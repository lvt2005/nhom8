import {Router} from "express"
const router = Router()
import * as login  from "../controller/login.controller"
import * as loginValidate from  "../validate/login.validate"
router.post("/",loginValidate.login,login.login)
router.post("/logout",login.logout)
export default router