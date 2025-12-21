import {Router} from "express"
const router = Router()
import * as user  from "../controller/user.controller"
import multer  from "multer"
import multerCloudinary from "../helpers/mlterCloudinary.helper"
import * as inforuserVali from "../validate/infouser.validate"
const upload = multer({ storage: multerCloudinary});
router.get("/profile",user.infoUser)
router.get("/profile/:userId",user.getUserById)
router.get("/list",user.getListUser)
router.put("/update",upload.single("avatar"),inforuserVali.updateProfileSchema,user.infoUserPut)
router.patch("/change-status", user.changeStatus);
router.post("/search", user.searchUser);
router.post("/search-all", user.searchAll);
router.post("/request-friend",  user.requestFriend);
router.get("/friends", user.getFriendsList); // API lấy danh sách bạn
router.post("/accept-friend", user.acceptFriend); // API đồng ý kết bạn
router.get("/friend-requests", user.getFriendRequests); // API Mới
router.post("/remove-friend",user.removeFriend);
router.post("/decline-friend", user.declineFriendRequest);
router.put("/change-password", user.changePassword);
router.post("/block", user.blockUser);
router.post("/unblock", user.unblockUser);
router.get("/blocked", user.getBlockedUsers);
router.post("/check-block", user.checkBlockStatus);
export default router