import nodemailer from "nodemailer";

const EMAIL_USER = "trilv2706@gmail.com";
const EMAIL_PASS = "rwzk gtef sbto kwsq";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Mã xác nhận khôi phục mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">Khôi phục mật khẩu</h2>
        <p>Mã xác nhận của bạn là:</p>
        <div style="background: linear-gradient(to right, #8b5cf6, #ec4899); padding: 20px; border-radius: 10px; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #666; margin-top: 20px;">Mã có hiệu lực trong 5 phút.</p>
        <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};
