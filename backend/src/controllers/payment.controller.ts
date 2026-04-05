import crypto from "crypto";
import { Request, Response } from "express";
import { z } from "zod";
import { getRazorpayKeyId, hasRazorpayConfig, razorpay } from "../lib/razorpay";

const createRazorpayOrderSchema = z.object({
  amountInPaise: z.number().int().positive("Amount must be greater than zero"),
  receipt: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-zA-Z0-9_-]+$/, "Receipt must use only letters, numbers, hyphens, or underscores"),
});

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().trim().min(1, "Missing Razorpay order id"),
  razorpayPaymentId: z.string().trim().min(1, "Missing Razorpay payment id"),
  razorpaySignature: z.string().trim().min(1, "Missing Razorpay signature"),
});

export async function createRazorpayOrder(req: Request, res: Response) {
  try {
    if (!hasRazorpayConfig() || !razorpay) {
      return res.status(500).json({ message: "Razorpay test mode is not configured on the backend" });
    }

    const parsedData = createRazorpayOrderSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        message: parsedData.error.issues[0]?.message || "Invalid payment order payload",
      });
    }

    const { amountInPaise, receipt } = parsedData.data;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      payment_capture: true,
      notes: {
        mode: "test",
        appOrderId: receipt,
      },
    });

    return res.status(201).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt,
      keyId: getRazorpayKeyId(),
      mode: "test",
    });
  } catch (error) {
    console.error("Failed to create Razorpay order", error);
    return res.status(500).json({ message: "Failed to create Razorpay order" });
  }
}

export async function verifyRazorpayPayment(req: Request, res: Response) {
  try {
    if (!hasRazorpayConfig()) {
      return res.status(500).json({ message: "Razorpay test mode is not configured on the backend" });
    }

    const parsedData = verifyPaymentSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        message: parsedData.error.issues[0]?.message || "Invalid payment verification payload",
      });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsedData.data;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({ message: "Razorpay secret is not configured" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      return res.status(400).json({
        message: "Payment verification failed. Please try again with a new payment attempt.",
      });
    }

    return res.json({
      verified: true,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      mode: "test",
    });
  } catch (error) {
    console.error("Failed to verify Razorpay payment", error);
    return res.status(500).json({ message: "Failed to verify Razorpay payment" });
  }
}
