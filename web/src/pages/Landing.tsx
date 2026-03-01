import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/landing/AnimatedBackground'
import {
    Sparkles, Timer, BookOpen, ClipboardList, Target,
    BarChart3, Calculator, Flame, Brain, ArrowRight,
    CheckCircle2, Zap, Shield, ChevronDown
} from 'lucide-react'

const features = [
    { icon: Timer, title: 'Pomodoro Studio', desc: 'SVG ring timer with focus scoring and session goals', color: '#6366F1' },
    { icon: BookOpen, title: 'Exam Hub', desc: 'Countdown tiles with difficulty badges and auto study blocks', color: '#A855F7' },
    { icon: ClipboardList, title: 'Assignment Board', desc: 'Drag-and-drop Kanban with smart priority sorting', color: '#EC4899' },
    { icon: Flame, title: 'Streak Engine', desc: 'Daily streaks, heatmap, and streak freezes', color: '#F97316' },
    { icon: Target, title: 'Goals Board', desc: 'Weekly & monthly goals with progress rings', color: '#10B981' },
    { icon: BarChart3, title: 'Analytics', desc: 'Study patterns, subject breakdown, and trends', color: '#3B82F6' },
    { icon: Calculator, title: 'GPA Predictor', desc: 'Know exactly what you need on finals', color: '#F59E0B' },
    { icon: Brain, title: 'AI Study Coach', desc: 'Personalized plans powered by Claude AI', color: '#7C3AED' },
]

const stats = [
    { value: '10K+', label: 'Students' },
    { value: '2M+', label: 'Sessions' },
    { value: '95%', label: 'Retention' },
    { value: '4.9★', label: 'Rating' },
]

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
}

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
}

