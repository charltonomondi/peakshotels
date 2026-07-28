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
    // Progress bar: starts at delay 2s, runs 2s → completes at 4s
    // Auto-dismiss after 4.3s with 0.8s exit animation
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 800);
    }, 4300);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onClick={undefined}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 via-transparent to-teal-900/20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Animated circles background */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/5"
            style={{
              width: 100 + i * 80,
              height: 100 + i * 80,
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="text-center z-10 relative">
        {/* Logo Container with Glow Effect */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
            delay: 0.3,
          }}
          className="relative mb-10"
        >
          {/* Glow effect behind logo */}
          <motion.div
            className="absolute inset-0 bg-amber-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <div className="relative w-40 h-40 mx-auto">
            {logoError ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center rounded-full shadow-2xl border-4 border-amber-500/50"
              >
                <span className="text-white font-bold text-4xl">PH</span>
              </motion.div>
            ) : (
              <motion.img
                initial={{ scale: 0, rotate: 180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  delay: 0.5,
                }}
                src={logo}
                alt="Peaks Hotel"
                className={`w-full h-full object-cover rounded-full shadow-2xl border-4 border-amber-500/50 transition-all duration-500 ${
                  logoLoading ? "scale-0 opacity-0" : "scale-100 opacity-100"
                }`}
                onLoad={() => setLogoLoading(false)}
                onError={() => {
                  setLogoError(true);
                  setLogoLoading(false);
                }}
                loading="eager"
                decoding="async"
                width="160"
                height="160"
              />
            )}
            
            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border-2 border-dashed border-amber-500/30 rounded-full"
            />
          </div>
        </motion.div>

        {/* Main Title with staggered letter animation */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold text-white tracking-wider"
          >
            <motion.span
              className="inline-block bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              Peaks Hotel
            </motion.span>
          </motion.h1>
        </div>

        {/* Location */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-2xl md:text-3xl text-amber-400 font-light tracking-[0.5em] uppercase mb-4"
        >
          Nanyuki
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-lg md:text-xl text-gray-400 mb-12 italic"
        >
          Beauty and Taste, with Nature
        </motion.p>

        {/* Loading/Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 1.8 }}
          className="w-64 mx-auto"
        >
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, delay: 2, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="flex justify-center mt-6 space-x-2"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [0.8, 1.3, 0.8],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: index * 0.2,
              }}
              className="w-2 h-2 bg-amber-500 rounded-full"
            />
          ))}
        </motion.div>
      </div>

      {/* Decorative corners */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-amber-500/50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-amber-500/50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-amber-500/50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-amber-500/50"
      />

      {/* Exit animation overlay */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: !show ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent origin-bottom"
      />
    </motion.div>
  );
};

export default SplashScreen;
