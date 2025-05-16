'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { 
  TrendingUp, Users, Send, MessageSquare, Activity, Calendar,
  CheckCircle, XCircle, Clock, AlertTriangle, Image, Eye
} from 'lucide-react'

interface DashboardStats {
  totalCampaigns: number
  totalContacts: number
  totalSenders: number
  totalLists: number
  totalMessagesSent: number
  successRate: number
  recentActivity: {
    campaigns: number
    contacts: number
    senders: number
  }
  campaignsByStatus: {
    draft: number
    sending: number
    done: number
    failed: number
  }
  messagesByType: {
    text: number
    media: number
  }
  dailyStats: Array<{
    date: string
    sent: number
    success: number
    failed: number
    campaigns: number
  }>
  recentCampaigns: Array<{
    _id: string
    title: string
    status: string
    messageType: string
    successCount: number
    failureCount: number
    totalContacts: number
    createdAt: string
  }>
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#6366F1',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1'
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/dashboard/stats?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Failed to load dashboard data
        </div>
      </div>
    )
  }

  const pieChartData = [
    { name: 'Done', value: stats.campaignsByStatus.done, color: COLORS.success },
    { name: 'Draft', value: stats.campaignsByStatus.draft, color: COLORS.info },
    { name: 'Sending', value: stats.campaignsByStatus.sending, color: COLORS.warning },
    { name: 'Failed', value: stats.campaignsByStatus.failed, color: COLORS.danger }
  ]

  const messageTypeData = [
    { name: 'Text Messages', value: stats.messagesByType.text, color: COLORS.primary },
    { name: 'Media Messages', value: stats.messagesByType.media, color: COLORS.purple }
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Campaign performance and analytics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Campaigns"
          value={stats.totalCampaigns}
          icon={<Send className="w-6 h-6" />}
          color="blue"
          trend={stats.recentActivity.campaigns}
          trendLabel="this month"
        />
        <MetricCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon={<Users className="w-6 h-6" />}
          color="green"
          trend={stats.recentActivity.contacts}
          trendLabel="this month"
        />
        <MetricCard
          title="Messages Sent"
          value={stats.totalMessagesSent}
          icon={<MessageSquare className="w-6 h-6" />}
          color="purple"
          trend={stats.dailyStats.reduce((acc, day) => acc + day.sent, 0)}
          trendLabel={`last ${timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}`}
        />
        <MetricCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="emerald"
          isPercentage
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Campaign Status Distribution */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Campaign Status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Message Type Distribution */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Message Types</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={messageTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {messageTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Stats</h2>
            <div className="space-y-4">
              <StatItem 
                icon={<Users className="w-5 h-5 text-blue-500" />}
                label="Active Senders"
                value={stats.totalSenders}
              />
              <StatItem 
                icon={<Calendar className="w-5 h-5 text-green-500" />}
                label="Contact Lists"
                value={stats.totalLists}
              />
              <StatItem 
                icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
                label="Successful Sends"
                value={stats.dailyStats.reduce((acc, day) => acc + day.success, 0)}
              />
              <StatItem 
                icon={<XCircle className="w-5 h-5 text-red-500" />}
                label="Failed Sends"
                value={stats.dailyStats.reduce((acc, day) => acc + day.failed, 0)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Messages Sent Over Time */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Messages Sent Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sent" 
                  stroke={COLORS.primary} 
                  fill={`${COLORS.primary}20`}
                  name="Total Sent"
                />
                <Area 
                  type="monotone" 
                  dataKey="success" 
                  stroke={COLORS.success} 
                  fill={`${COLORS.success}20`}
                  name="Successful"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success vs Failure Rate */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Success vs Failure Rate</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="success" fill={COLORS.success} name="Successful" />
                <Bar dataKey="failed" fill={COLORS.danger} name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Campaigns</h2>
          <a 
            href="/campaigns" 
            className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View All
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left p-4 text-gray-900 dark:text-white">Campaign</th>
                <th className="text-left p-4 text-gray-900 dark:text-white">Type</th>
                <th className="text-left p-4 text-gray-900 dark:text-white">Status</th>
                <th className="text-left p-4 text-gray-900 dark:text-white">Success Rate</th>
                <th className="text-left p-4 text-gray-900 dark:text-white">Progress</th>
                <th className="text-left p-4 text-gray-900 dark:text-white">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCampaigns.map((campaign) => (
                <tr key={campaign._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">{campaign.title}</div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      {campaign.messageType === 'media' ? <Image className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      {campaign.messageType === 'media' ? 'Media' : 'Text'}
                    </span>
                  </td>
                  <td className="p-4">
                    <CampaignStatusBadge status={campaign.status} />
                  </td>
                  <td className="p-4">
                    <span className="text-gray-900 dark:text-white">
                      {campaign.totalContacts > 0 
                        ? `${((campaign.successCount / campaign.totalContacts) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${campaign.totalContacts > 0 
                              ? ((campaign.successCount + campaign.failureCount) / campaign.totalContacts) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {campaign.successCount + campaign.failureCount}/{campaign.totalContacts}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Helper Components
interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'emerald'
  trend?: number
  trendLabel?: string
  isPercentage?: boolean
}

function MetricCard({ title, value, icon, color, trend, trendLabel, isPercentage }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">
                +{trend} {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: number | string
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

function CampaignStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    draft: { color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300', icon: Clock },
    sending: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: Activity },
    done: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle },
    failed: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: XCircle }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  const Icon = config.icon

  return (
    <span className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${config.color}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
