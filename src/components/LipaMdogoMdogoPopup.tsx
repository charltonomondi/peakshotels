import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LipaMdogoMdogoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-amber-600">
            💳 Lipa Mdogo Mdogo
          </DialogTitle>
          <DialogDescription className="text-center pt-4">
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Enjoy luxury at Peaks Hotel today, and pay conveniently with
                Lipa Mdogo Mdogo — comfort made affordable, your way.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium">
                  ✨ Flexible payment plans available
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  Book your stay now and pay in easy installments
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            Learn More
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LipaMdogoMdogoPopup;
