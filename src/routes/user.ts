import { Router } from "express";
import express from "express";
import { login, signup, forgotPassword, verifyOtpPasswordReset, newPassswordAfterOTPVerified, getDashboardStats, passwordReset, getUserInfo, editUserInfo, getUserInfoByEmail } from "../controllers/user/user";
import { getAllNotificationsOfUser, markAllNotificationsAsRead } from "src/controllers/notifications/notifications";
import { getUserProjects, deleteProject, getAProject, deleteAProjectStatus } from "src/controllers/projects/projects";
import { checkAuth } from "src/middleware/check-auth";
import {
    getAnotes,

} from "src/controllers/notes/notes";

import {
    getAattattachment

} from "src/controllers/attachments/attachments";

const router = Router();


router.post("/signup", signup)
router.post("/login", login)
// router.patch("/forgot-password", forgotPassword)
router.get("/dashboard", checkAuth, getDashboardStats)
router.get("/:id/projects", checkAuth, getUserProjects)
router.route("/:id").get(checkAuth, getUserInfo).put(checkAuth, editUserInfo)
router.route("/project/:id").get(checkAuth, getAProject).delete(checkAuth, deleteAProjectStatus)
router.route("/notes/:id").get(checkAuth, getAnotes)
router.route("/attachments/:id").get(checkAuth, getAattattachment)

router.route("/:id/notifications").get(checkAuth, getAllNotificationsOfUser).put(checkAuth, markAllNotificationsAsRead)
router.get("/email/:email", checkAuth, getUserInfoByEmail)

router.delete("/projects/:id", checkAuth, deleteProject)


export { router }