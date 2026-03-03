import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, GripVertical, Calendar, Flag, AlertTriangle } from 'lucide-react'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Assignment, Subject } from '@shared/types'
import toast from 'react-hot-toast'
import { format, isToday, differenceInHours } from 'date-fns'
import { DatePicker } from '@/components/ui/DatePicker'
import {
    DndContext, closestCenter, DragEndEvent,
    DragStartEvent, DragOverlay, useSensor, useSensors,
    PointerSensor,
} from '@dnd-kit/core'
import {
    SortableContext, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type ColumnId = 'todo' | 'in_progress' | 'done'

const COLUMNS: { id: ColumnId; title: string; emoji: string; color: string }[] = [
    { id: 'todo', title: 'To Do', emoji: '📋', color: '#6366F1' },
    { id: 'in_progress', title: 'In Progress', emoji: '⚡', color: '#F59E0B' },
    { id: 'done', title: 'Done', emoji: '✅', color: '#22C55E' },
]

const COMPLEXITY_COLORS = {
    easy: '#22C55E',
    medium: '#F59E0B',
    high: '#EF4444',
}

interface AssignmentWithSubject extends Assignment {
    subject?: Subject
}

function SortableCard({ assignment, subjects, onDelete }: {
    assignment: AssignmentWithSubject, subjects: Subject[],
    onDelete: (id: string) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: assignment.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    }

    const subject = subjects.find(s => s.id === assignment.subjectId)
    const subjectColor = subject?.color || '#64748B'
    const dueDate = assignment.dueDate.toDate()
    const isDueToday = isToday(dueDate)
    const hoursUntilDue = differenceInHours(dueDate, new Date())
    const isOverdue = hoursUntilDue < 0 && assignment.status !== 'done'

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className="kanban-card" style={{ borderLeft: `3px solid ${subjectColor}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div {...listeners} style={{ cursor: 'grab', marginTop: 2, color: 'var(--color-text-muted)' }}>
                        <GripVertical size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Tags row */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                            <span className="subject-tag" style={{
                                background: `${subjectColor}20`, color: subjectColor,
                                fontSize: 11,
                            }}>
                                {subject?.courseCode || subject?.name || 'General'}
                            </span>
                            <span className="badge" style={{
                                background: `${COMPLEXITY_COLORS[assignment.complexity]}15`,
                                color: COMPLEXITY_COLORS[assignment.complexity],
                                fontSize: 11,
                            }}>
                                {assignment.complexity}
                            </span>
                            {isDueToday && (
                                <span className="badge badge-warning" style={{ fontSize: 11 }}>Due Today</span>
                            )}
                            {isOverdue && (
                                <span className="badge badge-danger" style={{ fontSize: 11 }}>Overdue</span>
                            )}
                        </div>

                        {/* Title */}
                        <p className="text-heading-sm" style={{
                            marginBottom: 4,
                            textDecoration: assignment.status === 'done' ? 'line-through' : 'none',
                            color: assignment.status === 'done' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                        }}>
                            {assignment.title}
                        </p>

                        {assignment.description && (
                            <p className="text-body-sm" style={{
                                color: 'var(--color-text-muted)', marginBottom: 8,
                                overflow: 'hidden', textOverflow: 'ellipsis',
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            }}>
                                {assignment.description}
                            </p>
                        )}

                        {/* Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Calendar size={12} color="var(--color-text-muted)" />
                                <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    {format(dueDate, 'MMM d')}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Flag size={12} color={COMPLEXITY_COLORS[assignment.complexity]} />
                                <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    P{assignment.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Assignments() {
    const { user, profile } = useAuth()
    const [assignments, setAssignments] = useState<AssignmentWithSubject[]>([])
    const [loading, setLoading] = useState(true)
    const [showDrawer, setShowDrawer] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeId, setActiveId] = useState<string | null>(null)

    // Form state
    const [formTitle, setFormTitle] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formSubjectId, setFormSubjectId] = useState('')
    const [formDueDate, setFormDueDate] = useState('')
    const [formComplexity, setFormComplexity] = useState<'easy' | 'medium' | 'high'>('medium')
    const [saving, setSaving] = useState(false)

    const subjects = profile?.subjects || []

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    useEffect(() => {
        if (!user) return
        const load = async () => {
            try {
                const ref = collection(db, 'users', user.uid, 'assignments')
                const q = query(ref, orderBy('priority', 'desc'))
                const snap = await getDocs(q)
                setAssignments(snap.docs.map(d => {
                    const data = d.data() as Omit<Assignment, 'id'>
                    const subject = subjects.find(s => s.id === data.subjectId)
                    return { id: d.id, ...data, subject } as AssignmentWithSubject
                }))
            } catch (err) {
                console.warn('Could not load assignments:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user, subjects])

    const handleAddAssignment = async () => {
        if (!user || !formTitle || !formDueDate) {
            toast.error('Title and due date are required')
            return
        }
        setSaving(true)
        try {
            const dueDate = new Date(formDueDate + 'T23:59:00')
            const daysUntilDue = Math.max(1, Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            const complexityWeight = { easy: 1, medium: 2, high: 3 }[formComplexity]
            const priority = Math.min(10, Math.round((complexityWeight * 3 + (10 / daysUntilDue) * 7)))

            const data = {
                title: formTitle,
                description: formDescription || undefined,
                subjectId: formSubjectId,
                dueDate: Timestamp.fromDate(dueDate),
                complexity: formComplexity,
                status: 'todo' as const,
                priority,
                teamMode: false,
                assignees: [],
            }
            const ref = collection(db, 'users', user.uid, 'assignments')
            const docRef = await addDoc(ref, data)
            const subject = subjects.find(s => s.id === formSubjectId)
            setAssignments(prev => [...prev, { id: docRef.id, ...data, subject }])
            setShowDrawer(false)
            resetForm()
            toast.success('Assignment added!')
        } catch (err) {
            toast.error('Failed to add assignment')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAssignment = async (id: string) => {
        if (!user) return
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'assignments', id))
            setAssignments(prev => prev.filter(a => a.id !== id))
            toast.success('Assignment deleted')
        } catch { toast.error('Failed to delete') }
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null)
        const { active, over } = event
        if (!over || !user) return

        const activeAssignment = assignments.find(a => a.id === active.id)
        if (!activeAssignment) return

        // Determine target column by checking which column the item is dropped over
        let targetColumn: ColumnId | null = null

        // Check if dropped over a column directly
        if (['todo', 'in_progress', 'done'].includes(over.id as string)) {
            targetColumn = over.id as ColumnId
        } else {
            // Dropped over another card — find what column that card is in
            const overAssignment = assignments.find(a => a.id === over.id)
            if (overAssignment) {
                targetColumn = overAssignment.status
            }
        }

        if (targetColumn && targetColumn !== activeAssignment.status) {
            try {
                await updateDoc(doc(db, 'users', user.uid, 'assignments', activeAssignment.id), {
                    status: targetColumn,
                })
                setAssignments(prev =>
                    prev.map(a => a.id === activeAssignment.id ? { ...a, status: targetColumn! } : a)
                )
                toast.success(`Moved to ${COLUMNS.find(c => c.id === targetColumn)?.title}`)
            } catch { toast.error('Failed to update') }
        }
    }

    const resetForm = () => {
        setFormTitle('')
        setFormDescription('')
        setFormSubjectId('')
        setFormDueDate('')
        setFormComplexity('medium')
    }

    const filtered = assignments.filter(a =>
        !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getColumnItems = (status: ColumnId) =>
        filtered.filter(a => a.status === status)

    if (loading) {
        return (
            <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '3px solid var(--color-bg-raised)',
                    borderTopColor: 'var(--color-brand)',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        )
    }

    return (
        <div className="animate-fade-in-up">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 className="text-display" style={{ marginBottom: 4 }}>Assignment Board 📋</h1>
                    <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
                        Drag cards between columns to update status
                    </p>
                </div>
                <button className="btn btn-gradient" onClick={() => setShowDrawer(true)}>
                    <Plus size={18} /> Add Assignment
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20, maxWidth: 380 }}>
                <Search size={16} style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                }} />
                <input
                    className="input"
                    placeholder="Search assignments..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: 40 }}
                />
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-board">
                    {COLUMNS.map(column => {
                        const items = getColumnItems(column.id)
                        return (
                            <div key={column.id} className="kanban-column">
                                <div className="kanban-column-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>{column.emoji}</span>
                                        <span className="text-heading-sm">{column.title}</span>
                                        <span className="badge" style={{
                                            background: `${column.color}20`,
                                            color: column.color,
                                        }}>
                                            {items.length}
                                        </span>
                                    </div>
                                </div>
                                <SortableContext
                                    items={items.map(i => i.id)}
                                    strategy={verticalListSortingStrategy}
                                    id={column.id}
                                >
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100 }}>
                                        {items.length === 0 ? (
                                            <div style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: '2px dashed rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)',
                                                padding: 20, color: 'var(--color-text-muted)', fontSize: 13,
                                            }}>
                                                Drop here
                                            </div>
                                        ) : (
                                            items.map(assignment => (
                                                <SortableCard
                                                    key={assignment.id}
                                                    assignment={assignment}
                                                    subjects={subjects}
                                                    onDelete={handleDeleteAssignment}
                                                />
                                            ))
                                        )}
                                    </div>
                                </SortableContext>
                            </div>
                        )
                    })}
                </div>
            </DndContext>

            {/* Add Assignment Drawer */}
            <AnimatePresence>
                {showDrawer && (
                    <>
                        <motion.div
                            className="drawer-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDrawer(false)}
                        />
                        <motion.div
                            className="drawer"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                                <h2 className="text-heading-lg">Add Assignment</h2>
                                <button className="btn btn-icon" onClick={() => setShowDrawer(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {subjects.length === 0 && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                                    background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)',
                                    marginBottom: 20,
                                }}>
                                    <AlertTriangle size={16} color="var(--color-warning)" />
                                    <p className="text-body-sm" style={{ color: 'var(--color-warning)' }}>
                                        Add subjects in Settings
                                    </p>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    className="input"
                                    placeholder="e.g. Lab Report 3"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Optional notes..."
                                    value={formDescription}
                                    onChange={e => setFormDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Subject</label>
                                <select
                                    className="input"
                                    value={formSubjectId}
                                    onChange={e => setFormSubjectId(e.target.value)}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="">General</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Due Date *</label>
                                <DatePicker value={formDueDate} onChange={setFormDueDate} />
                            </div>

                            <div className="form-group">
                                <label>Complexity</label>
                                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                    {(['easy', 'medium', 'high'] as const).map(level => (
                                        <button
                                            key={level}
                                            className="btn btn-sm"
                                            onClick={() => setFormComplexity(level)}
                                            style={{
                                                background: formComplexity === level
                                                    ? `${COMPLEXITY_COLORS[level]}20`
                                                    : 'var(--color-bg-raised)',
                                                color: formComplexity === level
                                                    ? COMPLEXITY_COLORS[level]
                                                    : 'var(--color-text-muted)',
                                                border: `1px solid ${formComplexity === level ? COMPLEXITY_COLORS[level] + '40' : 'rgba(255,255,255,0.06)'}`,
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                <button className="btn btn-ghost" onClick={() => setShowDrawer(false)} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button className="btn btn-gradient" onClick={handleAddAssignment} disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Saving...' : 'Add Assignment'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* FAB */}
            <motion.button
                className="fab"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => setShowDrawer(true)}
            >
                <Plus size={24} />
            </motion.button>
        </div>
    )
}