export default function Landing() {
    const navigate = useNavigate()
    const { scrollYProgress } = useScroll()
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

    return (
        <div style={{ background: 'var(--color-bg-base)', minHeight: '100vh', overflow: 'hidden' }}>
            {/* ──── Floating Navbar ──── */}
            <motion.nav
                initial={{ y: -80 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 48px',
                    background: 'rgba(13,13,20,0.7)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sparkles size={18} color="white" />
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Scholar<span style={{ color: 'var(--color-brand)' }}>Sync</span>
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn btn-ghost" onClick={() => navigate('/login')}>
                        Sign In
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>
                        Get Started <ArrowRight size={14} />
                    </button>
                </div>
            </motion.nav>

            {/* ──── Hero Section ──── */}
            <motion.section
                style={{ opacity: heroOpacity, scale: heroScale }}
            >
                <div style={{
                    position: 'relative',
                    minHeight: '100vh',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center',
                    padding: '120px 24px 80px',
                }}>
                    {/* Animated particle constellation background */}
                    <AnimatedBackground />

                    {/* Animated gradient orbs */}
                    <motion.div
                        animate={{
                            x: [0, 30, -20, 0],
                            y: [0, -20, 30, 0],
                            scale: [1, 1.1, 0.9, 1],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', width: 600, height: 600, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(91,91,214,0.2) 0%, transparent 70%)',
                            top: '5%', right: '10%', filter: 'blur(40px)',
                        }}
                    />
                    <motion.div
                        animate={{
                            x: [0, -25, 15, 0],
                            y: [0, 25, -15, 0],
                            scale: [1, 0.95, 1.05, 1],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
                            bottom: '10%', left: '5%', filter: 'blur(40px)',
                        }}
                    />
                    <motion.div
                        animate={{
                            x: [0, 15, -10, 0],
                            y: [0, -10, 20, 0],
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
                            top: '40%', left: '50%', filter: 'blur(30px)',
                        }}
                    />

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 16px', borderRadius: 'var(--radius-full)',
                            background: 'rgba(91,91,214,0.1)',
                            border: '1px solid rgba(91,91,214,0.3)',
                            marginBottom: 28,
                            position: 'relative', zIndex: 1,
                        }}
                    >
                        <Zap size={14} color="var(--color-brand)" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand)' }}>
                            Powered by AI · Built for Students
                        </span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{
                            fontSize: 'clamp(40px, 6vw, 72px)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: '-0.03em',
                            maxWidth: 800,
                            position: 'relative', zIndex: 1,
                            marginBottom: 20,
                        }}
                    >
                        Your Academic{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-alt) 50%, #EC4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Operating System
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                        style={{
                            fontSize: 'clamp(16px, 2vw, 20px)',
                            color: 'var(--color-text-secondary)',
                            maxWidth: 560,
                            lineHeight: 1.7,
                            position: 'relative', zIndex: 1,
                            marginBottom: 40,
                        }}
                    >
                        One app. Track exams, crush assignments, build streaks,
                        and let AI plan your study schedule — all from one beautiful dashboard.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                        style={{
                            display: 'flex', gap: 16, position: 'relative', zIndex: 1,
                        }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn btn-lg"
                            onClick={() => navigate('/login')}
                            style={{
                                background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                                color: 'white',
                                padding: '0 32px',
                                fontSize: 16,
                                fontWeight: 700,
                                boxShadow: '0 4px 24px rgba(91,91,214,0.4)',
                            }}
                        >
                            Get Started Free <ArrowRight size={18} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            className="btn btn-outline btn-lg"
                            onClick={() => {
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                            }}
                            style={{ padding: '0 28px', fontSize: 16, borderRadius: 'var(--radius-full)' }}
                        >
                            See Features
                        </motion.button>
                    </motion.div>


                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        style={{
                            position: 'absolute', bottom: 40,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        }}
                    >
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Scroll to explore</span>
                        <motion.div
                            animate={{ y: [0, 6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <ChevronDown size={18} color="var(--color-text-muted)" />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* ──── Stats Bar ──── */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
                style={{
                    display: 'flex', justifyContent: 'center', gap: 60,
                    padding: '60px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
            >
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        variants={fadeUp}
                        custom={i}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{
                            fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em',
                            background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {stat.value}
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
                            {stat.label}
                        </div>
                    </motion.div>
                ))}
            </motion.section>

            {/* ──── Features Grid ──── */}
            <section id="features" style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto' }}>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={fadeUp}
                    custom={0}
                    style={{ textAlign: 'center', marginBottom: 64 }}
                >
                    <span className="text-label" style={{ color: 'var(--color-brand)', marginBottom: 12, display: 'block' }}>
                        Features
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
                        letterSpacing: '-0.02em', marginBottom: 16,
                    }}>
                        Everything You Need to{' '}
                        <span style={{ color: 'var(--color-brand)' }}>Ace College</span>
                    </h2>
                    <p style={{ fontSize: 17, color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                        Eight powerful tools, unified in one dark-mode dashboard
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={staggerContainer}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: 20,
                    }}
                >
                    {features.map((f, i) => {
                        const Icon = f.icon
                        return (
                            <motion.div
                                key={f.title}
                                variants={fadeUp}
                                custom={i}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="surface-card"
                                style={{ cursor: 'default' }}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                                    background: `${f.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 16,
                                }}>
                                    <Icon size={22} color={f.color} />
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    {f.desc}
                                </p>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </section>

            {/* ──── How It Works ──── */}
            <section style={{
                padding: '100px 48px', maxWidth: 1000, margin: '0 auto',
            }}>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={0}
                    style={{ textAlign: 'center', marginBottom: 64 }}
                >
                    <span className="text-label" style={{ color: 'var(--color-brand)', marginBottom: 12, display: 'block' }}>
                        How It Works
                    </span>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Three Steps to{' '}
                        <span style={{ color: 'var(--color-success)' }}>Academic Mastery</span>
                    </h2>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32,
                    }}
                >
                    {[
                        { step: '01', title: 'Sign Up & Add Subjects', desc: 'Quick onboarding — add your courses, set grading system, pick your streak cutoff time.', icon: CheckCircle2, color: '#6366F1' },
                        { step: '02', title: 'Study with Focus', desc: 'Use Pomodoro sessions, track assignments on Kanban, and build daily streaks.', icon: Flame, color: '#F97316' },
                        { step: '03', title: 'Let AI Optimize', desc: 'AI Coach analyzes your patterns and generates personalized study schedules.', icon: Brain, color: '#7C3AED' },
                    ].map((s, i) => (
                        <motion.div
                            key={s.step}
                            variants={fadeUp}
                            custom={i}
                            style={{ textAlign: 'center', position: 'relative' }}
                        >
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: `${s.color}15`,
                                border: `2px solid ${s.color}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                            }}>
                                <s.icon size={28} color={s.color} />
                            </div>
                            <div style={{
                                fontSize: 12, fontWeight: 700, color: s.color,
                                letterSpacing: '0.1em', marginBottom: 8,
                            }}>
                                STEP {s.step}
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                {s.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ──── CTA Section ──── */}
            <section style={{ padding: '80px 48px 120px', textAlign: 'center' }}>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={0}
                    className="ai-card"
                    style={{
                        maxWidth: 700, margin: '0 auto',
                        padding: '60px 48px',
                        textAlign: 'center',
                    }}
                >
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <Sparkles size={28} color="white" />
                    </div>
                    <h2 style={{
                        fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em',
                        marginBottom: 12,
                    }}>
                        Ready to Ace This Semester?
                    </h2>
                    <p style={{
                        fontSize: 16, color: 'var(--color-text-secondary)',
                        maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7,
                    }}>
                        Join thousands of students who transformed their academic life with ScholarSync.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn btn-lg"
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                            color: 'white', padding: '0 36px',
                            fontSize: 16, fontWeight: 700,
                            boxShadow: '0 4px 24px rgba(91,91,214,0.4)',
                        }}
                    >
                        Start Free — No Credit Card <ArrowRight size={18} />
                    </motion.button>
                </motion.div>
            </section>

            {/* ──── Footer ──── */}
            <footer style={{
                padding: '40px 48px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={16} color="var(--color-brand)" />
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                        Scholar<span style={{ color: 'var(--color-brand)' }}>Sync</span>
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                        © 2026
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                    {['Privacy', 'Terms', 'Contact'].map((link) => (
                        <a key={link} href="#" style={{
                            fontSize: 13, color: 'var(--color-text-muted)',
                            textDecoration: 'none',
                            transition: 'color 150ms',
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                        >
                            {link}
                        </a>
                    ))}
                </div>
            </footer>
        </div>
    )
}
