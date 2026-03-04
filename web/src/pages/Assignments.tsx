import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, GripVertical, Calendar, Flag, AlertTriangle, Pencil } from 'lucide-react'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Assignment, Subject } from '@shared/types'
import toast from 'react-hot-toast'
import { format, isToday, differenceInHours } from 'date-fns'
import {
    DndContext, DragEndEvent, DragStartEvent, DragOverlay,
    useSensor, useSensors, PointerSensor, useDroppable, DragOverEvent,
    pointerWithin,
} from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
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

// Droppable column wrapper
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id })
    return (
        <div
            ref={setNodeRef}
            style={{
                flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 120,
                borderRadius: 'var(--radius-md)',
                background: isOver ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                border: isOver ? '2px dashed rgba(99, 102, 241, 0.3)' : '2px dashed transparent',
                padding: 4,
                transition: 'all 150ms ease',
            }}
        >
            {children}
        </div>
    )
}

function DraggableCard({ assignment, subjects, onDelete, onEdit }: {
    assignment: AssignmentWithSubject; subjects: Subject[];
    onDelete: (id: string) => void; onEdit: (a: AssignmentWithSubject) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: assignment.id,
        data: { status: assignment.status },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    }

    const subject = subjects.find(s => s.id === assignment.subjectId)
    const subjectColor = subject?.color || '#64748B'

    const toDate = (ts: any): Date => {
        if (ts?.toDate) return ts.toDate()
        if (ts?.seconds) return new Date(ts.seconds * 1000)
        return new Date(ts)
    }

    const dueDate = toDate(assignment.dueDate)
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
                                background: `${subjectColor}20`, color: subjectColor, fontSize: 11,
                            }}>
                                {subject?.courseCode || subject?.name || 'General'}
                            </span>
                            <span className="badge" style={{
                                background: `${COMPLEXITY_COLORS[assignment.complexity]}15`,
                                color: COMPLEXITY_COLORS[assignment.complexity], fontSize: 11,
                            }}>
                                {assignment.complexity}
                            </span>
                            {isDueToday && <span className="badge badge-warning" style={{ fontSize: 11 }}>Due Today</span>}
                            {isOverdue && <span className="badge badge-danger" style={{ fontSize: 11 }}>Overdue</span>}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(assignment) }}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--color-text-muted)', padding: 2, display: 'flex',
                                    }}
                                >
                                    <Pencil size={12} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(assignment.id) }}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--color-text-muted)', padding: 2, display: 'flex',
                                    }}
                                >
                                    <X size={12} />
                                </button>
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
    const [overColumnId, setOverColumnId] = useState<string | null>(null)

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formTitle, setFormTitle] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formSubjectId, setFormSubjectId] = useState('')
    const [formDueDate, setFormDueDate] = useState('')
    const [formComplexity, setFormComplexity] = useState<'easy' | 'medium' | 'high'>('medium')
    const [saving, setSaving] = useState(false)

    const subjects = profile?.subjects || []

    // Use PointerSensor with a distance constraint to prevent accidental drags
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
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

            if (editingId) {
                // Update existing
                const updateData: any = {
                    title: formTitle,
                    description: formDescription || '',
                    subjectId: formSubjectId,
                    dueDate: Timestamp.fromDate(dueDate),
                    complexity: formComplexity,
                    priority,
                }
                await updateDoc(doc(db, 'users', user.uid, 'assignments', editingId), updateData)
                const subject = subjects.find(s => s.id === formSubjectId)
                setAssignments(prev => prev.map(a =>
                    a.id === editingId ? { ...a, ...updateData, subject } : a
                ))
                toast.success('Assignment updated!')
            } else {
                // Add new
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
                toast.success('Assignment added!')
            }
            setShowDrawer(false)
            resetForm()
        } catch (err) {
            toast.error('Failed to save assignment')
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

    const handleEditAssignment = (a: AssignmentWithSubject) => {
        setEditingId(a.id)
        setFormTitle(a.title)
        setFormDescription(a.description || '')
        setFormSubjectId(a.subjectId)
        const toDate = (ts: any): Date => {
            if (ts?.toDate) return ts.toDate()
            if (ts?.seconds) return new Date(ts.seconds * 1000)
            return new Date(ts)
        }
        setFormDueDate(format(toDate(a.dueDate), 'yyyy-MM-dd'))
        setFormComplexity(a.complexity)
        setShowDrawer(true)
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event
        if (!over) { setOverColumnId(null); return }
        // Check if hovering over a column
        const columnIds = COLUMNS.map(c => c.id)
        if (columnIds.includes(over.id as ColumnId)) {
            setOverColumnId(over.id as string)
        } else {
            // Hovering over a card — find its column
            const overAssignment = assignments.find(a => a.id === over.id)
            setOverColumnId(overAssignment?.status || null)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null)
        setOverColumnId(null)
        const { active, over } = event
        if (!over || !user) return

        const activeAssignment = assignments.find(a => a.id === active.id)
        if (!activeAssignment) return

        // Determine target column
        let targetColumn: ColumnId | null = null
        const columnIds = COLUMNS.map(c => c.id)

        if (columnIds.includes(over.id as ColumnId)) {
            targetColumn = over.id as ColumnId
        } else {
            const overAssignment = assignments.find(a => a.id === over.id)
            if (overAssignment) targetColumn = overAssignment.status
        }

        if (targetColumn && targetColumn !== activeAssignment.status) {
            // Optimistically update UI
            setAssignments(prev =>
                prev.map(a => a.id === activeAssignment.id ? { ...a, status: targetColumn! } : a)
            )
            try {
                await updateDoc(doc(db, 'users', user.uid, 'assignments', activeAssignment.id), {
                    status: targetColumn,
                })
                toast.success(`Moved to ${COLUMNS.find(c => c.id === targetColumn)?.title}`)
            } catch {
                // Revert on failure
                setAssignments(prev =>
                    prev.map(a => a.id === activeAssignment.id ? { ...a, status: activeAssignment.status } : a)
                )
                toast.error('Failed to move')
            }
        }
    }

    const resetForm = () => {
        setEditingId(null)
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

    const activeAssignment = assignments.find(a => a.id === activeId)

    if (loading) {
        return (
            <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '3px solid var(--color-bg-raised)', borderTopColor: 'var(--color-brand)',
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
                    <h1 className="text-display" style={{ marginBottom: 4 }}>Assignment Board</h1>
                    <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
                        Drag cards between columns to update status
                    </p>
                </div>
                <button className="btn btn-gradient" onClick={() => { resetForm(); setShowDrawer(true) }}>
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
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
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
                                            background: `${column.color}20`, color: column.color,
                                        }}>
                                            {items.length}
                                        </span>
                                    </div>
                                </div>
                                <DroppableColumn id={column.id}>
                                    {items.length === 0 ? (
                                        <div style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '2px dashed rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)',
                                            padding: 20, color: 'var(--color-text-muted)', fontSize: 13,
                                            minHeight: 100,
                                        }}>
                                            Drop here
                                        </div>
                                    ) : (
                                        items.map(assignment => (
                                            <DraggableCard
                                                key={assignment.id}
                                                assignment={assignment}
                                                subjects={subjects}
                                                onDelete={handleDeleteAssignment}
                                                onEdit={handleEditAssignment}
                                            />
                                        ))
                                    )}
                                </DroppableColumn>
                            </div>
                        )
                    })}
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeAssignment ? (
                        <div style={{ opacity: 0.9, transform: 'rotate(3deg)' }}>
                            <div className="kanban-card" style={{
                                borderLeft: `3px solid ${activeAssignment.subject?.color || '#64748B'}`,
                                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                            }}>
                                <p className="text-heading-sm">{activeAssignment.title}</p>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Add/Edit Assignment Drawer */}
            <AnimatePresence>
                {showDrawer && (
                    <>
                        <motion.div
                            className="drawer-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowDrawer(false); resetForm() }}
                        />
                        <motion.div
                            className="drawer"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                                <h2 className="text-heading-lg">{editingId ? 'Edit Assignment' : 'Add Assignment'}</h2>
                                <button className="btn btn-icon" onClick={() => { setShowDrawer(false); resetForm() }}>
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
                                <input
                                    type="date"
                                    className="input"
                                    value={formDueDate}
                                    onChange={e => setFormDueDate(e.target.value)}
                                />
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
                                <button className="btn btn-ghost" onClick={() => { setShowDrawer(false); resetForm() }} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button className="btn btn-gradient" onClick={handleAddAssignment} disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Saving...' : editingId ? 'Update' : 'Add Assignment'}
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
                onClick={() => { resetForm(); setShowDrawer(true) }}
            >
                <Plus size={24} />
            </motion.button>
        </div>
    )
}
