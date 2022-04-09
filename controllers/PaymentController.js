import { BigPromise } from "../middlewares/bigPromise";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET);

export const SendStripeKey = BigPromise(async (req, res, next) => {
  const stripe_key = process.env.STRIPE_API_KEY;
  res.status(200).json({
    success: true,
    data: stripe_key,
    Message: ""
  });
});

export const CaptureStripePayment = BigPromise(async (req, res, next) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: req.body.name
          },
          unit_amount: req.body.amount
        }
      }
    ],
    //optional
    metadata: { integration_check: "accept_a_payment" },

    mode: "payment",
    success_url: "http://localhost:5000/success",
    cancel_url: "http://localhost:5000/cancel"
  });

  res.status(200).json({
    success: true,
    data: session.client_secret,
    Message: ""
  });
});
