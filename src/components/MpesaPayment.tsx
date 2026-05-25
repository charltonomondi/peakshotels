import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";

interface MpesaPaymentProps {
  email: string;
  phone: string;
  amount: number;
  onSuccess: (transactionCode: string) => void;
  onError: (error: string) => void;
  triggerPayment?: number; // Increment to trigger payment
  bookingData?: {
    firstName: string;
    lastName: string;
    roomNumber: string;
    roomType: string;
    roomConfig: string;
    mealPlan: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    numberOfRooms: number;
    nights: number;
    totalPrice: number;
    perNightPrice: number;
    specialRequests?: string;
  };
}

const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  email,
  phone,
  amount,
  onSuccess,
  onError,
  triggerPayment = 0,
  bookingData,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isTestMode, setIsTestMode] = useState(false);
  const previousTrigger = useRef(triggerPayment);

  // Trigger STK push when triggerPayment changes
  useEffect(() => {
    if (triggerPayment > previousTrigger.current && status === "idle") {
      initiateSTKPush();
    }
    previousTrigger.current = triggerPayment;
  }, [triggerPayment, status]);

  const initiateSTKPush = async () => {
    setIsLoading(true);
    setStatus("processing");
    setMessage("Initiating M-Pesa payment...");

    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("0")
        ? "254" + cleanPhone.substring(1)
        : cleanPhone.startsWith("254")
        ? cleanPhone
        : "254" + cleanPhone;

      const payload = {
        phone: formattedPhone,
        amount: Math.max(1, amount),
        email,
        firstName: bookingData?.firstName || email?.split('@')[0] || 'Guest',
        lastName: bookingData?.lastName || 'User',
        bookingData,
      };

      let data: any = null;
      let usedTestMode = false;

      // Try real STK push first
      try {
        const response = await fetch('/api/daraja/stk-push', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await response.text();
        if (text) data = JSON.parse(text);
      } catch (_) {
        data = null;
      }

      // Fall back to test mode if real endpoint failed or credentials missing
      if (!data?.success) {
        const credsMissing = data?.message?.includes('not configured');
        const serverDown = !data;
        if (credsMissing || serverDown) {
          usedTestMode = true;
          setIsTestMode(true);
          setMessage("Using test mode (no real charge)...");
          const testResp = await fetch('/api/daraja/stk-push-test', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: formattedPhone, amount: Math.max(1, amount) }),
          });
          const testText = await testResp.text();
          data = testText ? JSON.parse(testText) : null;
        }
      }

      if (data?.success) {
        setStatus("success");
        setMessage(usedTestMode
          ? "✅ Test booking saved! (No real M-Pesa charge)"
          : (data.message || "STK push sent! Check your phone."));
        onSuccess(data.checkoutRequestId || "STK-PUSH-INITIATED");
      } else {
        const errMsg = data?.message || data?.error || "Payment failed. Please try again.";
        setStatus("error");
        setMessage(errMsg);
        onError(errMsg);
      }
    } catch (error) {
      const msg = "Cannot reach the payment server. Make sure the Express server is running: cd server && npm run dev";
      setStatus("error");
      setMessage(msg);
      onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl border-2 border-accent/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-100 p-3 rounded-full">
          <Smartphone className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">M-Pesa Payment</h3>
          <p className="text-sm text-muted-foreground">Pay securely with M-Pesa</p>
        </div>
      </div>

      {isTestMode && (
        <div className="mb-4 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 rounded-lg text-xs text-yellow-800 dark:text-yellow-300 font-medium">
          🧪 Test mode — no real charge. Add MPESA_CONSUMER_KEY/SECRET to server/.env for live payments.
        </div>
      )}

      <div className="bg-accent/10 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-bold text-foreground">KES {amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Phone:</span>
          <span className="font-semibold text-foreground">{phone}</span>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Pay with M-Pesa" below</li>
              <li>Enter your M-Pesa PIN on your phone</li>
              <li>Wait for confirmation</li>
            </ol>
          </div>
        </div>
      </div>

      {status === "idle" && (
        <Button
          onClick={initiateSTKPush}
          disabled={isLoading}
          variant="default"
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4 mr-2" />
              Pay KES {amount.toLocaleString()} with M-Pesa
            </>
          )}
        </Button>
      )}

      {status === "processing" && (
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
          <Loader2 className="h-8 w-8 text-yellow-600 animate-spin mx-auto mb-2" />
          <p className="font-medium text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check your phone for the STK push prompt
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="font-medium text-foreground">{message}</p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="font-medium text-foreground">{message}</p>
          <Button
            onClick={initiateSTKPush}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default MpesaPayment;
