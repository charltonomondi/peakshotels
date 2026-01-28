import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Bed, Wifi, Tv, Coffee, Utensils, Calendar, ArrowLeft, Shield, Wind, Music, Moon, Bath, UserCheck, Info, Star, X } from "lucide-react";
import roomDeluxe from "@/assets/bed.jpg";
import roomExecutive from "@/assets/bed1.jpg";
import roomPresidential from "@/assets/bed5.jpg";

// Define the types for room configuration and meal plans to ensure type safety.
type RoomConfig = "single" | "double" | "twin";
type MealPlan = "bed_breakfast" | "half_board" | "full_board";

// Define the structure for room pricing to ensure a consistent data model.
interface RoomPricing {
  single: { bed_breakfast: number; half_board: number; full_board: number };
  double: { bed_breakfast: number; half_board: number; full_board: number };
  twin: { bed_breakfast: number; half_board: number; full_board: number };
}

// Hardcoded data for the different room types, including their names, images, and detailed pricing.
const roomTypes = [
  {
    id: "standard",
    name: "Standard Room",
    priceRange: "From KES 8,400",
    image: roomDeluxe,
    pricing: {
      single: { bed_breakfast: 8400, half_board: 10400, full_board: 12400 },
      double: { bed_breakfast: 11400, half_board: 15400, full_board: 19400 },
      twin: { bed_breakfast: 6200, half_board: 8200, full_board: 10200 }
    },
    features: [
      {
        icon: Bed,
        text: "Comfortable double bed with premium linens"
      },
      {
        icon: Wifi,
        text: "High-speed Wi-Fi (50 Mbps)"
      },
      {
        icon: Tv,
        text: "42\" flat-screen TV with premium channels",
      },
      {
        icon: Coffee,
        text: "Coffee and tea maker"
      },
      {
        icon: Utensils,
        text: "Mini-fridge with complimentary drinks"
      },
      {
        icon: Bath,
        text: "Modern bathroom with shower"
      },
      {
        icon: Shield,
        text: "24/7 security"
      }
    ],
    instructions: [
      {
        icon: Calendar,
        text: "Check-in: 2:00 PM"
      },
      {
        icon: Calendar,
        text: "Check-out: 11:00 AM"
      },
      {
        icon: Info,
        text: "No smoking in rooms"
      },
      {
        icon: Moon,
        text: "Quiet hours: 10:00 PM - 7:00 AM"
      },
      {
        icon: UserCheck,
        text: "Housekeeping: Daily at 3:00 PM"
      }
    ]
  },
  {
    id: "superior",
    name: "Superior Room",
    priceRange: "From KES 9,600",
    image: roomExecutive,
    pricing: {
      single: { bed_breakfast: 9600, half_board: 11600, full_board: 13600 },
      double: { bed_breakfast: 12600, half_board: 16600, full_board: 20600 },
      twin: { bed_breakfast: 6800, half_board: 8800, full_board: 10800 }
    },
    features: [
      {
        icon: Bed,
        text: "King size bed with premium linens"
      },
      {
        icon: Wifi,
        text: "High-speed Wi-Fi (100 Mbps)"
      },
      {
        icon: Tv,
        text: "55\" flat-screen TV with premium channels"
      },
      {
        icon: Coffee,
        text: "Coffee and tea maker with premium selection"
      },
      {
        icon: Utensils,
        text: "Mini-fridge with complimentary drinks"
      },
      {
        icon: Bath,
        text: "Luxury bathroom with shower and bathtub"
      },
      {
        icon: Shield,
        text: "24/7 security with keycard access"
      },
      {
        icon: Wind,
        text: "Air conditioning"
      }
    ],
    instructions: [
      {
        icon: Calendar,
        text: "Check-in: 2:00 PM"
      },
      {
        icon: Calendar,
        text: "Check-out: 11:00 AM"
      },
      {
        icon: Info,
        text: "No smoking in rooms"
      },
      {
        icon: Moon,
        text: "Quiet hours: 10:00 PM - 7:00 AM"
      },
      {
        icon: UserCheck,
        text: "Housekeeping: Daily at 3:00 PM"
      }
    ]
  },
  {
    id: "executive",
    name: "Executive Room",
    priceRange: "From KES 13,400",
    image: roomPresidential,
    pricing: {
      single: { bed_breakfast: 13400, half_board: 15400, full_board: 17400 },
      double: { bed_breakfast: 16900, half_board: 20900, full_board: 24900 },
      twin: { bed_breakfast: 0, half_board: 0, full_board: 0 } // No twin option for executive
    },
    features: [
      {
        icon: Bed,
        text: "King size bed with premium linens and down comforter"
      },
      {
        icon: Wifi,
        text: "High-speed Wi-Fi (200 Mbps)"
      },
      {
        icon: Tv,
        text: "65\" flat-screen TV with premium channels"
      },
      {
        icon: Coffee,
        text: "Coffee and tea maker with premium selection"
      },
      {
        icon: Utensils,
        text: "Full-size fridge with complimentary drinks"
      },
      {
        icon: Bath,
        text: "Luxury bathroom with shower, bathtub, and premium amenities"
      },
      {
        icon: Shield,
        text: "24/7 security with keycard access and safe"
      },
      {
        icon: Wind,
        text: "Air conditioning with temperature control"
      },
      {
        icon: Music,
        text: "In-room entertainment system"
      }
    ],
    instructions: [
      {
        icon: Calendar,
        text: "Check-in: 2:00 PM"
      },
      {
        icon: Calendar,
        text: "Check-out: 11:00 AM"
      },
      {
        icon: Info,
        text: "No smoking in rooms"
      },
      {
        icon: Moon,
        text: "Quiet hours: 10:00 PM - 7:00 AM"
      },
      {
        icon: UserCheck,
        text: "Housekeeping: Daily at 3:00 PM"
      }
    ]
  }
];

