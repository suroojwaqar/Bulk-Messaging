'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

export default function TestMediaPage() {
  const [formData, setFormData] = useState({
    phone: '',
    message: '',
    token: '',
    instanceId: '',
    messageType: 'media' as 'text' | 'media',
    mediaUrl: 'https://tmp.waapi.app/ce81b23e5ac34a428c79705a08ea9f51:waapi/static/logo.png'
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test/send-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Test Media Sending</h1>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="923343867280"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Token</label>
            <input
              type="text"
              value={formData.token}
              onChange={(e) => setFormData({...formData, token: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Your WaAPI token"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Instance ID</label>
            <input
              type="text"
              value={formData.instanceId}
              onChange={(e) => setFormData({...formData, instanceId: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="12121"
            />
          </div>

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
                <span className="text-gray-700 dark:text-gray-300">Text</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="media"
                  checked={formData.messageType === 'media'}
                  onChange={(e) => setFormData({...formData, messageType: e.target.value as 'text' | 'media'})}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Media</span>
              </label>
            </div>
          </div>

          {formData.messageType === 'media' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Media URL</label>
              <input
                type="url"
                value={formData.mediaUrl}
                onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://tmp.waapi.app/ce81b23e5ac34a428c79705a08ea9f51:waapi/static/logo.png"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {formData.messageType === 'media' ? 'Caption (Optional)' : 'Message'}
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder={formData.messageType === 'media' ? 'Optional caption...' : 'Your message...'}
            />
          </div>

          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50"
          >
            <Send size={20} />
            {loading ? 'Sending...' : 'Test Send'}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Result</h2>
          <pre className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
