import {Router} from "express"
const router = Router()
import * as Message  from "../controller/sendmessage.controller"
router.post("/send",Message.sendMessage)
router.post("/list",Message.getListMessage)
export default router