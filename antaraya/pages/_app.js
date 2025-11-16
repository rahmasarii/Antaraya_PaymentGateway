import { useEffect } from "react";
import axios from "axios";
import "../styles/products.css"; 
import '../styles/checkout.css'

export default function App({ Component, pageProps }) {
  // Enable cookies for all axios requests
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    );
    document.body.appendChild(script);
  }, []);

  return <Component {...pageProps} />;
}