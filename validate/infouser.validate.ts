// validations/userValidation.js

// Schema cho việc CẬP NHẬT THÔNG TIN CÁ NHÂN (Profile Update)
// File: middleware/updateProfileValidation.js

import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const updateProfileSchema = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .max(50)
      .required()
      .messages({
        'string.empty': 'Tên hiển thị là bắt buộc.',
        'string.max': 'Tên hiển thị không được quá 50 ký tự.',
        'any.required': 'Tên hiển thị là bắt buộc.'
      }),

    phone: Joi.string()
      .required()
      .pattern(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/)
      .messages({
        "string.empty": "Vui lòng nhập số điện thoại.",
        "string.pattern.base": "Số điện thoại không đúng định dạng.",
        "string.base": "Số điện thoại phải là chuỗi ký tự."
      }),

    bio: Joi.string()
      .max(150)
      .allow("") // nếu người dùng không nhập gì
      .messages({
        'string.max': 'Phần giới thiệu không được quá 150 ký tự.'
      }),
  });
  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message.replace(/"/g, '');
    return res.json({
      code: "error",
      Message: errorMessage,
    });
  }

  next();
};

export const changePasswordValidation = (req: Request, res: Response, next: NextFunction) => {
  // Schema để validate dữ liệu gửi lên
  const schema = Joi.object({
    // Mật khẩu hiện tại: Bắt buộc
    currentPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập mật khẩu hiện tại.',
        'any.required': 'Mật khẩu hiện tại là bắt buộc.'
      }),

    // Mật khẩu mới: Bắt buộc, tối thiểu 6 ký tự
    newPassword: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập mật khẩu mới.',
        'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự.',
        'any.required': 'Mật khẩu mới là bắt buộc.'
      }),

    // Không validate confirmPassword ở đây, để frontend kiểm tra là đủ.
    // Server chỉ cần newPassword và currentPassword để xử lý logic.
  }).unknown(true);

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message.replace(/"/g, ''); // Loại bỏ dấu ""
    return res.json({ // Trả về lỗi theo định dạng yêu cầu của bạn
      code: "error",
      Message: errorMessage,
    });
  }

  next();
}