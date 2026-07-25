import { NextRequest, NextResponse } from "next/server";
import { StripePaymentProvider } from "@lib/billing/providers/StripePaymentProvider";

export async function POST(req: NextRequest) {
  try {
    const provider = new StripePaymentProvider();
    if (!provider.isEnabled) {
      return NextResponse.json(
        {
          received: true,
          status: "disabled",
          message: "Stripe webhook processor is currently disabled in environment configuration.",
        },
        { status: 200 }
      );
    }

    const payload = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    const result = await provider.handleWebhook(payload, signature);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ received: true, eventType: result.data?.eventType }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Webhook error" }, { status: 500 });
  }
}
