import { CartItem } from "@/lib/cart";

const ORDER_CONFIRMATION_STORAGE_KEY = "commerce-checkout-order-confirmation";
export const DELIVERY_FEE_IN_PAISE = 9900;

export type ConfirmationCustomer = {
  fullName: string;
  email: string;
  phone: string;
};

export type ConfirmationShippingAddress = {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderConfirmationData = {
  orderId: string;
  createdAt: string;
  customer: ConfirmationCustomer;
  shippingAddress: ConfirmationShippingAddress;
  items: CartItem[];
  pricing: {
    itemTotalInPaise: number;
    deliveryFeeInPaise: number;
    grandTotalInPaise: number;
  };
};

export function generateMockOrderId() {
  return `ORD-${Date.now().toString().slice(-8)}`;
}

export function saveOrderConfirmation(data: OrderConfirmationData) {
  window.sessionStorage.setItem(ORDER_CONFIRMATION_STORAGE_KEY, JSON.stringify(data));
}

export function getOrderConfirmation() {
  const rawValue = window.sessionStorage.getItem(ORDER_CONFIRMATION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as OrderConfirmationData;
  } catch {
    window.sessionStorage.removeItem(ORDER_CONFIRMATION_STORAGE_KEY);
    return null;
  }
}

export function clearOrderConfirmation() {
  window.sessionStorage.removeItem(ORDER_CONFIRMATION_STORAGE_KEY);
}
