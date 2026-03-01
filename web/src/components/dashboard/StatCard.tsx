import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
    icon: LucideIcon
    iconColor: string
    label: string
    value: string | number
    subtitle?: string
    trend?: { value: string; positive: boolean }
    badge?: { text: string; color: string }
}

export function StatCard({ icon: Icon, iconColor, label, value, subtitle, trend, badge }: StatCardProps) {
    return (
        <motion.div
            className="surface-card"
            whileHover={{ scale: 1.01 }}
            style={{ flex: 1, minWidth: 0 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                    width: 40, height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: `${iconColor}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={20} color={iconColor} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="text-stat-number">{value}</span>
                {trend && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2,
                        fontSize: 12, fontWeight: 600,
                        color: trend.positive ? 'var(--color-success)' : 'var(--color-danger)',
                    }}>
                        {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend.value}
                    </span>
                )}
                {badge && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        fontSize: 12, fontWeight: 600,
                        background: `${badge.color}20`, color: badge.color,
                    }}>
                        {badge.text}
                    </span>
                )}
            </div>
            {subtitle && (
                <span className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
                    {subtitle}
                </span>
            )}
        </motion.div>
    )
}
