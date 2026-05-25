import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Bed, Check, CreditCard, X, Info, AlertCircle, Smartphone, Building2, CreditCard as CardIcon } from "lucide-react";
import MpesaPayment from "@/components/MpesaPayment";
import PaystackPayment from "@/components/PaystackPayment";
import BankTransferPayment from "@/components/BankTransferPayment";
import { supabase } from "@/lib/supabase";
import { useLoyaltyAuth, calcPoints } from "@/lib/loyaltyAuth";
import roomDeluxe from "@/assets/bed.jpg";
import roomExecutive from "@/assets/bed1.jpg";
import roomPresidential from "@/assets/bed5.jpg";
import heroBackground from "@/assets/bed2.jpg";

// Room configuration types
type RoomConfig = "single" | "double" | "twin";
type MealPlan = "bed_breakfast" | "half_board" | "full_board";

// Payment method types
type PaymentMethod = "mpesa" | "paystack" | "bank_transfer";

interface RoomPricing {
  single: { bed_breakfast: number; half_board: number; full_board: number };
  double: { bed_breakfast: number; half_board: number; full_board: number };
  twin: { bed_breakfast: number; half_board: number; full_board: number };
}

const roomTypes = [
  {
    id: "test",
    name: "🧪 Test Room (KES 1)",
    image: roomDeluxe,
    isTest: true,
    pricing: {
      single: { bed_breakfast: 1, half_board: 1, full_board: 1 },
      double: { bed_breakfast: 1, half_board: 1, full_board: 1 },
      twin:   { bed_breakfast: 1, half_board: 1, full_board: 1 },
    },
  },
  { 
    id: "standard", 
    name: "Standard Rooms", 
    image: roomDeluxe,
    pricing: {
      single: { bed_breakfast: 8400, half_board: 10400, full_board: 12400 },
      double: { bed_breakfast: 11400, half_board: 15400, full_board: 19400 },
      twin: { bed_breakfast: 6200, half_board: 8200, full_board: 10200 }
    }
  },
  { 
    id: "superior", 
    name: "Superior Rooms", 
    image: roomExecutive,
    pricing: {
      single: { bed_breakfast: 9600, half_board: 11600, full_board: 13600 },
      double: { bed_breakfast: 12600, half_board: 16600, full_board: 20600 },
      twin: { bed_breakfast: 6800, half_board: 8800, full_board: 10800 }
    }
  },
  { 
    id: "executive", 
    name: "Executive Rooms", 
    image: roomPresidential,
    pricing: {
      single: { bed_breakfast: 13400, half_board: 15400, full_board: 17400 },
      double: { bed_breakfast: 16900, half_board: 20900, full_board: 24900 },
      twin: { bed_breakfast: 0, half_board: 0, full_board: 0 }
    }
  },
];

const mealPlanLabels = {
  bed_breakfast: "Bed & Breakfast",
  half_board: "Half Board",
  full_board: "Full Board"
};

const roomConfigLabels = {
  single: "Single Room",
  double: "Double Room",
  twin: "Twin Room (per person)"
};

const paymentMethodLabels = {
  mpesa: "M-Pesa",
  paystack: "Credit/Debit Card",
  bank_transfer: "Bank Transfer"
};

const paymentMethodIcons = {
  mpesa: Smartphone,
  paystack: CardIcon,
  bank_transfer: Building2
};

// Room numbers by floor
const roomNumbers = {
  1: Array.from({ length: 12 }, (_, i) => 101 + i), // 101-112
  2: Array.from({ length: 12 }, (_, i) => 201 + i), // 201-212
  3: Array.from({ length: 12 }, (_, i) => 301 + i), // 301-312
  4: [407, 408, 409, 410, 411, 412] // 407-412
};

// Test room numbers (only shown for test room type)
const testRoomNumbers = { 0: [999] };

// Function to determine room category
const getRoomCategory = (roomNumber: number) => {
  if (roomNumber === 999) return "test";
  const lastTwoDigits = roomNumber % 100;
  if ([1, 6, 7].includes(lastTwoDigits)) return "superior";
  if (lastTwoDigits === 12) return "executive";
  return "standard";
};

