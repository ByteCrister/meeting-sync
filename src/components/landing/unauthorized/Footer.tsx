import {
    FaArrowUp,
} from "react-icons/fa";
import Logo from '@/components/layout/Logo';
import { motion, } from 'framer-motion';

const Footer = ({ scrollToTop }: { scrollToTop: () => void }) => {
    return (
        <footer className="container mx-auto px-4 py-8 mt-32 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <Logo />
                <p className="text-gray-500">© 2025 MeetSync. All rights reserved.</p>
            </div>

            {/* Back to Top Button */}
            <motion.button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 bg-gradient-to-tr from-primary to-secondary text-slate-700 p-3 rounded-full shadow-md hover:bg-white hover:text-primary border border-transparent hover:border-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300 }}
                aria-label="Back to top"
            >
                <FaArrowUp className="w-4 h-4" />
            </motion.button>
        </footer>
    )
};

export default Footer;