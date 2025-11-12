// pages/payment.js (after you received token from /api/create-transaction)
import { useEffect } from 'react';
export default function Payment({ token }){
  useEffect(()=>{
    if(!token) return;
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
    document.body.appendChild(script);
    script.onload = () => {
      window.snap.pay(token, {
        onSuccess: result => { console.log('success', result); /* optional: redirect to success page */ },
        onPending: result => { console.log('pending', result); },
        onError: result => { console.log('error', result); }
      });
    };
    return ()=>document.body.removeChild(script);
  },[token]);
  return <div>Processing payment...</div>;
}
