import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import Stripe = require('stripe');
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  async createCheckoutSession(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const customerId = user.stripeCustomerId ?? (await this.createStripeCustomer(userId, user.email));

    const session = await this.stripeService.client.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID as string, quantity: 1 }],
      success_url: `${process.env.WEB_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEB_APP_URL}/billing/cancel`,
    });

    return { url: session.url };
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { subscription: true },
    });
    return { plan: user.plan, subscription: user.subscription };
  }

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await this.stripeService.client.subscriptions.retrieve(
            session.subscription as string,
          );
          await this.upsertSubscription(subscription);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.upsertSubscription(subscription);
        break;
      }
      default:
        this.logger.debug(`Ignoring unhandled event type: ${event.type}`);
    }
  }

  private async createStripeCustomer(userId: string, email: string): Promise<string> {
    const customer = await this.stripeService.client.customers.create({ email });
    await this.prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customer.id } });
    return customer.id;
  }

  private async upsertSubscription(subscription: Stripe.Subscription) {
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });
    if (!user) {
      throw new NotFoundException(`No user found for Stripe customer ${subscription.customer}`);
    }

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    const currentPeriodEnd = new Date(subscription.items.data[0].current_period_end * 1000);

    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        plan: 'premium',
        status: subscription.status,
        currentPeriodEnd,
      },
      update: {
        status: subscription.status,
        currentPeriodEnd,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { plan: isActive ? 'premium' : 'free' },
    });
  }
}
