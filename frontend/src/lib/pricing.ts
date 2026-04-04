export const DELIVERY_FEE_IN_PAISE = 9900;

export type CouponDefinition = {
  code: string;
  label: string;
} & (
  | {
      type: "flat";
      amountInPaise: number;
    }
  | {
      type: "percentage";
      percentage: number;
    }
);

export const COUPONS: CouponDefinition[] = [
  {
    code: "SAVE200",
    label: "Flat Rs. 200 off",
    type: "flat",
    amountInPaise: 20000,
  },
  {
    code: "WELCOME10",
    label: "10% off your order",
    type: "percentage",
    percentage: 10,
  },
  {
    code: "DESK15",
    label: "15% off desk essentials",
    type: "percentage",
    percentage: 15,
  },
] as const;

export type AppliedCoupon = {
  code: string;
  label: string;
  type: "flat" | "percentage";
  amountInPaise?: number;
  percentage?: number;
};

export type PricingSummary = {
  itemTotalInPaise: number;
  discountInPaise: number;
  deliveryFeeInPaise: number;
  grandTotalInPaise: number;
};

export function findCouponByCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  return COUPONS.find((coupon) => coupon.code === normalizedCode) || null;
}

export function getPricingSummary(
  itemTotalInPaise: number,
  appliedCoupon: AppliedCoupon | null,
): PricingSummary {
  let discountInPaise = 0;

  if (appliedCoupon?.type === "flat" && appliedCoupon.amountInPaise) {
    discountInPaise = appliedCoupon.amountInPaise;
  }

  if (appliedCoupon?.type === "percentage" && appliedCoupon.percentage) {
    discountInPaise = Math.round((itemTotalInPaise * appliedCoupon.percentage) / 100);
  }

  discountInPaise = Math.min(discountInPaise, itemTotalInPaise);

  return {
    itemTotalInPaise,
    discountInPaise,
    deliveryFeeInPaise: DELIVERY_FEE_IN_PAISE,
    grandTotalInPaise: itemTotalInPaise - discountInPaise + DELIVERY_FEE_IN_PAISE,
  };
}
