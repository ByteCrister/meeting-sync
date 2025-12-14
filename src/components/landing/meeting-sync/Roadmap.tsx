'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
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
  Heart,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

const STEPS = [
  {
    id: 'login',
    title: 'Login to Your Account',
    description: 'Securely log in using email, social providers, or magic links.',
    icon: LogIn,
    gradient: 'from-[#3B82F6] to-[#2563EB]',
    bgGlow: 'bg-blue-500/10',
    iconColor: 'text-[#3B82F6]',
    features: ['OAuth Integration', 'Magic Links', 'Biometric Auth'],
  },
  {
    id: 'profile-setup',
    title: 'Setup Your Profile',
    description: 'Add personal info, photo, and customize your preferences.',
    icon: User,
    gradient: 'from-[#059669] to-[#047857]',
    bgGlow: 'bg-emerald-500/10',
    iconColor: 'text-[#059669]',
    features: ['Avatar Upload', 'Bio & Links', 'Privacy Settings'],
  },
  {
    id: 'create-feed',
    title: 'Create Your Feed',
    description: 'Make your first post or update to start engaging with others.',
    icon: Activity,
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
    bgGlow: 'bg-purple-500/10',
    iconColor: 'text-[#8B5CF6]',
    features: ['Rich Text Editor', 'Media Upload', 'Hashtags'],
  },
  {
    id: 'meeting-slots',
    title: 'Explore Meeting Slots',
    description: 'Browse and book available meeting slots in real time.',
    icon: Calendar,
    gradient: 'from-[#EC4899] to-[#DB2777]',
    bgGlow: 'bg-pink-500/10',
    iconColor: 'text-[#EC4899]',
    features: ['Calendar Sync', 'Time Zone Support', 'Availability View'],
  },
  {
    id: 'bookings',
    title: 'Manage Your Bookings',
    description: 'View, reschedule, or cancel your booked meetings easily.',
    icon: BookOpen,
    gradient: 'from-[#F59E0B] to-[#D97706]',
    bgGlow: 'bg-amber-500/10',
    iconColor: 'text-[#F59E0B]',
    features: ['Quick Reschedule', 'Cancel Anytime', 'Booking History'],
  },
  {
    id: 'follow-unfollow',
    title: 'Follow & Unfollow',
    description: 'Connect with other users and curate your network.',
    icon: Heart,
    gradient: 'from-[#DC2626] to-[#B91C1C]',
    bgGlow: 'bg-red-500/10',
    iconColor: 'text-[#DC2626]',
    features: ['Smart Suggestions', 'Mutual Connections', 'Interest Matching'],
  },
  {
    id: 'invite-team',
    title: 'Invite & Collaborate',
    description: 'Add teammates, assign roles, and collaborate seamlessly.',
    icon: Users,
    gradient: 'from-[#8B5CF6] to-[#A855F7]',
    bgGlow: 'bg-purple-500/10',
    iconColor: 'text-[#A855F7]',
    features: ['Role Management', 'Team Invites', 'Permission Control'],
  },
  {
    id: 'analytics',
    title: 'Track & Optimize',
    description: 'Analyze trends and optimize your activity for better results.',
    icon: BarChart2,
    gradient: 'from-[#3B82F6] to-[#1E40AF]',
    bgGlow: 'bg-blue-500/10',
    iconColor: 'text-[#3B82F6]',
    features: ['Real-time Stats', 'Custom Reports', 'Export Data'],
  },
  {
    id: 'download-app',
    title: 'Download Mobile App',
    description: 'Stay updated on the go with iOS and Android apps.',
    icon: Download,
    gradient: 'from-[#10B981] to-[#059669]',
    bgGlow: 'bg-emerald-500/10',
    iconColor: 'text-[#10B981]',
    features: ['Push Notifications', 'Offline Mode', 'Widget Support'],
  },
  {
    id: 'security-settings',
    title: 'Configure Security',
    description: 'Enable 2FA, manage sessions, and review security logs.',
    icon: Shield,
    gradient: 'from-[#0EA5E9] to-[#0284C7]',
    bgGlow: 'bg-sky-500/10',
    iconColor: 'text-[#0EA5E9]',
    features: ['Two-Factor Auth', 'Session Control', 'Activity Logs'],
  },
  {
    id: 'notifications',
    title: 'Set Notification Preferences',
    description: 'Control email, push, and in-app alerts to stay in the loop.',
    icon: Bell,
    gradient: 'from-[#6366F1] to-[#4F46E5]',
    bgGlow: 'bg-indigo-500/10',
    iconColor: 'text-[#6366F1]',
    features: ['Smart Filters', 'Digest Mode', 'Do Not Disturb'],
  },
  {
    id: 'feedback-support',
    title: 'Provide Feedback',
    description: 'Share your thoughts or report issues directly in the app.',
    icon: MessageSquare,
    gradient: 'from-[#64748B] to-[#475569]',
    bgGlow: 'bg-slate-500/10',
    iconColor: 'text-[#64748B]',
    features: ['Bug Reports', 'Feature Requests', 'Rating System'],
  },
  {
    id: 'help-center',
    title: 'Visit Help Center',
    description: 'Browse docs, FAQs, or chat with support to get unstuck.',
    icon: HelpCircle,
    gradient: 'from-[#6366F1] to-[#4338CA]',
    bgGlow: 'bg-indigo-500/10',
    iconColor: 'text-[#6366F1]',
    features: ['Live Chat', 'Video Tutorials', 'Documentation'],
  },
  {
    id: 'billing-payments',
    title: 'Manage Billing',
    description: 'Update payment methods, view invoices, and handle subscriptions.',
    icon: CreditCard,
    gradient: 'from-[#A855F7] to-[#9333EA]',
    bgGlow: 'bg-purple-500/10',
    iconColor: 'text-[#A855F7]',
    features: ['Auto-Billing', 'Invoice History', 'Payment Methods'],
  },
  {
    id: 'integrations',
    title: 'Configure Integrations',
    description: 'Connect with Slack, Zapier, Google Calendar, and more.',
    icon: Zap,
    gradient: 'from-[#10B981] to-[#059669]',
    bgGlow: 'bg-emerald-500/10',
    iconColor: 'text-[#10B981]',
    features: ['Slack Integration', 'Zapier Workflows', 'API Access'],
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const stepAnim = {
  hidden: { opacity: 0, x: -60, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default function Roadmap() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <motion.section
      ref={sectionRef}
      className="relative py-28 px-6 pt-32 sm:px-12 bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9] overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-[10%] w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
          className="absolute bottom-20 left-[20%] w-80 h-80 bg-[#10B981]/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border border-[#3B82F6]/20 rounded-full mb-6"
          >
            <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-sm font-semibold text-[#1A365D]">
              Complete Product Journey
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6">
            Get Started in{' '}
            <span className="bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#10B981] bg-clip-text text-transparent">
              {STEPS.length} Steps
            </span>
          </h2>
          <p className="text-xl text-[#64748B] max-w-3xl mx-auto leading-relaxed">
            Follow our comprehensive roadmap to unlock the full potential of your scheduling workflow.
            Each step is designed to get you up and running quickly.
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Vertical Line - Static Background */}
          <div className="absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-[#E2E8F0] via-[#CBD5E1] to-[#E2E8F0] -translate-x-1/2 rounded-full" />

          {/* Animated Progress Line */}
          <motion.div
            className="absolute left-1/2 top-0 w-1 bg-gradient-to-b from-[#3B82F6] via-[#8B5CF6] to-[#10B981] -translate-x-1/2 rounded-full"
            style={{ height: lineHeight }}
          />

          {/* Steps */}
          <div className="relative z-10 space-y-24">
            {STEPS.map((step, idx) => {
              const isLeft = idx % 2 === 0;
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  className="relative"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={stepAnim}
                >
                  <div
                    className={`flex flex-col md:flex-row items-center gap-8 ${
                      isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Card */}
                    <motion.div
                      whileHover={{
                        scale: 1.03,
                        y: -5,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="group relative w-full md:w-[calc(50%-2rem)] p-8 rounded-3xl bg-white shadow-xl border border-[#E2E8F0] hover:border-[#3B82F6]/30 transition-all duration-300 overflow-hidden"
                    >
                      {/* Background Glow Effect */}
                      <div
                        className={`absolute -top-20 -right-20 w-60 h-60 ${step.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      />

                      <div className="relative z-10">
                        {/* Icon & Title Row */}
                        <div className="flex items-start gap-4 mb-4">
                          <motion.div
                            whileHover={{ rotate: [0, -15, 15, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                          >
                            <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                          </motion.div>

                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-[#0F172A] mb-2 group-hover:text-[#3B82F6] transition-colors duration-300">
                              {step.title}
                            </h3>
                            <p className="text-[#64748B] leading-relaxed">{step.description}</p>
                          </div>
                        </div>

                        {/* Features List */}
                        <div className="mt-5 flex flex-wrap gap-2">
                          {step.features.map((feature, fIdx) => (
                            <motion.span
                              key={fIdx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ delay: fIdx * 0.1 }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${step.bgGlow} ${step.iconColor} border border-current/20`}
                            >
                              <Sparkles className="w-3 h-3" />
                              {feature}
                            </motion.span>
                          ))}
                        </div>

                        {/* Step Progress Indicator */}
                        <div className="mt-6 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: '100%' }}
                              transition={{ delay: 0.3, duration: 0.8 }}
                              className={`h-full bg-gradient-to-r ${step.gradient} rounded-full`}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#64748B]">
                            {Math.round(((idx + 1) / STEPS.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Center Badge - Always Visible */}
                    <div className="relative flex-shrink-0">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="relative"
                      >
                        {/* Outer Ring */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 blur-lg" />

                        {/* Badge */}
                        <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl border-4 border-white`}>
                          <span className="text-2xl font-bold text-white">{idx + 1}</span>
                        </div>

                        {/* Pulse Animation */}
                        <motion.div
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.gradient}`}
                        />
                      </motion.div>
                    </div>

                    {/* Spacer for opposite side */}
                    <div className="hidden md:block w-[calc(50%-2rem)]" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-32 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] p-8 rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-3xl">
            <div className="flex-1 text-left">
              <h3 className="text-3xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-[#3B82F6]" />
                Ready to Start Your Journey?
              </h3>
              <p className="text-[#64748B] text-lg">
                Follow these steps and unlock the full power of seamless scheduling.
              </p>
            </div>
            <Link href="/user-authentication">
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A365D] hover:bg-[#2D4A7C] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.15)]"
                aria-label="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: 'Total Steps', value: STEPS.length, icon: TrendingUp },
            { label: 'Avg. Completion', value: '< 30 min', icon: Activity },
            { label: 'Success Rate', value: '98%', icon: Sparkles },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                <p className="text-sm text-[#64748B]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}