// Get rooms by category and floor
const getRoomsByCategory = (category: string) => {
  if (category === "test") return testRoomNumbers;
  const result: { [floor: number]: number[] } = {};
  Object.entries(roomNumbers).forEach(([floor, rooms]) => {
    const floorRooms = rooms.filter(room => getRoomCategory(room) === category);
    if (floorRooms.length > 0) result[parseInt(floor)] = floorRooms;
  });
  return result;
};

const Booking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRoomCategory, setSelectedRoomCategory] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [showPolicies, setShowPolicies] = useState(false);
  const [paymentTrigger, setPaymentTrigger] = useState(0);
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
    roomType: "standard",
    roomConfig: "double" as RoomConfig,
    mealPlan: "bed_breakfast" as MealPlan,
    roomNumber: "",
    rooms: 1,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    paymentMethod: "mpesa" as PaymentMethod,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomNumber = urlParams.get('roomNumber');
    const stepParam = urlParams.get('step');

    if (roomNumber) {
      setFormData(prev => ({ ...prev, roomNumber }));
    }
    if (stepParam) {
      setStep(parseInt(stepParam));
    }
  }, []);

  const selectedRoom = roomTypes.find(r => r.id === formData.roomType);
  const nights = formData.checkIn && formData.checkOut 
    ? Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  // Auto-set guests when room config changes
  const guestsPerRoom = { single: 1, double: 2, twin: 2 };

  const handleConfigChange = (config: RoomConfig) => {
    setFormData(prev => ({
      ...prev,
      roomConfig: config,
      guests: String(guestsPerRoom[config]),
    }));
  };

  const getRoomPrice = () => {
    if (!selectedRoom) return 0;
    const basePrice = selectedRoom.pricing[formData.roomConfig][formData.mealPlan];
    // Twin: price is per person, so multiply by guests per room (2)
    if (formData.roomConfig === "twin") return basePrice * 2;
    return basePrice;
  };

  // Total = price per room × rooms × nights
  const totalPrice = getRoomPrice() * formData.rooms * nights;

  const [bookedRooms, setBookedRooms] = useState<Set<string>>(new Set());
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Poll booked rooms every 10s while on step 4 so confirmed bookings show in real-time
  useEffect(() => {
    if (step !== 4 || !formData.checkIn || !formData.checkOut) return;

    loadBookedRooms();
    const interval = setInterval(loadBookedRooms, 10000);
    return () => clearInterval(interval);
  }, [step, formData.checkIn, formData.checkOut]);

  async function loadBookedRooms() {
    if (!formData.checkIn || !formData.checkOut) return;
    setLoadingAvailability(true);
    try {
      // Query Supabase directly — no proxy dependency
      const { data: bookings } = await supabase
        .from("bookings")
        .select("room_number")
        .in("status", ["pending", "confirmed"])
        .lt("check_in", formData.checkOut)
        .gt("check_out", formData.checkIn);

      const booked = new Set<string>(
        (bookings ?? []).map((b: any) => b.room_number).filter(Boolean)
      );
      setBookedRooms(booked);
    } catch (_) {
      // keep existing state on error
    } finally {
      setLoadingAvailability(false);
    }
  }

  const handleRoomSelection = async (roomNumber: number) => {
    setAvailabilityError(null);

    if (bookedRooms.has(String(roomNumber))) {
      setAvailabilityError(`Room ${roomNumber} is already booked for your selected dates. Please choose another room.`);
      return;
    }

    setIsCheckingAvailability(true);
    // Re-fetch to confirm (catches race conditions)
    try {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("room_number")
        .in("status", ["pending", "confirmed"])
        .lt("check_in", formData.checkOut)
        .gt("check_out", formData.checkIn);

      const latest = new Set<string>(
        (bookings ?? []).map((b: any) => b.room_number).filter(Boolean)
      );
      setBookedRooms(latest);
      if (latest.has(String(roomNumber))) {
        setAvailabilityError(`Room ${roomNumber} was just booked. Please choose another room.`);
        setIsCheckingAvailability(false);
        return;
      }
    } catch (_) { /* proceed optimistically */ }

    setIsCheckingAvailability(false);
    setFormData({ ...formData, roomNumber: roomNumber.toString() });
    setStep(5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For steps 1-5, move to next step
    if (step < 6) {
      setStep(step + 1);
      return;
    }

    // For step 6 (payment method selection), move to step 7
    if (step === 6) {
      setStep(7);
      return;
    }

    // For step 7, handle payment based on selected method
    if (step === 7) {
      // Trigger the payment by incrementing paymentTrigger
      setPaymentTrigger(prev => prev + 1);
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialRequests: formData.specialRequests,
        roomNumber: formData.roomNumber,
        roomType: selectedRoom?.name || formData.roomType,
        roomCategory: formData.roomType,
        roomConfig: formData.roomConfig,
        mealPlan: formData.mealPlan,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: parseInt(formData.guests),
        numberOfRooms: formData.rooms,
        nights,
        totalPrice,
        perNightPrice: getRoomPrice(),
        paymentMethod: formData.paymentMethod,
      };

      const resp = await fetch("/api/send-booking-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, guests: String(payload.guests) }),
      });
      if (!resp.ok) throw new Error(`Email send failed (${resp.status})`);

      alert("Booking confirmed and email sent to guest.");
    } catch (err) {
      console.error("Booking email error", err);
      alert("Booking submitted, but failed to send email. Please contact the hotel.");
    }
  };

  const { member, refreshMember } = useLoyaltyAuth();

  const handlePaymentSuccess = async (transactionCode: string) => {
    const isMpesa = formData.paymentMethod === "mpesa";
    const isBank = formData.paymentMethod === "bank_transfer";
    const bookingStatus = (isMpesa || isBank) ? "pending" : "confirmed";
    const paymentStatus = (isMpesa || isBank) ? "pending" : "paid";
    const totalGuests = guestsPerRoom[formData.roomConfig] * formData.rooms;
    const finalAmount = Math.max(1, totalPrice);

    // Look up room_id from Supabase by room_number
    let roomId: string | null = null;
    try {
      const { data: roomRow } = await supabase
        .from("rooms")
        .select("id")
        .eq("room_number", formData.roomNumber)
        .single();
      roomId = roomRow?.id ?? null;
    } catch (_) {}

    // Write booking directly to Supabase — no proxy needed
    let bookingRef = "";
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        room_id: roomId,
        guest_name: `${formData.firstName} ${formData.lastName}`,
        guest_email: formData.email || null,
        guest_phone: formData.phone,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        num_guests: totalGuests,
        number_of_rooms: formData.rooms,
        total_amount: finalAmount,
        room_number: formData.roomNumber,
        room_type: selectedRoom?.name || formData.roomType,
        room_config: formData.roomConfig,
        meal_plan: formData.mealPlan,
        price_per_night: getRoomPrice(),
        payment_method: formData.paymentMethod,
        payment_status: paymentStatus,
        transaction_ref: transactionCode || null,
        special_requests: formData.specialRequests || null,
        status: bookingStatus,
      } as any)
      .select("reference, id")
      .single();

    if (bookingError) {
      console.error("❌ Booking save error:", bookingError.message);
      // Still proceed — don't block the user
    } else {
      bookingRef = booking?.reference || "";
      console.log("✅ Booking saved to DB:", bookingRef);

      // Award loyalty points if member is logged in
      if (member && booking?.id) {
        const pts = calcPoints(finalAmount);
        if (pts > 0) {
          await supabase.from("bookings").update({
            loyalty_member_id: member.id,
            loyalty_points_earned: pts,
          }).eq("id", booking.id);

          await supabase.from("loyalty_members").update({
            points: member.points + pts,
          }).eq("id", member.id);

          await supabase.from("loyalty_transactions").insert({
            member_id: member.id,
            booking_id: booking.id,
            type: "earned",
            points: pts,
            description: `Booking ${bookingRef} — Room ${formData.roomNumber}`,
          });

          await refreshMember();
          console.log(`✅ Awarded ${pts} loyalty points`);
        }
      }
    }

    // Send confirmation email via Express server (best-effort)
    fetch("/api/send-booking-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialRequests: formData.specialRequests,
        roomNumber: formData.roomNumber,
        roomType: selectedRoom?.name || formData.roomType,
        roomCategory: formData.roomType,
        roomConfig: formData.roomConfig,
        mealPlan: formData.mealPlan,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: String(totalGuests),
        numberOfRooms: formData.rooms,
        nights,
        totalPrice: finalAmount,
        perNightPrice: getRoomPrice(),
        paymentMethod: formData.paymentMethod,
        transactionCode,
        status: bookingStatus,
      }),
    }).catch(err => console.warn("Email send failed (non-critical):", err));

    if (isBank) {
      alert(`Booking submitted (Ref: ${bookingRef || "pending"}).\nOur team will verify your bank transfer and confirm within 1–2 business hours.`);
    } else if (isMpesa) {
      const pts = member ? calcPoints(finalAmount) : 0;
      alert(`M-Pesa STK push sent! Check your phone to complete payment.\n\nBooking Ref: ${bookingRef || "pending"}${pts > 0 ? `\n+${pts} loyalty points will be awarded on confirmation.` : "\nJoin Peaks Loyalty to earn points on this stay!"}`);
    } else {
      const pts = member ? calcPoints(finalAmount) : 0;
      alert(`Payment successful! Booking confirmed.\nRef: ${bookingRef}${pts > 0 ? `\n+${pts} loyalty points added to your account!` : "\nJoin Peaks Loyalty to earn points on future stays!"}\nCheck your email for confirmation.`);
    }
    navigate("/");
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    alert("Payment failed: " + error);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={heroBackground}
            alt="Book Your Stay"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </motion.div>

        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center"
            >
              <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
                Reservations
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Book Your Stay
              </h1>
              <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg max-w-2xl mx-auto">
                Experience luxury and comfort at Peaks Hotel. Reserve your perfect room today.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-4 md:py-6 bg-secondary overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-start md:justify-center gap-2 md:gap-4 min-w-max md:min-w-0 mx-auto">
            {[
              { num: 1, label: "Dates" },
              { num: 2, label: "Room Type" },
              { num: 3, label: "Config" },
              { num: 4, label: "Room #" },
              { num: 5, label: "Details" },
              { num: 6, label: "Payment" },
              { num: 7, label: "Pay" }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm transition-colors ${
                    step >= s.num ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {s.num}
                  </div>
                  <span className="text-[10px] md:text-xs mt-1 text-muted-foreground whitespace-nowrap">{s.label}</span>
                </div>
                {idx < 6 && (
                  <div className={`w-4 md:w-8 h-0.5 mx-1 md:mx-2 ${step > s.num ? "bg-accent" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-6 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Dates and Guests */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card p-4 md:p-8 rounded-xl shadow-elegant"
                  >
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Select Your Dates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <CalendarDays className="inline h-4 w-4 mr-2" />
                          Check-in Date
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split("T")[0]}
                          value={formData.checkIn}
                          onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <CalendarDays className="inline h-4 w-4 mr-2" />
                          Check-out Date
                        </label>
                        <input
                          type="date"
                          required
                          min={formData.checkIn || new Date().toISOString().split("T")[0]}
                          value={formData.checkOut}
                          onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                    </div>
                    {nights > 0 && (
                      <p className="mt-4 text-sm text-accent font-medium">{nights} night{nights !== 1 ? "s" : ""} selected</p>
                    )}
                    <div className="mt-6 flex justify-end">
                      <Button type="button" variant="gold" onClick={() => setStep(2)}>
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Room Type Selection */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card p-4 md:p-8 rounded-xl shadow-elegant"
                  >
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Choose Room Type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {roomTypes.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => setFormData({ ...formData, roomType: room.id })}
                          className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                            formData.roomType === room.id
                              ? "border-accent shadow-lg"
                              : "border-border hover:border-accent/50"
                          } ${"isTest" in room && room.isTest ? "border-dashed border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20" : ""}`}
                        >
                          {"isTest" in room && room.isTest ? (
                            <div className="w-full h-20 bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-3xl">🧪</div>
                          ) : (
                            <img src={room.image} alt={room.name} className="w-full h-48 object-cover" />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold text-foreground mb-2">{room.name}</h3>
                            {"isTest" in room && room.isTest ? (
                              <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">Sandbox testing only — KES 1 M-Pesa charge</p>
                            ) : (
                              <p className="text-sm text-muted-foreground">Starting from KES {room.pricing.single.bed_breakfast.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="button" variant="gold" onClick={() => setStep(3)}>
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Room Configuration & Meal Plan */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card p-4 md:p-8 rounded-xl shadow-elegant"
                  >
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Room Configuration & Meal Plan</h2>
                    
                    {/* Room Configuration */}
                    <div className="mb-8">
                      <h3 className="font-semibold text-foreground mb-4">Select Room Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(Object.keys(roomConfigLabels) as RoomConfig[]).map((config) => {
                          if (formData.roomType === "executive" && config === "twin") return null;
                          const gpR = guestsPerRoom[config];
                          return (
                            <div
                              key={config}
                              onClick={() => handleConfigChange(config)}
                              className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                formData.roomConfig === config
                                  ? "border-accent bg-accent/5"
                                  : "border-border hover:border-accent/50"
                              }`}
                            >
                              <div className="font-semibold text-foreground mb-1">{roomConfigLabels[config]}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {gpR} guest{gpR > 1 ? "s" : ""} per room
                                {config === "twin" && " (pp pricing)"}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Number of Rooms — shown after config is chosen */}
                      <div className="mt-6 p-4 bg-secondary rounded-lg">
                        <label className="block text-sm font-medium text-foreground mb-3">
                          <Bed className="inline h-4 w-4 mr-2" />
                          Number of Rooms
                          <span className="text-muted-foreground font-normal ml-2 text-xs">
                            ({guestsPerRoom[formData.roomConfig]} guest{guestsPerRoom[formData.roomConfig] > 1 ? "s" : ""} per room
                            {formData.rooms > 1 ? ` × ${formData.rooms} rooms = ${guestsPerRoom[formData.roomConfig] * formData.rooms} guests total` : ""})
                          </span>
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, rooms: Math.max(1, p.rooms - 1) }))}
                            className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center text-lg font-bold hover:border-accent transition-colors"
                          >−</button>
                          <span className="text-2xl font-bold text-foreground w-12 text-center">{formData.rooms}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, rooms: Math.min(10, p.rooms + 1) }))}
                            className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center text-lg font-bold hover:border-accent transition-colors"
                          >+</button>
                          <span className="text-sm text-muted-foreground ml-2">room{formData.rooms > 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>

                    {/* Meal Plan */}
                    <div className="mb-8">
                      <h3 className="font-semibold text-foreground mb-4">Select Meal Plan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(Object.keys(mealPlanLabels) as MealPlan[]).map((plan) => {
                          const price = selectedRoom?.pricing[formData.roomConfig][plan] || 0;
                          return (
                            <div
                              key={plan}
                              onClick={() => setFormData({ ...formData, mealPlan: plan })}
                              className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                formData.mealPlan === plan
                                  ? "border-accent bg-accent/5"
                                  : "border-border hover:border-accent/50"
                              }`}
                            >
                              <div className="font-semibold text-foreground mb-1">{mealPlanLabels[plan]}</div>
                              <div className="text-lg font-bold text-accent">
                                KES {price.toLocaleString()}
                                {formData.roomConfig === "twin" && <span className="text-sm"> pp</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="bg-accent/10 p-6 rounded-lg mb-6">
                      <h3 className="font-semibold text-foreground mb-4">Pricing Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Room Type:</span>
                          <span className="font-semibold">{selectedRoom?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Configuration:</span>
                          <span className="font-semibold">{roomConfigLabels[formData.roomConfig]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Meal Plan:</span>
                          <span className="font-semibold">{mealPlanLabels[formData.mealPlan]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price per room/night:</span>
                          <span className="font-semibold">KES {getRoomPrice().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Number of rooms:</span>
                          <span className="font-semibold">{formData.rooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total guests:</span>
                          <span className="font-semibold">{guestsPerRoom[formData.roomConfig] * formData.rooms}</span>
                        </div>
                        {nights > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Number of nights:</span>
                              <span className="font-semibold">{nights}</span>
                            </div>
                            <div className="border-t border-border pt-2 mt-2 flex justify-between">
                              <span className="font-bold text-foreground">Total:</span>
                              <span className="font-bold text-accent text-xl">KES {totalPrice.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-6">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                          <p className="font-semibold mb-1">Important Notes:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Rates are in Kenya Shillings (KES) and include all applicable taxes and levies.</li>
                            <li>Twin occupancy means two persons sharing a room, charged per person (pp sharing).</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowPolicies(true)}>
                          <Info className="h-4 w-4 mr-2" />
                          View Policies
                        </Button>
                        <Button type="button" variant="gold" onClick={() => setStep(4)}>
                          Continue
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Room Number Selection */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card p-4 md:p-8 rounded-xl shadow-elegant"
                  >
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Select Room Number</h2>
                    <p className="text-muted-foreground mb-6">
                      Choose your preferred room number from the available {roomTypes.find(r => r.id === formData.roomType)?.name.toLowerCase()}.
                    </p>

                    <div className="space-y-6">
                      {loadingAvailability && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-secondary rounded-lg">
                          <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          Checking availability for your dates...
                        </div>
                      )}

                      {availabilityError && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {availabilityError}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-secondary inline-block" /> Available</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 inline-block" /> Booked</span>
                      </div>

                      {Object.entries(getRoomsByCategory(formData.roomType)).map(([floor, rooms]) => (
                        <div key={floor}>
                          <h3 className="font-semibold text-foreground mb-3">Floor {floor}</h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
                            {rooms.map((roomNumber) => {
                              const isBooked = bookedRooms.has(String(roomNumber));
                              return (
                                <button
                                  key={roomNumber}
                                  type="button"
                                  disabled={isBooked || isCheckingAvailability}
                                  onClick={() => handleRoomSelection(roomNumber)}
                                  title={isBooked ? `Room ${roomNumber} — Already booked` : `Room ${roomNumber} — Available`}
                                  className={`rounded-lg p-2 md:p-3 text-center font-medium transition-colors text-sm md:text-base relative ${
                                    isBooked
                                      ? "bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-500 border border-red-300 dark:border-red-700 cursor-not-allowed line-through"
                                      : "bg-secondary hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                  }`}
                                >
                                  {roomNumber}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(3)}>
                        Back
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Guest Information */}
                {step === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card p-4 md:p-8 rounded-xl shadow-elegant"
                  >
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Guest Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">Special Requests (Optional)</label>
                        <textarea
                          value={formData.specialRequests}
                          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="mt-8 bg-accent/10 p-6 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-4">Booking Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Check-in:</span>
                          <p className="font-semibold">{formData.checkIn}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Check-out:</span>
                          <p className="font-semibold">{formData.checkOut}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Room Type:</span>
                          <p className="font-semibold">{selectedRoom?.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Room Number:</span>
                          <p className="font-semibold">{formData.roomNumber}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Configuration:</span>
                          <p className="font-semibold">{roomConfigLabels[formData.roomConfig]}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Meal Plan:</span>
                          <p className="font-semibold">{mealPlanLabels[formData.mealPlan]}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rooms:</span>
                          <p className="font-semibold">{formData.rooms} room{formData.rooms > 1 ? "s" : ""}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Guests:</span>
                          <p className="font-semibold">{guestsPerRoom[formData.roomConfig] * formData.rooms}</p>
                        </div>
                        <div className="col-span-2 border-t border-border pt-4 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">Total Amount:</span>
                            <span className="font-bold text-accent text-2xl">KES {totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(4)}>
                        Back
                      </Button>
                      <Button type="submit" variant="gold" size="lg">
                        Continue to Payment Method
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Payment Method Selection */}
                {step === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card p-4 md:p-8 rounded-xl shadow-elegant"
                  >
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Select Payment Method</h2>
                    
                    {/* Payment Method Selection */}
                    <div className="mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((method) => {
                          const Icon = paymentMethodIcons[method];
                          return (
                            <div
                              key={method}
                              onClick={() => setFormData({ ...formData, paymentMethod: method })}
                              className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                formData.paymentMethod === method
                                  ? "border-accent bg-accent/5"
                                  : "border-border hover:border-accent/50"
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <Icon className="h-6 w-6 text-accent" />
                                <div className="font-semibold text-foreground">{paymentMethodLabels[method]}</div>
                              </div>
                              {method === 'mpesa' && (
                                <p className="text-xs text-muted-foreground">Instant payment via STK push</p>
                              )}
                              {method === 'paystack' && (
                                <p className="text-xs text-muted-foreground">Pay with Visa, Mastercard, etc.</p>
                              )}
                              {method === 'bank_transfer' && (
                                <p className="text-xs text-muted-foreground">Direct bank transfer</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="mt-8 bg-accent/10 p-6 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-4">Booking Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Check-in:</span>
                          <p className="font-semibold">{formData.checkIn}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Check-out:</span>
                          <p className="font-semibold">{formData.checkOut}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Room Type:</span>
                          <p className="font-semibold">{selectedRoom?.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Room Number:</span>
                          <p className="font-semibold">{formData.roomNumber}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Configuration:</span>
                          <p className="font-semibold">{roomConfigLabels[formData.roomConfig]}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Meal Plan:</span>
                          <p className="font-semibold">{mealPlanLabels[formData.mealPlan]}</p>
                        </div>
                        <div className="col-span-2 border-t border-border pt-4 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">Total Amount:</span>
                            <span className="font-bold text-accent text-2xl">KES {totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(5)}>
                        Back
                      </Button>
                      <Button type="submit" variant="gold" size="lg">
                        Continue to Payment
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 7: Payment */}
                {step === 7 && (
                  <motion.div
                    key="step7"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card p-4 md:p-8 rounded-xl shadow-elegant"
                  >
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Complete Payment</h2>
                    
                    {/* Payment Method Component */}
                    {formData.paymentMethod === 'mpesa' && (
                      <MpesaPayment
                        email={formData.email}
                        phone={formData.phone}
                        amount={totalPrice}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        triggerPayment={paymentTrigger}
                        bookingData={{
                          firstName: formData.firstName,
                          lastName: formData.lastName,
                          roomNumber: formData.roomNumber,
                          roomType: selectedRoom?.name || formData.roomType,
                          roomConfig: formData.roomConfig,
                          mealPlan: formData.mealPlan,
                          checkIn: formData.checkIn,
                          checkOut: formData.checkOut,
                          guests: parseInt(formData.guests),
                          numberOfRooms: formData.rooms,
                          nights,
                          totalPrice,
                          perNightPrice: getRoomPrice(),
                          specialRequests: formData.specialRequests,
                        }}
                      />
                    )}
                    {formData.paymentMethod === 'paystack' && (
                      <PaystackPayment
                        email={formData.email}
                        phone={formData.phone}
                        amount={totalPrice}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    )}
                    {formData.paymentMethod === 'bank_transfer' && (
                      <BankTransferPayment
                        amount={totalPrice}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    )}

                    {/* Booking Summary */}
                    <div className="mt-8 bg-accent/10 p-6 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-4">Booking Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Check-in:</span>
                          <p className="font-semibold">{formData.checkIn}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Check-out:</span>
                          <p className="font-semibold">{formData.checkOut}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Room Type:</span>
                          <p className="font-semibold">{selectedRoom?.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Room Number:</span>
                          <p className="font-semibold">{formData.roomNumber}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Configuration:</span>
                          <p className="font-semibold">{roomConfigLabels[formData.roomConfig]}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Meal Plan:</span>
                          <p className="font-semibold">{mealPlanLabels[formData.mealPlan]}</p>
                        </div>
                        <div className="col-span-2 border-t border-border pt-4 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">Total Amount:</span>
                            <span className="font-bold text-accent text-2xl">KES {totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(6)}>
                        Back
                      </Button>
                      <Button type="submit" variant="gold" size="lg">
                        Pay Now
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </section>

      {/* Checking Availability Modal */}
      <AnimatePresence>
        {isCheckingAvailability && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl p-12 max-w-md w-full text-center"
            >
              <div className="mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mx-auto"></div>
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                Checking Room Availability
              </h3>
              <p className="text-muted-foreground">
                Please wait while we verify room readiness...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Policies Modal */}
      <AnimatePresence>
        {showPolicies && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
            onClick={() => setShowPolicies(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b sticky top-0 bg-background z-10">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-bold text-foreground">Hotel Policies & Information</h2>
                  <button
                    onClick={() => setShowPolicies(false)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* SPA Information */}
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Info className="h-5 w-5 text-accent" />
                    SPA Facilities
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    The Spa comprises of a heated Swimming Pool, Gymnasium, Steam Bath and Sauna, Massage and Beauty Parlour, and an Eatery.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-foreground">Complimentary Services:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>The heated Pool, Gymnasium, Steam Bath and Sauna are complimentary for in-house guests.</li>
                      <li>In-house guests will be issued with a coupon/s on check-in, which they must produce when using the services.</li>
                      <li>In-house guests to contact the Spa Manager for reservations.</li>
                      <li>Services will be subject to earlier reservation and availability of space.</li>
                    </ul>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                      <li>Massage and beauty services will be at normal rates for all guests (in-house and walk-ins).</li>
                      <li>Light meals are served from the Eatery. More elaborate meals will be from the main Kitchen.</li>
                      <li>The Spa is a Non-Smoking Zone.</li>
                      <li>No alcoholic beverages will be served in the Spa.</li>
                      <li>The poolside is strictly for swimmers, and will not be used as an extension of the Eatery.</li>
                    </ul>
                  </div>
                </div>

                {/* Accommodation Policies */}
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-3">Accommodation Policies</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-foreground mb-2">1. Checking-in and Checking-out Policy</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>Check out time: 10:00 hrs</li>
                        <li>Check in time: 14:00 hrs</li>
                        <li>Early check in or late check out are subject to prior notification and room availability.</li>
                        <li>Rates are quoted in Kenya shillings and are inclusive of all applicable taxes and levies.</li>
                        <li>Late check out without prior arrangement will attract a surcharge of KSh. 1,000 per hour.</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-foreground mb-2">2. Booking and Cancellation</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>Reservations without advance payment will be tentative.</li>
                        <li>Bookings will be confirmed on at least 50% advance payment.</li>
                        <li>A booking is considered cancelled once the guest receives an e-mail from Peaks Hotel Nanyuki confirming that the cancellation has been acknowledged and processed.</li>
                        <li>Cancellation done 4 days (48 hours) in advance will attract no penalty.</li>
                        <li>Cancellation done 2 to 3 days (47 - 24 hours) in advance will attract 25% surcharge of the room rate.</li>
                        <li>No-show on the reserved day and cancellation done 1 day (23-0 hours) in advance will attract 100% surcharge of the room rate.</li>
                        <li>Any refunds due will be pro-rated as per the above policy.</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-foreground mb-2">3. Children Policy</p>
                      <p className="text-sm text-muted-foreground mb-2 ml-4">Children sharing a room with adult/s:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-8">
                        <li>0-4 years - Free of Charge (FOC)</li>
                        <li>Between 5-11 years - KSh. 2,700</li>
                        <li>12 years and above - Full Adult Rate</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mb-2 ml-4 mt-2">Own Room:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-8">
                        <li>5-11 years (Maximum of 3 children) - KSh. 8,400</li>
                        <li>12 years and above - Full Adult Rate</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mb-2 ml-4 mt-2">Meals:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-8">
                        <li>0-4 years - Free of Charge (FOC)</li>
                        <li>Between 5-7 years - KSh. 1,000 per Full Meal</li>
                        <li>8 years and above - Full Adult Rate</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Billing and Payment Policy */}
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-3">Billing and Payment Policy</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>A pro-forma invoice will be sent upon reservation.</li>
                    <li>Full payment has to be made before or when checking out. The hotel reserves the right to detain a guest and/or his/her property for bills not cleared at check out.</li>
                    <li>For a long staying guest, the bill will be updated at least every three days, unless in the case of guests from organizations with contract/framework agreement/service level agreements in place.</li>
                    <li>Methods of payment will be Credit/Debit Cards, M-pesa or Bank Transfer.</li>
                    <li>Cheque payment has to be with prior arrangements with the hotel.</li>
                    <li>There will be no refund for early check-out.</li>
                    <li>There will be no refund for meals not taken.</li>
                    <li>No show on the reserved day and cancellation done 1 day (23-0 hours) in advance will attract 100% surcharge of the room rate.</li>
                    <li>Any refund due will be pro-rated as per the above policy.</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t bg-secondary/50">
                <Button onClick={() => setShowPolicies(false)} variant="gold" className="w-full">
                  I Understand
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Booking;
