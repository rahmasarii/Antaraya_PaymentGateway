export const runtime = "nodejs";
import nodemailer from "nodemailer";

export default async function OTPemail(toEmail, otp) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.OWNER_EMAIL,
      pass: process.env.OWNER_EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.OWNER_EMAIL,
    to: toEmail,
    subject: "Your Password Reset OTP",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("EMAIL ERROR >>>", err);
    throw err;
  }
}
