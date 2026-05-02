import { Router } from "express";
import { register, login, googleAuthRedirect, googleAuthCallback, logout, getMe } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/google", googleAuthRedirect);
router.get("/callback/google", googleAuthCallback);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;
