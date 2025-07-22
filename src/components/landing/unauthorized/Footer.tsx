import {
  FaArrowUp,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import Logo from "@/components/layout/Logo";
import { motion, Variants } from "framer-motion";

interface FooterProps {
  scrollToTop: () => void;
}

// Stagger children for entry animations (optional)
const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const iconEntry: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 200, damping: 20 } 
  },
};

const Footer: React.FC<FooterProps> = ({ scrollToTop }) => {
  const socials = [FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn];

  return (
    <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Logo />

        {/* social icons with staggered entry */}
        <motion.div
          className="flex gap-4 mt-4 md:mt-0"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {socials.map((Icon, i) => (
            <motion.a
              key={i}
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary"
              variants={iconEntry}
              whileHover={{
                scale: 1.4,
                rotate: [0, 15, -15, 0],
                transition: {
                  // everything not listed below uses this spring
                  default: { type: "spring", stiffness: 300, damping: 20 },
                  // but rotate explicitly uses a tween so you can have 4 steps
                  rotate: { type: "tween", duration: 0.6, ease: "easeInOut" },
                },
              }}
              whileTap={{
                scale: 0.9,
                rotate: 360,
                transition: { type: "spring", stiffness: 400, damping: 15 },
              }}
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          ))}
        </motion.div>

        <p className="text-gray-500">© 2025 MeetSync. All rights reserved.</p>
      </div>

      {/* back-to-top button */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-gradient-to-tr from-primary to-secondary text-slate-700 p-3 rounded-full shadow-lg hover:bg-white hover:text-primary border border-transparent hover:border-primary transition-colors"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{
          scale: 1.2,
          rotate: [0, 15, -15, 0],
          transition: {
            default: { type: "spring", stiffness: 300, damping: 20 },
            rotate: { type: "tween", duration: 0.6, ease: "easeInOut" },
          },
          boxShadow: "0px 0px 12px rgba(236, 72, 153, 0.5)",
        }}
        whileTap={{
          scale: 0.8,
          rotate: 180,
          transition: { type: "spring", stiffness: 500, damping: 30 },
        }}
        aria-label="Back to top"
      >
        <FaArrowUp className="w-4 h-4" />
      </motion.button>
    </footer>
  );
};

export default Footer;