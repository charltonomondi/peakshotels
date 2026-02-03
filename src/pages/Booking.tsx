import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Bed, Check, CreditCard, X, Info, AlertCircle } from "lucide-react";
import roomDeluxe from "@/assets/bed.jpg";
import roomExecutive from "@/assets/bed1.jpg";
import roomPresidential from "@/assets/bed5.jpg";
import heroBackground from "@/assets/bed2.jpg";

// Room configuration types
type RoomConfig = "single" | "double" | "twin";
type MealPlan = "bed_breakfast" | "half_board" | "full_board";

interface RoomPricing {
  single: { bed_breakfast: number; half_board: number; full_board: number };
  double: { bed_breakfast: number; half_board: number; full_board: number };
  twin: { bed_breakfast: number; half_board: number; full_board: number };
}

const roomTypes = [
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
      twin: { bed_breakfast: 0, half_board: 0, full_board: 0 } // No twin option for executive
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

// Room numbers by floor
const roomNumbers = {
  1: Array.from({ length: 12 }, (_, i) => 101 + i), // 101-112
  2: Array.from({ length: 12 }, (_, i) => 201 + i), // 201-212
  3: Array.from({ length: 12 }, (_, i) => 301 + i), // 301-312
  4: [407, 408, 409, 410, 411, 412] // 407-412
};

// Function to determine room category
const getRoomCategory = (roomNumber: number) => {
  const lastTwoDigits = roomNumber % 100;
  if ([1, 6, 7].includes(lastTwoDigits)) return "superior";
  if (lastTwoDigits === 12) return "executive";
  return "standard";
};

// Get rooms by category and floor
const getRoomsByCategory = (category: string) => {
  const result: { [floor: number]: number[] } = {};

  Object.entries(roomNumbers).forEach(([floor, rooms]) => {
    const floorRooms = rooms.filter(room => getRoomCategory(room) === category);
    if (floorRooms.length > 0) {
      result[parseInt(floor)] = floorRooms;
    }
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
  
  const getRoomPrice = () => {
    if (!selectedRoom) return 0;
    const basePrice = selectedRoom.pricing[formData.roomConfig][formData.mealPlan];
    // For twin rooms, multiply by number of guests
    if (formData.roomConfig === "twin") {
      return basePrice * parseInt(formData.guests);
    }
    return basePrice;
  };
  
  const totalPrice = getRoomPrice() * nights * formData.rooms;

  const handleRoomSelection = async (roomNumber: number) => {
    setIsCheckingAvailability(true);
    setSelectedRoomCategory(null);

    // Simulate availability check
    await new Promise(resolve => setTimeout(resolve, 5000));

    setIsCheckingAvailability(false);

    // Set room images based on room type
    const selectedRoomType = roomTypes.find(r => r.id === formData.roomType);
    if (selectedRoomType) {
      setRoomImages([selectedRoomType.image, selectedRoomType.image, selectedRoomType.image]); // Use same image 3 times for demo
    }

    setFormData({ ...formData, roomNumber: roomNumber.toString() });
    // Redirect to room features page
    navigate(`/room-features/${roomNumber}`);
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep(step + 1);
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
      };

      const resp = await fetch("http://localhost:3001/api/send-booking-email", {
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
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { num: 1, label: "Dates" },
              { num: 2, label: "Room Type" },
              { num: 3, label: "Configuration" },
              { num: 4, label: "Room Number" },
              { num: 5, label: "Guest Info" }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step >= s.num ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.num}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">{s.label}</span>
                </div>
                {idx < 4 && (
                  <div className={`w-8 h-0.5 mx-2 ${step > s.num ? "bg-accent" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12 bg-background">
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
                    className="bg-card p-8 rounded-xl shadow-elegant"
                  >
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Select Dates & Guests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <CalendarDays className="inline h-4 w-4 mr-2" />
                          Check-in Date
                        </label>
                        <input
                          type="date"
                          required
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
                          value={formData.checkOut}
                          onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Users className="inline h-4 w-4 mr-2" />
                          Number of Guests
                        </label>
                        <select
                          value={formData.guests}
                          onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                          {[1, 2, 3, 4].map(num => (
                            <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Bed className="inline h-4 w-4 mr-2" />
                          Number of Rooms
                        </label>
                        <select
                          value={formData.rooms}
                          onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
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
                    className="bg-card p-8 rounded-xl shadow-elegant"
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
                          }`}
                        >
                          <img src={room.image} alt={room.name} className="w-full h-48 object-cover" />
                          <div className="p-4">
                            <h3 className="font-semibold text-foreground mb-2">{room.name}</h3>
                            <p className="text-sm text-muted-foreground">Starting from KES {room.pricing.single.bed_breakfast.toLocaleString()}</p>
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
                    className="bg-card p-8 rounded-xl shadow-elegant"
                  >
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Room Configuration & Meal Plan</h2>
                    
                    {/* Room Configuration */}
                    <div className="mb-8">
                      <h3 className="font-semibold text-foreground mb-4">Select Room Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(Object.keys(roomConfigLabels) as RoomConfig[]).map((config) => {
                          // Skip twin for executive rooms
                          if (formData.roomType === "executive" && config === "twin") return null;
                          
                          return (
                            <div
                              key={config}
                              onClick={() => setFormData({ ...formData, roomConfig: config })}
                              className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                formData.roomConfig === config
                                  ? "border-accent bg-accent/5"
                                  : "border-border hover:border-accent/50"
                              }`}
                            >
                              <div className="font-semibold text-foreground mb-1">{roomConfigLabels[config]}</div>
                              <div className="text-sm text-muted-foreground">
                                {config === "twin" && "(Per person pricing)"}
                              </div>
                            </div>
                          );
                        })}
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
                          <span className="text-muted-foreground">Price per night:</span>
                          <span className="font-semibold">KES {getRoomPrice().toLocaleString()}</span>
                        </div>
                        {nights > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Number of nights:</span>
                              <span className="font-semibold">{nights}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Number of rooms:</span>
                              <span className="font-semibold">{formData.rooms}</span>
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
                    className="bg-card p-8 rounded-xl shadow-elegant"
                  >
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Select Room Number</h2>
                    <p className="text-muted-foreground mb-6">
                      Choose your preferred room number from the available {roomTypes.find(r => r.id === formData.roomType)?.name.toLowerCase()}.
                    </p>

                    <div className="space-y-6">
                      {Object.entries(getRoomsByCategory(formData.roomType)).map(([floor, rooms]) => (
                        <div key={floor}>
                          <h3 className="font-semibold text-foreground mb-3">Floor {floor}</h3>
                          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {rooms.map((roomNumber) => (
                              <button
                                key={roomNumber}
                                type="button"
                                onClick={() => handleRoomSelection(roomNumber)}
                                className="bg-secondary hover:bg-accent hover:text-accent-foreground rounded-lg p-3 text-center font-medium transition-colors"
                              >
                                {roomNumber}
                              </button>
                            ))}
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
                    className="bg-card p-8 rounded-xl shadow-elegant"
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
                        <CreditCard className="h-4 w-4 mr-2" />
                        Confirm Booking
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
