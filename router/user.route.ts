import {Router} from "express"
const router = Router()
import * as user  from "../controller/user.controller"
import multer  from "multer"
import multerCloudinary from "../helpers/mlterCloudinary.helper"
import * as inforuserVali from "../validate/infouser.validate"
const upload = multer({ storage: multerCloudinary});
router.get("/profile",user.infoUser)
router.get("/list",user.getListUser)
router.put("/update",upload.single("avatar"),inforuserVali.updateProfileSchema,user.infoUserPut)
router.patch("/change-status", user.changeStatus);
router.post("/search", user.searchUser); // API tìm kiếm
router.post("/request-friend",  user.requestFriend); // API kết bạn
router.get("/friends", user.getFriendsList); // API lấy danh sách bạn
router.post("/accept-friend", user.acceptFriend); // API đồng ý kết bạn
router.get("/friend-requests", user.getFriendRequests); // API Mới
router.post("/remove-friend",user.removeFriend);
router.post("/decline-friend", user.declineFriendRequest);
export default router