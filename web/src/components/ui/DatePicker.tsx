import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface DatePickerProps {
    value: string  // 'YYYY-MM-DD'
    onChange: (value: string) => void
    placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const today = new Date()
    const selected = value ? new Date(value + 'T00:00:00') : null
    const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())
    const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear())

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const prevDays = new Date(viewYear, viewMonth, 0).getDate()

    const handlePrev = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }
    const handleNext = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    const selectDate = (day: number) => {
        const m = String(viewMonth + 1).padStart(2, '0')
        const d = String(day).padStart(2, '0')
        onChange(`${viewYear}-${m}-${d}`)
        setOpen(false)
    }

    const displayValue = selected
        ? `${selected.getDate()} ${MONTHS[selected.getMonth()].slice(0, 3)} ${selected.getFullYear()}`
        : placeholder

    const isToday = (day: number) =>
        day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()

    const isSelected = (day: number) =>
        selected && day === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear()

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', height: 40, padding: '0 16px',
                    background: 'var(--color-bg-input)',
                    border: `1px solid ${open ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    fontSize: 14, fontFamily: 'var(--font-sans)',
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'border-color 150ms ease',
                }}
            >
                <span>{displayValue}</span>
                <Calendar size={16} color="var(--color-text-muted)" />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                    zIndex: 200, width: 300,
                    background: 'var(--color-bg-surface)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    padding: 16,
                    animation: 'fadeInUp 150ms ease-out',
                }}>
                    {/* Month nav */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <button type="button" onClick={handlePrev} style={navBtnStyle}>
                            <ChevronLeft size={16} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button type="button" onClick={handleNext} style={navBtnStyle}>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                        {DAYS.map(d => (
                            <div key={d} style={{
                                textAlign: 'center', fontSize: 11, fontWeight: 600,
                                color: 'var(--color-text-muted)', padding: '4px 0',
                            }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                        {/* Previous month's trailing days */}
                        {Array.from({ length: firstDay }, (_, i) => (
                            <div key={`p${i}`} style={{
                                textAlign: 'center', padding: '6px 0', fontSize: 13,
                                color: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-sm)',
                            }}>
                                {prevDays - firstDay + i + 1}
                            </div>
                        ))}

                        {/* Current month days */}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1
                            const sel = isSelected(day)
                            const tod = isToday(day)
                            return (
                                <button
                                    type="button"
                                    key={day}
                                    onClick={() => selectDate(day)}
                                    style={{
                                        textAlign: 'center', padding: '6px 0', fontSize: 13,
                                        fontWeight: sel || tod ? 700 : 400,
                                        background: sel ? 'var(--color-brand)' : tod ? 'rgba(91,91,214,0.15)' : 'transparent',
                                        color: sel ? 'white' : tod ? 'var(--color-brand)' : 'var(--color-text-primary)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: 'none', cursor: 'pointer',
                                        transition: 'all 100ms ease',
                                    }}
                                    onMouseEnter={e => {
                                        if (!sel) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                                    }}
                                    onMouseLeave={e => {
                                        if (!sel) (e.target as HTMLElement).style.background = tod ? 'rgba(91,91,214,0.15)' : 'transparent'
                                    }}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>

                    {/* Today shortcut */}
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setViewMonth(today.getMonth())
                                setViewYear(today.getFullYear())
                                selectDate(today.getDate())
                            }}
                            style={{
                                fontSize: 12, fontWeight: 600, color: 'var(--color-brand)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '4px 12px',
                            }}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const navBtnStyle: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-raised)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
}
