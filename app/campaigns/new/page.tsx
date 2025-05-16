'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Image } from 'lucide-react'

interface Sender {
  _id: string
  name: string
  status: string
}

interface List {
  _id: string
  name: string
  description?: string
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [senders, setSenders] = useState<Sender[]>([])
  const [lists, setLists] = useState<List[]>([])
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    senderId: '',
    listId: '',
    messageType: 'text' as 'text' | 'media',
    mediaUrl: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [contactCount, setContactCount] = useState(0)

  useEffect(() => {
    fetchSenders()
    fetchLists()
  }, [])

  useEffect(() => {
    if (formData.listId) {
      fetchContactCount(formData.listId)
    }
  }, [formData.listId])

  const fetchSenders = async () => {
    try {
      const response = await fetch('/api/senders')
      const data = await response.json()
      setSenders(data.filter((sender: Sender) => sender.status === 'connected'))
    } catch (error) {
      console.error('Failed to fetch senders:', error)
    }
  }

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

  const fetchContactCount = async (listId: string) => {
    try {
      const response = await fetch(`/api/contacts?listId=${listId}`)
      const data = await response.json()
      setContactCount(data.pagination?.total || 0)
    } catch (error) {
      console.error('Failed to fetch contact count:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (contactCount === 0) {
      alert('Selected list has no contacts. Please choose a different list.')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const campaign = await response.json()
        alert('Campaign created successfully!')
        router.push(`/campaigns/${campaign._id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create campaign')
      }
    } catch (error) {
      alert('Failed to create campaign')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-900 dark:text-white">Loading...</div>
  }

  const selectedSender = senders.find(s => s._id === formData.senderId)
  const selectedList = lists.find(l => l._id === formData.listId)
  const isFormValid = formData.title && formData.senderId && formData.listId && 
    (formData.messageType === 'text' ? formData.message : formData.mediaUrl)

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Campaign</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Campaign Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Weekly Newsletter"
              required
            />
          </div>

          {/* Sender Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Sender</label>
            <select
              value={formData.senderId}
              onChange={(e) => setFormData({...formData, senderId: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a sender</option>
              {senders.map((sender) => (
                <option key={sender._id} value={sender._id}>
                  {sender.name} (Connected)
                </option>
              ))}
            </select>
            {senders.length === 0 && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                No connected senders available. Please add and connect a sender first.
              </p>
            )}
          </div>

          {/* List Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Contact List</label>
            <select
              value={formData.listId}
              onChange={(e) => setFormData({...formData, listId: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a contact list</option>
              {lists.map((list) => (
                <option key={list._id} value={list._id}>
                  {list.name}
                </option>
              ))}
            </select>
            {formData.listId && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Selected list contains {contactCount} contacts
              </p>
            )}
            {contactCount === 0 && formData.listId && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                Warning: This list has no contacts
              </p>
            )}
          </div>

          {/* Message Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Message Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="text"
                  checked={formData.messageType === 'text'}
                  onChange={(e) => setFormData({...formData, messageType: e.target.value as 'text' | 'media'})}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Text Message</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="media"
                  checked={formData.messageType === 'media'}
                  onChange={(e) => setFormData({...formData, messageType: e.target.value as 'text' | 'media'})}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Image size={16} />
                  Media Message
                </span>
              </label>
            </div>
          </div>

          {/* Text Message */}
          {formData.messageType === 'text' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Enter your message here..."
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Characters: {formData.message.length}
              </p>
            </div>
          )}

          {/* Media Message */}
          {formData.messageType === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Media URL</label>
                <input
                  type="url"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter the direct URL to your image, video, audio, or document file
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Caption (Optional)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional caption for your media..."
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Characters: {formData.message.length}
                </p>
              </div>
              {/* Media Preview */}
              {formData.mediaUrl && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Media Preview</label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
                    {formData.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={formData.mediaUrl}
                        alt="Media preview"
                        className="max-w-full h-auto max-h-48 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 text-sm p-4 text-center">
                        {formData.mediaUrl.match(/\.(mp4|avi|mov|webm)$/i) ? 'Video file' :
                         formData.mediaUrl.match(/\.(mp3|wav|ogg)$/i) ? 'Audio file' :
                         formData.mediaUrl.match(/\.(pdf|doc|docx)$/i) ? 'Document file' :
                         'Media file'} - Preview will be available when sent
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {isFormValid && (
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Campaign Preview</h3>
              <div className="text-sm space-y-1">
                <p className="text-gray-700 dark:text-gray-300"><strong>Title:</strong> {formData.title}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Sender:</strong> {selectedSender?.name}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Recipients:</strong> {selectedList?.name} ({contactCount} contacts)</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Type:</strong> {formData.messageType === 'text' ? 'Text Message' : 'Media Message'}</p>
                {formData.messageType === 'text' ? (
                  <>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Message:</strong></p>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2 mt-1 whitespace-pre-wrap text-gray-900 dark:text-white">
                      {formData.message}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Media URL:</strong> <span className="text-blue-500 text-xs">{formData.mediaUrl}</span></p>
                    {formData.message && (
                      <>
                        <p className="text-gray-700 dark:text-gray-300"><strong>Caption:</strong></p>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2 mt-1 whitespace-pre-wrap text-gray-900 dark:text-white">
                          {formData.message}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || senders.length === 0 || contactCount === 0 || !isFormValid}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Send size={20} />
              {submitting ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
