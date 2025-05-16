import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Campaign from '@/models/Campaign'
import Contact from '@/models/Contact'
import Sender from '@/models/Sender'

export async function GET() {
  try {
    await connectToDatabase()
    const campaigns = await Campaign.find({})
      .populate('senderId', 'name')
      .populate('listId', 'name')
      .sort({ createdAt: -1 })
      
    return NextResponse.json(campaigns)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { title, message, senderId, listId, messageType, mediaUrl } = await request.json()

    if (!title || !senderId || !listId) {
      return NextResponse.json(
        { error: 'Title, sender, and list are required' },
        { status: 400 }
      )
    }

    // Validate message content based on type
    if (messageType === 'media') {
      if (!mediaUrl) {
        return NextResponse.json(
          { error: 'Media URL is required for media messages' },
          { status: 400 }
        )
      }
    } else {
      if (!message) {
        return NextResponse.json(
          { error: 'Message content is required for text messages' },
          { status: 400 }
        )
      }
    }

    // Verify sender exists and is connected
    const sender = await Sender.findById(senderId)
    if (!sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      )
    }

    if (sender.status !== 'connected') {
      return NextResponse.json(
        { error: 'Sender is not connected' },
        { status: 400 }
      )
    }

    // Count contacts in the list
    const contactCount = await Contact.countDocuments({ listId })
    if (contactCount === 0) {
      return NextResponse.json(
        { error: 'No contacts found in the selected list' },
        { status: 400 }
      )
    }

    const campaign = new Campaign({
      title,
      message: message || '', // Empty string for media-only messages
      messageType: messageType || 'text',
      mediaUrl: mediaUrl || undefined,
      senderId,
      listId,
      totalContacts: contactCount,
      status: 'draft'
    })

    await campaign.save()
    await campaign.populate(['senderId', 'listId'])
    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
