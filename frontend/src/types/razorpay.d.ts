export {};

declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayCheckoutOptions,
    ) => {
      open: () => void;
      on: (eventName: "payment.failed", callback: (response: RazorpayFailureResponse) => void) => void;
    };
  }
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error: {
    code?: string;
    description?: string;
    field?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
    reason?: string;
    source?: string;
    step?: string;
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  notes?: Record<string, string>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  readonly?: {
    contact?: boolean;
    email?: boolean;
    name?: boolean;
  };
  theme?: {
    color?: string;
  };
};
