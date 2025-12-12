import {Router} from "express"
const router = Router()
import * as register  from "../controller/register.controller"
import * as registerValidate from  "../validate/register.validate"
router.post("/",registerValidate.register,register.register)
export default router