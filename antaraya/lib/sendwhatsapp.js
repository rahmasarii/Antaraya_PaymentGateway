// lib/sendWhatsapp.js
import axios from "axios";

export default async function sendWhatsapp(phone, message) {
  try {
    await axios.post(
      "https://api.fonnte.com/send",
      {
        target: phone,
        message: message,
      },
      {
        headers: {
          Authorization: process.env.FONNTE_TOKEN, // token langsung, tidak pake "Bearer"
        },
      }
    );

    console.log("WA sent to", phone);
  } catch (err) {
    console.error("WA send error:", err.response?.data || err);
  }
}
