import ContactMessage from "../../models/ContactMessage";
import nodemailer from "nodemailer";
import dbConnect from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  await dbConnect();

  try {
    const { firstName, lastName, email, subscribe, message } = req.body;

    // Save ke DB
    const saved = await ContactMessage.create({
      firstName,
      lastName,
      email,
      subscribe,
      message,
    });

    // --- EMAIL SETUP ---
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
      from: `"Contact Form" <${process.env.MAIL_USER}>`,
      to: process.env.OWNER_EMAIL, // OWNER EMAIL DI SINI
      subject: "New Contact Form Message",
      html: `
        <h2>Contact Message</h2>
        <p><b>Name:</b> ${firstName} ${lastName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subscribed:</b> ${subscribe ? "Yes" : "No"}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Message sent successfully" });

  } catch (err) {
    console.error("CONTACT ERROR:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
