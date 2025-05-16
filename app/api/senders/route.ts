import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Sender from '@/models/Sender'
import { verifyWaAPIToken, getInstanceInfo } from '@/lib/waapi'

export async function GET() {
  try {
    await connectToDatabase()
    const senders = await Sender.find({}).sort({ createdAt: -1 })
    return NextResponse.json(senders)
  } catch (error) {
    console.error('Get senders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch senders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { name, token, instanceId } = await request.json()

    console.log('Creating sender with data:', { name, token: `${token.substring(0, 10)}...`, instanceId })

    if (!name || !token) {
      return NextResponse.json(
        { error: 'Name and token are required' },
        { status: 400 }
      )
    }

    let finalInstanceId = instanceId

    // If instanceId is not provided, try to get it from the token
    if (!finalInstanceId) {
      console.log('No instanceId provided, attempting to fetch from API...')
      const instanceInfo = await getInstanceInfo(token)
      if (instanceInfo.error) {
        console.log('Instance detection failed:', instanceInfo.error)
        // Don't fail here, just proceed without instanceId
        // User can add it later via edit
      } else {
        finalInstanceId = instanceInfo.instanceId!
        console.log('Auto-detected instanceId:', finalInstanceId)
      }
    }

    // Create sender object
    const senderData: any = {
      name,
      token,
      status: 'disconnected'
    }

    // Only add instanceId if we have one
    if (finalInstanceId) {
      senderData.instanceId = finalInstanceId
      // Verify token with WaAPI if we have instanceId
      const isValidToken = await verifyWaAPIToken(token, finalInstanceId)
      senderData.status = isValidToken ? 'connected' : 'disconnected'
    }

    console.log('Creating sender with final data:', { ...senderData, token: `${token.substring(0, 10)}...` })

    const sender = new Sender(senderData)
    await sender.save()
    
    console.log('Sender created successfully:', { id: sender._id, instanceId: sender.instanceId })
    
    return NextResponse.json(sender, { status: 201 })
  } catch (error) {
    console.error('Create sender error:', error)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Token already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create sender' },
      { status: 500 }
    )
  }
}
