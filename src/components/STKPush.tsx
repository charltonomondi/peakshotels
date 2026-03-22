import React, { useState } from "react";
import axios from "axios";

const STKPush: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number>(1);
  const [message, setMessage] = useState("");
  const [checkoutRequestID, setCheckoutRequestID] = useState("");
  const [queryResult, setQueryResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testServer = async () => {
    setLoading(true);
    setMessage("Testing server...");
    
    try {
      const response = await axios.post("http://localhost:5000/test", {
        test: "data",
      }, { timeout: 5000 });
      
      console.log("Test response:", response.data);
      setMessage("✅ Server is working! " + JSON.stringify(response.data));
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Test failed:", err.message);
      setMessage("❌ Server test failed: " + err.message + " - Is the server running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!phone || !amount) {
      setMessage("⚠️ Please enter phone number and amount");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Format phone number
      const cleanPhone = phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("254") 
        ? cleanPhone 
        : cleanPhone.startsWith("0") 
          ? "254" + cleanPhone.substring(1)
          : "254" + cleanPhone;

      console.log("Sending request to:", "http://localhost:5000/stkpush");
      console.log("Payload:", JSON.stringify({
        phoneNumber: formattedPhone,
        amount: amount,
      }));

      const response = await axios({
        method: "post",
        url: "http://localhost:5000/stkpush",
        data: {
          phoneNumber: formattedPhone,
          amount: amount,
        },
        timeout: 30000,
        validateStatus: (status) => status < 500,
      });

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      // Handle any status code
      if (response.data && typeof response.data === 'object') {
        if (response.data.CheckoutRequestID) {
          setCheckoutRequestID(response.data.CheckoutRequestID);
          setMessage("✅ STK push sent! Check your phone to complete the payment.");
        } else if (response.data.ResponseCode === "0") {
          setCheckoutRequestID(response.data.CheckoutRequestID || "");
          setMessage("✅ STK push initiated successfully!");
        } else if (response.data.error) {
          setMessage(`❌ ${response.data.error}: ${response.data.errorMessage || response.data.ResponseDescription || ""}`);
        } else {
          setMessage(`⚠️ ${response.data.ResponseDescription || "Response received but no CheckoutRequestID"}`);
        }
      } else {
        setMessage(`⚠️ Unexpected response: ${JSON.stringify(response.data)}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown }; request?: unknown; message?: string; code?: string };
      
      console.error("Payment error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        code: err.code,
      });

      // Handle different error types
      if (err.response) {
        // Server responded with error status
        if (err.response.data && typeof err.response.data === 'object') {
          const errorData = err.response.data as { error?: string; errorMessage?: string; ResponseDescription?: string };
          setMessage(`❌ ${errorData.error || errorData.errorMessage || errorData.ResponseDescription || `Server error (${err.response.status})`}`);
        } else {
          setMessage(`❌ Server error (${err.response.status}): ${err.response.data || "No response data"}`);
        }
      } else if (err.request) {
        // Request was made but no response
        setMessage("❌ No response from server. Is the STK server running on port 5000?");
      } else if (err.code === "ECONNABORTED") {
        setMessage("❌ Request timed out. Please try again.");
      } else {
        setMessage(`❌ ${err.message || "Unknown error occurred"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!checkoutRequestID) {
      setMessage("⚠️ No CheckoutRequestID to query");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios({
        method: "post",
        url: "http://localhost:5000/stkpushquery",
        data: {
          checkoutRequestID: checkoutRequestID,
        },
        timeout: 30000,
      });

      console.log("Query response:", response.data);
      setQueryResult(JSON.stringify(response.data, null, 2));

      const resultCode = response.data.ResultCode;
      const resultCodeStr = String(resultCode);
      
      if (resultCode === 0) {
        setMessage("✅ Payment successful!");
      } else if (resultCodeStr === "1032") {
        setMessage("⏳ Request timeout/cancelled by user");
      } else if (resultCodeStr === "1037") {
        setMessage("⏳ STK push timeout on customer phone");
      } else {
        setMessage(`⚠️ ${response.data.ResultDesc || "Unknown status"}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error("Query error:", err.response?.data || err.message);
      setMessage(`❌ Query failed: ${err.response?.data?.error || err.response?.data?.errorMessage || err.message || "Unknown error"}`);
      setQueryResult(JSON.stringify(err.response?.data || { error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Pay with M-Pesa</h2>

      <div className="space-y-4">
        
        <button
          onClick={testServer}
          disabled={loading}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:bg-gray-400 transition-colors text-sm"
        >
          {loading ? "Testing..." : "Test Server Connection"}
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            placeholder="2547XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
          <input
            type="number"
            min="1"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !phone || !amount}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        {checkoutRequestID && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600 mb-2 break-all">
              <strong>CheckoutRequestID:</strong> {checkoutRequestID}
            </p>
            <button
              onClick={handleQuery}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Querying..." : "Check Payment Status"}
            </button>
          </div>
        )}

        {queryResult && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">Query Result:</h3>
            <pre className="text-xs text-blue-700 overflow-auto whitespace-pre-wrap">
              {queryResult}
            </pre>
          </div>
        )}

        {message && (
          <p className={`mt-4 p-3 rounded-md ${
            message.includes("✅") ? "bg-green-100 text-green-800" :
            message.includes("❌") ? "bg-red-100 text-red-800" :
            message.includes("⏳") ? "bg-yellow-100 text-yellow-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default STKPush;
