import { Injectable } from '@nestjs/common';
import Stripe = require('stripe');

@Injectable()
export class StripeService {
  readonly client = new Stripe(process.env.STRIPE_SECRET_KEY as string);
}
