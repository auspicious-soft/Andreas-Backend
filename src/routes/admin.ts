import { Router } from "express";
import {
    createAUser,
    getDashboardStats,
    sendLatestUpdates,
    newPassswordAfterOTPVerified,
    getAllUsers,
    getAUser,
    updateAUser,
    deleteAUser,
    //  updateDashboardStats
} from "../controllers/admin/admin";


import {
    createProject,
    getAProject,
    deleteAProject,
    updateAProject,
    getAllProjects
} from "src/controllers/projects/projects";

import {
    getAnotes,
    deleteANote,
    createNote

} from "src/controllers/notes/notes";

import {
    getAattattachment,
    deleteAattachment,
    createattachment

} from "src/controllers/attachments/attachments";

// import { checkAdminAuth } from "../middleware/check-auth";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { forgotPassword } from "src/controllers/admin/admin";
import { verifyOtpPasswordReset } from "src/controllers/user/user";
import { sendNotificationToUser, sendNotificationToUsers } from "src/controllers/notifications/notifications";
import { checkAuth } from "src/middleware/check-auth";



const router = Router();

router.post("/verify-otp", verifyOtpPasswordReset)
router.patch("/new-password-otp-verified", newPassswordAfterOTPVerified)
router.get("/dashboard", checkAuth, getDashboardStats)
router.route("/projects").post(checkAuth, createProject).get(checkAuth, getAllProjects)
router.route("/project/:id").get(checkAuth, getAProject).delete(checkAuth, deleteAProject).patch(checkAuth, updateAProject)
router.route("/users").get(checkAuth, getAllUsers).post(checkAuth, createAUser)
router.route("/users/:id").get(checkAuth, getAUser).delete(checkAuth, deleteAUser).patch(checkAuth, updateAUser)

router.post("/send-latest-updates", checkAuth, sendLatestUpdates)
router.post("/send-notification", checkAuth, sendNotificationToUsers)
router.post("/send-notification-to-specific-users", checkAuth, sendNotificationToUser)

router.route("/notes/:id").get(checkAuth, getAnotes).delete(checkAuth, deleteANote).post(checkAuth, createNote)

router.route("/attachments/:id").get(checkAuth, getAattattachment).delete(checkAuth, deleteAattachment).post(checkAuth, createattachment)

// router.get("/verify-session", verifySession);
// router.patch("/update-password", passwordReset)
// router.patch("/forgot-password", forgotPassword)
// router.patch("/new-password-email-sent", newPassswordAfterEmailSent)
// router.put("/edit-info", upload.single("profilePic"), checkMulter, editAdminInfo)
// router.get("/info", getAdminInfo)

// Protected routes
// router.route("/dashboard").get(getDashboardStats).put(updateDashboardStats);
// router.route("/card").post(upload.single("image"), checkMulter, createCard).get(getCards)
// router.route("/card/:id").delete(deleteACard).patch(changeCardStatus)
// router.route("/cards-per-spinner").get(getCardsPerSpinner).patch(updateCardsPerSpinner)


export { router }