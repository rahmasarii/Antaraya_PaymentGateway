import dbConnect from "../../../lib/db";
import Admin from "../../../models/Admin";
import bcrypt from "bcryptjs";
import OTPemail from "../../../lib/otpemail";

let otpStore = {};

export default async function handler(req, res) {
  await dbConnect();

  const { step, email, otp, newPass, confirmNewPass } = req.body;

  // STEP 1 → Send OTP to user's email
  if (step === "request") {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Email is not registered" });
    }

    const code = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = { code };
    console.log("EMAIL:", process.env.OWNER_EMAIL);
console.log("PASS:", process.env.OWNER_EMAIL_PASS);


    try {
      await OTPemail(email, code);  // <-- NOW SEND TO USER EMAIL
    } catch (err) {
      return res.status(500).json({ error: "Failed to send OTP" });
    }

    return res.json({ message: "OTP sent to your email." });
  }

  // STEP 2 → Verify OTP
  if (step === "verify") {
    const saved = otpStore[email];
    if (!saved) return res.status(400).json({ error: "OTP expired" });

    if (saved.code != otp)
      return res.status(400).json({ error: "Incorrect OTP" });

    otpStore[email].verified = true;

    return res.json({ message: "OTP verified" });
  }

  // STEP 3 → Reset password
  if (step === "reset") {
    const saved = otpStore[email];
    if (!saved) return res.status(400).json({ error: "OTP expired" });

    if (!saved.verified)
      return res.status(400).json({ error: "OTP not verified." });

    if (!newPass || !confirmNewPass)
      return res.status(400).json({ error: "All fields are required." });

    if (newPass !== confirmNewPass)
      return res.status(400).json({ error: "Passwords do not match." });

    const passwordRules =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRules.test(newPass)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 chars, include uppercase, number, and special char.",
      });
    }

    const hashed = await bcrypt.hash(newPass, 10);
    await Admin.findOneAndUpdate({ email }, { password: hashed });

    delete otpStore[email];

    return res.json({ message: "Password updated successfully!" });
  }

  return res.status(400).json({ error: "Invalid step" });
}
