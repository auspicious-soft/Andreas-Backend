import { Router } from "express";
import { dashboardProjects, editEmployeeInfo, getEmployeeInfo } from "src/controllers/employees/employees-controller";
import { checkAuth } from "src/middleware/check-auth";

const router = Router();

router.get("/:id/dashboard", checkAuth, dashboardProjects)
router.route("/:id").get(checkAuth, getEmployeeInfo).put(checkAuth, editEmployeeInfo)
export { router }