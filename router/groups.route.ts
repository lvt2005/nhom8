import { Router } from "express";
const router = Router();
import * as chatgroup from "../controller/chatgroup.controller";

router.post("/create-group", chatgroup.createGroup);
router.get("/list-groups",  chatgroup.getListGroups); // API lấy danh sách nhóm
// API rời nhóm
router.post("/leave", chatgroup.leaveGroup);

// API xóa nhóm (giải tán)
router.post("/delete",chatgroup.deleteGroup);
export default router