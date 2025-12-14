'use client';

import { motion} from 'framer-motion';
import {
  CheckCircle2,
  Cloud,
  Shield,
  Puzzle,
  BarChart2,
  WifiOff,
  Layers,
  Rocket,
  AlarmClock,
  Users,
  Server,
  FileText,
  Sparkles,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

const FEATURES = [
  {
    id: 'analytics',
    title: 'Real-Time Analytics',
    icon: BarChart2,
    description:
      'Track every event as it happens with live dashboards, custom KPIs, and smart alerts.',
    details: [
      'Instant chart updates',
      'Custom alert thresholds',
      'Exportable reports',
    ],
    gradient: 'from-[#3B82F6] to-[#2563EB]',
    bgGlow: 'bg-blue-500/10',
    iconColor: 'text-[#3B82F6]',
    category: 'Analytics',
  },
  {
    id: 'collaboration',
    title: 'Collaborative Workspace',
    icon: Puzzle,
    description:
      'Co-author docs, assign tasks, and chat inline—all in a secure, shared space.',
    details: ['Task boards & timelines', 'In-context chat threads', 'Version history'],
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
    bgGlow: 'bg-purple-500/10',
    iconColor: 'text-[#8B5CF6]',
    category: 'Productivity',
  },
  {
    id: 'insights',
    title: 'AI-Powered Insights',
    icon: Cloud,
    description:
      'Let AI analyze your data, predict trends, and draft executive summaries.',
    details: [
      'Predictive trend modeling',
      'Natural language queries',
      'Auto-generated summaries',
    ],
    gradient: 'from-[#EC4899] to-[#DB2777]',
    bgGlow: 'bg-pink-500/10',
    iconColor: 'text-[#EC4899]',
    category: 'AI & Automation',
  },
  {
    id: 'security',
    title: 'Secure Cloud Storage',
    icon: Shield,
    description:
      '256-bit encryption, automated backups, and geo-redundant storage ensure zero downtime.',
    details: ['End-to-end encryption', 'Automated backups', 'Multi-region replication'],
    gradient: 'from-[#059669] to-[#047857]',
    bgGlow: 'bg-emerald-500/10',
    iconColor: 'text-[#059669]',
    category: 'Security',
  },
  {
    id: 'integrations',
    title: 'Custom Integrations',
    icon: Puzzle,
    description:
      'Connect to third-party tools via REST APIs, webhooks, or Zapier—no code needed.',
    details: ['Full REST API', 'Webhook listener', 'Zapier & Make support'],
    gradient: 'from-[#10B981] to-[#059669]',
    bgGlow: 'bg-emerald-500/10',
    iconColor: 'text-[#10B981]',
    category: 'Integration',
  },
  {
    id: 'offline',
    title: 'Offline Mode',
    icon: WifiOff,
    description:
      'Continue working without interruption even when you lose internet connectivity.',
    details: ['Local data caching', 'Seamless sync on reconnect', 'Conflict resolution'],
    gradient: 'from-[#F59E0B] to-[#D97706]',
    bgGlow: 'bg-amber-500/10',
    iconColor: 'text-[#F59E0B]',
    category: 'Productivity',
  },
  {
    id: 'multi-calendar',
    title: 'Multi-Calendar Sync',
    icon: Layers,
    description:
      'Seamlessly manage events across Google, Outlook, Apple Calendar and more.',
    details: [
      'Unified calendar view',
      'Two-way sync with major platforms',
      'Conflict detection & merge logic',
    ],
    gradient: 'from-[#0EA5E9] to-[#0284C7]',
    bgGlow: 'bg-sky-500/10',
    iconColor: 'text-[#0EA5E9]',
    category: 'Integration',
  },
  {
    id: 'smart-reminders',
    title: 'Smart Reminders',
    icon: AlarmClock,
    description:
      'Get notified exactly when you need to act—across devices and platforms.',
    details: [
      'Smart rescheduling based on context',
      'In-app, email, and push reminders',
      'AI-based urgency detection',
    ],
    gradient: 'from-[#DC2626] to-[#B91C1C]',
    bgGlow: 'bg-red-500/10',
    iconColor: 'text-[#DC2626]',
    category: 'AI & Automation',
  },
  {
    id: 'team-permissions',
    title: 'Advanced Team Permissions',
    icon: Users,
    description:
      'Delegate roles, control access, and manage user visibility across teams.',
    details: [
      'Granular access control',
      'Admin/moderator delegation',
      'Private vs public team settings',
    ],
    gradient: 'from-[#A855F7] to-[#9333EA]',
    bgGlow: 'bg-purple-500/10',
    iconColor: 'text-[#A855F7]',
    category: 'Security',
  },
  {
    id: 'performance',
    title: 'Lightning-Fast Performance',
    icon: Rocket,
    description:
      'Blazing-fast page loads, real-time sync, and smooth offline support.',
    details: [
      'Optimized with Next.js 15',
      'Edge-ready APIs',
      'Caching, preload, and prefetch',
    ],
    gradient: 'from-[#F97316] to-[#EA580C]',
    bgGlow: 'bg-orange-500/10',
    iconColor: 'text-[#F97316]',
    category: 'Performance',
  },
  {
    id: 'data-control',
    title: 'Data Ownership & Compliance',
    icon: FileText,
    description:
      'You fully control your data with export tools, GDPR, and privacy-first defaults.',
    details: [
      'Full data export anytime',
      'GDPR & CCPA compliant',
      'User-level data control',
    ],
    gradient: 'from-[#1A365D] to-[#2D4A7C]',
    bgGlow: 'bg-slate-900/10',
    iconColor: 'text-[#1A365D]',
    category: 'Security',
  },
  {
    id: 'infrastructure',
    title: 'Scalable Infrastructure',
    icon: Server,
    description:
      'Auto-scaling backend to handle thousands of users, meetings, and integrations.',
    details: [
      'Serverless edge compute',
      'Auto horizontal scaling',
      'Resilient fault-tolerant design',
    ],
    gradient: 'from-[#14B8A6] to-[#0D9488]',
    bgGlow: 'bg-teal-500/10',
    iconColor: 'text-[#14B8A6]',
    category: 'Performance',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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
      damping: 20,
    },
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

export default function Feature() {
  const sectionRef = useRef(null);

  return (
    <div ref={sectionRef} className="relative bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-40 left-[5%] w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute top-[50%] right-[5%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
          className="absolute bottom-40 left-[30%] w-80 h-80 bg-[#10B981]/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 pt-32">
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
              Powerful Features
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#10B981] bg-clip-text text-transparent">
              Succeed
            </span>
          </h1>
          <p className="text-xl text-[#64748B] max-w-3xl mx-auto leading-relaxed">
            Comprehensive tools and integrations designed to streamline your workflow,
            boost productivity, and scale with your team.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.article
                key={feat.id}
                id={feat.id}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="group relative bg-white rounded-3xl p-8 shadow-lg border border-[#E2E8F0] hover:border-[#3B82F6]/30 transition-all duration-300 overflow-hidden"
              >
                {/* Background Glow Effect */}
                <div
                  className={`absolute -top-20 -right-20 w-60 h-60 ${feat.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Category Badge */}
                <div className="absolute top-6 right-6">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${feat.bgGlow} ${feat.iconColor} border border-current/20`}>
                    <Sparkles className="w-3 h-3" />
                    {feat.category}
                  </span>
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feat.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300 mb-6`}
                  >
                    <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-3 group-hover:text-[#3B82F6] transition-colors duration-300">
                    {feat.title}
                  </h3>
                  <p className="text-[#64748B] leading-relaxed mb-5">
                    {feat.description}
                  </p>

                  {/* Details List */}
                  <ul className="space-y-2">
                    {feat.details.map((detail, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-2 text-[#64748B] text-sm"
                      >
                        <CheckCircle2
                          className={`w-5 h-5 ${feat.iconColor} flex-shrink-0 mt-0.5`}
                          strokeWidth={2.5}
                        />
                        <span className="font-medium">{detail}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Hover Indicator */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${feat.gradient} flex items-center justify-center shadow-lg`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20"
        >
          {[
            { label: 'Total Features', value: FEATURES.length, icon: Sparkles },
            { label: 'Integrations', value: '50+', icon: Puzzle },
            { label: 'Uptime', value: '99.9%', icon: TrendingUp },
            { label: 'Active Users', value: '10K+', icon: Users },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center mb-3">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-[#0F172A] mb-1">{stat.value}</p>
              <p className="text-sm text-[#64748B] font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] p-8 rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-3xl">
            <div className="flex-1 text-left">
              <h3 className="text-3xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-[#3B82F6]" />
                Ready to Get Started?
              </h3>
              <p className="text-[#64748B] text-lg">
                Explore all features and start optimizing your workflow today.
              </p>
            </div>
            <Link href="/">
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

        {/* Feature Categories Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {[
            ...new Set(FEATURES.map((f) => f.category)),
          ].map((category, i) => {
            const count = FEATURES.filter((f) => f.category === category).length;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]" />
                <p className="text-sm font-semibold text-[#0F172A] text-center">{category}</p>
                <p className="text-xs text-[#64748B]">{count} feature{count > 1 ? 's' : ''}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}