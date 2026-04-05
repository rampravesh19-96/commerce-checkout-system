import { CartItem } from "@/lib/cart";
import { AppliedCoupon } from "@/lib/pricing";

const ORDER_CONFIRMATION_STORAGE_KEY = "commerce-checkout-order-confirmation";
const ORDER_HISTORY_STORAGE_KEY = "commerce-checkout-order-history";

export const ORDER_STATUSES = [
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

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

export type ConfirmationPayment = {
  provider: "Razorpay";
  mode: "test";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  verifiedAt: string;
};

export type OrderConfirmationData = {
  orderId: string;
  createdAt: string;
  status: OrderStatus;
  user: {
    email: string;
    name: string;
  };
  customer: ConfirmationCustomer;
  shippingAddress: ConfirmationShippingAddress;
  coupon: AppliedCoupon | null;
  items: CartItem[];
  pricing: {
    itemTotalInPaise: number;
    discountInPaise: number;
    deliveryFeeInPaise: number;
    grandTotalInPaise: number;
  };
  payment?: ConfirmationPayment;
};

export function generateMockOrderId() {
  return `ORD-${Date.now().toString().slice(-8)}`;
}

export function saveOrderConfirmation(data: OrderConfirmationData) {
  window.sessionStorage.setItem(ORDER_CONFIRMATION_STORAGE_KEY, JSON.stringify(data));
}

export function saveOrderToHistory(data: OrderConfirmationData) {
  const currentOrders = getOrderHistory();
  const nextOrders = [data, ...currentOrders];
  window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(nextOrders));
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

export function getOrderHistory() {
  const rawValue = window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);

  if (!rawValue) {
    return [] as OrderConfirmationData[];
  }

  try {
    return JSON.parse(rawValue) as OrderConfirmationData[];
  } catch {
    window.localStorage.removeItem(ORDER_HISTORY_STORAGE_KEY);
    return [] as OrderConfirmationData[];
  }
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const currentOrders = getOrderHistory();
  const nextOrders = currentOrders.map((order) =>
    order.orderId === orderId ? { ...order, status } : order,
  );

  window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(nextOrders));

  const currentConfirmation = getOrderConfirmation();
  if (currentConfirmation?.orderId === orderId) {
    saveOrderConfirmation({
      ...currentConfirmation,
      status,
    });
  }

  return nextOrders;
}
