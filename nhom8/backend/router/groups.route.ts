import { Router } from "express";
const router = Router();
import * as chatgroup from "../controller/chatgroup.controller";
import * as groupavatar from "../controller/groupavatar.controller";

router.post("/create-group", chatgroup.createGroup);
router.get("/list-groups", chatgroup.getListGroups);
router.post("/leave", chatgroup.leaveGroup);
router.get("/members/:groupId", chatgroup.getGroupMembers);
router.post("/add-member", chatgroup.addMember);
router.post("/add-members", chatgroup.addMembers);
router.post("/transfer-admin", chatgroup.transferAdmin);
router.post("/transfer-owner", chatgroup.transferAdmin);
router.post("/kick-member", chatgroup.kickMember);
router.post("/remove-member", chatgroup.kickMember);
router.post("/delete", chatgroup.deleteGroup);
router.post("/upload-avatar", groupavatar.upload.single("avatar"), groupavatar.uploadGroupAvatar);
router.post("/update-background", chatgroup.updateBackground);
router.post("/update-emoji", chatgroup.updateQuickEmoji);
export default router