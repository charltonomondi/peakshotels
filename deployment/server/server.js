import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Supabase client for booking storage
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = 3001;

// In-memory storage for pending M-Pesa bookings (keyed by account reference)
const pendingMpesaBookings = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// SMTP Configuration with explicit TLS
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS (port 587), set to true for SSL (port 465)
  requireTLS: true, // Require TLS
  auth: {
    user: "cipherctech@gmail.com",
    pass: "dlbt ftit tmxs miby", // App password
  },
  tls: {
    // Do not fail on invalid certs (for development)
    rejectUnauthorized: false,
  },
  // Enable debug output for troubleshooting
  debug: true, // Always enable debug
  logger: true, // Log to console
  // Add connection timeout
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Helper functions for email templates
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }
    .ticket-container {
      max-width: 1400px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
      position: relative;
    }
    .ticket-header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      padding: 30px 50px;
      text-align: center;
      position: relative;
      border-bottom: 5px solid #d4af37;
    }
    .ticket-header::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      border: 5px solid #ffffff;
    }
    .logo-container {
      display: inline-block;
      background: #ffffff;
      padding: 15px 25px;
      border-radius: 15px;
      margin-bottom: 10px;
      box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
    }
    .logo-text {
      font-size: 36px;
      font-weight: 900;
      color: #1a1a1a;
      letter-spacing: 2px;
      margin: 0;
    }
    .logo-accent {
      color: #d4af37;
    }
    .hotel-name {
      color: #d4af37;
      font-size: 18px;
      font-weight: 600;
      margin-top: 10px;
      letter-spacing: 3px;
    }
    .tagline {
      color: #ffffff;
      font-size: 14px;
      margin-top: 8px;
      font-style: italic;
    }
    .ticket-body {
      padding: 40px 50px;
      background: #ffffff;
    }
    .confirmation-badge {
      text-align: center;
      margin-bottom: 25px;
    }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
      color: #1a1a1a;
      padding: 12px 30px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 1px;
      box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4);
    }
    .ticket-section {
      margin-bottom: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 15px;
      border-left: 5px solid #d4af37;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::before {
      content: '';
      width: 5px;
      height: 25px;
      background: #d4af37;
      border-radius: 3px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    .info-item {
      padding: 12px 0;
      border-bottom: 1px dashed #dee2e6;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
      font-weight: 600;
    }
    .info-value {
      font-size: 16px;
      color: #1a1a1a;
      font-weight: 600;
    }
    .price-section {
      background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%);
      padding: 25px;
      border-radius: 15px;
      border: 3px solid #d4af37;
      margin: 25px 0;
      text-align: center;
    }
    .price-breakdown {
      margin-bottom: 20px;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      color: #495057;
    }
    .price-row.total {
      border-top: 2px solid #d4af37;
      margin-top: 15px;
      padding-top: 15px;
      font-size: 28px;
      font-weight: 900;
      color: #1a1a1a;
    }
    .price-amount {
      color: #d4af37;
      font-weight: 700;
    }
    .ticket-footer {
      background: #1a1a1a;
      color: #ffffff;
      padding: 25px;
      text-align: center;
      position: relative;
    }
    .footer-title {
      font-size: 18px;
      font-weight: 700;
      color: #d4af37;
      margin-bottom: 15px;
    }
    .footer-info {
      font-size: 13px;
      line-height: 1.8;
      color: #b0b0b0;
    }
    .footer-info a {
      color: #d4af37;
      text-decoration: none;
    }
    .important-note {
      background: #e8f4f8;
      border-left: 5px solid #17a2b8;
      padding: 15px;
      border-radius: 10px;
      margin-top: 20px;
    }
    .important-note-title {
      font-weight: 700;
      color: #17a2b8;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .important-note ul {
      list-style: none;
      padding-left: 0;
    }
    .important-note li {
      padding: 5px 0;
      color: #495057;
      font-size: 14px;
    }
    .important-note li::before {
      content: '✓ ';
      color: #17a2b8;
      font-weight: bold;
      margin-right: 8px;
    }
    .peaks-decoration {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      overflow: hidden;
    }
    .peak {
      position: absolute;
      bottom: 0;
      width: 0;
      height: 0;
      border-style: solid;
    }
    .peak-1 { left: 5%; border-width: 0 40px 60px 40px; border-color: transparent transparent #d4af37 transparent; opacity: 0.3; }
    .peak-2 { left: 15%; border-width: 0 30px 45px 30px; border-color: transparent transparent #f4d03f transparent; opacity: 0.4; }
    .peak-3 { left: 25%; border-width: 0 50px 70px 50px; border-color: transparent transparent #d4af37 transparent; opacity: 0.5; }
    .peak-4 { left: 40%; border-width: 0 35px 55px 35px; border-color: transparent transparent #f4d03f transparent; opacity: 0.3; }
    .peak-5 { left: 55%; border-width: 0 45px 65px 45px; border-color: transparent transparent #d4af37 transparent; opacity: 0.4; }
    .peak-6 { left: 70%; border-width: 0 30px 50px 30px; border-color: transparent transparent #f4d03f transparent; opacity: 0.5; }
    .peak-7 { left: 85%; border-width: 0 40px 60px 40px; border-color: transparent transparent #d4af37 transparent; opacity: 0.3; }
    .header-peaks {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
    }
    .header-peak {
      position: absolute;
      bottom: 0;
      width: 0;
      height: 0;
      border-style: solid;
    }
    .header-peak-1 { left: 2%; border-width: 0 25px 40px 25px; border-color: transparent transparent rgba(212, 175, 55, 0.15) transparent; }
    .header-peak-2 { left: 10%; border-width: 0 35px 50px 35px; border-color: transparent transparent rgba(212, 175, 55, 0.1) transparent; }
    .header-peak-3 { right: 10%; border-width: 0 35px 50px 35px; border-color: transparent transparent rgba(212, 175, 55, 0.1) transparent; }
    .header-peak-4 { right: 2%; border-width: 0 25px 40px 25px; border-color: transparent transparent rgba(212, 175, 55, 0.15) transparent; }
    @media only screen and (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr 1fr;
      }
      .ticket-body {
        padding: 25px 20px;
      }
      .logo-text {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="ticket-header">
      <div class="header-peaks">
        <div class="header-peak header-peak-1"></div>
        <div class="header-peak header-peak-2"></div>
        <div class="header-peak header-peak-3"></div>
        <div class="header-peak header-peak-4"></div>
      </div>
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
      <div class="peaks-decoration">
        <div class="peak peak-1"></div>
        <div class="peak peak-2"></div>
        <div class="peak peak-3"></div>
        <div class="peak peak-4"></div>
        <div class="peak peak-5"></div>
        <div class="peak peak-6"></div>
        <div class="peak peak-7"></div>
      </div>
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

// API endpoint to send booking confirmation email
app.post("/api/send-booking-email", async (req, res) => {
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
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
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

    // Save booking to Supabase (if configured)
    if (supabase) {
      // First, find the room ID by room number
      let roomId = null;
      if (roomNumber) {
        const { data: rooms } = await supabase.from("rooms").select("id").like("room_number", `%${roomNumber}%`).limit(1);
        roomId = rooms?.[0]?.id;
      }
      
      // Generate unique reference
      const bookingRef = "PEAKS-" + Date.now().toString(36).toUpperCase();
      
      const bookingData = {
        reference: bookingRef,
        guest_name: `${firstName} ${lastName}`,
        guest_email: email,
        guest_phone: phone,
        room_id: roomId,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: parseInt(guests) || 1,
        total_amount: parseFloat(totalPrice) || 0,
        status: req.body.status || "confirmed",
        notes: specialRequests || null,
      };
      
      const { data: booking, error: bookingError } = await supabase.from("bookings").insert(bookingData).select().single();
      if (bookingError) {
        console.error("❌ Failed to save booking to Supabase:", bookingError.message);
      } else {
        console.log("✅ Booking saved to Supabase:", bookingRef, "ID:", booking?.id);
      }
    } else {
      console.log("⚠️ Supabase not configured - booking not saved to database");
    }

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
            <p><strong>Rooms:</strong> ${numberOfRooms}</p>
            <p><strong>Total Amount:</strong> KES ${parseFloat(totalPrice).toLocaleString()}</p>
            ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
          </div>
        </div>
      `,
    };

    // Send email to hotel
    console.log(`📧 Sending notification email to hotel: cipherctech@gmail.com`);
    const hotelResult = await transporter.sendMail(hotelMailOptions);
    console.log(`✅ Hotel email sent successfully.`);
    console.log(`   Message ID: ${hotelResult.messageId}`);
    console.log(`   Response: ${hotelResult.response}`);
    console.log(`   Accepted: ${hotelResult.accepted}`);
    console.log(`   Rejected: ${hotelResult.rejected}`);

    res.json({
      success: true,
      message: "Booking confirmation email sent successfully",
      guestEmailId: guestResult.messageId,
      hotelEmailId: hotelResult.messageId,
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    console.error("Error details:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    res.status(500).json({
      error: "Failed to send email",
      details: error.message,
      code: error.code,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Peaks Hotel Booking API is running" });
});

// Mount Kenya climbing expedition booking
app.post("/api/send-mountain-booking", async (req, res) => {
  try {
    const {
      fullName, email, phone,
      entryPoint, exitPoint, groupSize,
      accommodation, numberOfDays, startDate,
      residency, experience, specialRequests,
      package: pkg,
    } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const residencyLabel = residency === "eac" ? "EAC Resident" : "Non-EAC Resident";
    const accomLabel     = accommodation === "bandas" ? "Bandas (Huts)" : "Tents";
    const expLabel       = { beginner: "Beginner — first time", intermediate: "Intermediate — some hiking", experienced: "Experienced — high altitude" }[experience] || experience;
    const formattedDate  = startDate ? new Date(startDate).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Not specified";

    const rows = [
      ["Full Name",          fullName],
      ["Email",              email],
      ["Phone",              phone],
      ["Preferred Start Date", formattedDate],
      ["Entry Point",        entryPoint || "Sirimon Gate"],
      ["Exit Point",         exitPoint  || "Sirimon Gate"],
      ["Number of People",   `${groupSize} ${groupSize === "1" ? "person" : "people"}`],
      ["Number of Days",     `${numberOfDays} days`],
      ["Accommodation",      accomLabel],
      ["Residency",          residencyLabel],
      ["Experience Level",   expLabel],
    ].map(([label, val]) => `
      <tr>
        <td style="padding:11px 16px;border-bottom:1px solid #1e3320;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:.5px;width:38%;vertical-align:top">${label}</td>
        <td style="padding:11px 16px;border-bottom:1px solid #1e3320;color:#ffffff;font-size:14px;font-weight:600;vertical-align:top">${val}</td>
      </tr>`).join("");

    const hotelHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#0a1208;font-family:'Segoe UI',sans-serif">
<div style="max-width:620px;margin:0 auto;background:#0d1a0f;border-radius:20px;overflow:hidden;border:1px solid #1e3320;box-shadow:0 20px 60px rgba(0,0,0,0.5)">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#14401a 0%,#0d1a0f 100%);padding:32px 28px;border-bottom:3px solid #16a34a;text-align:center">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(22,163,74,0.15);border:1px solid rgba(22,163,74,0.3);padding:6px 16px;border-radius:50px;margin-bottom:14px">
      <span style="color:#4ade80;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase">Peaks Hotel · Adventures</span>
    </div>
    <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 6px;letter-spacing:-0.5px">🏔️ Mount Kenya Expedition</h1>
    <p style="color:#6b7280;font-size:13px;margin:0">New booking enquiry received</p>
  </div>

  <!-- Details table -->
  <div style="padding:28px">
    <table style="width:100%;border-collapse:collapse;background:#162018;border-radius:12px;overflow:hidden;border:1px solid #1e3320">
      ${rows}
    </table>

    ${specialRequests ? `
    <div style="margin-top:20px;background:#111f13;border-left:4px solid #16a34a;border-radius:10px;padding:16px">
      <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin:0 0 8px;font-weight:600">Special Requests / Notes</p>
      <p style="color:#d1fae5;font-size:14px;line-height:1.6;margin:0">${specialRequests}</p>
    </div>` : ""}

    <!-- Summary pill -->
    <div style="margin-top:24px;background:linear-gradient(135deg,#14401a,#0d2e12);border:1px solid #16a34a;border-radius:14px;padding:20px;text-align:center">
      <p style="color:#4ade80;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">Expedition Summary</p>
      <p style="color:#ffffff;font-size:18px;font-weight:800;margin:0 0 4px">${accomLabel} · ${numberOfDays} Days · ${groupSize} ${groupSize === "1" ? "Person" : "People"}</p>
      <p style="color:#86efac;font-size:13px;margin:0">${residencyLabel} · Starting ${formattedDate}</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#060e07;padding:16px 28px;display:flex;justify-content:space-between;align-items:center">
    <span style="color:#374151;font-size:11px">Peaks Hotel Nanyuki · peakshotels.co.ke</span>
    <span style="color:#374151;font-size:11px">${new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</span>
  </div>
</div>
</body></html>`;

    const guestHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f0f4f0;font-family:'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1)">
  <div style="background:linear-gradient(135deg,#14532d 0%,#166534 100%);padding:32px;text-align:center;border-bottom:4px solid #16a34a">
    <p style="color:#86efac;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px">Peaks Hotel · Adventures</p>
    <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0">🏔️ Expedition Request Received</h1>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;font-size:16px;margin:0 0 12px">Dear <strong>${fullName}</strong>,</p>
    <p style="color:#6b7280;line-height:1.8;margin:0 0 20px">
      Thank you for your Mount Kenya climbing expedition request. Our adventure team at Peaks Hotel will review your enquiry and <strong style="color:#374151">contact you within 24 hours</strong> to confirm availability and arrange the details.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:20px">
      <p style="color:#14532d;font-weight:700;font-size:14px;margin:0 0 12px">📋 Your Expedition Summary</p>
      ${[
        ["Start Date",     formattedDate],
        ["Entry / Exit",   `${entryPoint || "Sirimon Gate"} → ${exitPoint || "Sirimon Gate"}`],
        ["Group Size",     `${groupSize} ${groupSize === "1" ? "person" : "people"}`],
        ["Duration",       `${numberOfDays} days`],
        ["Accommodation",  accomLabel],
        ["Rate Category",  residencyLabel],
      ].map(([l, v]) => `<p style="color:#374151;font-size:13px;margin:5px 0"><strong>${l}:</strong> ${v}</p>`).join("")}
    </div>
    <p style="color:#6b7280;font-size:13px;margin:0">
      Have questions? Call us at <a href="tel:+254711969690" style="color:#16a34a;font-weight:600">+254 711 969 690</a> or email 
      <a href="mailto:info@peakshotels.co.ke" style="color:#16a34a;font-weight:600">info@peakshotels.co.ke</a>
    </p>
  </div>
  <div style="background:#0d1a0f;padding:16px 24px;text-align:center">
    <p style="color:#4b5563;font-size:11px;margin:0">Peaks Hotel Nanyuki · Nanyuki-Meru Highway, Kenya</p>
  </div>
</div>
</body></html>`;

    await transporter.verify();

    // Send to hotel
    await transporter.sendMail({
      from: '"Peaks Hotel Adventures" <cipherctech@gmail.com>',
      to: "info@peakshotels.co.ke",
      replyTo: email,
      subject: `🏔️ Mt. Kenya Expedition — ${fullName} — ${formattedDate} — ${groupSize} pax`,
      html: hotelHtml,
    });

    // Send confirmation to guest
    await transporter.sendMail({
      from: '"Peaks Hotel Adventures" <cipherctech@gmail.com>',
      to: email,
      subject: "Your Mount Kenya Expedition Request — Peaks Hotel Nanyuki",
      html: guestHtml,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("mountain booking error:", err.message);
    res.status(500).json({ success: false, error: "Failed to send reservation" });
  }
});

// Email diagnostics endpoint
app.get("/api/email-diagnostics", async (req, res) => {
  try {
    // Test SMTP connection
    const verifyResult = await transporter.verify();
    console.log("SMTP Verification:", verifyResult);
    
    res.json({
      success: true,
      smtp: {
        host: transporter.options.host,
        port: transporter.options.port,
        secure: transporter.options.secure,
        user: transporter.options.auth.user,
        passwordSet: !!transporter.options.auth.pass,
      },
      verification: "SMTP connection verified",
      message: "Check server logs for detailed SMTP communication",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
});

// Test email endpoint
app.post("/api/test-email", async (req, res) => {
  try {
    const { testEmail } = req.body;
    const emailToTest = testEmail || "cipherctech@gmail.com";

    // Verify SMTP connection
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    // Send test email
    const testMailOptions = {
      from: '"PEAKS HOTEL NANYUKI" <cipherctech@gmail.com>',
      to: emailToTest,
      subject: "Test Email - Peaks Hotel Booking System",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #d4af37;">✅ Email Test Successful!</h2>
          <p>This is a test email from Peaks Hotel Nanyuki booking system.</p>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Server:</strong> ${req.headers.host}</p>
        </div>
      `,
    };

    console.log(`📧 Sending test email to: ${emailToTest}`);
    const result = await transporter.sendMail(testMailOptions);
    console.log(`✅ Test email sent successfully.`);
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Response: ${result.response}`);
    console.log(`   Accepted: ${result.accepted}`);
    console.log(`   Rejected: ${result.rejected}`);

    res.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
      rejected: result.rejected,
      to: emailToTest,
    });
  } catch (error) {
    console.error("❌ Test email failed:", error);
    console.error("Error details:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Failed to send test email",
      details: error.message,
      code: error.code,
      response: error.response,
    });
  }
});

// Test SMTP connection on startup

// ============================================
// M-Pesa Daraja API 2.0 STK Push Implementation
// ============================================

// Helper function to generate Daraja API access token
async function getDarajaAccessToken() {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
      throw new Error("M-Pesa credentials not configured");
    }
    
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    // Use sandbox or production URL based on environment
    const isSandbox = process.env.NODE_ENV !== 'production' || process.env.MPESA_USE_SANDBOX === 'true';
    const baseUrl = isSandbox ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke";
    
    console.log(`Daraja Access Token - URL: ${baseUrl}/oauth/v1/generate?grant_type=client_credentials`);
    
    const response = await axios.get(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          "Authorization": `Basic ${auth}`
        }
      }
    );
    
    console.log("Access token received");
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting Daraja access token:", error.response?.data || error.message);
    throw new Error("Failed to get access token: " + (error.response?.data?.error || error.message));
  }
}

// Helper function to generate STK push password
function generateSTKPassword(shortcode, passkey, timestamp) {
  return crypto.createHash('md5').update(shortcode + passkey + timestamp).digest('hex');
}

// M-Pesa STK Push endpoint (via Daraja API 2.0)
app.post("/api/daraja/stk-push", async (req, res) => {
  try {
    const { phone, amount, email, firstName, lastName } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: "Phone and amount are required" });
    }

    // Format phone number to required format (2547XXXXXXXX)
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("0")
      ? "254" + cleanPhone.substring(1)
      : cleanPhone.startsWith("254")
      ? cleanPhone
      : "254" + cleanPhone;

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!shortcode || !passkey || !callbackUrl) {
      return res.status(500).json({
        success: false,
        message: "M-Pesa Daraja configuration missing",
        hint: "Check MPESA_SHORTCODE, MPESA_PASSKEY, and MPESA_CALLBACK_URL in .env"
      });
    }

    // Get access token
    const accessToken = await getDarajaAccessToken();

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const stkPassword = generateSTKPassword(shortcode, passkey, timestamp);

    // Generate unique transaction references
    const transactionType = "CustomerPayBillOnline";
    const accountReference = "PEAKS" + Date.now();
    const transactionDesc = "Hotel Booking Payment - Peaks Hotel";

    // STK Push request body
    const stkRequest = {
      BusinessShortCode: shortcode,
      Password: stkPassword,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
      Remark: "Hotel Booking Payment"
    };

    // Store booking data for later use in callback
    const bookingData = req.body.bookingData || {};
    pendingMpesaBookings.set(accountReference, {
      phone: formattedPhone,
      amount,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      bookingData,
      timestamp: Date.now()
    });
    
    // Clean up old entries (older than 30 minutes)
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    for (const [key, value] of pendingMpesaBookings.entries()) {
      if (value.timestamp < thirtyMinutesAgo) {
        pendingMpesaBookings.delete(key);
      }
    }

    console.log('Initiating Daraja STK push...');
    console.log('   Phone:', formattedPhone);
    console.log('   Amount:', amount);
    console.log('   Account Ref:', accountReference);

    // Use sandbox or production URL based on environment
    const isSandbox = process.env.NODE_ENV !== 'production' || process.env.MPESA_USE_SANDBOX === 'true';
    const baseUrl = isSandbox ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke";
    
    console.log(`STK Push - URL: ${baseUrl}/mpesa/stkpush/v1/processrequest`);

    // Send STK push request
    const response = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      stkRequest,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Daraja STK Push initiated successfully:", response.data);

    return res.json({
      success: true,
      message: "STK push sent! Please check your phone.",
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription
    });
  } catch (error) {
    console.error("Daraja STK Push error:", error.response?.data || error.message || error);
    
    const errorMessage = error.response?.data?.errorMessage || error.response?.data?.ResponseDescription || error.message || "STK Push failed";
    
    return res.status(500).json({
      success: false,
      error: "STK Push failed",
      details: errorMessage,
      response: error.response?.data
    });
  }
});

// M-Pesa callback endpoint (for Daraja API webhooks)
app.post("/api/mpesa/callback", async (req, res) => {
  try {
    const callbackData = req.body;
    console.log("Daraja webhook received:", JSON.stringify(callbackData, null, 2));

    // Extract callback data
    const result = callbackData.Body?.stkCallback || callbackData;
    
    if (result.ResultCode === 0) {
      // Payment successful
      const checkoutRequestID = result.CheckoutRequestID;
      const merchantRequestID = result.MerchantRequestID;
      
      // Extract payment details from callback
      const callbackMetadata = result.CallbackMetadata?.Item || [];
      let transactionCode = "";
      let amount = "";
      let phone = "";
      let transactionDate = "";

      callbackMetadata.forEach(item => {
        if (item.Name === "MpesaReceiptNumber") {
          transactionCode = item.Value;
        } else if (item.Name === "Amount") {
          amount = item.Value;
        } else if (item.Name === "PhoneNumber") {
          phone = item.Value;
        } else if (item.Name === "TransactionDate") {
          transactionDate = item.Value;
        }
      });

      console.log(`M-Pesa payment successful: ${transactionCode} from ${phone} amount KES ${amount}`);

      // Here you would typically:
      // 1. Update the booking/payment record in your database
      // 2. Send confirmation email
      // 3. Notify the frontend

      // For now, just log the payment details
      console.log("   CheckoutRequestID:", checkoutRequestID);
      console.log("   MerchantRequestID:", merchantRequestID);
      console.log("   TransactionDate:", transactionDate);

      // Send confirmation email if booking data exists
      try {
        // Find the booking data by matching phone number and amount
        let bookingData = null;
        let accountRef = null;
        
        for (const [key, value] of pendingMpesaBookings.entries()) {
          if (value.phone === phone && value.amount == amount) {
            bookingData = value;
            accountRef = key;
            break;
          }
        }

        if (bookingData && bookingData.bookingData) {
          console.log("📧 Sending confirmation email for M-Pesa payment...");
          
          const emailData = bookingData.bookingData;
          const emailHtml = createEmailTemplate({
            firstName: emailData.firstName || bookingData.firstName,
            lastName: emailData.lastName || bookingData.lastName,
            email: emailData.email || bookingData.email,
            phone: phone,
            specialRequests: emailData.specialRequests || "",
            roomNumber: emailData.roomNumber || "N/A",
            roomType: emailData.roomType || "N/A",
            roomCategory: emailData.roomCategory || "N/A",
            roomConfig: emailData.roomConfig || "N/A",
            mealPlan: emailData.mealPlan || "N/A",
            checkIn: emailData.checkIn || "N/A",
            checkOut: emailData.checkOut || "N/A",
            guests: parseInt(emailData.guests) || 1,
            numberOfRooms: parseInt(emailData.numberOfRooms) || 1,
            nights: parseInt(emailData.nights) || 1,
            totalPrice: parseFloat(emailData.totalPrice) || amount,
            perNightPrice: parseFloat(emailData.perNightPrice) || amount,
          });

          // Send email to guest
          const mailOptions = {
            from: '"PEAKS HOTEL NANYUKI" <cipherctech@gmail.com>',
            to: emailData.email || bookingData.email,
            subject: `🎫 Final Booking Confirmation - Peaks Hotel Nanyuki - M-Pesa Payment ${transactionCode}`,
            html: emailHtml,
          };

          await transporter.verify();
          const guestResult = await transporter.sendMail(mailOptions);
          console.log(`✅ Guest email sent successfully for M-Pesa payment.`);
          console.log(`   Message ID: ${guestResult.messageId}`);

          // Also send a copy to the hotel email
          const hotelMailOptions = {
            from: '"PEAKS HOTEL NANYUKI Booking System" <cipherctech@gmail.com>',
            to: "cipherctech@gmail.com",
            subject: `📧 Final M-Pesa Booking Confirmation - ${emailData.firstName || bookingData.firstName} ${emailData.lastName || bookingData.lastName} - ${transactionCode}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #d4af37;">Final M-Pesa Booking Confirmation</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <p><strong>Transaction Code:</strong> ${transactionCode}</p>
                  <p><strong>Guest:</strong> ${emailData.firstName || bookingData.firstName} ${emailData.lastName || bookingData.lastName}</p>
                  <p><strong>Email:</strong> ${emailData.email || bookingData.email}</p>
                  <p><strong>Phone:</strong> ${phone}</p>
                  <p><strong>Room:</strong> ${emailData.roomNumber || "N/A"} - ${emailData.roomType || "N/A"}</p>
                  <p><strong>Configuration:</strong> ${roomConfigLabels[emailData.roomConfig] || emailData.roomConfig || "N/A"}</p>
                  <p><strong>Meal Plan:</strong> ${mealPlanLabels[emailData.mealPlan] || emailData.mealPlan || "N/A"}</p>
                  <p><strong>Check-in:</strong> ${emailData.checkIn ? formatDate(emailData.checkIn) : "N/A"}</p>
                  <p><strong>Check-out:</strong> ${emailData.checkOut ? formatDate(emailData.checkOut) : "N/A"}</p>
                  <p><strong>Nights:</strong> ${emailData.nights || "N/A"}</p>
                  <p><strong>Guests:</strong> ${emailData.guests || "N/A"}</p>
                  <p><strong>Rooms:</strong> ${emailData.numberOfRooms || "N/A"}</p>
                  <p><strong>Total Amount:</strong> KES ${parseFloat(emailData.totalPrice || amount).toLocaleString()}</p>
                  ${emailData.specialRequests ? `<p><strong>Special Requests:</strong> ${emailData.specialRequests}</p>` : ""}
                </div>
              </div>
            `,
          };

          const hotelResult = await transporter.sendMail(hotelMailOptions);
          console.log(`✅ Hotel email sent successfully for M-Pesa payment.`);
          console.log(`   Message ID: ${hotelResult.messageId}`);

          // Remove from pending bookings
          if (accountRef) {
            pendingMpesaBookings.delete(accountRef);
          }
        } else {
          console.log("⚠️ No booking data found for this M-Pesa payment. Email not sent.");
        }
      } catch (emailError) {
        console.error("❌ Error sending M-Pesa confirmation email:", emailError);
        // Don't fail the callback if email fails
      }

      res.json({ success: true, message: "Callback processed" });
    } else {
      // Payment failed or was cancelled
      console.log(`M-Pesa payment failed/cancelled: ${result.ResultDesc}`);
      res.json({ success: false, message: result.ResultDesc });
    }
  } catch (error) {
    console.error("Daraja webhook error:", error.message);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
});

// M-Pesa transaction status check endpoint (STK Push Query)
// Sandbox URL: https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query
// Production URL: https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query
app.get("/api/daraja/status", async (req, res) => {
  try {
    const { checkoutRequestID } = req.query;

    if (!checkoutRequestID) {
      return res.status(400).json({ success: false, message: "CheckoutRequestID is required" });
    }

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    
    // Get access token
    const accessToken = await getDarajaAccessToken();

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const password = generateSTKPassword(shortcode, passkey, timestamp);

    // STK Push Query request body
    const queryRequest = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    };

    // Use sandbox or production URL based on environment
    const isSandbox = process.env.NODE_ENV !== 'production' || process.env.MPESA_USE_SANDBOX === 'true';
    const baseUrl = isSandbox ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke";
    
    console.log(`STK Push Query - URL: ${baseUrl}/mpesa/stkpushquery/v1/query`);
    console.log('Request Body:', JSON.stringify(queryRequest, null, 2));

    const response = await axios.post(
      `${baseUrl}/mpesa/stkpushquery/v1/query`,
      queryRequest,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Daraja status query result:", response.data);

    if (response.data.ResultCode === 0) {
      return res.json({
        success: true,
        transactionStatus: "success",
        message: response.data.ResultDesc
      });
    } else {
      return res.json({
        success: true,
        transactionStatus: "pending",
        message: response.data.ResultDesc
      });
    }
  } catch (error) {
    console.error("Daraja status query error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Status check failed" });
  }
});

transporter.verify()
  .then(() => {
    console.log("✅ SMTP server connection verified successfully");
  })
  .catch((error) => {
    console.error("❌ SMTP server connection failed:", error);
    console.error("Please check your email credentials and app password");
  });

app.listen(PORT, () => {
  console.log(`🚀 Peaks Hotel Booking API server running on http://localhost:${PORT}`);
  console.log(`📧 Email service configured for: PEAKS HOTEL NANYUKI (cipherctech@gmail.com)`);
  console.log(`🔐 Using SMTP/TLS on port 587`);
});
