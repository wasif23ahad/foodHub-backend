import { Router, IRouter } from "express";
import * as mealController from "../controllers/meal.controller";
import * as reviewController from "../controllers/review.controller";
import { validateQuery, validateParams } from "../middlewares";
import { mealQuerySchema, mealIdParamSchema } from "../validations/meal.validation";
import { reviewQuerySchema, mealIdParamSchema as reviewMealIdParamSchema } from "../validations/review.validation";

const router: IRouter = Router();

router.get("/", validateQuery(mealQuerySchema), mealController.getMeals);
router.get("/:id", validateParams(mealIdParamSchema), mealController.getMealById);
router.get("/:mealId/reviews", validateParams(reviewMealIdParamSchema), validateQuery(reviewQuerySchema), reviewController.getMealReviews);

export default router;
