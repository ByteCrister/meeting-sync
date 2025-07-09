'use client';

import { motion } from 'framer-motion';
import {
  User,
  Users,
  BarChart2,
  Download,
  ArrowLeft,
  Shield,
  Bell,
  MessageSquare,
  HelpCircle,
  CreditCard,
  Zap,
  LogIn,
  Activity,
  Calendar,
  BookOpen,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import Footer from '../unauthorized/Footer';

const STEPS = [
  {
    id: 'login',
    title: 'Login to Your Account',
    description: 'Securely log in using email, social providers, or magic links.',
    icon: <LogIn className="w-6 h-6 text-white" />,
    bg: 'from-indigo-500 to-indigo-400',
  },
  {
    id: 'profile-setup',
    title: 'Setup Your Profile',
    description: 'Add personal info, photo, and customize your preferences.',
    icon: <User className="w-6 h-6 text-white" />,
    bg: 'from-green-500 to-green-400',
  },
  {
    id: 'create-feed',
    title: 'Create Your Feed',
    description: 'Make your first post or update to start engaging with others.',
    icon: <Activity className="w-6 h-6 text-white" />,
    bg: 'from-purple-500 to-purple-400',
  },
  {
    id: 'meeting-slots',
    title: 'Explore Meeting Slots',
    description: 'Browse and book available meeting slots in real time.',
    icon: <Calendar className="w-6 h-6 text-white" />,
    bg: 'from-pink-500 to-pink-400',
  },
  {
    id: 'bookings',
    title: 'Manage Your Bookings',
    description: 'View, reschedule, or cancel your booked meetings easily.',
    icon: <BookOpen className="w-6 h-6 text-white" />,
    bg: 'from-yellow-500 to-yellow-400',
  },
  {
    id: 'follow-unfollow',
    title: 'Follow & Unfollow',
    description: 'Connect with other users and curate your network.',
    icon: <Heart className="w-6 h-6 text-white" />,
    bg: 'from-red-500 to-red-400',
  },
  {
    id: 'invite-team',
    title: 'Invite & Collaborate',
    description: 'Add teammates, assign roles, and collaborate seamlessly.',
    icon: <Users className="w-6 h-6 text-white" />,
    bg: 'from-pink-500 to-pink-400',
  },
  {
    id: 'analytics',
    title: 'Track & Optimize',
    description: 'Analyze trends and optimize your activity for better results.',
    icon: <BarChart2 className="w-6 h-6 text-white" />,
    bg: 'from-indigo-500 to-indigo-400',
  },
  {
    id: 'download-app',
    title: 'Download Mobile App',
    description: 'Stay updated on the go with iOS and Android apps.',
    icon: <Download className="w-6 h-6 text-white" />,
    bg: 'from-yellow-500 to-yellow-400',
  },
  {
    id: 'security-settings',
    title: 'Configure Security',
    description: 'Enable 2FA, manage sessions, and review security logs.',
    icon: <Shield className="w-6 h-6 text-white" />,
    bg: 'from-teal-500 to-teal-400',
  },
  {
    id: 'notifications',
    title: 'Set Notification Preferences',
    description: 'Control email, push, and in-app alerts to stay in the loop.',
    icon: <Bell className="w-6 h-6 text-white" />,
    bg: 'from-blue-500 to-blue-400',
  },
  {
    id: 'feedback-support',
    title: 'Provide Feedback',
    description: 'Share your thoughts or report issues directly in the app.',
    icon: <MessageSquare className="w-6 h-6 text-white" />,
    bg: 'from-gray-500 to-gray-400',
  },
  {
    id: 'help-center',
    title: 'Visit Help Center',
    description: 'Browse docs, FAQs, or chat with support to get unstuck.',
    icon: <HelpCircle className="w-6 h-6 text-white" />,
    bg: 'from-indigo-600 to-indigo-500',
  },
  {
    id: 'billing-payments',
    title: 'Manage Billing',
    description: 'Update payment methods, view invoices, and handle subscriptions.',
    icon: <CreditCard className="w-6 h-6 text-white" />,
    bg: 'from-purple-600 to-purple-500',
  },
  {
    id: 'integrations',
    title: 'Configure Integrations',
    description: 'Connect with Slack, Zapier, Google Calendar, and more.',
    icon: <Zap className="w-6 h-6 text-white" />,
    bg: 'from-green-600 to-green-500',
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};


const stepAnim = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 90, damping: 12 },
  },
};

export default function Roadmap() {
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <>
      <motion.section
        className="relative overflow-hidden py-28 px-6 sm:px-12 bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-300"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <h2 className="text-4xl font-bold text-center text-gray-200 mb-20">
          Get Started in {STEPS.length} Steps
        </h2>

        <div className="relative max-w-6xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-indigo-300 via-gray-300 to-purple-300 -translate-x-1/2" />

          <div className="relative z-10 space-y-32">
            {STEPS.map((step, idx) => {
              const isLeft = idx % 2 === 0;

              return (
                <motion.div
                  key={step.id}
                  className={`relative flex flex-col md:flex-row items-center ${isLeft ? 'md:justify-start' : 'md:justify-end'} group`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={stepAnim}
                >
                  {/* Step number on center line */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-lg">
                      {idx + 1}
                    </div>
                  </div>

                  {/* The card side */}
                  {isLeft && (
                    <motion.div
                      whileHover={{ rotateY: 5, scale: 1.02 }}
                      className="w-full md:w-[48%] p-8 rounded-3xl bg-white/90 shadow-2xl ring-1 ring-gray-200 hover:ring-indigo-300 backdrop-blur-md hover:shadow-2xl transition-transform duration-500 md:mr-auto"
                    >
                      <div
                        className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br ${step.bg} shadow-lg`}
                      >
                        {step.icon}
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </motion.div>
                  )}

                  {/* The opposite side icon */}
                  <div className="hidden md:flex md:w-[48%] justify-center items-center">
                    <div
                      className={`text-[10rem] select-none pointer-events-none text-gray-300 opacity-30 drop-shadow-lg
                      bg-gradient-to-br from-indigo-400 to-purple-300 rounded-3xl p-6`}
                      style={{
                        filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.05))',
                        transformStyle: 'preserve-3d',
                        transform: 'rotateY(15deg) rotateX(5deg)',
                      }}
                    >
                      {step.icon}
                    </div>
                  </div>

                  {/* Card on right side */}
                  {!isLeft && (
                    <motion.div
                      whileHover={{ rotateY: 5, scale: 1.02 }}
                      className="w-full md:w-[48%] p-8 rounded-3xl bg-white/90 shadow-2xl ring-1 ring-gray-200 hover:ring-indigo-300 backdrop-blur-md hover:shadow-2xl transition-transform duration-500 md:ml-auto"
                    >
                      <div
                        className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br ${step.bg} shadow-lg`}
                      >
                        {step.icon}
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Decorative Blobs: behind everything */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-visible">
          <motion.div
            className="absolute w-[30rem] h-[30rem] bg-blue-300 rounded-full opacity-20 top-[20%] left-[5%] blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-[25rem] h-[25rem] bg-purple-300 rounded-full opacity-20 top-[60%] right-[5%] blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        {/* Back Button */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/user-authentication">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </motion.button>
          </Link>
        </motion.div>
      </motion.section>

      <Footer scrollToTop={scrollToTop} />
    </>
  );
}