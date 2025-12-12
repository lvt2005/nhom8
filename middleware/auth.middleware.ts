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
    const { id, email } = jwt.verify(tokenCookie, `${process.env.jwtToken}`) as JwtPayload;
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
  } catch (error) {
    res.json({
      code: "error",
      Message: "Lỗi!"
    })
  }
}