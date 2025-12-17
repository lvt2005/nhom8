import { Router } from "express";
const router = Router();
import * as chatgroup from "../controller/chatgroup.controller";

router.post("/create-group", chatgroup.createGroup);
router.get("/list-groups",  chatgroup.getListGroups); // API lấy danh sách nhóm
// API rời nhóm
router.post("/leave", chatgroup.leaveGroup);

// Xem thành viên (tham số groupId)
router.get("/members/:groupId", chatgroup.getGroupMembers);

// Thêm thành viên (chỉ superAdmin)
router.post("/add-member", chatgroup.addMember);

// Kick thành viên (chỉ superAdmin)
router.post("/kick-member", chatgroup.kickMember);

// API xóa nhóm (giải tán)
router.post("/delete",chatgroup.deleteGroup);
export default router