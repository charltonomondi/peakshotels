import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, Phone, Utensils, Wine, Coffee, Leaf } from "lucide-react";
import restaurantImage from "@/assets/restaurant.jpg";
import barImage from "@/assets/bar.jpg";

const menuCategories = [
  {
    name: "Breakfast",
    icon: Coffee,
    items: [
      { name: "Full English Breakfast", price: "KES 1,200", description: "Eggs, bacon, sausages, beans, toast" },
      { name: "African Continental", price: "KES 950", description: "Mandazi, chapati, fruits, tea or coffee" },
      { name: "Healthy Start", price: "KES 850", description: "Granola, yogurt, fresh fruits, honey" },
    ],
  },
  {
    name: "Main Course",
    icon: Utensils,
    items: [
      { name: "Grilled Tilapia", price: "KES 2,500", description: "Lake Victoria tilapia, vegetables, rice" },
      { name: "Nyama Choma", price: "KES 2,800", description: "Traditional roasted meat, ugali, kachumbari" },
      { name: "Beef Wellington", price: "KES 3,500", description: "Prime beef, mushroom duxelles, puff pastry" },
    ],
  },
  {
    name: "Vegetarian",
    icon: Leaf,
    items: [
      { name: "Garden Risotto", price: "KES 1,800", description: "Arborio rice, seasonal vegetables, parmesan" },
      { name: "Vegetable Curry", price: "KES 1,500", description: "Mixed vegetables, aromatic spices, rice" },
      { name: "Quinoa Bowl", price: "KES 1,600", description: "Quinoa, roasted vegetables, tahini dressing" },
    ],
  },
];

const cocktails = [
  { name: "Safari Sunset", price: "KES 850", description: "Vodka, passion fruit, orange, grenadine" },
  { name: "Mt. Kenya Mule", price: "KES 750", description: "Ginger beer, lime, vodka, mint" },
  { name: "African Queen", price: "KES 900", description: "Amarula, coffee liqueur, cream" },
  { name: "Savanna Breeze", price: "KES 800", description: "Rum, coconut cream, pineapple" },
];

const Dining = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
              Culinary Excellence
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Restaurant & Bar
            </h1>
            <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Experience world-class cuisine and exquisite cocktails in an atmosphere of refined elegance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Restaurant Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={restaurantImage}
                alt="The Summit Restaurant"
                className="w-full h-[400px] object-cover rounded-2xl shadow-elegant"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-accent mb-4">
                <Utensils className="h-5 w-5" />
                <span className="font-medium tracking-wide uppercase text-sm">Restaurant</span>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                The Summit Restaurant
              </h2>
              <p className="text-muted-foreground mb-6">
                Our award-winning restaurant offers a unique dining experience that celebrates 
                the rich culinary heritage of Kenya while embracing international flavors. 
                Our chefs use only the freshest local ingredients to create memorable dishes.
              </p>
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Breakfast: 6:30 AM - 10:00 AM
                </span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Lunch: 12:00 PM - 3:00 PM
                </span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground mb-8">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Dinner: 6:00 PM - 10:00 PM
                </span>
              </div>
              <Button variant="gold" size="lg" asChild>
                <Link to="/contact">Reserve a Table</Link>
              </Button>
            </motion.div>
          </div>

          {/* Menu Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-heading text-2xl font-bold text-foreground mb-8 text-center">
              Sample Menu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {menuCategories.map((category) => (
                <div key={category.name} className="bg-card p-6 rounded-xl shadow-elegant">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h4 className="font-heading text-xl font-bold text-foreground">
                      {category.name}
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div key={item.name} className="border-b border-border pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-foreground">{item.name}</span>
                          <span className="text-accent font-semibold">{item.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bar Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="flex items-center gap-2 text-accent mb-4">
                <Wine className="h-5 w-5" />
                <span className="font-medium tracking-wide uppercase text-sm">Bar & Lounge</span>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                The Peak Lounge
              </h2>
              <p className="text-muted-foreground mb-6">
                Unwind in our sophisticated lounge with a selection of premium spirits, 
                fine wines, and signature cocktails. The perfect spot for pre-dinner drinks 
                or a nightcap under the stars.
              </p>
              <div className="flex items-center gap-4 text-muted-foreground mb-8">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  4:00 PM - Midnight
                </span>
              </div>

              {/* Signature Cocktails */}
              <h4 className="font-heading text-lg font-bold text-foreground mb-4">
                Signature Cocktails
              </h4>
              <div className="space-y-3">
                {cocktails.map((cocktail) => (
                  <div key={cocktail.name} className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-foreground">{cocktail.name}</span>
                      <p className="text-sm text-muted-foreground">{cocktail.description}</p>
                    </div>
                    <span className="text-accent font-semibold">{cocktail.price}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <img
                src={barImage}
                alt="The Peak Lounge"
                className="w-full h-[400px] object-cover rounded-2xl shadow-elegant"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dining;
