import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Campaign from '@/models/Campaign'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const campaign = await Campaign.findById(params.id)
      .populate('senderId', 'name')
      .populate('listId', 'name')
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(campaign)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const campaign = await Campaign.findById(params.id)

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot delete campaign while sending' },
        { status: 400 }
      )
    }

    await Campaign.findByIdAndDelete(params.id)
    return NextResponse.json({ message: 'Campaign deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
