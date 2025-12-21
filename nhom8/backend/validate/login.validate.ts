import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const login = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Vui lòng nhập email!",
        "string.email": "Email có định dạng không hợp lệ!",
      }),
    password: Joi.string()
      .required()
      .messages({
        "string.empty": "Vui lòng nhập mật khẩu!",
      }),
      remember: Joi.boolean().allow("")

  });
  const { error } = schema.validate(req.body);
  if (error) {
    res.json({
      code: "error",
      Message: error.details[0].message,
    });
    return;
  }

  next();
}