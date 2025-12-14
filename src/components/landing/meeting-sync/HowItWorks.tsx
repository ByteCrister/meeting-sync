'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  CalendarPlus, LayoutTemplate, Smartphone, Clock, ShieldCheck,
  Users, Zap, Rocket, ArrowLeft, CheckCircle2, Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const STEPS = [
  {
    icon: CalendarPlus,
    title: 'Account Setup',
    desc: 'Sign up and personalize your availability, time zone, and preferences.',
    bulletPoints: ['Google/Outlook Sync', 'Time Zone Detection', 'Custom Buffers'],
    gradient: 'from-[#3B82F6] to-[#2563EB]',
    bgGlow: 'bg-blue-500/10',
    iconColor: 'text-[#3B82F6]',
  },
  {
    icon: LayoutTemplate,
    title: 'Create Scheduling Pages',
    desc: 'Build custom booking pages that reflect your brand and workflow.',
    bulletPoints: ['Custom Domains', 'Multiple Event Types', 'Branding Controls'],
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
    bgGlow: 'bg-purple-500/10',
    iconColor: 'text-[#8B5CF6]',
  },
  {
    icon: Smartphone,
    title: 'Share Booking Links',
    desc: 'Share booking links via email, embed them, or use QR codes.',
    bulletPoints: ['One-click Sharing', 'QR Code Embed', 'Link Previews'],
    gradient: 'from-[#0EA5E9] to-[#0284C7]',
    bgGlow: 'bg-sky-500/10',
    iconColor: 'text-[#0EA5E9]',
  },
  {
    icon: Clock,
    title: 'Automated Reminders',
    desc: 'Reduce no-shows with email/SMS reminders and calendar invites.',
    bulletPoints: ['Custom Reminders', 'iCal & Google Invites', 'Follow-up Emails'],
    gradient: 'from-[#F59E0B] to-[#D97706]',
    bgGlow: 'bg-amber-500/10',
    iconColor: 'text-[#F59E0B]',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Compliant',
    desc: 'We protect user data with strong encryption and privacy practices.',
    bulletPoints: ['GDPR Compliant', 'OAuth2 & SSO', 'Activity Logs'],
    gradient: 'from-[#059669] to-[#047857]',
    bgGlow: 'bg-emerald-500/10',
    iconColor: 'text-[#059669]',
  },
  {
    icon: Users,
    title: 'Team Scheduling',
    desc: 'Round-robin, collective or one-to-one meetings across teams.',
    bulletPoints: ['Load Balancing', 'Shared Availability', 'Priority Routing'],
    gradient: 'from-[#8B5CF6] to-[#A855F7]',
    bgGlow: 'bg-purple-500/10',
    iconColor: 'text-[#A855F7]',
  },
  {
    icon: Zap,
    title: 'Integrations & Workflows',
    desc: 'Connect with CRMs, video tools, and thousands of Zapier apps.',
    bulletPoints: ['Zoom/Meet Integration', 'Zapier & Make.com', 'Webhooks'],
    gradient: 'from-[#10B981] to-[#059669]',
    bgGlow: 'bg-emerald-500/10',
    iconColor: 'text-[#10B981]',
  },
  {
    icon: Rocket,
    title: 'Launch & Scale',
    desc: 'Monitor analytics, optimize bookings, and grow with ease.',
    bulletPoints: ['Analytics Dashboard', 'A/B Test Pages', 'Growth Insights'],
    gradient: 'from-[#F97316] to-[#EA580C]',
    bgGlow: 'bg-orange-500/10',
    iconColor: 'text-[#F97316]',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default function HowItWorks() {
  const router = useRouter();
  const [hasSeen, setHasSeen] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const STORAGE_KEY = 'howItWorksSeen_v1';

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0.8, 1, 1, 0.8]);

  // Read persisted flag on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setHasSeen(true);
    } catch {
      setHasSeen(false);
    }
  }, []);

  const markSeen = () => {
    if (!hasSeen) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {}
      setHasSeen(true);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-6 sm:px-12 bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9] overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-10 w-72 h-72 bg-[#3B82F6]/5 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#10B981]/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        {!hasSeen ? (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            onViewportEnter={markSeen}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border border-[#3B82F6]/20 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm font-semibold text-[#1A365D]">
                Complete Workflow Guide
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6">
              How Scheduling Becomes{' '}
              <span className="bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#10B981] bg-clip-text text-transparent">
                Effortless
              </span>
            </h2>
            <p className="text-xl text-[#64748B] max-w-3xl mx-auto leading-relaxed">
              A modern scheduling flow that saves time and reduces friction — from setup to scale.
              Transform your booking process with intelligent automation.
            </p>
          </motion.div>
        ) : (
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border border-[#3B82F6]/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm font-semibold text-[#1A365D]">
                Complete Workflow Guide
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6">
              How Scheduling Becomes{' '}
              <span className="bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#10B981] bg-clip-text text-transparent">
                Effortless
              </span>
            </h2>
            <p className="text-xl text-[#64748B] max-w-3xl mx-auto leading-relaxed">
              A modern scheduling flow that saves time and reduces friction — from setup to scale.
              Transform your booking process with intelligent automation.
            </p>
          </div>
        )}

        {/* Progress Indicator */}
        <motion.div
          style={{ opacity, scale }}
          className="flex justify-center mb-16"
        >
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="h-1 w-12 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-full"
              />
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {!hasSeen ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              onViewportEnter={markSeen}
              className="contents"
            >
              {STEPS.map((step, i) => (
                <motion.article
                  key={i}
                  variants={cardVariants}
                  whileHover={{
                    y: -8,
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
                    transition: { duration: 0.3 },
                  }}
                  className="group relative bg-white rounded-3xl p-8 shadow-lg border border-[#E2E8F0] hover:border-[#3B82F6]/30 transition-all duration-300 overflow-hidden"
                >
                  {/* Background Glow Effect */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 ${step.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Step Number Badge */}
                  <div className="absolute top-6 right-6 w-10 h-10 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-[#64748B]">{i + 1}</span>
                  </div>

                  <div className="flex flex-col gap-4 relative z-10">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                    >
                      <step.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </motion.div>

                    {/* Content */}
                    <div>
                      <h3 className="text-[#0F172A] text-2xl font-bold mb-2 group-hover:text-[#3B82F6] transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-[#64748B] text-base leading-relaxed mb-4">
                        {step.desc}
                      </p>

                      {/* Bullet Points with Icons */}
                      <ul className="space-y-3">
                        {step.bulletPoints.map((b, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-3 text-[#64748B] text-sm"
                          >
                            <CheckCircle2 className={`w-5 h-5 ${step.iconColor} flex-shrink-0`} strokeWidth={2.5} />
                            <span className="font-medium">{b}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Hover Arrow Indicator */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <>
              {STEPS.map((step, i) => (
                <motion.article
                  key={i}
                  whileHover={{
                    y: -8,
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
                    transition: { duration: 0.3 },
                  }}
                  className="group relative bg-white rounded-3xl p-8 shadow-lg border border-[#E2E8F0] hover:border-[#3B82F6]/30 transition-all duration-300 overflow-hidden"
                >
                  {/* Background Glow Effect */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 ${step.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Step Number Badge */}
                  <div className="absolute top-6 right-6 w-10 h-10 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-[#64748B]">{i + 1}</span>
                  </div>

                  <div className="flex flex-col gap-4 relative z-10">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                    >
                      <step.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </motion.div>

                    {/* Content */}
                    <div>
                      <h3 className="text-[#0F172A] text-2xl font-bold mb-2 group-hover:text-[#3B82F6] transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-[#64748B] text-base leading-relaxed mb-4">
                        {step.desc}
                      </p>

                      {/* Bullet Points with Icons */}
                      <ul className="space-y-3">
                        {step.bulletPoints.map((b, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-3 text-[#64748B] text-sm"
                          >
                            <CheckCircle2 className={`w-5 h-5 ${step.iconColor} flex-shrink-0`} strokeWidth={2.5} />
                            <span className="font-medium">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Hover Arrow Indicator */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                </motion.article>
              ))}
            </>
          )}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] p-8 rounded-3xl border border-[#E2E8F0] shadow-lg">
            <div className="flex-1 text-left">
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                Ready to Transform Your Scheduling?
              </h3>
              <p className="text-[#64748B]">
                Join thousands of teams already saving time with MeetSync.
              </p>
            </div>
            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A365D] hover:bg-[#2D4A7C] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.15)]"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}