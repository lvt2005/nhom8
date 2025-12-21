import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const register = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .required()
      .min(5)
      .max(50)
      .messages({
        "string.empty": "Vui lòng nhập Họ và Tên",
        "string.min": "Vui lòng nhập đủ 5 kí tự",
        "string.max": "Vui lòng không nhập quá 50 kí tự",
      }),

    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Vui lòng nhập email!",
        "string.email": "Email có định dạng không hợp lệ!",
      }),

    phone: Joi.string()
      .required()
      .pattern(/^0(3|5|7|8|9)\d{8}$/)
      .messages({
        "string.empty": "Vui lòng nhập số điện thoại",
        "string.pattern.base": "Số điện thoại không đúng định dạng!",
      }),

    password: Joi.string()
      .required()
      .min(8)
      .pattern(/[A-Z]/, "uppercase")
      .pattern(/[a-z]/, "lowercase")
      .pattern(/\d/, "digit")
      .pattern(/[!@#$%^&*()_+\-={}[\]|\\:;"'<>,.?~`]/, "special")
      .messages({
        "string.empty": "Vui lòng nhập mật khẩu!",
        "string.min": "Vui lòng nhập đủ 8 kí tự!",
        "string.pattern.name": "Mật khẩu không đúng định dạng!",

        // Các case cụ thể
        "string.pattern.base": "Mật khẩu phải chứa chữ hoa, chữ thường, số và kí tự đặc biệt!",
        "string.pattern.uppercase": "Vui lòng nhập ít nhất một chữ cái viết hoa!",
        "string.pattern.lowercase": "Vui lòng nhập ít nhất một chữ cái viết thường!",
        "string.pattern.digit": "Vui lòng nhập ít nhất một số!",
        "string.pattern.special": "Vui lòng nhập ít nhất một kí tự đặc biệt! ví dụ: !@#$%^&*",
      }),

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