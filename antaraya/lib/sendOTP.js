export default async function sendOTP(otp) {
  const fonnteToken = process.env.FONNTE_TOKEN;

  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: fonnteToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: "6287880673865",  // Your WhatsApp Number
      message: `Your admin registration OTP is: ${otp}`,
    }),
  });

  const data = await res.json();
  console.log("FONNTE RESPONSE:", data);

  return data;
}
