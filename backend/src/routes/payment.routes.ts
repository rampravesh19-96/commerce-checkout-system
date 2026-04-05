import { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/payment.controller";

const paymentRouter = Router();

paymentRouter.post("/create-order", createRazorpayOrder);
paymentRouter.post("/verify", verifyRazorpayPayment);

export default paymentRouter;
