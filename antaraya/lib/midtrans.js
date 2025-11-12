// lib/midtrans.js
import midtransClient from 'midtrans-client';

const isProd = process.env.NODE_ENV === 'production';

const coreApi = new midtransClient.CoreApi({
  isProduction: isProd,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

const snap = new midtransClient.Snap({
  isProduction: isProd,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export { coreApi, snap };
