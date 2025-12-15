'use client';

import React, { useEffect, useRef, useState } from 'react'
import { FaCalendarCheck, FaUsers, FaSyncAlt, FaShieldAlt } from "react-icons/fa";
import { motion, useReducedMotion } from 'framer-motion';
import * as RiIcons from 'react-icons/ri';
import { useRouter } from "next/navigation";
import { useAppSelector } from '@/lib/hooks';

const sectionVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

const extendedFeatures = [
    {
        title: 'Organize Smarter',
        desc: 'Create, edit, and cancel meetings in seconds.',
        Icon: RiIcons.RiCalendarCheckFill,
        from: 'from-[#3B82F6]',
        to: 'to-[#2563EB]'
    },
    {
        title: 'Time Zone Friendly',
        desc: 'Perfectly sync meetings regardless of where your team is.',
        Icon: RiIcons.RiMapPinTimeLine,
        from: 'from-[#0EA5E9]',
        to: 'to-[#3B82F6]'
    },
    {
        title: 'Sort & Filter',
        desc: 'Filter by date, status, or members to find what matters.',
        Icon: RiIcons.RiFilter2Fill,
        from: 'from-[#8B5CF6]',
        to: 'to-[#7C3AED]'
    },
    {
        title: 'Friend Sync',
        desc: 'Auto-sync with your contacts and avoid double-booking.',
        Icon: RiIcons.RiUserSharedFill,
        from: 'from-[#059669]',
        to: 'to-[#0EA5E9]'
    },
];

const roadmap = [
    {
        id: "smart-scheduling",
        title: "Smart Scheduling",
        desc: "Find the best time for everyone with smart conflict detection and time-zone awareness.",
        icon: FaCalendarCheck,
        bg: "bg-[#F1F5F9]",
        screenshot: "/screenshots/scheduling.png",
        bullets: [
            "Instant conflict detection across teams",
            "Time-zone aware slot suggestion",
            "Customizable meeting durations",
            "Drag-and-drop calendar UI",
        ],
        walkthrough: [
            "Click on 'Create Meeting' from the dashboard.",
            "Select participants and preferred time ranges.",
            "System suggests optimal time slots avoiding conflicts.",
            "Review and confirm the final schedule.",
        ],
    },
    {
        id: "team-collaboration",
        title: "Team Collaboration",
        desc: "Collaborate in real time with shared agendas, live notes, and integrated chat.",
        icon: FaUsers,
        bg: "bg-[#F1F5F9]",
        screenshot: "/screenshots/collab.png",
        bullets: [
            "Shared agendas & roles assignment",
            "Live note-taking with markdown",
            "Real-time task tracking",
            "Integrated chat & reactions",
        ],
        walkthrough: [
            "Invite team members to a meeting.",
            "Assign agenda topics and participant roles.",
            "Take shared notes during the session.",
            "Track assigned tasks and follow-up actions in real time.",
        ],
    },
    {
        id: "auto-sync",
        title: "Auto Sync",
        desc: "Keep all your calendars up to date automatically with instant sync and notifications.",
        icon: FaSyncAlt,
        bg: "bg-[#F1F5F9]",
        screenshot: "/screenshots/sync.png",
        bullets: [
            "One-click calendar updates",
            "Webhook notifications",
            "Bi-directional API integration",
            "Offline sync support",
        ],
        walkthrough: [
            "Connect your calendar under settings.",
            "Enable auto-sync for real-time updates.",
            "Changes in external calendars reflect instantly.",
            "Receive notifications on changes and conflicts.",
        ],
    },
    {
        id: "secure-access",
        title: "Secure Access",
        desc: "Enterprise-grade security with SSO, encryption, and detailed audit logs.",
        icon: FaShieldAlt,
        bg: "bg-[#F1F5F9]",
        screenshot: "/screenshots/security.png",
        bullets: [
            "SSO with SAML & OAuth2",
            "AES-256 data encryption",
            "Role-based access controls",
            "Audit logs & compliance reports",
        ],
        walkthrough: [
            "Sign in using SSO or OAuth2 credentials.",
            "Access is granted based on assigned roles.",
            "All data is encrypted both in transit and at rest.",
            "Admins can view logs and generate compliance reports.",
        ],
    },
];

