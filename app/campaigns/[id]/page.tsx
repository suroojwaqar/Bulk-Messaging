'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Clock, CheckCircle, XCircle, AlertCircle, Image } from 'lucide-react'

interface CampaignLog {
  phone: string
  status: 'sent' | 'failed'
  error?: string
  sentAt: string
}

interface Campaign {
  _id: string
  title: string
  message: string
  messageType?: 'text' | 'media'
  mediaUrl?: string
  senderId: {
    _id: string
    name: string
  }
  listId: {
    _id: string
    name: string
  }
  status: 'draft' | 'sending' | 'done' | 'failed'
  totalContacts?: number
  successCount?: number
  failureCount?: number
  logs: CampaignLog[]
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchCampaign()
    
    // Set up polling for sending campaigns
    const interval = setInterval(() => {
      if (campaign?.status === 'sending') {
        fetchCampaign()
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [params.id, campaign?.status])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCampaign(data)
      } else {
        console.error('Failed to fetch campaign')
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendCampaign = async () => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return
    }

    setSending(true)

    try {
      const response = await fetch(`/api/campaigns/${params.id}/send`, {
        method: 'POST'
      })

      if (response.ok) {
        setCampaign(prev => prev ? { ...prev, status: 'sending' } : null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send campaign')
      }
    } catch (error) {
      alert('Failed to send campaign')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-900 dark:text-white">Loading campaign details...</div>
  }

  if (!campaign) {
    return <div className="p-8 text-gray-900 dark:text-white">Campaign not found</div>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-5 w-5 text-gray-500" />
      case 'sending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'done':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      sending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      done: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      failed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-sm ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const successRate = campaign.totalContacts ? 
    ((campaign.successCount || 0) / campaign.totalContacts * 100).toFixed(1) : '0'

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{campaign.title}</h1>
        <div className="flex items-center gap-2">
          {getStatusIcon(campaign.status)}
          {getStatusBadge(campaign.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Campaign Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Sender</label>
                <p className="text-lg text-gray-900 dark:text-white">{campaign.senderId.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact List</label>
                <p className="text-lg text-gray-900 dark:text-white">{campaign.listId.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                <p className="text-lg text-gray-900 dark:text-white">{new Date(campaign.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Contacts</label>
                <p className="text-lg text-gray-900 dark:text-white">{campaign.totalContacts || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Message Type</label>
                <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  {campaign.messageType === 'media' ? (
                    <><Image size={20} /> Media Message</>
                  ) : (
                    'Text Message'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {campaign.messageType === 'media' ? 'Media & Caption' : 'Message'}
            </h2>
            {campaign.messageType === 'media' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Media URL</label>
                  <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <a 
                      href={campaign.mediaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 break-all"
                    >
                      {campaign.mediaUrl}
                    </a>
                  </div>
                </div>
                {campaign.mediaUrl && campaign.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Media Preview</label>
                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                      <img
                        src={campaign.mediaUrl}
                        alt="Media preview"
                        className="max-w-full h-auto max-h-64 rounded mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                {campaign.message && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Caption</label>
                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 whitespace-pre-wrap text-gray-900 dark:text-white">
                      {campaign.message}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 whitespace-pre-wrap text-gray-900 dark:text-white">
                {campaign.message}
              </div>
            )}
          </div>

          {/* Logs Section */}
          {campaign.logs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Delivery Logs</h2>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="text-left p-3 text-gray-900 dark:text-white">Phone</th>
                      <th className="text-left p-3 text-gray-900 dark:text-white">Status</th>
                      <th className="text-left p-3 text-gray-900 dark:text-white">Time</th>
                      <th className="text-left p-3 text-gray-900 dark:text-white">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.logs.map((log, index) => (
                      <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-3 font-mono text-sm text-gray-900 dark:text-white">{log.phone}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.status === 'sent' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(log.sentAt).toLocaleTimeString()}
                        </td>
                        <td className="p-3 text-sm text-red-600 dark:text-red-400">
                          {log.error || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-medium text-gray-900 dark:text-white">{campaign.totalContacts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sent</span>
                <span className="font-medium text-green-600 dark:text-green-400">{campaign.successCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Failed</span>
                <span className="font-medium text-red-600 dark:text-red-400">{campaign.failureCount || 0}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">{successRate}%</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Progress</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="text-gray-900 dark:text-white">{(campaign.successCount ?? 0) + (campaign.failureCount ?? 0)} / {campaign.totalContacts ?? 0}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${campaign.totalContacts ? 
                      ((campaign.successCount || 0) + (campaign.failureCount || 0)) / campaign.totalContacts * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Actions</h2>
            <div className="space-y-3">
              {campaign.status === 'draft' && (
                <button
                  onClick={sendCampaign}
                  disabled={sending}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  <Send size={20} />
                  {sending ? 'Starting...' : 'Send Campaign'}
                </button>
              )}
              {campaign.status === 'sending' && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Sending messages...</p>
                </div>
              )}
            </div>
          </div>

          {/* Timing */}
          {(campaign.startedAt || campaign.completedAt) && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Timing</h2>
              <div className="space-y-2 text-sm">
                {campaign.startedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Started</span>
                    <span className="text-gray-900 dark:text-white">{new Date(campaign.startedAt).toLocaleString()}</span>
                  </div>
                )}
                {campaign.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Completed</span>
                    <span className="text-gray-900 dark:text-white">{new Date(campaign.completedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
