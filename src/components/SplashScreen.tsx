import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "/logo.jpeg";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [show, setShow] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent/20"
    >
      <div className="text-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: 0.2
          }}
          className="mb-8"
        >
          <div className="relative w-32 h-32 mx-auto">
            {logoError ? (
              <div className="w-full h-full bg-primary-foreground/20 flex items-center justify-center rounded-full shadow-2xl border-4 border-primary-foreground/20">
                <span className="text-primary-foreground font-bold text-3xl">PH</span>
              </div>
            ) : (
              <img
                src={logo}
                alt="Peaks Hotel"
                className={`w-full h-full object-cover rounded-full shadow-2xl border-4 border-primary-foreground/20 transition-opacity duration-300 ${logoLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setLogoLoading(false)}
                onError={() => {
                  setLogoError(true);
                  setLogoLoading(false);
                }}
                loading="eager"
                decoding="async"
                width="128"
                height="128"
              />
            )}
            {logoLoading && !logoError && (
              <div className="absolute inset-0 bg-primary-foreground/10 rounded-full animate-pulse" />
            )}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-accent/30"
            />
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-4xl md:text-6xl font-heading font-bold text-primary-foreground mb-4"
        >
          Peaks Hotel
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-xl md:text-2xl text-primary-foreground/90 mb-2"
        >
          Nanyuki
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-lg text-primary-foreground/80 mb-8"
        >
          Where Luxury Meets African Majesty
        </motion.p>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex justify-center"
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className="w-3 h-3 bg-accent rounded-full"
              />
            ))}
          </div>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-8"
        >
          <p className="text-primary-foreground/70 text-sm">
            Welcome to an unforgettable experience
          </p>
        </motion.div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-primary-foreground/20 rounded-full" />
        <div className="absolute top-20 right-20 w-16 h-16 border border-primary-foreground/20 rounded-full" />
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-primary-foreground/20 rounded-full" />
        <div className="absolute bottom-10 right-10 w-12 h-12 border border-primary-foreground/20 rounded-full" />
      </div>
    </motion.div>
  );
};

export default SplashScreen;