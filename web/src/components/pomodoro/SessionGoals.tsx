import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'

interface Todo {
    id: string
    text: string
    done: boolean
}

interface SessionGoalsProps {
    todos: Todo[]
    setTodos: (todos: Todo[]) => void
    disabled?: boolean
}

export default function SessionGoals({ todos, setTodos, disabled }: SessionGoalsProps) {
    const [input, setInput] = useState('')

    const addTodo = () => {
        if (!input.trim()) return
        setTodos([...todos, { id: Date.now().toString(), text: input.trim(), done: false }])
        setInput('')
    }

    const toggleTodo = (id: string) => {
        setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
    }

    const removeTodo = (id: string) => {
        setTodos(todos.filter(t => t.id !== id))
    }

    const completed = todos.filter(t => t.done).length

    return (
        <div className="surface-card" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>Session Goals</h3>
                {todos.length > 0 && (
                    <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: completed === todos.length && todos.length > 0 ? '#10B981' : 'var(--color-text-muted)',
                    }}>
                        {completed}/{todos.length}
                    </span>
                )}
            </div>

            {/* Add task input */}
            {!disabled && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTodo()}
                        placeholder="Add a task..."
                        className="input"
                        style={{ flex: 1, fontSize: 13, padding: '8px 12px' }}
                    />
                    <button
                        onClick={addTodo}
                        style={{
                            width: 36, height: 36, borderRadius: 'var(--radius-md)',
                            background: 'var(--color-brand)',
                            color: 'white', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Plus size={16} />
                    </button>
                </div>
            )}

            {/* Task list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {todos.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 16 }}>
                        Add tasks to track during this session
                    </p>
                ) : (
                    todos.map(todo => (
                        <div
                            key={todo.id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-md)',
                                background: todo.done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                                transition: 'background 150ms',
                            }}
                        >
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                style={{
                                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                    border: todo.done ? 'none' : '2px solid rgba(255,255,255,0.15)',
                                    background: todo.done ? '#10B981' : 'transparent',
                                    color: 'white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                {todo.done && <Check size={12} />}
                            </button>
                            <span style={{
                                flex: 1, fontSize: 13,
                                textDecoration: todo.done ? 'line-through' : 'none',
                                color: todo.done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                            }}>
                                {todo.text}
                            </span>
                            {!disabled && (
                                <button
                                    onClick={() => removeTodo(todo.id)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--color-text-muted)', padding: 4, opacity: 0.5,
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
