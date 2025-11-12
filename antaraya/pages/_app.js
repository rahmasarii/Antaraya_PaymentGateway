import { useEffect } from "react";
// import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
    document.body.appendChild(script);
  }, []);

  return <Component {...pageProps} />;
}
