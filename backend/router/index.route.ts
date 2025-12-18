import {Router} from "express"
const router = Router()
import register from "./register.route"
import login from "./login.route"
import chat from "./chat.route"
import users from "./user.route"
import groups from "./groups.route"
import report from "./report.route"
import password from "./password.route"
import { verifyTokenUser } from "../middleware/auth.middleware"
router.use("/register",register)
router.use("/login",login)
router.use("/password", password)
router.use(verifyTokenUser);
router.use("/chat",chat)
router.use("/users",users)
router.use("/groups",groups)
router.use("/report",report)
export default router