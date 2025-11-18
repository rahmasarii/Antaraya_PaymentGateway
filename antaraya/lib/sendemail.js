// lib/sendEmail.js
import nodemailer from "nodemailer";

export default async function sendEmail(to, subject, html) {
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

  await transporter.sendMail({
    from: `"Antaraya Payment" <${process.env.OWNER_EMAIL}>`,
    to,
    subject,
    html,
  });
}
