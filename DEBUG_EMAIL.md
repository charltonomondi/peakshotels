# Email Debugging Guide

## Issue
User reports that no email is being sent when clicking the "Pay" button.

## Investigation Steps

### 1. Verify Email Endpoint is Working

I've tested the email endpoint directly and it's working correctly:

```bash
curl -X POST http://localhost:3001/api/send-booking-email \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "254712345678",
    "roomNumber": "101",
    "roomType": "Standard Room",
    "roomConfig": "double",
    "mealPlan": "bed_breakfast",
    "checkIn": "2024-04-01",
    "checkOut": "2024-04-03",
    "guests": "2",
    "numberOfRooms": "1",
    "nights": "2",
    "totalPrice": "22800",
    "perNightPrice": "11400"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Booking confirmation email sent successfully",
  "bookingReference": "PHMNCV44BT-W1C5",
  "guestEmailId": "<b7fc1b2b-76ce-e1e6-87d4-0a1427532cb5@gmail.com>",
  "hotelEmailId": "<5c836d79-6fd0-b2e0-6cd5-92f1e5307895@gmail.com>"
}
```

✅ **Email endpoint is working correctly**

### 2. Check Server Logs

Server logs show emails are being sent successfully:
```
✅ Guest email sent successfully.
✅ Hotel notification sent successfully.
```

✅ **Server is sending emails correctly**

### 3. Added Debug Logging

I've added comprehensive console logging to help debug the issue:

#### Booking.tsx
- Added logging to `handlePaymentSuccess` function
- Added logging before calling email endpoint
- Added logging for email response

#### MpesaPayment.tsx
- Added logging when STK push is successful
- Added logging when calling `onSuccess` callback

#### PaystackPayment.tsx
- Added logging when payment is successful
- Added logging when calling `onSuccess` callback

#### BankTransferPayment.tsx
- Added logging when transfer is confirmed
- Added logging when calling `onSuccess` callback

### 4. How to Debug

#### Step 1: Open Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the "Console" tab
3. Clear the console

#### Step 2: Complete a Booking
1. Go to the booking page
2. Fill in all the details
3. Select a payment method
4. Click "Pay"

#### Step 3: Check Console Output
Look for these log messages:

**For M-Pesa:**
```
✅ STK Push successful, calling onSuccess callback
🎉 handlePaymentSuccess called with transactionCode: STK-PUSH-INITIATED
📧 Payment method: mpesa
📧 Preparing to send M-Pesa booking email...
📧 Sending M-Pesa booking email to: http://localhost:3001/api/send-booking-email
📧 Email payload: {...}
📧 Email response status: 200
📧 Email response data: {...}
```

**For Paystack:**
```
✅ Paystack payment successful, reference: PEAKS_...
📧 Paystack verification response: {...}
✅ Paystack verification successful, calling onSuccess
🎉 handlePaymentSuccess called with transactionCode: PEAKS_...
📧 Payment method: paystack
📧 Preparing to send booking email for payment method: paystack
📧 Sending booking email to: http://localhost:3001/api/send-booking-email
📧 Email payload: {...}
📧 Email response status: 200
📧 Email response data: {...}
```

**For Bank Transfer:**
```
✅ Bank transfer confirmed, calling onSuccess with reference: BANK_...
🎉 handlePaymentSuccess called with transactionCode: BANK_...
📧 Payment method: bank_transfer
📧 Preparing to send booking email for payment method: bank_transfer
📧 Sending booking email to: http://localhost:3001/api/send-booking-email
📧 Email payload: {...}
📧 Email response status: 200
📧 Email response data: {...}
```

### 5. Common Issues and Solutions

#### Issue 1: No Console Logs Appear
**Problem:** Payment component is not calling `onSuccess`
**Solution:** 
- Check if payment was actually successful
- Check for JavaScript errors in console
- Verify payment gateway is working

#### Issue 2: Console Shows Email Error
**Problem:** Email endpoint is returning an error
**Solution:**
- Check server logs for detailed error
- Verify SMTP credentials in `server/.env`
- Test email endpoint directly with curl

#### Issue 3: Email Response Shows Success But No Email Received
**Problem:** Email might be in spam/junk folder
**Solution:**
- Check spam/junk folder
- Verify email address is correct
- Check Gmail sent folder

#### Issue 4: CORS Error
**Problem:** Frontend can't reach backend
**Solution:**
- Verify server is running on port 3001
- Check CORS configuration in server
- Verify API URL in frontend

### 6. Test Email Endpoint

You can test the email endpoint directly:

```bash
# Test with your email
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"your-email@example.com"}'

# Test booking email
curl -X POST http://localhost:3001/api/send-booking-email \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "your-email@example.com",
    "phone": "254712345678",
    "roomNumber": "101",
    "roomType": "Standard Room",
    "roomConfig": "double",
    "mealPlan": "bed_breakfast",
    "checkIn": "2024-04-01",
    "checkOut": "2024-04-03",
    "guests": "2",
    "numberOfRooms": "1",
    "nights": "2",
    "totalPrice": "22800",
    "perNightPrice": "11400"
  }'
```

### 7. Check Server Logs

Monitor server logs in real-time:

```bash
tail -f /tmp/server.log | grep -E "email|Email|📧|✅|❌"
```

### 8. Verify SMTP Configuration

Check `server/.env` file:

```bash
cat server/.env | grep -E "SMTP|EMAIL"
```

Should show:
```
SMTP_USER=cipherctech@gmail.com
SMTP_PASS=dlbt ftit tmxs miby
```

## Summary

The email functionality is working correctly at the server level. The issue is likely:

1. **Payment not completing successfully** - Check browser console for payment errors
2. **JavaScript error preventing email call** - Check browser console for errors
3. **Email in spam folder** - Check spam/junk folder
4. **Wrong email address** - Verify email address in booking form

## Next Steps

1. Complete a booking and check browser console
2. Look for the debug log messages listed above
3. If logs appear, check if email is in spam folder
4. If logs don't appear, check for JavaScript errors
5. Share the console output with me for further debugging

## Files Modified

- `src/pages/Booking.tsx` - Added debug logging
- `src/components/MpesaPayment.tsx` - Added debug logging
- `src/components/PaystackPayment.tsx` - Added debug logging
- `src/components/BankTransferPayment.tsx` - Added debug logging
- `server/src/index.js` - Added test email endpoint and improved error handling
- `server/.env` - Added SMTP environment variables
- `server/.env.example` - Added SMTP configuration documentation
