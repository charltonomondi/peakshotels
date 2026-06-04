import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env FIRST before anything else
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { getRoomByNumber, updateBookingStatus, getAllBookings, supabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  credentials: false,
}));
app.use(express.json());

// Email transporter — credentials from env only
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

const roomConfigLabels = { single: 'Single Room', double: 'Double Room', twin: 'Twin Room (per person)' };
const mealPlanLabels = { bed_breakfast: 'Bed & Breakfast', half_board: 'Half Board', full_board: 'Full Board' };
const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

function createEmailTemplate(b) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#f0f0f0;padding:20px}
.wrap{max-width:700px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.15)}
.hdr{background:#1a1a1a;padding:30px;text-align:center;border-bottom:4px solid #d4af37}
.logo{font-size:28px;font-weight:900;color:#fff;letter-spacing:2px}.logo span{color:#d4af37}
.sub{color:#d4af37;font-size:13px;letter-spacing:3px;margin-top:6px}
.body{padding:30px}
.badge{text-align:center;margin-bottom:20px}
.badge span{background:#d4af37;color:#1a1a1a;padding:8px 24px;border-radius:50px;font-weight:700;font-size:13px}
.section{background:#f8f9fa;border-left:4px solid #d4af37;border-radius:8px;padding:16px;margin-bottom:16px}
.section h3{font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.item label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:2px}
.item span{font-size:14px;font-weight:600;color:#1a1a1a}
.price{background:#fff9e6;border:2px solid #d4af37;border-radius:8px;padding:20px;margin:16px 0;text-align:center}
.price-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#555}
.price-total{border-top:2px solid #d4af37;margin-top:10px;padding-top:10px;font-size:22px;font-weight:900;color:#1a1a1a}
.price-total .amt{color:#d4af37}
.note{background:#e8f4f8;border-left:4px solid #17a2b8;border-radius:8px;padding:14px;margin-top:16px}
.note h4{color:#17a2b8;font-size:13px;font-weight:700;margin-bottom:8px}
.note li{font-size:12px;color:#555;padding:2px 0;list-style:none}
.note li::before{content:'✓ ';color:#17a2b8;font-weight:bold}
.ftr{background:#1a1a1a;color:#b0b0b0;padding:20px;text-align:center;font-size:12px;line-height:1.8}
.ftr a{color:#d4af37;text-decoration:none}
</style></head><body>
<div class="wrap">
  <div class="hdr"><div class="logo">PEAKS <span>HOTEL</span></div><div class="sub">PEAKS HOTEL NANYUKI</div></div>
  <div class="body">
    <div class="badge"><span>✓ BOOKING CONFIRMED</span></div>
    <div class="section"><h3>Guest Information</h3><div class="grid">
      <div class="item"><label>Full Name</label><span>${b.firstName} ${b.lastName}</span></div>
      <div class="item"><label>Phone</label><span>${b.phone}</span></div>
      <div class="item"><label>Email</label><span>${b.email}</span></div>
      ${b.specialRequests ? `<div class="item" style="grid-column:1/-1"><label>Special Requests</label><span>${b.specialRequests}</span></div>` : ''}
    </div></div>
    <div class="section"><h3>Booking Details</h3><div class="grid">
      <div class="item"><label>Room Number</label><span>${b.roomNumber}</span></div>
      <div class="item"><label>Room Type</label><span>${b.roomType}</span></div>
      <div class="item"><label>Configuration</label><span>${roomConfigLabels[b.roomConfig] || b.roomConfig}</span></div>
      <div class="item"><label>Meal Plan</label><span>${mealPlanLabels[b.mealPlan] || b.mealPlan}</span></div>
      <div class="item"><label>Check-in</label><span>${formatDate(b.checkIn)}</span></div>
      <div class="item"><label>Check-out</label><span>${formatDate(b.checkOut)}</span></div>
      <div class="item"><label>Nights</label><span>${b.nights}</span></div>
      <div class="item"><label>Guests</label><span>${b.guests}</span></div>
    </div></div>
    <div class="price">
      <div class="price-row"><span>Price per night</span><span>KES ${parseInt(b.perNightPrice).toLocaleString()}</span></div>
      <div class="price-row"><span>Nights × Rooms</span><span>${b.nights} × ${b.numberOfRooms}</span></div>
      <div class="price-row price-total"><span>Total</span><span class="amt">KES ${parseInt(b.totalPrice).toLocaleString()}</span></div>
    </div>
    <div class="note"><h4>📋 Important Information</h4><ul>
      <li>Check-in: 2:00 PM | Check-out: 11:00 AM</li>
      <li>Free cancellation up to 48 hours before arrival</li>
      <li>Please present this email at check-in</li>
      <li>You will receive a confirmation call from our team shortly</li>
    </ul></div>
  </div>
  <div class="ftr">
    <strong style="color:#d4af37">PEAKS HOTEL NANYUKI</strong><br>
    Nanyuki-Meru/Isiolo Highway, Nanyuki, Kenya<br>
    +254 711 969 690 | <a href="mailto:info@peakshotel.co.ke">info@peakshotel.co.ke</a>
  </div>
</div></body></html>`;
}

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Send booking confirmation email + save to DB
app.post('/api/send-booking-email', async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, specialRequests,
      roomNumber, roomType, roomCategory, roomConfig, mealPlan,
      checkIn, checkOut, guests, numberOfRooms, nights,
      totalPrice, perNightPrice, paymentMethod, transactionCode, status,
    } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Look up room_id by room_number (best-effort)
    let roomId = null;
    if (roomNumber) {
      try { const room = await getRoomByNumber(roomNumber); roomId = room?.id ?? null; } catch (_) {}
    }

    const bookingStatus = status || (transactionCode ? 'confirmed' : 'pending');

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        guest_name: `${firstName} ${lastName}`,
        guest_email: email,
        guest_phone: phone,
        room_id: roomId,
        room_number: String(roomNumber || ''),
        room_type: roomType || roomCategory || 'standard',
        room_config: roomConfig || 'double',
        meal_plan: mealPlan || 'bed_breakfast',
        check_in: checkIn,
        check_out: checkOut,
        num_guests: parseInt(guests) || 1,
        number_of_rooms: parseInt(numberOfRooms) || 1,
        price_per_night: parseFloat(perNightPrice) || 0,
        total_amount: parseFloat(totalPrice) || 0,
        special_requests: specialRequests || null,
        payment_method: paymentMethod || null,
        payment_status: transactionCode ? 'paid' : 'pending',
        transaction_ref: transactionCode || null,
        status: bookingStatus,
      })
      .select()
      .single();

    if (bookingError) console.error('DB booking error:', bookingError.message);
    else console.log('Booking saved:', booking.reference);

    // Skip email if SMTP not configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.json({
        success: true,
        message: 'Booking saved (email skipped — SMTP not configured)',
        bookingReference: booking?.reference,
        bookingId: booking?.id,
      });
    }

    const emailHtml = createEmailTemplate({
      firstName, lastName, email, phone, specialRequests,
      roomNumber, roomType, roomConfig, mealPlan, checkIn, checkOut,
      guests: parseInt(guests), numberOfRooms: parseInt(numberOfRooms),
      nights: parseInt(nights), totalPrice: parseFloat(totalPrice), perNightPrice: parseFloat(perNightPrice),
    });

    await transporter.verify();
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Peaks Hotel Nanyuki'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🎫 Booking Confirmation — Peaks Hotel Nanyuki — Room ${roomNumber}`,
      html: emailHtml,
    });

    const hotelEmail = process.env.HOTEL_EMAIL || process.env.SMTP_USER;
    await transporter.sendMail({
      from: `"Peaks Hotel Booking System" <${process.env.SMTP_USER}>`,
      to: hotelEmail,
      subject: `New Booking — Room ${roomNumber} — ${firstName} ${lastName}`,
      html: `<div style="font-family:Arial,sans-serif;padding:20px">
        <h2 style="color:#d4af37">New Booking</h2>
        <p><b>Guest:</b> ${firstName} ${lastName} | <b>Phone:</b> ${phone} | <b>Email:</b> ${email}</p>
        <p><b>Room:</b> ${roomNumber} — ${roomType} | <b>Config:</b> ${roomConfigLabels[roomConfig] || roomConfig}</p>
        <p><b>Meal Plan:</b> ${mealPlanLabels[mealPlan] || mealPlan}</p>
        <p><b>Check-in:</b> ${formatDate(checkIn)} | <b>Check-out:</b> ${formatDate(checkOut)}</p>
        <p><b>Nights:</b> ${nights} | <b>Guests:</b> ${guests} | <b>Total:</b> KES ${parseFloat(totalPrice).toLocaleString()}</p>
        <p><b>Payment:</b> ${paymentMethod} | <b>Ref:</b> ${booking?.reference || 'N/A'}</p>
        ${specialRequests ? `<p><b>Special Requests:</b> ${specialRequests}</p>` : ''}
      </div>`,
    });

    res.json({
      success: true,
      message: 'Booking confirmed and email sent',
      bookingReference: booking?.reference,
      bookingId: booking?.id,
    });
  } catch (error) {
    console.error('send-booking-email error:', error.message);
    res.status(500).json({ error: 'Failed to process booking', details: error.message });
  }
});

// M-Pesa Daraja STK Push
async function getDarajaToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret || key === 'REPLACE_WITH_MPESA_CONSUMER_KEY') {
    throw new Error('M-Pesa credentials not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in server/.env');
  }
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const isSandbox = process.env.MPESA_USE_SANDBOX !== 'false';
  const base = isSandbox ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke';
  const { data } = await axios.get(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return { token: data.access_token, base };
}

// TEST endpoint — simulates STK push without real Daraja credentials
// Remove this in production
app.post('/api/daraja/stk-push-test', async (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount) return res.status(400).json({ success: false, message: 'phone and amount required' });
  console.log(`[TEST STK] Simulating KES ${amount} push to ${phone}`);
  // Simulate a 1-second delay like a real STK push
  await new Promise(r => setTimeout(r, 1000));
  res.json({
    success: true,
    message: '[TEST] Simulated STK push — no real charge made',
    checkoutRequestId: 'TEST-' + Date.now(),
    isTest: true,
  });
});

app.post('/api/daraja/stk-push', async (req, res) => {
  try {
    const { phone, amount, bookingData } = req.body;
    if (!phone || !amount) return res.status(400).json({ success: false, message: 'phone and amount required' });

    const clean = phone.replace(/\D/g, '');
    const formatted = clean.startsWith('254') ? clean : clean.startsWith('0') ? '254' + clean.slice(1) : '254' + clean;

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    if (!shortcode || !passkey || !callbackUrl) {
      return res.status(500).json({ success: false, message: 'M-Pesa not fully configured' });
    }

    const { token, base } = await getDarajaToken();
    const ts = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString('base64');
    const accountRef = 'PEAKS' + Date.now().toString(36).toUpperCase().slice(-6);

    const { data } = await axios.post(
      `${base}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortcode, Password: password, Timestamp: ts,
        TransactionType: 'CustomerPayBillOnline', Amount: Math.max(1, Math.round(amount)),
        PartyA: formatted, PartyB: shortcode, PhoneNumber: formatted,
        CallBackURL: callbackUrl, AccountReference: accountRef,
        TransactionDesc: 'Peaks Hotel Booking',
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    if (bookingData?.bookingId) {
      await supabase.from('mpesa_transactions').insert({
        booking_id: bookingData.bookingId, phone: formatted, amount: Math.round(amount),
        environment: process.env.MPESA_USE_SANDBOX !== 'false' ? 'sandbox' : 'live',
        merchant_request_id: data.MerchantRequestID,
        checkout_request_id: data.CheckoutRequestID, status: 'pending',
      });
    }

    res.json({ success: true, message: 'STK push sent', checkoutRequestId: data.CheckoutRequestID });
  } catch (error) {
    console.error('STK push error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.errorMessage || error.message });
  }
});

// M-Pesa callback from Safaricom
app.post('/api/daraja/callback', async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;
    const receipt = CallbackMetadata?.Item?.find((i) => i.Name === 'MpesaReceiptNumber')?.Value;
    const status = ResultCode === 0 ? 'completed' : 'failed';

    const { data: tx } = await supabase
      .from('mpesa_transactions')
      .update({ status, result_code: String(ResultCode), result_desc: ResultDesc, mpesa_receipt: receipt || null, callback_payload: req.body })
      .eq('checkout_request_id', CheckoutRequestID)
      .select('booking_id, amount')
      .single();

    if (ResultCode === 0 && tx?.booking_id) {
      await supabase.from('bookings').update({ status: 'confirmed', payment_status: 'paid', transaction_ref: receipt }).eq('id', tx.booking_id);
      await supabase.from('payments').insert({
        booking_id: tx.booking_id, amount: tx.amount || 0,
        method: 'mpesa', status: 'paid', transaction_ref: receipt, paid_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Callback error:', err.message);
  }
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// Paystack payment verification
app.get('/api/paystack/verify', async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ success: false, message: 'reference is required' });

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || secretKey === 'sk_test_your-secret-key') {
      // No secret key — accept the payment optimistically in test/dev
      console.warn('[Paystack] PAYSTACK_SECRET_KEY not set, skipping verification');
      return res.json({ success: true, message: 'Payment accepted (verification skipped — no secret key configured)' });
    }

    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );

    if (data.data?.status === 'success') {
      res.json({ success: true, reference, amount: data.data.amount / 100 });
    } else {
      res.json({ success: false, message: data.data?.gateway_response || 'Payment not successful' });
    }
  } catch (error) {
    console.error('Paystack verify error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
  }
});

// Guest review/feedback email
app.post('/api/send-review', async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS ||
        process.env.SMTP_USER.includes('REPLACE') || process.env.SMTP_PASS.includes('REPLACE')) {
      console.warn('[Review] SMTP not configured, skipping email');
      return res.json({ success: true, message: 'Review received (email skipped — SMTP not configured)' });
    }

    await transporter.sendMail({
      from: `"Peaks Hotel Website" <${process.env.SMTP_USER}>`,
      to: 'peakshotels@gmail.com',
      replyTo: email,
      subject: `New Guest Review — ${rating}/5 stars — ${name}`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:'Segoe UI',sans-serif;background:#f0f0f0;padding:20px;margin:0">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.15)">
  <div style="background:#1a1a1a;padding:24px;text-align:center;border-bottom:4px solid #d4af37">
    <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:2px">PEAKS <span style="color:#d4af37">HOTEL</span></div>
    <div style="color:#d4af37;font-size:12px;letter-spacing:3px;margin-top:4px">NEW GUEST REVIEW</div>
  </div>
  <div style="padding:28px">
    <div style="text-align:center;margin-bottom:20px">
      <span style="font-size:32px;letter-spacing:4px;color:#d4af37">${stars}</span>
      <div style="font-size:14px;color:#888;margin-top:4px">${rating} out of 5 stars</div>
    </div>
    <div style="background:#f8f9fa;border-left:4px solid #d4af37;border-radius:8px;padding:16px;margin-bottom:16px">
      <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Guest Name</div>
      <div style="font-size:16px;font-weight:600;color:#1a1a1a">${name}</div>
    </div>
    <div style="background:#f8f9fa;border-left:4px solid #d4af37;border-radius:8px;padding:16px;margin-bottom:16px">
      <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Email</div>
      <div style="font-size:16px;font-weight:600;color:#1a1a1a"><a href="mailto:${email}" style="color:#d4af37">${email}</a></div>
    </div>
    <div style="background:#f8f9fa;border-left:4px solid #d4af37;border-radius:8px;padding:16px">
      <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Review</div>
      <div style="font-size:15px;color:#333;line-height:1.6">${message.replace(/\n/g, '<br>')}</div>
    </div>
  </div>
  <div style="background:#1a1a1a;color:#b0b0b0;padding:16px;text-align:center;font-size:12px">
    Submitted via peakshotel.co.ke — ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
  </div>
</div></body></html>`,
    });

    res.json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    console.error('send-review error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to send review' });
  }
});

// Admin endpoints
app.get('/api/admin/bookings', async (_req, res) => {
  try { res.json({ success: true, data: await getAllBookings() }); }
  catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.patch('/api/admin/bookings/:id', async (req, res) => {
  try { res.json({ success: true, data: await updateBookingStatus(req.params.id, req.body.status) }); }
  catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.listen(PORT, () => console.log(`Peaks Hotel server running on port ${PORT}`));
