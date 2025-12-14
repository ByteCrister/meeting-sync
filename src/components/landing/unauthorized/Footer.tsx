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
  const socials = [
    { Icon: FaFacebookF, label: 'Facebook' },
    { Icon: FaTwitter, label: 'Twitter' },
    { Icon: FaInstagram, label: 'Instagram' },
    { Icon: FaLinkedinIn, label: 'LinkedIn' }
  ];

  return (
    <footer className="container mx-auto px-4 py-12 border-t border-[#E2E8F0] bg-[#F8FAFC]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <Logo />

        {/* Social icons with staggered entry */}
        <motion.div
          className="flex gap-4 mt-4 md:mt-0"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {socials.map(({ Icon, label }, i) => (
            <motion.a
              key={i}
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E2E8F0] text-[#64748B] hover:text-white hover:bg-[#3B82F6] hover:border-[#3B82F6] transition-all duration-300 shadow-sm hover:shadow-md"
              variants={iconEntry}
              whileHover={{
                scale: 1.15,
                rotate: [0, 10, -10, 0],
                transition: {
                  default: { type: "spring", stiffness: 300, damping: 20 },
                  rotate: { type: "tween", duration: 0.5, ease: "easeInOut" },
                },
              }}
              whileTap={{
                scale: 0.9,
                rotate: 360,
                transition: { type: "spring", stiffness: 400, damping: 15 },
              }}
            >
              <Icon className="w-4 h-4" />
            </motion.a>
          ))}
        </motion.div>

        <p className="text-[#64748B] text-sm text-center md:text-right">
          © 2025 MeetSync. All rights reserved by Sadiqul Islam Shakib.
        </p>
      </div>

      {/* Back-to-top button */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white p-3.5 rounded-full shadow-lg hover:shadow-xl border-2 border-transparent hover:border-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.15)]"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{
          scale: 1.15,
          rotate: [0, 15, -15, 0],
          transition: {
            default: { type: "spring", stiffness: 300, damping: 20 },
            rotate: { type: "tween", duration: 0.6, ease: "easeInOut" },
          },
          boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.6)",
        }}
        whileTap={{
          scale: 0.85,
          rotate: 180,
          transition: { type: "spring", stiffness: 500, damping: 30 },
        }}
        aria-label="Back to top"
      >
        <FaArrowUp className="w-5 h-5" />
      </motion.button>
    </footer>
  );
};

export default Footer;