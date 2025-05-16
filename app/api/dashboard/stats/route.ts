import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Campaign from '@/models/Campaign'
import Contact from '@/models/Contact'
import Sender from '@/models/Sender'
import List from '@/models/List'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }
    
    // Total counts
    const [totalCampaigns, totalContacts, totalSenders, totalLists] = await Promise.all([
      Campaign.countDocuments(),
      Contact.countDocuments(),
      Sender.countDocuments(),
      List.countDocuments()
    ])
    
    // Recent activity (last 30 days)
    const lastMonth = new Date()
    lastMonth.setDate(now.getDate() - 30)
    
    const [recentCampaigns, recentContacts, recentSenders] = await Promise.all([
      Campaign.countDocuments({ createdAt: { $gte: lastMonth } }),
      Contact.countDocuments({ createdAt: { $gte: lastMonth } }),
      Sender.countDocuments({ createdAt: { $gte: lastMonth } })
    ])
    
    // Campaign status distribution
    const campaignsByStatus = await Campaign.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
    
    const statusCounts = {
      draft: 0,
      sending: 0,
      done: 0,
      failed: 0
    }
    
    campaignsByStatus.forEach(item => {
      if (item._id in statusCounts) {
        statusCounts[item._id as keyof typeof statusCounts] = item.count
      }
    })
    
    // Message type distribution
    const messagesByType = await Campaign.aggregate([
      {
        $group: {
          _id: '$messageType',
          count: { $sum: 1 }
        }
      }
    ])
    
    const typeCounts = {
      text: 0,
      media: 0
    }
    
    messagesByType.forEach(item => {
      const messageType = item._id || 'text' // Default to text for null values
      if (messageType in typeCounts) {
        typeCounts[messageType as keyof typeof typeCounts] = item.count
      }
    })
    
    // Total messages sent and success rate
    const campaigns = await Campaign.find({
      status: { $in: ['done', 'failed'] }
    }).select('successCount failureCount totalContacts')
    
    let totalMessagesSent = 0
    let totalSuccessful = 0
    let totalFailed = 0
    
    campaigns.forEach(campaign => {
      totalMessagesSent += (campaign.successCount || 0) + (campaign.failureCount || 0)
      totalSuccessful += campaign.successCount || 0
      totalFailed += campaign.failureCount || 0
    })
    
    const successRate = totalMessagesSent > 0 ? 
      Math.round((totalSuccessful / totalMessagesSent) * 100) : 0
    
    // Daily stats for the selected range
    const dailyStats = await Campaign.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['done', 'failed'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          campaigns: { $sum: 1 },
          totalSent: { $sum: { $add: ['$successCount', '$failureCount'] } },
          successful: { $sum: '$successCount' },
          failed: { $sum: '$failureCount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])
    
    // Fill in missing dates
    const filledDailyStats = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const existingData = dailyStats.find(stat => stat._id === dateStr)
      
      filledDailyStats.push({
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sent: existingData?.totalSent || 0,
        success: existingData?.successful || 0,
        failed: existingData?.failed || 0,
        campaigns: existingData?.campaigns || 0
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Recent campaigns for the table
    const recentCampaignsData = await Campaign.find()
      .populate('senderId', 'name')
      .populate('listId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status messageType successCount failureCount totalContacts createdAt')
    
    const dashboardStats = {
      totalCampaigns,
      totalContacts,
      totalSenders,
      totalLists,
      totalMessagesSent,
      successRate,
      recentActivity: {
        campaigns: recentCampaigns,
        contacts: recentContacts,
        senders: recentSenders
      },
      campaignsByStatus: statusCounts,
      messagesByType: typeCounts,
      dailyStats: filledDailyStats,
      recentCampaigns: recentCampaignsData.map(campaign => ({
        _id: campaign._id,
        title: campaign.title,
        status: campaign.status,
        messageType: campaign.messageType || 'text',
        successCount: campaign.successCount || 0,
        failureCount: campaign.failureCount || 0,
        totalContacts: campaign.totalContacts || 0,
        createdAt: campaign.createdAt
      }))
    }
    
    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
