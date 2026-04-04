import { Router } from "express";
import { getCategories } from "../controllers/category.controller";

const categoryRouter = Router();

categoryRouter.get("/", getCategories);

export default categoryRouter;
