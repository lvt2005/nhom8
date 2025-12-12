import {Router} from "express"
const router = Router()
import register from "./register.route"
import login from "./login.route"
import chat from "./chat.route"
import users from "./user.route"
import groups from "./groups.route"
import { verifyTokenUser } from "../middleware/auth.middleware"
router.use("/register",register)
router.use("/login",login)
router.use(verifyTokenUser);
router.use("/chat",chat)
router.use("/users",users)
router.use("/groups",groups)
export default router