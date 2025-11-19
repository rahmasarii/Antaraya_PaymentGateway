import { useEffect } from "react";
import axios from "axios";
import '../styles/global.css'; 
import '../styles/home.css';
import '../styles/shop.css';
import '../styles/about.css';
import '../styles/product-detail.css';
import '../styles/checkout.css';
import '../styles/auth.css';
import '../styles/payment.css';

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