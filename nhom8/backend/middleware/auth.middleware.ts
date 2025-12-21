import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { RequestAccount } from "../interfaces/reqAccount.interface";
import account_user from "../models/account_user.models";
export const verifyTokenUser = async (req: RequestAccount, res: Response, next: NextFunction) => {
  try {
    const tokenCookie = req.cookies.token
    if (!tokenCookie) {
      res.json({
        code: "error",
        Message: "Vui lòng đăng nhập!"
      })
      return;
    }
    
    // Verify token với error handling tốt hơn
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(tokenCookie, `${process.env.jwtToken}`) as JwtPayload;
    } catch (jwtError: any) {
      // Token hết hạn hoặc không hợp lệ
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV == "production" ? true : false,
        path: "/"
      });
      res.json({
        code: "error",
        Message: jwtError.name === "TokenExpiredError" ? "Phiên đăng nhập đã hết hạn!" : "Token không hợp lệ!"
      })
      return;
    }

    const { id, email } = decoded;
    const existDataUser = await account_user.findOne({
      _id: id,
      email: email,
    })
    if (!existDataUser) {
      res.json({
        code: "error",
        Message: "Tài khoản không tồn tại!"
      })
      return;
    }
    req.account = existDataUser
    next()
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    res.json({
      code: "error",
      Message: error.message || "Lỗi xác thực!"
    })
  }
}