const Hero = ({ displayText, setIsModalOpen }: { displayText: string, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const prefersReduced = useReducedMotion();
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const userId = useAppSelector(state => state.userStore.user?._id);
    const isLogged = userId ? true : false;
    const isFetching = useAppSelector(state => state.userStore.fetching);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        // Server + first client render match
        return null;
    }
    return (
        <main className="container mx-auto px-4 py-16 pt-24">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#1A365D] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent font-display min-h-[120px] md:min-h-[160px]">
                    {displayText}
                    <span className="animate-pulse">|</span>
                </h1>
                <p className="text-xl text-[#64748B] mb-8 leading-relaxed max-w-3xl mx-auto">
                    Connect, collaborate, and coordinate with your team effortlessly. MeetSync makes scheduling meetings simple and efficient.
                </p>
                <motion.button
                    onClick={() => {
                        if (isFetching) return;

                        if (!isLogged) {
                            setIsModalOpen(true);
                        } else {
                            router.push("/profile");
                        }
                    }}
                    disabled={isFetching}
                    className={`
        relative inline-flex items-center justify-center gap-2
        px-10 py-4 rounded-xl text-lg font-semibold text-white
        bg-[#1A365D]
        shadow-lg
        focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.15)]
        transition-all duration-300
        ${isFetching
                            ? "cursor-not-allowed opacity-80"
                            : "hover:bg-[#2D4A7C] hover:shadow-2xl hover:scale-105"}
    `}
                    whileTap={!isFetching ? { scale: 0.97 } : {}}
                >
                    {isFetching ? (
                        <motion.div
                            className="flex items-center gap-2"
                            initial="idle"
                            animate="loading"
                            variants={{
                                loading: {
                                    transition: {
                                        staggerChildren: 0.15,
                                        repeat: Infinity,
                                    },
                                },
                            }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    className="w-1.5 h-1.5 bg-white rounded-full"
                                    variants={{
                                        idle: { opacity: 0.3, y: 0 },
                                        loading: {
                                            opacity: [0.3, 1, 0.3],
                                            y: [0, -4, 0],
                                        },
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "easeInOut",
                                        repeat: Infinity,
                                    }}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        "Start Scheduling Now"
                    )}
                </motion.button>
            </div>

            {/* Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
                {[
                    {
                        title: 'Smart Scheduling',
                        desc: 'Find the perfect time for everyone with intelligent scheduling algorithms.',
                        iconColor: '#3B82F6',
                        iconBg: '#EFF6FF',
                        hoverBg: '#DBEAFE'
                    },
                    {
                        title: 'Team Collaboration',
                        desc: 'Connect with your team members and manage meetings efficiently.',
                        iconColor: '#8B5CF6',
                        iconBg: '#F5F3FF',
                        hoverBg: '#EDE9FE'
                    },
                    {
                        title: 'Reliable Platform',
                        desc: 'Trust in a secure and reliable platform for all your meeting needs.',
                        iconColor: '#059669',
                        iconBg: '#ECFDF5',
                        hoverBg: '#D1FAE5'
                    },
                ].map(({ title, desc, iconColor, iconBg }, i) => (
                    <div
                        key={i}
                        className="group bg-[#F8FAFC] hover:bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-[#E2E8F0]"
                    >
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300"
                            style={{
                                backgroundColor: iconBg,
                            }}
                        >
                            <svg
                                className="w-8 h-8"
                                style={{ color: iconColor }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-[#0F172A] mb-4 group-hover:text-[#3B82F6] transition-colors duration-300">
                            {title}
                        </h3>
                        <p className="text-[#64748B] leading-relaxed">{desc}</p>
                    </div>
                ))}
            </section>

            {/* Extended Features */}
            <section className="mt-32 text-center px-4">
                <h2
                    className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4"
                    data-aos="fade-down"
                >
                    Why MeetSync?
                </h2>
                <p
                    className="text-lg text-[#64748B] max-w-2xl mx-auto mb-16"
                    data-aos="fade-up"
                >
                    MeetSync is more than just a scheduler — it&apos;s your team&apos;s time wizard.
                    Streamline how you meet, manage calendars, and sync with your squad
                    across time zones.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {extendedFeatures.map(({ title, desc, Icon, from, to }) => (
                        <motion.div
                            key={title}
                            className={`
                relative overflow-hidden rounded-3xl p-8
                bg-gradient-to-br ${from} ${to}
                shadow-xl hover:shadow-2xl transform transition-all duration-500
                group
              `}
                            data-aos="zoom-in"
                            whileHover={{ y: -10, rotate: 1 }}
                        >
                            {/* decorative circles */}
                            <span className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></span>
                            <span className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-500"></span>

                            <Icon
                                className="w-12 h-12 text-white mb-5 group-hover:scale-110 transition-transform duration-300"
                            />

                            <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
                            <p className="text-white/90 text-sm leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Roadmap Section */}
            <div className="font-sans text-[#0F172A] bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9] mt-24 rounded-3xl py-16">
                {/* Roadmap Bar */}
                <section className="px-4 sm:px-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-[#1A365D] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent" data-aos="fade-down">
                        Your Meeting Journey
                    </h2>
                    <p className="text-center text-[#64748B] text-lg mb-16 max-w-2xl mx-auto">
                        Discover how MeetSync transforms your scheduling workflow with powerful features designed for modern teams
                    </p>

                    <div className="relative">
                        {!prefersReduced && (
                            <motion.div
                                className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#0EA5E9]"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                                style={{ transformOrigin: "left center" }}
                            />
                        )}

                        <div className="flex flex-wrap justify-center gap-6 relative z-10">
                            {roadmap.map(({ id, title, icon: Icon }, i) => (
                                <motion.button
                                    key={id}
                                    onClick={() => {
                                        router.replace(`#${id}`);
                                        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="flex flex-col items-center w-36 md:w-44 focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.15)] rounded-2xl p-3 transition-all duration-300 hover:scale-105 hover:bg-white/50"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.2 }}
                                    whileHover={!prefersReduced ? { scale: 1.1 } : {}}
                                >
                                    <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center mb-3 border-2 border-[#3B82F6] group-hover:border-[#8B5CF6] transition-colors">
                                        <Icon className="w-10 h-10 text-[#3B82F6]" />
                                    </div>
                                    <span className="text-sm sm:text-base font-semibold text-[#0F172A] text-center">{title}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Feature Sections */}
                {roadmap.map((feat, index) => {
                    const isEven = index % 2 === 0;
                    return (<motion.section
                        key={feat.id}
                        id={feat.id}
                        ref={(el) => {
                            sectionRefs.current[feat.id] = el as HTMLDivElement | null;
                        }}
                        className={`py-16 sm:py-32 px-4 sm:px-6`}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={sectionVariant}
                    >
                        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Icon Preview */}
                            <div className={`space-y-8 text-center lg:text-left ${isEven ? '' : 'lg:order-last'}`}>
                                <div className="w-56 h-56 mx-auto lg:mx-0 flex items-center justify-center bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] rounded-3xl shadow-2xl border-2 border-[#CBD5E1]">
                                    <feat.icon className="text-[#3B82F6] w-24 h-24" />
                                </div>
                                <p className="text-xl text-[#64748B] leading-relaxed">{feat.desc || 'Enhance productivity with this powerful feature.'}</p>
                            </div>

                            {/* Content */}
                            <div>
                                <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-[#1A365D]">{feat.title}</h3>

                                <ul className="space-y-3 text-lg text-[#64748B] mb-8">
                                    {feat.bullets.map((b, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <svg className="w-6 h-6 text-[#059669] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mb-8 text-left bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0]">
                                    <h4 className="text-xl font-bold mb-4 text-[#1A365D] flex items-center">
                                        <span className="w-8 h-8 bg-[#3B82F6] text-white rounded-lg flex items-center justify-center mr-3 text-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </span>
                                        How it works:
                                    </h4>
                                    <ol className="space-y-3">
                                        {feat.walkthrough?.map((step, i) => (
                                            <li key={i} className="flex items-start text-[#64748B]">
                                                <span className="w-7 h-7 bg-[#3B82F6] text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span className="leading-relaxed">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                <motion.button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.15)]"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                >
                                    Explore Feature
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>
                    </motion.section>
                    )
                }
                )}
            </div>
        </main>
    )
}

export default Hero