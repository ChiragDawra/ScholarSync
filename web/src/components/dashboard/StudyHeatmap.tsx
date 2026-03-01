import { useMemo } from 'react'

interface HeatmapValue {
    date: string
    count: number
}

interface StudyHeatmapProps {
    data: Record<string, number>
}

export function StudyHeatmap({ data }: StudyHeatmapProps) {
    const { weeks, months } = useMemo(() => {
        const today = new Date()
        const sixMonthsAgo = new Date(today)
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        // Start from the Sunday of the week containing sixMonthsAgo
        const startDate = new Date(sixMonthsAgo)
        startDate.setDate(startDate.getDate() - startDate.getDay())

        const weeksArr: { date: Date; count: number }[][] = []
        const monthsArr: { month: string; col: number }[] = []
        let currentDate = new Date(startDate)
        let currentWeek: { date: Date; count: number }[] = []
        let lastMonth = -1

        while (currentDate <= today) {
            if (currentDate.getDay() === 0 && currentWeek.length > 0) {
                weeksArr.push(currentWeek)
                currentWeek = []
            }
            const dateStr = currentDate.toISOString().slice(0, 10)
            currentWeek.push({
                date: new Date(currentDate),
                count: data[dateStr] || 0,
            })

            const m = currentDate.getMonth()
            if (m !== lastMonth) {
                monthsArr.push({
                    month: currentDate.toLocaleDateString('en', { month: 'short' }),
                    col: weeksArr.length,
                })
                lastMonth = m
            }

            currentDate.setDate(currentDate.getDate() + 1)
        }
        if (currentWeek.length > 0) weeksArr.push(currentWeek)

        return { weeks: weeksArr, months: monthsArr }
    }, [data])

    const getColor = (hours: number) => {
        if (hours <= 0) return 'var(--heatmap-empty)'
        if (hours < 1) return 'var(--heatmap-l1)'
        if (hours < 2) return 'var(--heatmap-l2)'
        if (hours < 3) return 'var(--heatmap-l3)'
        return 'var(--heatmap-l4)'
    }

    const cellSize = 12
    const gap = 3
    const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', '']

    return (
        <div className="surface-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 className="text-heading-md">Study Consistency</h3>
                <span className="badge-muted" style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 12,
                }}>Last 6 Months</span>
            </div>

            <div style={{ overflow: 'auto' }}>
                <svg width={weeks.length * (cellSize + gap) + 30} height={7 * (cellSize + gap) + 24}>
                    {/* Month labels */}
                    {months.map((m, i) => (
                        <text
                            key={`month-${i}`}
                            x={m.col * (cellSize + gap) + 30}
                            y={10}
                            fill="var(--color-text-muted)"
                            fontSize={10}
                        >
                            {m.month}
                        </text>
                    ))}

                    {/* Day labels */}
                    {dayLabels.map((d, i) => (
                        d ? (
                            <text
                                key={`day-${i}`}
                                x={0}
                                y={i * (cellSize + gap) + 24 + cellSize - 2}
                                fill="var(--color-text-muted)"
                                fontSize={10}
                            >
                                {d}
                            </text>
                        ) : null
                    ))}

                    {/* Cells */}
                    {weeks.map((week, wi) => (
                        week.map((day, di) => (
                            <rect
                                key={`${wi}-${di}`}
                                x={wi * (cellSize + gap) + 30}
                                y={day.date.getDay() * (cellSize + gap) + 18}
                                width={cellSize}
                                height={cellSize}
                                rx={2}
                                ry={2}
                                fill={getColor(day.count)}
                                style={{ cursor: 'pointer', transition: 'transform 100ms ease' }}
                            >
                                <title>{`${day.date.toLocaleDateString()}: ${day.count.toFixed(1)}h`}</title>
                            </rect>
                        ))
                    ))}
                </svg>
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                gap: 4, marginTop: 12,
            }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Less</span>
                {['var(--heatmap-empty)', 'var(--heatmap-l1)', 'var(--heatmap-l2)', 'var(--heatmap-l3)', 'var(--heatmap-l4)'].map((c, i) => (
                    <div key={i} style={{
                        width: 12, height: 12, borderRadius: 2, background: c,
                    }} />
                ))}
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>More</span>
            </div>
        </div>
    )
}
