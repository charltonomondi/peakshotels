import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Copy, CheckCircle, Info } from "lucide-react";

interface BankTransferPaymentProps {
  amount: number;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
}

const bankDetails = {
  bankName: "Equity Bank Kenya Limited",
  accountName: "Peaks Hotel Nanyuki",
  accountNumber: "200-300-400-500",
  branch: "Nanyuki Branch",
  swiftCode: "EQBLKENA",
};

const BankTransferPayment: React.FC<BankTransferPaymentProps> = ({ amount, onSuccess }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [hasTransferred, setHasTransferred] = useState(false);
  // Generate a stable reference for this session
  const [reference] = useState(() => "BANK_" + Date.now().toString().slice(-8));

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConfirmTransfer = () => {
    setHasTransferred(true);
    // Booking is saved as "pending" — hotel staff will verify and confirm
    // We pass the reference so the booking record is created with payment_status=pending
    onSuccess(reference);
  };

  return (
    <div className="bg-card p-6 rounded-xl border-2 border-accent/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-3 rounded-full">
          <Building2 className="h-8 w-8 text-gray-600" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Bank Transfer</h3>
          <p className="text-sm text-muted-foreground">Direct bank transfer to our account</p>
        </div>
      </div>

      <div className="bg-accent/10 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-bold text-foreground">KES {amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Reference:</span>
          <span className="font-semibold text-foreground">BANK_{Date.now().toString().slice(-8)}</span>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Copy the bank details below</li>
              <li>Make a transfer from your bank</li>
              <li>Use the reference number above</li>
              <li>Confirm below once transferred</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-border rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-foreground mb-3">Bank Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Bank:</span>
            <span className="font-medium text-foreground">{bankDetails.bankName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Account Name:</span>
            <span className="font-medium text-foreground">{bankDetails.accountName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Account Number:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-foreground">{bankDetails.accountNumber}</span>
              <button
                onClick={() => copyToClipboard(bankDetails.accountNumber, "account")}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                {copied === "account" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Branch:</span>
            <span className="font-medium text-foreground">{bankDetails.branch}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">SWIFT Code:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-foreground">{bankDetails.swiftCode}</span>
              <button
                onClick={() => copyToClipboard(bankDetails.swiftCode, "swift")}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                {copied === "swift" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!hasTransferred ? (
        <Button
          onClick={handleConfirmTransfer}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          I have made the transfer
        </Button>
      ) : (
        <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
          <CheckCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <p className="font-medium text-foreground">Transfer submitted — pending verification</p>
          <p className="text-sm text-muted-foreground mt-1">
            Our team will verify your payment within 1–2 business hours and send a confirmation email.
          </p>
        </div>
      )}
    </div>
  );
};

export default BankTransferPayment;
