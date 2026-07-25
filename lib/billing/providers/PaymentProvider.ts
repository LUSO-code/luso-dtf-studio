export interface CheckoutSessionOptions {
  workspaceId: string;
  planId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CustomerPortalOptions {
  workspaceId: string;
  returnUrl: string;
}

export interface PaymentProviderResult<T = any> {
  success: boolean;
  url?: string;
  data?: T;
  error?: string;
}

/**
 * Abstract Payment Provider Interface for SaaS monetization.
 */
export interface PaymentProvider {
  name: string;
  isEnabled: boolean;

  createCheckoutSession(options: CheckoutSessionOptions): Promise<PaymentProviderResult<{ sessionId: string }>>;
  createCustomerPortalSession(options: CustomerPortalOptions): Promise<PaymentProviderResult<{ portalUrl: string }>>;
  cancelSubscription(subscriptionId: string): Promise<PaymentProviderResult>;
  changeSubscription(subscriptionId: string, newPriceId: string): Promise<PaymentProviderResult>;
  handleWebhook(payload: string, signature: string): Promise<PaymentProviderResult<{ eventType: string }>>;
}
