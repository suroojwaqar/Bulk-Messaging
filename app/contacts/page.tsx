'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Upload, Users, Download } from 'lucide-react'

interface Contact {
  _id: string
  name: string
  phone: string
  listId: {
    _id: string
    name: string
  }
  createdAt: string
}

interface List {
  _id: string
  name: string
  description?: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', listId: '' })
  const [submitting, setSubmitting] = useState(false)
  const [selectedListId, setSelectedListId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  useEffect(() => {
    fetchContacts()
    fetchLists()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      const data = await response.json()
      setContacts(data.contacts || [])
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/lists')
      const data = await response.json()
      setLists(data)
    } catch (error) {
      console.error('Failed to fetch lists:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', phone: '', listId: '' })
        setShowForm(false)
        fetchContacts()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create contact')
      }
    } catch (error) {
      alert('Failed to create contact')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !selectedListId) return

    setUploadingFile(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('listId', selectedListId)

    try {
      const response = await fetch('/api/contacts/bulk', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (response.ok) {
        alert(`Success! ${result.imported} contacts imported.`)
        setShowBulkUpload(false)
        setFile(null)
        setSelectedListId('')
        fetchContacts()
      } else {
        alert(result.error || 'Failed to upload contacts')
      }
    } catch (error) {
      alert('Failed to upload contacts')
    } finally {
      setUploadingFile(false)
    }
  }

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchContacts()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete contact')
      }
    } catch (error) {
      alert('Failed to delete contact')
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-900 dark:text-white">Loading contacts...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contacts</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors"
          >
            <Upload size={20} />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Single Contact Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Contact</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">List</label>
                <select
                  value={formData.listId}
                  onChange={(e) => setFormData({...formData, listId: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a list</option>
                  {lists.map((list) => (
                    <option key={list._id} value={list._id}>{list.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Contact'}
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

      {/* Bulk Upload Form */}
      {showBulkUpload && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Bulk Upload Contacts</h2>
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>CSV Format:</strong> Your CSV file should have columns named 'name' and 'phone'.
                  Example:
                </p>
              </div>
              <a
                href="/api/contacts/example"
                download="contacts-example.csv"
                className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                <Download size={12} />
                Download Example
              </a>
            </div>
            <pre className="mt-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white">
name,phone
John Doe,+1234567890
Jane Smith,+0987654321
            </pre>
          </div>
          <form onSubmit={handleBulkUpload}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Select List</label>
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a list</option>
                  {lists.map((list) => (
                    <option key={list._id} value={list._id}>{list.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={uploadingFile || !file || !selectedListId}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {uploadingFile ? 'Uploading...' : 'Upload Contacts'}
              </button>
              <button
                type="button"
                onClick={() => setShowBulkUpload(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left p-4 text-gray-900 dark:text-white">Name</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Phone</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">List</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Created</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact._id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-4 font-medium text-gray-900 dark:text-white">{contact.name}</td>
                <td className="p-4 font-mono text-gray-700 dark:text-gray-300">{contact.phone}</td>
                <td className="p-4">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
                    {contact.listId.name}
                  </span>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => deleteContact(contact._id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            No contacts found. Add your first contact or upload a CSV file.
          </div>
        )}
      </div>
    </div>
  )
}
