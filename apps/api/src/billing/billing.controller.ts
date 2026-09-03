import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Req,
  BadRequestException,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly stripeService: StripeService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout-session')
  createCheckoutSession(@CurrentUser() user: JwtPayload) {
    return this.billingService.createCheckoutSession(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(@CurrentUser() user: JwtPayload) {
    return this.billingService.getStatus(user.sub);
  }

  // No JwtAuthGuard: Stripe calls this directly, authenticated via webhook signature instead.
  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'];
    if (!signature || !req.rawBody) {
      throw new BadRequestException('Missing Stripe signature or raw body');
    }

    const event = this.stripeService.client.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );

    await this.billingService.handleWebhookEvent(event);
    return { received: true };
  }
}