// Labels for displaying meal plan options in the UI.
const mealPlanLabels = {
  bed_breakfast: "Bed & Breakfast",
  half_board: "Half Board",
  full_board: "Full Board"
};

// Labels for displaying room configuration options in the UI.
const roomConfigLabels = {
  single: "Single Room",
  double: "Double Room",
  twin: "Twin Room (per person)"
};


const RoomFeatures = () => {
  const { roomNumber } = useParams<{ roomNumber: string }>();
  const navigate = useNavigate();
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<(typeof roomTypes)[0] & { pricing: RoomPricing } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2,
    roomConfig: "double" as RoomConfig,
    mealPlan: "bed_breakfast" as MealPlan,
    numberOfRooms: 1
  });
  const [guestData, setGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    idCard: null as File | null
  });

  useEffect(() => {
    // Simulate fetching room data
    setTimeout(() => {
      const roomCategory = getRoomCategory(parseInt(roomNumber || "0"));
      const roomType = roomTypes.find(r => r.id === roomCategory);
      if (roomType) {
        setSelectedRoom(roomType as (typeof roomTypes)[0] & { pricing: RoomPricing });
        setRoomImages([roomType.image, roomType.image, roomType.image]); // Use same image 3 times for demo
      }
      setIsLoading(false);
    }, 1000);
  }, [roomNumber]);

  const getRoomCategory = (roomNumber: number) => {
    const lastTwoDigits = roomNumber % 100;
    if ([1, 6, 7].includes(lastTwoDigits)) return "superior";
    if (lastTwoDigits === 12) return "executive";
    return "standard";
  };

  const handleBookNow = () => {
    setBookingStep(1);
    setShowBookingModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuestData({ ...guestData, idCard: file });
    }
  };

  const handleSubmitBooking = () => {
    // Validate required fields
    if (!guestData.firstName || !guestData.lastName || !guestData.email || !guestData.phone) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Here you would typically send the booking data to your backend
    console.log("Booking submitted:", {
      room: selectedRoom,
      roomNumber,
      bookingDetails: bookingData,
      totalPrice,
      guestData
    });
    alert("Booking submitted successfully! We will contact you shortly.");
    setShowBookingModal(false);
  };

  const nights = bookingData.checkIn && bookingData.checkOut
    ? Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getRoomPrice = () => {
    if (!selectedRoom) return 0;
    const basePrice = selectedRoom.pricing[bookingData.roomConfig][bookingData.mealPlan];
    if (bookingData.roomConfig === "twin") {
      return basePrice * bookingData.guests;
    }
    return basePrice;
  };

  const totalPrice = getRoomPrice() * nights * bookingData.numberOfRooms;


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Image */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={selectedRoom.image}
            alt={selectedRoom.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </motion.div>

        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-4 pb-16">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="mb-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Room Selection
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-accent font-medium tracking-[0.2em] uppercase mb-3">
                Room {roomNumber}
              </p>
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                {selectedRoom.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-white/80 text-lg">Luxury Accommodation</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-accent text-5xl font-bold">
                  {selectedRoom.priceRange}
                </span>
                <span className="text-white/70 text-xl">per night</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Features and Gallery Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              
              {/* Room Features Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="bg-card rounded-2xl shadow-elegant p-8 h-full border border-border/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-accent/10 rounded-xl">
                      <Bed className="h-6 w-6 text-accent" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">
                      Room Features
                    </h2>
                  </div>
                  <ul className="space-y-4">
                    {selectedRoom.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                        className="flex items-start gap-3 group"
                      >
                        <div className="p-2 bg-accent/5 rounded-lg group-hover:bg-accent/10 transition-colors">
                          <feature.icon className="h-5 w-5 text-accent flex-shrink-0" />
                        </div>
                        <span className="text-foreground/80 leading-relaxed">{feature.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Gallery Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="lg:col-span-2"
              >
                <div className="grid grid-cols-2 gap-4 h-full">
                  {/* Large Image */}
                  <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl shadow-lg group">
                    <img
                      src={roomImages[0]}
                      alt="Room view 1"
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  {/* Small Images */}
                  {roomImages.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-2xl shadow-lg group aspect-square"
                    >
                      <img
                        src={image}
                        alt={`Room view ${index + 2}`}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Instructions and Booking Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Room Instructions */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="lg:col-span-2"
              >
                <div className="bg-card rounded-2xl shadow-elegant p-8 border border-border/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-accent/10 rounded-xl">
                      <Info className="h-6 w-6 text-accent" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">
                      Important Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedRoom.instructions.map((instruction, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                        className="flex items-start gap-4 p-4 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors"
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <instruction.icon className="h-5 w-5 text-accent flex-shrink-0" />
                        </div>
                        <span className="text-foreground/80 leading-relaxed">{instruction.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Booking Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="lg:col-span-1"
              >
                <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-2xl shadow-elegant p-8 border border-accent/20 sticky top-24">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                      Starting From
                    </p>
                    <div className="flex items-baseline justify-center gap-2 mb-1">
                      <span className="text-4xl font-bold text-foreground">
                        {selectedRoom.priceRange}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">per night</p>
                  </div>

                  {/* Pricing Table */}
                  <div className="bg-accent/10 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Room Rates</h4>
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-4 gap-1 font-semibold text-foreground border-b border-border pb-2">
                        <div>Type</div>
                        <div className="text-right">B&B</div>
                        <div className="text-right">HB</div>
                        <div className="text-right">FB</div>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-muted-foreground">
                        <div>Single</div>
                        <div className="text-right">{selectedRoom.pricing.single.bed_breakfast.toLocaleString()}</div>
                        <div className="text-right">{selectedRoom.pricing.single.half_board.toLocaleString()}</div>
                        <div className="text-right">{selectedRoom.pricing.single.full_board.toLocaleString()}</div>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-muted-foreground">
                        <div>Double</div>
                        <div className="text-right">{selectedRoom.pricing.double.bed_breakfast.toLocaleString()}</div>
                        <div className="text-right">{selectedRoom.pricing.double.half_board.toLocaleString()}</div>
                        <div className="text-right">{selectedRoom.pricing.double.full_board.toLocaleString()}</div>
                      </div>
                      {selectedRoom.id !== "executive" && (
                        <div className="grid grid-cols-4 gap-1 text-muted-foreground">
                          <div>Twin</div>
                          <div className="text-right">{selectedRoom.pricing.twin.bed_breakfast.toLocaleString()}</div>
                          <div className="text-right">{selectedRoom.pricing.twin.half_board.toLocaleString()}</div>
                          <div className="text-right">{selectedRoom.pricing.twin.full_board.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 italic">All rates in KES</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-foreground/70">Room Type</span>
                      <span className="font-semibold text-foreground">{selectedRoom.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-foreground/70">Room Number</span>
                      <span className="font-semibold text-foreground">{roomNumber}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-foreground/70">Max Guests</span>
                      <span className="font-semibold text-foreground">2 Adults</span>
                    </div>
                  </div>

                  <Button
                    variant="gold"
                    size="lg"
                    onClick={handleBookNow}
                    className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Book This Room
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Free cancellation up to 24 hours before check-in
                  </p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Guest Details Modal */}
      <AnimatePresence>
        {showBookingModal && selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b sticky top-0 bg-background z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">Complete Your Booking</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRoom.name} - Room {roomNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  {[1, 2].map((step) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${bookingStep === step ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}>
                        {step}
                      </div>
                      <span className={`font-semibold ${bookingStep === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step === 1 ? 'Configuration' : 'Guest Details'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* Step 1: Configuration */}
                {bookingStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-6"
                  >
                    {/* Date Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Check-in Date</label>
                        <input
                          type="date"
                          required
                          value={bookingData.checkIn}
                          onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Check-out Date</label>
                        <input
                          type="date"
                          required
                          value={bookingData.checkOut}
                          onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Room Configuration */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Room Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(Object.keys(roomConfigLabels) as RoomConfig[]).map((config) => {
                          if (selectedRoom.id === "executive" && config === "twin") return null;
                          return (
                            <div
                              key={config}
                              onClick={() => setBookingData({ ...bookingData, roomConfig: config })}
                              className={`cursor-pointer p-4 rounded-lg border-2 ${bookingData.roomConfig === config ? 'border-accent' : 'border-border'}`}
                            >
                              {roomConfigLabels[config]}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Meal Plan */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Meal Plan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(Object.keys(mealPlanLabels) as MealPlan[]).map((plan) => (
                          <div
                            key={plan}
                            onClick={() => setBookingData({ ...bookingData, mealPlan: plan })}
                            className={`cursor-pointer p-4 rounded-lg border-2 ${bookingData.mealPlan === plan ? 'border-accent' : 'border-border'}`}
                          >
                            <p>{mealPlanLabels[plan]}</p>
                            <p className="font-bold">KES {selectedRoom.pricing[bookingData.roomConfig][plan].toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Total Price */}
                    {nights > 0 && (
                      <div className="bg-accent/10 p-4 rounded-lg text-right">
                        <p className="text-muted-foreground">
                          {getRoomPrice().toLocaleString()} KES/night x {nights} night(s)
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          Total: KES {totalPrice.toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <Button variant="outline" onClick={() => setShowBookingModal(false)}>Cancel</Button>
                      <Button variant="gold" onClick={() => setBookingStep(2)} disabled={!bookingData.checkIn || !bookingData.checkOut}>
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Guest Details */}
                {bookingStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
                        <input type="text" required value={guestData.firstName} onChange={(e) => setGuestData({ ...guestData, firstName: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
                        <input type="text" required value={guestData.lastName} onChange={(e) => setGuestData({ ...guestData, lastName: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                        <input type="email" required value={guestData.email} onChange={(e) => setGuestData({ ...guestData, email: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
                        <input type="tel" required value={guestData.phone} onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">Special Requests</label>
                        <textarea value={guestData.specialRequests} onChange={(e) => setGuestData({ ...guestData, specialRequests: e.target.value })} rows={3} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                    </div>
                    <div className="flex justify-between gap-4 pt-6 border-t">
                      <Button variant="outline" onClick={() => setBookingStep(1)}>Back</Button>
                      <Button variant="gold" onClick={handleSubmitBooking}>Confirm Booking</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default RoomFeatures;
