import {Router} from "express"
const router = Router()
import * as Message  from "../controller/sendmessage.controller"
import multer from "multer"
import multerCloudinary from "../helpers/mlterCloudinary.helper"

const upload = multer({ storage: multerCloudinary });

router.post("/send", upload.single("file"), Message.sendMessage)
router.post("/list",Message.getListMessage)
router.post("/delete-for-me",Message.deleteForMe)
router.post("/delete-for-everyone",Message.deleteForEveryone)
router.post("/search", Message.searchMessages)
router.post("/forward",Message.forwardMessage)
router.post("/pin",Message.pinMessage)
router.post("/unpin",Message.unpinMessage)
router.post("/pinned-messages",Message.getPinnedMessages)
router.post("/react", Message.reactMessage)
export default router