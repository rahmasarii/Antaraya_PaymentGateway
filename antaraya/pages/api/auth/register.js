import dbConnect from "../../../lib/db";
import Admin from "../../../models/Admin";
import bcrypt from "bcryptjs";
import sendOTP from "../../../lib/sendOTP"; // WhatsApp OTP sender

let otpStore = {}; // TEMPORARY memory

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { step, name, email, password, confirmPassword, otp } = req.body;

  // STEP 1 → Validate and send OTP
  if (step === "request") {
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const passwordRules = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRules.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 chars, include uppercase, number, and special character.",
      });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const code = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = {
      code,
      name,
      password,
    };

    await sendOTP(code); // WhatsApp OTP

    return res.json({ message: "OTP sent successfully" });
  }

  // STEP 2 → Verify OTP and create admin
  if (step === "verify") {
    const saved = otpStore[email];

    if (!saved) {
      return res.status(400).json({ error: "OTP expired or not requested" });
    }

    if (String(saved.code) !== String(otp)) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    const hashed = await bcrypt.hash(saved.password, 10);

    await Admin.create({
      name: saved.name,
      email,
      password: hashed,
    });

    delete otpStore[email];

    return res.json({ message: "Admin registered successfully!" });
  }

  return res.status(400).json({ error: "Invalid step" });
}
