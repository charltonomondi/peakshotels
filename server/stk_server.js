import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with specific origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Handle CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

app.use(express.json());

// Helper: get OAuth token
async function getAccessToken() {
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  // Use MPESA_ prefixed vars or fall back to non-prefixed
  const consumerKey = process.env.MPESA_CONSUMER_KEY || process.env.CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || process.env.CONSUMER_SECRET;
  
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

// STK Push endpoint
app.post("/stkpush", async (req, res) => {
  try {
    const { phoneNumber, amount } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: "phoneNumber and amount are required" });
    }

    console.log("📱 STK Push request received:", { phoneNumber, amount });

    const token = await getAccessToken();

    const stkUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const passkey = process.env.PASSKEY;
    const shortCode = process.env.BUSINESS_SHORTCODE;
    const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: "Test123",
      TransactionDesc: "Payment for goods",
    };

    console.log("📤 Sending STK Push to Safaricom...");

    const response = await axios.post(stkUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log("✅ STK Push response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ STK Push Error:", error);
    if (error.response) {
      console.error("❌ Response Data:", error.response.data);
      console.error("❌ Response Status:", error.response.status);
    }
    
    // Safaricom typically returns JSON errors, but handle non-JSON responses
    if (error.response && error.response.data) {
      try {
        // Try to parse as JSON
        const jsonData = typeof error.response.data === 'string' 
          ? JSON.parse(error.response.data) 
          : error.response.data;
        return res.status(error.response.status || 500).json(jsonData);
      } catch {
        // If not JSON, create a JSON error response
        return res.status(error.response.status || 500).json({
          error: "STK Push failed",
          errorMessage: error.response.data || error.message
        });
      }
    }
    
    res.status(500).json({ 
      error: "STK Push failed", 
      errorMessage: error.message || "Unknown error"
    });
  }
});

// STK Push Query endpoint
app.post("/stkpushquery", async (req, res) => {
  try {
    const { checkoutRequestID } = req.body;

    if (!checkoutRequestID) {
      return res.status(400).json({ error: "CheckoutRequestID is required" });
    }

    console.log("🔍 STK Push Query request:", { checkoutRequestID });

    const token = await getAccessToken();

    const queryUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";

    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const passkey = process.env.MPESA_PASSKEY || process.env.PASSKEY;
    const shortCode = process.env.MPESA_SHORTCODE || process.env.BUSINESS_SHORTCODE;
    
    if (!passkey || !shortCode) {
      return res.status(500).json({ error: "Missing MPESA_PASSKEY or MPESA_SHORTCODE environment variables" });
    }
    
    const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

    const queryPayload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    console.log("📤 Sending STK Push Query to Safaricom...");

    const response = await axios.post(queryUrl, queryPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log("✅ STK Push Query response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ STK Push Query Error:", error.response?.data || error.message);
    
    if (error.response && error.response.data) {
      try {
        const jsonData = typeof error.response.data === 'string' 
          ? JSON.parse(error.response.data) 
          : error.response.data;
        return res.status(error.response.status || 500).json(jsonData);
      } catch {
        return res.status(error.response.status || 500).json({
          error: "STK Push Query failed",
          errorMessage: error.response.data || error.message
        });
      }
    }
    
    res.status(500).json({ 
      error: "STK Push Query failed", 
      errorMessage: error.message || "Unknown error"
    });
  }
});

// Callback endpoint
app.post("/callback", async (req, res) => {
  try {
    const callbackData = req.body;
    console.log("📞 M-Pesa Callback received:", JSON.stringify(callbackData, null, 2));

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
    console.error("❌ Callback Error:", error.message);
    res.json({ success: true, message: "Callback received" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test endpoint (no Safaricom API required)
app.post("/test", (req, res) => {
  console.log("Test endpoint received:", req.body);
  res.json({
    status: "ok",
    message: "Server is working!",
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 M-Pesa STK Server running on http://localhost:${PORT}`);
  console.log(`📱 POST /stkpush - Initiate STK push`);
  console.log(`🔍 POST /stkpushquery - Query transaction status`);
  console.log(`📞 POST /callback - M-Pesa callback URL`);
});

export default app;
