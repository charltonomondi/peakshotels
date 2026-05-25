import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, Info } from "lucide-react";

interface PaystackPaymentProps {
  email: string;
  phone: string;
  amount: number;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  email,
  phone,
  amount,
  onSuccess,
  onError,
}) => {
  const isLoaded = useRef(false);

  useEffect(() => {
    // Load Paystack script
    if (!document.querySelector('script[src*="paystack"]')) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        isLoaded.current = true;
      };
      document.body.appendChild(script);
    } else {
      isLoaded.current = true;
    }
  }, []);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

  const handlePayment = () => {
    if (!window.PaystackPop) {
      onError("Paystack not loaded yet. Please wait...");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_45a5071a39738224148b58c1389127ced30d6cd6",
      email: email,
      amount: amount * 100, // Paystack amount is in kobo
      currency: "KES",
      ref: "PEAKS_" + Math.floor(Math.random() * 1000000000 + 1),
      metadata: {
        phone: phone,
      },
      callback: function (response: any) {
        console.log("✅ Paystack payment successful, reference:", response.reference);
        // Send reference to backend for verification
        fetch(`${API_BASE}/api/paystack/verify?reference=${response.reference}`)
          .then(res => res.json())
          .then(data => {
            console.log("📧 Paystack verification response:", data);
            if (data.success) {
              console.log("✅ Paystack verification successful, calling onSuccess");
              onSuccess(response.reference);
            } else {
              console.error("❌ Paystack verification failed:", data.message);
              onError(data.message || "Payment verification failed");
            }
          })
          .catch(err => {
            console.error("❌ Paystack verification error:", err);
            onError("Verification failed: " + err.message);
          });
      },
      onClose: function () {
        onError("Payment cancelled by user");
      },
    });
    handler.openIframe();
  };

  return (
    <div className="bg-card p-6 rounded-xl border-2 border-accent/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <CreditCard className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Credit/Debit Card</h3>
          <p className="text-sm text-muted-foreground">Pay securely with Visa, Mastercard</p>
        </div>
      </div>

      <div className="bg-accent/10 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-bold text-foreground">KES {amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Email:</span>
          <span className="font-semibold text-foreground">{email}</span>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Pay with Card" below</li>
              <li>Enter your card details on the secure form</li>
              <li>Enter OTP from your bank</li>
              <li>Wait for confirmation</li>
            </ol>
          </div>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        variant="default"
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Pay KES {amount.toLocaleString()} with Card
      </Button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Secure payment
        </span>
        <span>|</span>
        <span>Powered by Paystack</span>
      </div>
    </div>
  );
};

export default PaystackPayment;
