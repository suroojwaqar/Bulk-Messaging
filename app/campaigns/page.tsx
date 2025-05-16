'use client'

import { useState, useEffect } from 'react'
import { Send, Plus, Eye, Trash2, Image } from 'lucide-react'

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
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string[]>([])

  useEffect(() => {
    fetchCampaigns()
    // Set up polling for campaigns that are sending
    const interval = setInterval(() => {
      fetchCampaigns()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return
    }

    setSending([...sending, campaignId])

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: 'POST'
      })

      if (response.ok) {
        // Update the campaign status immediately
        setCampaigns(campaigns.map(c => 
          c._id === campaignId 
            ? { ...c, status: 'sending' as const }
            : c
        ))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send campaign')
      }
    } catch (error) {
      alert('Failed to send campaign')
    } finally {
      setSending(sending.filter(id => id !== campaignId))
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCampaigns(campaigns.filter(c => c._id !== campaignId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete campaign')
      }
    } catch (error) {
      alert('Failed to delete campaign')
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

  const getProgressText = (campaign: Campaign) => {
    if (campaign.status === 'draft') return 'Not sent'
    if (campaign.status === 'sending') return 'Sending...'
    if (campaign.status === 'done' || campaign.status === 'failed') {
      const success = campaign.successCount || 0
      const failed = campaign.failureCount || 0
      const total = campaign.totalContacts || 0
      return `${success} sent, ${failed} failed of ${total} total`
    }
    return ''
  }

  if (loading) {
    return <div className="p-8 text-gray-900 dark:text-white">Loading campaigns...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
        <a
          href="/campaigns/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          New Campaign
        </a>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left p-4 text-gray-900 dark:text-white">Title</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Sender</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">List</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Status</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Progress</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Created</th>
              <th className="text-left p-4 text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign._id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{campaign.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {campaign.messageType === 'media' ? (
                        <span className="flex items-center gap-1">
                          <Image size={12} />
                          Media: {campaign.message || 'No caption'}
                        </span>
                      ) : (
                        campaign.message
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-700 dark:text-gray-300">{campaign.senderId?.name || 'No Sender'}</td>
                <td className="p-4 text-gray-700 dark:text-gray-300">{campaign.listId?.name || 'No List'}</td>
                <td className="p-4">{getStatusBadge(campaign.status)}</td>
                <td className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">{getProgressText(campaign)}</div>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <a
                      href={`/campaigns/${campaign._id}`}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </a>
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => sendCampaign(campaign._id)}
                        disabled={sending.includes(campaign._id)}
                        className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 transition-colors"
                        title="Send Campaign"
                      >
                        <Send size={18} />
                      </button>
                    )}
                    {campaign.status !== 'sending' && (
                      <button
                        onClick={() => deleteCampaign(campaign._id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Delete Campaign"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {campaigns.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Send size={48} className="mx-auto mb-4 opacity-50" />
            No campaigns found. Create your first campaign to start messaging.
          </div>
        )}
      </div>
    </div>
  )
}
