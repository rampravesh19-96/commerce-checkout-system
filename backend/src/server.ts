import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRouter from "./routes/product.routes";
import categoryRouter from "./routes/category.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ message: "Backend is running" });
});

app.use("/products", productRouter);
app.use("/categories", categoryRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
