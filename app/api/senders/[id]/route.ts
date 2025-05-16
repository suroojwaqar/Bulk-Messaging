import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Sender from '@/models/Sender'
import { verifyWaAPIToken, getInstanceInfo } from '@/lib/waapi'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const sender = await Sender.findById(params.id)
    
    if (!sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(sender)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sender' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const { name, token, instanceId } = await request.json()

    console.log(`Updating sender ${params.id} with:`, { 
      name, 
      token: `${token.substring(0, 10)}...`, 
      instanceId 
    })

    if (!name || !token) {
      return NextResponse.json(
        { error: 'Name and token are required' },
        { status: 400 }
      )
    }

    let finalInstanceId = instanceId

    // Only try to auto-detect if instanceId is empty or not provided
    if (!finalInstanceId || finalInstanceId.trim() === '') {
      console.log('No instanceId provided, attempting to fetch from API...')
      const instanceInfo = await getInstanceInfo(token)
      if (instanceInfo.error) {
        console.log('Instance detection failed:', instanceInfo.error)
        // Don't fail here, just proceed without instanceId
        finalInstanceId = null
      } else {
        finalInstanceId = instanceInfo.instanceId!
        console.log('Auto-detected instanceId:', finalInstanceId)
      }
    } else {
      console.log('Using provided instanceId:', finalInstanceId)
    }

    // Prepare update data
    const updateData: any = {
      name,
      token,
      instanceId: finalInstanceId || null,  // Always set instanceId field
      status: 'disconnected'
    }

    // Verify token with WaAPI if we have instanceId
    if (finalInstanceId) {
      try {
        const isValidToken = await verifyWaAPIToken(token, finalInstanceId)
        updateData.status = isValidToken ? 'connected' : 'disconnected'
        console.log('Token verification result:', isValidToken)
      } catch (verifyError) {
        console.log('Token verification failed:', verifyError)
        // Keep status as disconnected
      }
    }

    console.log('Final update data:', { ...updateData, token: `${token.substring(0, 10)}...` })

    // Use findByIdAndUpdate with explicit field update
    const sender = await Sender.findByIdAndUpdate(
      params.id,
      updateData,
      { 
        new: true,  // Return the updated document
        runValidators: false,  // Skip validation for this update
        upsert: false  // Don't create if not found
      }
    )

    if (!sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      )
    }

    console.log('Sender updated successfully:', { 
      id: sender._id, 
      instanceId: sender.instanceId,
      status: sender.status 
    })

    return NextResponse.json(sender)
  } catch (error) {
    console.error('Update sender error:', error)
    return NextResponse.json(
      { error: 'Failed to update sender' },
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
    const sender = await Sender.findByIdAndDelete(params.id)

    if (!sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Sender deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete sender' },
      { status: 500 }
    )
  }
}
