import Razorpay from "razorpay";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

export const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

export function getRazorpayKeyId() {
  return razorpayKeyId;
}

export function hasRazorpayConfig() {
  return Boolean(razorpayKeyId && razorpayKeySecret);
}
