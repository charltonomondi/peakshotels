import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Star, Send } from "lucide-react";
import heroBackground from "@/assets/facilities/frontage.jpg";
import awardImage from "@/assets/facilities/frontage.jpg";
import wellnessImage from "@/assets/spa.jpg";
import sustainabilityImage from "@/assets/views/Ngare Ndare.jpg";
import adventureImage from "@/assets/news/mountk.JPG";
import diningImage from "@/assets/restaurant/Ami5.jpg";
import communityImage from "@/assets/outdoor/eventsgrounds.jpg";

const newsItems = [
  {
    id: 1,
    title: "Peaks Hotel Wins 'Best Mountain Resort' Award 2024",
    excerpt: "We're thrilled to announce that Peaks Hotel has been recognized as Kenya's Best Mountain Resort in the prestigious Tourism Awards.",
    date: "2024-01-15",
    author: "Peaks Hotel Team",
    category: "Awards",
    image: awardImage,
  },
  {
    id: 2,
    title: "New Wellness Retreat Program Launches",
    excerpt: "Experience our comprehensive 7-day wellness retreat combining mountain hikes, spa treatments, and mindfulness practices.",
    date: "2024-01-10",
    author: "Wellness Director",
    category: "Wellness",
    image: wellnessImage,
  },
  {
    id: 3,
    title: "Sustainable Practices Initiative",
    excerpt: "Peaks Hotel commits to carbon neutrality with new eco-friendly initiatives including solar power and water conservation.",
    date: "2024-01-05",
    author: "Operations Manager",
    category: "Sustainability",
    image: sustainabilityImage,
  },
  {
    id: 4,
    title: "Mount Kenya Climbing Season Opens",
    excerpt: "Professional guides are now available for climbing expeditions to Point Lenana and other peaks in the Mount Kenya region.",
    date: "2023-12-20",
    author: "Adventure Coordinator",
    category: "Adventure",
    image: adventureImage,
  },
  {
    id: 5,
    title: "Culinary Excellence: New Executive Chef",
    excerpt: "Welcome our new executive chef bringing innovative fusion cuisine inspired by local ingredients and international techniques.",
    date: "2023-12-15",
    author: "Food & Beverage Manager",
    category: "Dining",
    image: diningImage,
  },
  {
    id: 6,
    title: "Community Partnership Program",
    excerpt: "Peaks Hotel launches partnership with local communities to support education and conservation initiatives.",
    date: "2023-12-01",
    author: "Community Relations",
    category: "Community",
    image: communityImage,
  },
];

const News = () => {
  const [feedbackData, setFeedbackData] = useState({
    name: "",
    email: "",
    rating: 0,
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackData.rating === 0) {
      alert("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setSubmitStatus("idle");
    try {
      const res = await fetch("/api/send-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitStatus("success");
        setFeedbackData({ name: "", email: "", rating: 0, message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={heroBackground}
            alt="News & Updates"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </motion.div>

        <div className="relative h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
                Stay Informed
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                News & Updates
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Keep up with the latest news, events, and developments at Peaks Hotel.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card rounded-xl shadow-elegant overflow-hidden group hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {item.author}
                    </div>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {item.excerpt}
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto font-semibold text-accent hover:text-accent/80">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Feedback */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Share Your Experience
              </h2>
              <p className="text-muted-foreground">
                Your feedback helps us improve and serve you better. Please share your thoughts about your stay at Peaks Hotel.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-elegant">
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={feedbackData.name}
                      onChange={(e) => setFeedbackData({ ...feedbackData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={feedbackData.email}
                      onChange={(e) => setFeedbackData({ ...feedbackData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Rating *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= feedbackData.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Feedback *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={feedbackData.message}
                    onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <Button variant="gold" size="lg" type="submit" className="w-full" disabled={submitting}>
                  <Send className="h-5 w-5 mr-2" />
                  {submitting ? "Sending..." : "Submit Feedback"}
                </Button>

                {submitStatus === "success" && (
                  <p className="text-center text-sm text-green-600 font-medium">
                    ✓ Thank you! Your review has been sent to our team.
                  </p>
                )}
                {submitStatus === "error" && (
                  <p className="text-center text-sm text-red-600 font-medium">
                    Something went wrong. Please try again or email us directly at peakshotels@gmail.com
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our newsletter for the latest news, special offers, and exclusive updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button variant="gold" size="lg">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;