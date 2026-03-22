import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { 
  getRooms, 
  getRoomByNumber, 
  getRoomPricing, 
  getAllPricing,
  checkRoomAvailability,
  getAvailableRooms,
  createBooking,
  getBookingByReference,
  updateBookingStatus,
  getAllBookings,
  updateRoomAvailability
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============ EMAIL CONFIGURATION ============

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "cipherctech@gmail.com",
    pass: "dlbt ftit tmxs miby",
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
  logger: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Email helper functions
const roomConfigLabels = {
  single: "Single Room",
  double: "Double Room",
  twin: "Twin Room (per person)",
};

const mealPlanLabels = {
  bed_breakfast: "Bed & Breakfast",
  half_board: "Half Board",
  full_board: "Full Board",
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Email template function
function createEmailTemplate(bookingData) {
  const {
    firstName,
    lastName,
    email,
    phone,
    specialRequests,
    roomNumber,
    roomType,
    roomCategory,
    roomConfig,
    mealPlan,
    checkIn,
    checkOut,
    guests,
    numberOfRooms,
    nights,
    totalPrice,
    perNightPrice,
  } = bookingData;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - Peaks Hotel Nanyuki</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; }
    .ticket-container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; position: relative; }
    .ticket-header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center; position: relative; border-bottom: 5px solid #d4af37; }
    .ticket-header::after { content: ''; position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; border: 5px solid #ffffff; }
    .logo-container { display: inline-block; background: #ffffff; padding: 20px 30px; border-radius: 15px; margin-bottom: 15px; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); }
    .logo-text { font-size: 36px; font-weight: 900; color: #1a1a1a; letter-spacing: 2px; margin: 0; }
    .logo-accent { color: #d4af37; }
    .hotel-name { color: #d4af37; font-size: 18px; font-weight: 600; margin-top: 10px; letter-spacing: 3px; }
    .tagline { color: #ffffff; font-size: 14px; margin-top: 8px; font-style: italic; }
    .ticket-body { padding: 50px 40px 40px; background: #ffffff; }
    .confirmation-badge { text-align: center; margin-bottom: 40px; }
    .badge { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #1a1a1a; padding: 12px 30px; border-radius: 50px; font-weight: 700; font-size: 16px; letter-spacing: 1px; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4); }
    .ticket-section { margin-bottom: 35px; padding: 25px; background: #f8f9fa; border-radius: 15px; border-left: 5px solid #d4af37; }
    .section-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .section-title::before { content: ''; width: 5px; height: 25px; background: #d4af37; border-radius: 3px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-item { padding: 12px 0; border-bottom: 1px dashed #dee2e6; }
    .info-item:last-child { border-bottom: none; }
    .info-label { font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; font-weight: 600; }
    .info-value { font-size: 16px; color: #1a1a1a; font-weight: 600; }
    .price-section { background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%); padding: 30px; border-radius: 15px; border: 3px solid #d4af37; margin: 30px 0; text-align: center; }
    .price-breakdown { margin-bottom: 20px; }
    .price-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #495057; }
    .price-row.total { border-top: 2px solid #d4af37; margin-top: 15px; padding-top: 15px; font-size: 28px; font-weight: 900; color: #1a1a1a; }
    .price-amount { color: #d4af37; font-weight: 700; }
    .ticket-footer { background: #1a1a1a; color: #ffffff; padding: 30px; text-align: center; }
    .footer-title { font-size: 18px; font-weight: 700; color: #d4af37; margin-bottom: 15px; }
    .footer-info { font-size: 13px; line-height: 1.8; color: #b0b0b0; }
    .footer-info a { color: #d4af37; text-decoration: none; }
    .important-note { background: #e8f4f8; border-left: 5px solid #17a2b8; padding: 20px; border-radius: 10px; margin-top: 30px; }
    .important-note-title { font-weight: 700; color: #17a2b8; margin-bottom: 10px; font-size: 16px; }
    .important-note ul { list-style: none; padding-left: 0; }
    .important-note li { padding: 5px 0; color: #495057; font-size: 14px; }
    .important-note li::before { content: '✓ '; color: #17a2b8; font-weight: bold; margin-right: 8px; }
    @media only screen and (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .ticket-body { padding: 30px 20px; } .logo-text { font-size: 28px; } }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="ticket-header">
      <div class="logo-container">
        <div class="logo-text">PEAKS <span class="logo-accent">HOTEL</span></div>
      </div>
      <div class="hotel-name">PEAKS HOTEL NANYUKI</div>
      <div class="tagline">Where Luxury Meets African Majesty</div>
    </div>
    <div class="ticket-body">
      <div class="confirmation-badge">
        <div class="badge">✓ BOOKING CONFIRMED</div>
      </div>
      <div class="ticket-section">
        <div class="section-title">Guest Information</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Full Name</div>
            <div class="info-value">${firstName} ${lastName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email Address</div>
            <div class="info-value">${email}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Phone Number</div>
            <div class="info-value">${phone}</div>
          </div>
          ${specialRequests ? `
          <div class="info-item" style="grid-column: 1 / -1;">
            <div class="info-label">Special Requests</div>
            <div class="info-value">${specialRequests}</div>
          </div>
          ` : ""}
        </div>
      </div>
      <div class="ticket-section">
        <div class="section-title">Booking Details</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Room Number</div>
            <div class="info-value">${roomNumber}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Room Type</div>
            <div class="info-value">${roomType}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Room Configuration</div>
            <div class="info-value">${roomConfigLabels[roomConfig] || roomConfig}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Meal Plan</div>
            <div class="info-value">${mealPlanLabels[mealPlan] || mealPlan}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Check-in Date</div>
            <div class="info-value">${formatDate(checkIn)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Check-out Date</div>
            <div class="info-value">${formatDate(checkOut)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Number of Nights</div>
            <div class="info-value">${nights} night${nights !== 1 ? "s" : ""}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Number of Rooms</div>
            <div class="info-value">${numberOfRooms}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Number of Guests</div>
            <div class="info-value">${guests}</div>
          </div>
        </div>
      </div>
      <div class="price-section">
        <div class="price-breakdown">
          <div class="price-row">
            <span>Price per Night</span>
            <span class="price-amount">KES ${parseInt(perNightPrice).toLocaleString()}</span>
          </div>
          <div class="price-row">
            <span>Nights</span>
            <span>${nights} night${nights !== 1 ? "s" : ""}</span>
          </div>
          <div class="price-row">
            <span>Rooms</span>
            <span>${numberOfRooms} room${numberOfRooms !== 1 ? "s" : ""}</span>
          </div>
          <div class="price-row total">
            <span>Total Amount Payable</span>
            <span class="price-amount">KES ${parseInt(totalPrice).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div class="important-note">
        <div class="important-note-title">📋 Important Information</div>
        <ul>
          <li>Check-in time: 2:00 PM</li>
          <li>Check-out time: 11:00 AM</li>
          <li>Free cancellation up to 48 hours before arrival</li>
          <li>Your passport/ID documents have been received and are being processed</li>
          <li>You will receive a confirmation call from our reservations team shortly</li>
          <li>Please present this confirmation email at check-in</li>
        </ul>
      </div>
    </div>
    <div class="ticket-footer">
      <div class="footer-title">PEAKS HOTEL NANYUKI</div>
      <div class="footer-info">
        <p><strong>Location:</strong> Nanyuki-Meru Highway, Nanyuki, Kenya</p>
        <p><strong>Phone:</strong> +254 700 000 000 | <strong>Email:</strong> <a href="mailto:info@peakshotel.co.ke">info@peakshotel.co.ke</a></p>
        <p style="margin-top: 20px; color: #d4af37; font-style: italic;">Thank you for choosing Peaks Hotel. We look forward to hosting you!</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// ============ DATABASE IMPORTS ============

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint to check MPESA configuration
app.get('/api/debug/mpesa', (req, res) => {
  const hasConsumerKey = !!process.env.MPESA_CONSUMER_KEY;
  const hasConsumerSecret = !!process.env.MPESA_CONSUMER_SECRET;
  const hasShortCode = !!process.env.MPESA_SHORTCODE;
  const hasPasskey = !!process.env.MPESA_PASSKEY;
  
  res.json({
    configured: hasConsumerKey && hasConsumerSecret && hasShortCode && hasPasskey,
    consumerKey: hasConsumerKey ? "set (" + process.env.MPESA_CONSUMER_KEY.length + " chars)" : "missing",
    consumerSecret: hasConsumerSecret ? "set (" + process.env.MPESA_CONSUMER_SECRET.length + " chars)" : "missing",
    shortCode: process.env.MPESA_SHORTCODE || "missing",
    passkey: hasPasskey ? "set (" + process.env.MPESA_PASSKEY.length + " chars)" : "missing",
    callbackUrl: process.env.MPESA_CALLBACK_URL || "not set"
  });
});

// ============ ROOMS ============

// Get all rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await getRooms();
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get room by number
app.get('/api/rooms/:roomNumber', async (req, res) => {
  try {
    const room = await getRoomByNumber(parseInt(req.params.roomNumber));
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ PRICING ============

// Get all pricing
app.get('/api/pricing', async (req, res) => {
  try {
    const pricing = await getAllPricing();
    res.json({ success: true, data: pricing });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pricing for specific room type
app.get('/api/pricing/:roomType', async (req, res) => {
  try {
    const pricing = await getAllPricing();
    const filtered = pricing.filter(p => p.room_type === req.params.roomType);
    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ AVAILABILITY ============

// Check room availability
app.get('/api/availability/:roomNumber', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ 
        success: false, 
        error: 'Check-in and check-out dates are required' 
      });
    }

    const availability = await checkRoomAvailability(
      parseInt(req.params.roomNumber),
      checkIn,
      checkOut
    );
    res.json({ success: true, data: availability });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available rooms
app.get('/api/available-rooms', async (req, res) => {
  try {
    const { checkIn, checkOut, roomType } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ 
        success: false, 
        error: 'Check-in and check-out dates are required' 
      });
    }

    const rooms = await getAvailableRooms(checkIn, checkOut, roomType);
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ BOOKINGS ============

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate required fields
    const required = [
      'guest_first_name', 'guest_last_name', 'guest_email',
      'room_number', 'room_type', 'room_config', 'meal_plan',
      'check_in', 'check_out', 'number_of_guests', 'number_of_nights',
      'price_per_night', 'total_price'
    ];

    const missing = required.filter(field => !bookingData[field]);
    if (missing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Missing required fields: ${missing.join(', ')}` 
      });
    }

    // Check availability before creating booking
    const availability = await checkRoomAvailability(
      bookingData.room_number,
      bookingData.check_in,
      bookingData.check_out
    );

    if (!availability.available) {
      return res.status(400).json({ 
        success: false, 
        error: availability.reason || 'Room not available for selected dates' 
      });
    }

    const booking = await createBooking(bookingData);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get booking by reference
app.get('/api/bookings/:reference', async (req, res) => {
  try {
    const booking = await getBookingByReference(req.params.reference);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all bookings (admin)
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update booking status (admin)
app.patch('/api/admin/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await updateBookingStatus(req.params.id, status);
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update room availability (admin)
app.post('/api/admin/availability', async (req, res) => {
  try {
    const { roomId, date, isAvailable, bookingId } = req.body;
    const result = await updateRoomAvailability(roomId, date, isAvailable, bookingId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ EMAIL ENDPOINT ============

// API endpoint to send booking confirmation email
app.post('/api/send-booking-email', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      specialRequests,
      roomNumber,
      roomType,
      roomCategory,
      roomConfig,
      mealPlan,
      checkIn,
      checkOut,
      guests,
      numberOfRooms,
      nights,
      totalPrice,
      perNightPrice,
      status,
      paymentMethod,
      transactionCode,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Look up the room by room_number to get the room_id
    let roomId = null;
    if (roomNumber) {
      try {
        const room = await getRoomByNumber(roomNumber);
        roomId = room?.id || null;
      } catch (roomError) {
        console.warn('⚠️ Could not find room by number:', roomNumber, roomError.message);
      }
    }

    // Create booking in the database
    const bookingStatus = status || 'confirmed';
    const bookingData = {
      guest_first_name: firstName,
      guest_last_name: lastName,
      guest_email: email,
      guest_phone: phone,
      room_id: roomId,
      room_type: roomType || roomCategory || 'standard',
      room_config: roomConfig || 'double',
      meal_plan: mealPlan || 'bed_breakfast',
      check_in: checkIn,
      check_out: checkOut,
      number_of_guests: parseInt(guests) || 1,
      number_of_rooms: parseInt(numberOfRooms) || 1,
      number_of_nights: parseInt(nights) || 1,
      price_per_night: parseFloat(perNightPrice) || 0,
      total_price: parseFloat(totalPrice) || 0,
      special_requests: specialRequests || null,
      status: bookingStatus,
      payment_status: transactionCode ? 'paid' : 'pending',
    };

    // Generate booking reference
    const bookingRef = `PH${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    bookingData.booking_reference = bookingRef;

    console.log('💾 Saving booking to database:', bookingData);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Database error saving booking:', bookingError);
      // Continue with email even if database save fails
    } else {
      console.log('✅ Booking saved successfully:', booking.booking_reference);
    }

    // Create email content
    const emailHtml = createEmailTemplate({
      firstName,
      lastName,
      email,
      phone,
      specialRequests: specialRequests || "",
      roomNumber,
      roomType,
      roomCategory,
      roomConfig,
      mealPlan,
      checkIn,
      checkOut,
      guests: parseInt(guests),
      numberOfRooms: parseInt(numberOfRooms),
      nights: parseInt(nights),
      totalPrice: parseFloat(totalPrice),
      perNightPrice: parseFloat(perNightPrice),
    });

    // Send email to guest
    const mailOptions = {
      from: '"PEAKS HOTEL NANYUKI" <cipherctech@gmail.com>',
      to: email,
      subject: `🎫 Booking Confirmation - Peaks Hotel Nanyuki - Room ${roomNumber}`,
      html: emailHtml,
    };

    // Verify SMTP connection before sending
    await transporter.verify();
    console.log("✅ SMTP server is ready to send emails");

    // Send email to guest
    console.log(`📧 Sending confirmation email to: ${email}`);
    console.log(`📧 Email details:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });
    
    const guestResult = await transporter.sendMail(mailOptions);
    console.log(`✅ Guest email sent successfully.`);
    console.log(`   Message ID: ${guestResult.messageId}`);
    console.log(`   Response: ${guestResult.response}`);
    console.log(`   Accepted: ${guestResult.accepted}`);
    console.log(`   Rejected: ${guestResult.rejected}`);

    // Also send a copy to the hotel email
    const hotelMailOptions = {
      from: '"PEAKS HOTEL NANYUKI Booking System" <cipherctech@gmail.com>',
      to: "cipherctech@gmail.com",
      subject: `📧 New Booking - Room ${roomNumber} - ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #d4af37;">New Booking Received</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Guest:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Room:</strong> ${roomNumber} - ${roomType}</p>
            <p><strong>Configuration:</strong> ${roomConfigLabels[roomConfig] || roomConfig}</p>
            <p><strong>Meal Plan:</strong> ${mealPlanLabels[mealPlan] || mealPlan}</p>
            <p><strong>Check-in:</strong> ${formatDate(checkIn)}</p>
            <p><strong>Check-out:</strong> ${formatDate(checkOut)}</p>
            <p><strong>Nights:</strong> ${nights}</p>
            <p><strong>Guests:</strong> ${guests}</p>
            <p><strong>Total Price:</strong> KES ${parseInt(totalPrice).toLocaleString()}</p>
            ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ""}
          </div>
        </div>
      `,
    };

    const hotelResult = await transporter.sendMail(hotelMailOptions);
    console.log(`✅ Hotel notification sent successfully.`);
    console.log(`   Message ID: ${hotelResult.messageId}`);

    res.json({ 
      success: true, 
      message: "Booking confirmation email sent successfully",
      bookingReference: bookingRef,
      bookingId: booking?.id || null,
      guestEmailId: guestResult.messageId,
      hotelEmailId: hotelResult.messageId
    });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to send booking confirmation email",
      details: error.message 
    });
  }
});

// ============ DARAJA/STK PUSH (Integrated) ============

// Helper: get OAuth token
async function getAccessToken() {
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  // Use MPESA_ prefixed vars from .env
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  
  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET environment variables");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    console.log("✅ Access token received");
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Failed to get access token:", error.response?.data || error.message);
    throw new Error("Failed to get access token");
  }
}

// Direct STK Push endpoint
app.post('/api/daraja/stk-push', async (req, res) => {
  try {
    const { phone, amount, email, firstName, lastName } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and amount are required' 
      });
    }

    // Format phone number
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('254') 
      ? cleanPhone 
      : cleanPhone.startsWith('0') 
        ? '254' + cleanPhone.substring(1)
        : '254' + cleanPhone;

    console.log('📱 STK Push request:', { phone: formattedPhone, amount });

    const token = await getAccessToken();

    const stkUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const passkey = process.env.MPESA_PASSKEY;
    const shortCode = process.env.MPESA_SHORTCODE;
    const partyB = process.env.MPESA_PARTYB || shortCode;
    
    if (!passkey || !shortCode) {
      return res.status(500).json({ 
        success: false, 
        error: 'Missing MPESA_PASSKEY or MPESA_SHORTCODE environment variables' 
      });
    }
    
    const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: partyB,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL || `http://localhost:${PORT}/api/daraja/callback`,
      AccountReference: "Peaks Hotel Nanyuki",
      TransactionDesc: "Peaks Hotel Booking Payment",
    };

    console.log('📤 Sending STK Push to Safaricom...');

    const response = await axios.post(stkUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log('✅ STK Push response:', response.data);

    if (response.data.CheckoutRequestID) {
      res.json({
        success: true,
        message: 'STK push sent! Please check your phone.',
        checkoutRequestID: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode
      });
    } else {
      res.json({
        success: true,
        message: response.data.ResponseDescription || 'STK push initiated',
        ...response.data
      });
    }
  } catch (error) {
    console.error('❌ STK Push error:', error.response?.data || error.message);
    
    if (error.response) {
      const errorData = error.response.data;
      console.error('❌ Safaricom error response:', JSON.stringify(errorData));
      res.status(error.response.status || 500).json({
        success: false,
        error: errorData?.error || errorData?.errorMessage || 'STK Push failed',
        message: errorData?.ResponseDescription || errorData?.errorMessage || error.message,
        details: errorData
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      res.status(503).json({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to Safaricom API. Please check your internet connection.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Payment failed',
        message: error.message || 'Unknown error occurred'
      });
    }
  }
});

// M-Pesa Callback endpoint
app.post('/api/daraja/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('📞 M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    const result = callbackData.Body?.stkCallback || callbackData;

    if (result.ResultCode === 0) {
      const checkoutRequestID = result.CheckoutRequestID;
      const merchantRequestID = result.MerchantRequestID;
      const callbackMetadata = result.CallbackMetadata?.Item || [];
      
      let mpesaReceiptNumber = "";
      let amount = "";
      let phoneNumber = "";

      callbackMetadata.forEach((item) => {
        if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = item.Value;
        else if (item.Name === "Amount") amount = item.Value;
        else if (item.Name === "PhoneNumber") phoneNumber = item.Value;
      });

      console.log(`✅ Payment Success: ${mpesaReceiptNumber} from ${phoneNumber} - KES ${amount}`);
      console.log(`   CheckoutRequestID: ${checkoutRequestID}`);
    } else {
      console.log(`❌ Payment Failed: ${result.ResultDesc}`);
    }

    res.json({ success: true, message: "Callback processed" });
  } catch (error) {
    console.error('❌ Callback Error:', error.message);
    res.json({ success: true, message: "Callback received" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
