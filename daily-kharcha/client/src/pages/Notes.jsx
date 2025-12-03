import React, { useState } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { Plus, Trash2, StickyNote, X } from 'lucide-react'
import { format } from 'date-fns'

function Notes() {
  const { notes, addNote, deleteNote } = useExpense()
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    await addNote({
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString()
    })

    setTitle('')
    setContent('')
    setShowModal(false)
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2>Notes</h2>
          <p>Keep track of your financial notes and reminders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Note
        </button>
      </div>

      <div className="card">
        {notes.length === 0 ? (
          <div className="empty-state">
            <StickyNote size={48} />
            <h3>No notes yet</h3>
            <p>Add notes to keep track of important financial reminders</p>
          </div>
        ) : (
          <div className="notes-list">
            {notes.map(note => (
              <div key={note.id} className="note-item">
                <div className="note-header">
                  <h4 className="note-title">{note.title}</h4>
                  <div className="flex gap-1" style={{ alignItems: 'center' }}>
                    <span className="note-date">
                      {format(new Date(note.createdAt), 'MMM d, yyyy')}
                    </span>
                    <button 
                      className="icon-btn" 
                      onClick={() => deleteNote(note.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="note-content">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Note</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  className="form-control"
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  required
                  style={{ resize: 'vertical', minHeight: '120px' }}
                />
              </div>

              <div className="flex gap-1">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Note
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes
