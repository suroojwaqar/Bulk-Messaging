'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Upload, Download } from 'lucide-react'

interface List {
  _id: string
  name: string
  description?: string
  createdAt: string
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/lists')
      const data = await response.json()
      setLists(data)
    } catch (error) {
      console.error('Failed to fetch lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', description: '' })
        setShowForm(false)
        fetchLists()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create list')
      }
    } catch (error) {
      alert('Failed to create list')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteList = async (id: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return

    try {
      const response = await fetch(`/api/lists/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchLists()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete list')
      }
    } catch (error) {
      alert('Failed to delete list')
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-900 dark:text-white">Loading lists...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Lists</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Create List
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create New List</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create List'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <div key={list._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{list.name}</h3>
              <button
                onClick={() => deleteList(list._id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            {list.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{list.description}</p>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Created: {new Date(list.createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <a
                href={`/contacts?listId=${list._id}`}
                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-center hover:bg-blue-600 transition-colors"
              >
                View Contacts
              </a>
              <a
                href="/api/contacts/example"
                download="contacts-example.csv"
                className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors"
                title="Download CSV example"
              >
                <Download size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {lists.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Plus size={48} className="mx-auto mb-4 opacity-50" />
          <p>No lists found. Create your first list to start organizing contacts.</p>
        </div>
      )}
    </div>
  )
}
