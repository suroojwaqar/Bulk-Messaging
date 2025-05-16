'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Check, X, TestTube, Info, Edit, RefreshCw } from 'lucide-react'

interface Sender {
  _id: string
  name: string
  token: string
  instanceId: string
  status: 'connected' | 'disconnected'
  createdAt: string
}

export default function SendersPage() {
  const [senders, setSenders] = useState<Sender[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', token: '', instanceId: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showTestPanel, setShowTestPanel] = useState(false)
  const [testPhone, setTestPhone] = useState('+1234567890')
  const [testMessage, setTestMessage] = useState('Test message from Bulk Messaging Tool')
  const [testingSender, setTestingSender] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [editingSender, setEditingSender] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({ name: '', token: '', instanceId: '' })
  const [migrating, setMigrating] = useState(false)
  const [showMigrationResult, setShowMigrationResult] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)

  useEffect(() => {
    fetchSenders()
  }, [])

  const fetchSenders = async () => {
    try {
      const response = await fetch('/api/senders')
      const data = await response.json()
      setSenders(data)
    } catch (error) {
      console.error('Failed to fetch senders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Always send instanceId field, even if empty
      const payload = {
        name: formData.name,
        token: formData.token,
        instanceId: formData.instanceId || ''
      }

      console.log('Creating sender with payload:', { ...payload, token: `${payload.token.substring(0, 10)}...` })

      const response = await fetch('/api/senders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setFormData({ name: '', token: '', instanceId: '' })
        setShowForm(false)
        fetchSenders()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create sender')
      }
    } catch (error) {
      alert('Failed to create sender')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSender) return

    setSubmitting(true)

    try {
      // Always send instanceId field, even if empty
      const payload = {
        name: editFormData.name,
        token: editFormData.token,
        instanceId: editFormData.instanceId || ''  // Send empty string if not provided
      }

      console.log('Updating sender with payload:', { ...payload, token: `${payload.token.substring(0, 10)}...` })

      const response = await fetch(`/api/senders/${editingSender}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Update result:', { id: result._id, instanceId: result.instanceId })
        setEditingSender(null)
        setEditFormData({ name: '', token: '', instanceId: '' })
        fetchSenders()
      } else {
        const error = await response.json()
        console.error('Update error:', error)
        alert(error.error || 'Failed to update sender')
      }
    } catch (error) {
      console.error('Update request failed:', error)
      alert('Failed to update sender')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (sender: Sender) => {
    setEditingSender(sender._id)
    setEditFormData({
      name: sender.name,
      token: sender.token,
      instanceId: sender.instanceId || ''
    })
    console.log('Starting edit for sender:', { id: sender._id, instanceId: sender.instanceId })
  }

  const cancelEdit = () => {
    setEditingSender(null)
    setEditFormData({ name: '', token: '', instanceId: '' })
  }

  const deleteSender = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sender?')) return

    try {
      const response = await fetch(`/api/senders/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchSenders()
      } else {
        alert('Failed to delete sender')
      }
    } catch (error) {
      alert('Failed to delete sender')
    }
  }

  const testSender = async (sender: Sender) => {
    setTestingSender(sender._id)
    setTestResult(null)

    try {
      const response = await fetch('/api/test-waapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sender.token,
          instanceId: sender.instanceId,
          phone: testPhone,
          message: testMessage
        })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to test sender',
        details: error
      })
    } finally {
      setTestingSender('')
    }
  }

  const migrateSenders = async () => {
    if (!confirm('This will attempt to auto-detect instance IDs for senders that are missing them. Continue?')) {
      return
    }

    setMigrating(true)
    setMigrationResult(null)

    try {
      const response = await fetch('/api/admin/migrate-senders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      setMigrationResult(result)
      setShowMigrationResult(true)
      
      if (response.ok) {
        // Refresh senders list after migration
        fetchSenders()
      }
    } catch (error) {
      alert('Migration failed: ' + error)
    } finally {
      setMigrating(false)
    }
  }

  // Check if any senders are missing instance ID
  const sendersWithoutInstanceId = senders.filter(sender => !sender.instanceId)

  if (loading) {
    return <div className="p-8 text-gray-900 dark:text-white">Loading senders...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Senders</h1>
        <div className="flex gap-2">
          {sendersWithoutInstanceId.length > 0 && (
            <button
              onClick={migrateSenders}
              disabled={migrating}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={20} className={migrating ? 'animate-spin' : ''} />
              {migrating ? 'Migrating...' : `Fix ${sendersWithoutInstanceId.length} Sender${sendersWithoutInstanceId.length > 1 ? 's' : ''}`}
            </button>
          )}
          <button
            onClick={() => setShowTestPanel(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-600 transition-colors"
          >
            <TestTube size={20} />
            Test WaAPI
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            Add Sender
          </button>
        </div>
      </div>

      {/* Migration Warning */}
      {sendersWithoutInstanceId.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-200">Instance ID Migration Required</h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                {sendersWithoutInstanceId.length} sender{sendersWithoutInstanceId.length > 1 ? 's' : ''} missing instance ID. 
                This is required for WaAPI integration. Click the "Fix" button to automatically detect and update instance IDs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Migration Result */}
      {showMigrationResult && migrationResult && (
        <div className={`border rounded-lg p-4 mb-6 ${
          migrationResult.successCount > 0 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-semibold ${
                migrationResult.successCount > 0 
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                Migration Results
              </h3>
              <p className={`text-sm mt-1 ${
                migrationResult.successCount > 0 
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {migrationResult.message}
              </p>
              {migrationResult.results && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Show Details</summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                    {JSON.stringify(migrationResult.results, null, 2)}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={() => setShowMigrationResult(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* API Documentation Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">WaAPI Integration Updated</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
              Now using the official WaAPI endpoint: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">POST /instances/{String.raw`{id}`}/client/action/send-message</code>
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
              • Phone numbers are automatically formatted as WhatsApp chat IDs (e.g., number@c.us)<br/>
              • Instance ID will be automatically detected from your token if not provided<br/>
              • Messages now support all WaAPI features like message tracking
            </p>
          </div>
        </div>
      </div>

      {showTestPanel && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Test WaAPI Connection</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Test Phone Number</label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1234567890"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Include country code (e.g., +1 for US)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Test Message</label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Test message"
              />
            </div>
          </div>
          {testResult && (
            <div className={`p-4 rounded-lg mb-4 ${
              testResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
            }`}>
              <h3 className={`font-semibold ${
                testResult.success 
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                Test Result: {testResult.success ? 'Success' : 'Failed'}
              </h3>
              {testResult.error && (
                <p className="text-red-700 dark:text-red-300 mt-1">{testResult.error}</p>
              )}
              {testResult.message && (
                <p className="text-green-700 dark:text-green-300 mt-1">{testResult.message}</p>
              )}
              {testResult.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">Show Details</summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
          <button
            onClick={() => setShowTestPanel(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close Test Panel
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Sender</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., My WhatsApp Sender"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">WaAPI Token</label>
                <input
                  type="text"
                  value={formData.token}
                  onChange={(e) => setFormData({...formData, token: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your WaAPI token"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Instance ID 
                  <span className="text-xs text-gray-500 ml-1">(Optional - will auto-detect if not provided)</span>
                </label>
                <input
                  type="text"
                  value={formData.instanceId}
                  onChange={(e) => setFormData({...formData, instanceId: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 12345 (leave empty to auto-detect)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your WaAPI instance ID. If left empty, the system will try to detect it automatically from your token.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Sender'}
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

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left p-4 text-gray-900 dark:text-white">Name</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Token</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Instance ID</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Status</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Created</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {senders.map((sender) => (
              <tr key={sender._id} className="border-t border-gray-200 dark:border-gray-700">
                {editingSender === sender._id ? (
                  <td colSpan={6} className="p-4">
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Token</label>
                          <input
                            type="text"
                            value={editFormData.token}
                            onChange={(e) => setEditFormData({...editFormData, token: e.target.value})}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Instance ID</label>
                          <input
                            type="text"
                            value={editFormData.instanceId}
                            onChange={(e) => setEditFormData({...editFormData, instanceId: e.target.value})}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter instance ID"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Required for campaigns. Get this from your WaAPI dashboard.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                        >
                          {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{sender.name}</td>
                    <td className="p-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                      {sender.token.slice(0, 10)}...{sender.token.slice(-5)}
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                      {sender.instanceId ? (
                        sender.instanceId
                      ) : (
                        <span className="text-red-500 dark:text-red-400">Missing</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                        sender.status === 'connected' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {sender.status === 'connected' ? <Check size={14} /> : <X size={14} />}
                        {sender.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {new Date(sender.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(sender)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Edit sender"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => testSender(sender)}
                          disabled={testingSender === sender._id}
                          className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors disabled:opacity-50"
                          title="Test this sender"
                        >
                          <TestTube size={18} />
                        </button>
                        <button
                          onClick={() => deleteSender(sender._id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete sender"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {senders.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No senders found. Add your first sender to get started.
          </div>
        )}
      </div>
    </div>
  )
}
