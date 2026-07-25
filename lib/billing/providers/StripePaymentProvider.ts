import {
  PaymentProvider,
  CheckoutSessionOptions,
  CustomerPortalOptions,
  PaymentProviderResult,
} from "./PaymentProvider";

export class StripePaymentProvider implements PaymentProvider {
  public name = "Stripe";
  public isEnabled: boolean;

  constructor() {
    // Explicit server-side feature toggle safeguard: Default is FALSE
    this.isEnabled = process.env.BILLING_PROVIDER_ENABLED === "true" || false;
  }

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<PaymentProviderResult<{ sessionId: string }>> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: "El procesamiento de pagos en directo con Stripe no está activado aún en esta versión.",
      };
    }

    // Server-side integration stub for Stripe Checkout
    return {
      success: true,
      url: `/precios?checkout=stub&workspaceId=${options.workspaceId}`,
      data: { sessionId: "stub_checkout_session_id" },
    };
  }

  async createCustomerPortalSession(options: CustomerPortalOptions): Promise<PaymentProviderResult<{ portalUrl: string }>> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: "El portal de clientes con Stripe está desactivado.",
      };
    }

    return {
      success: true,
      url: `/cuenta`,
      data: { portalUrl: "stub_customer_portal_url" },
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<PaymentProviderResult> {
    if (!this.isEnabled) {
      return { success: false, error: "Pagos no activados." };
    }
    return { success: true };
  }

  async changeSubscription(subscriptionId: string, newPriceId: string): Promise<PaymentProviderResult> {
    if (!this.isEnabled) {
      return { success: false, error: "Pagos no activados." };
    }
    return { success: true };
  }

  async handleWebhook(payload: string, signature: string): Promise<PaymentProviderResult<{ eventType: string }>> {
    if (!this.isEnabled) {
      return { success: false, error: "Procesador de webhooks deshabilitado." };
    }
    return { success: true, data: { eventType: "stub.event" } };
  }
}
