import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Campaign from '@/models/Campaign'
import Contact from '@/models/Contact'
import Sender from '@/models/Sender'
import { sendWaAPIMessage, checkWaAPIStatus, getInstanceInfo } from '@/lib/waapi'

export async function POST(
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

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Campaign has already been sent or is currently sending' },
        { status: 400 }
      )
    }

    // Get sender details
    const sender = await Sender.findById(campaign.senderId)
    if (!sender || sender.status !== 'connected') {
      return NextResponse.json(
        { error: 'Sender not available or disconnected' },
        { status: 400 }
      )
    }

    console.log('Sender details:', { 
      id: sender._id, 
      name: sender.name, 
      instanceId: sender.instanceId,
      hasInstanceId: !!sender.instanceId 
    })

    // Try to get instanceId if missing
    let instanceId = sender.instanceId
    if (!instanceId) {
      console.log('No instanceId found, attempting to fetch from API...')
      const instanceInfo = await getInstanceInfo(sender.token)
      if (instanceInfo.error) {
        return NextResponse.json(
          { error: `Sender missing instance ID and auto-detection failed: ${instanceInfo.error}. Please edit the sender and add an instance ID manually.` },
          { status: 400 }
        )
      }
      instanceId = instanceInfo.instanceId!
      
      // Update the sender with the detected instance ID
      console.log('Auto-detected instanceId:', instanceId)
      await Sender.findByIdAndUpdate(sender._id, { instanceId })
    }

    // Check WaAPI service availability
    const apiStatus = await checkWaAPIStatus()
    if (!apiStatus.available) {
      return NextResponse.json(
        { error: `WaAPI service unavailable: ${apiStatus.message}` },
        { status: 503 }
      )
    }

    // Get contacts from the list
    const contacts = await Contact.find({ listId: campaign.listId })
    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts found in the list' },
        { status: 400 }
      )
    }

    // Update campaign status to sending
    campaign.status = 'sending'
    campaign.startedAt = new Date()
    campaign.totalContacts = contacts.length
    campaign.logs = [] // Clear any existing logs
    await campaign.save()

    console.log(`Starting campaign ${campaign._id} with ${contacts.length} contacts using instance ${instanceId}`)

    // Start sending process in background
    // Don't await this - let it run async
    sendMessagesWithThrottling(campaign._id.toString(), contacts, sender.token, instanceId, campaign)

    return NextResponse.json({ 
      message: 'Campaign sending started',
      totalContacts: contacts.length 
    })
  } catch (error) {
    console.error('Campaign send error:', error)
    return NextResponse.json(
      { error: 'Failed to start campaign' },
      { status: 500 }
    )
  }
}

async function sendMessagesWithThrottling(
  campaignId: string,
  contacts: any[],
  token: string,
  instanceId: string,
  campaign: any
) {
  let successCount = 0
  let failureCount = 0
  const logs: any[] = []

  console.log(`Campaign ${campaignId}: Starting to send to ${contacts.length} contacts using instance ${instanceId}`)
  console.log(`Campaign ${campaignId}: Message type: ${campaign.messageType || 'text'}`)

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i]
    console.log(`Campaign ${campaignId}: Sending to ${contact.phone} (${i + 1}/${contacts.length})`)

    try {
      // Prepare message parameters based on campaign type
      const messageParams = {
        phone: contact.phone,
        message: campaign.message || '',
        token,
        instanceId,
        messageType: campaign.messageType || 'text',
        mediaUrl: campaign.mediaUrl
      }

      // Send message with proper error handling
      const result = await sendWaAPIMessage(messageParams)

      const logEntry = {
        phone: contact.phone,
        status: result.success ? 'sent' : 'failed',
        error: result.error,
        messageId: result.messageId,
        sentAt: new Date()
      }

      logs.push(logEntry)
      
      if (result.success) {
        successCount++
        console.log(`Campaign ${campaignId}: Success - ${contact.phone} (Message ID: ${result.messageId})`)
      } else {
        failureCount++
        console.log(`Campaign ${campaignId}: Failed - ${contact.phone}: ${result.error}`)
      }

      // Update campaign with current progress every 5 messages or on last message
      if ((i + 1) % 5 === 0 || i === contacts.length - 1) {
        try {
          // Get all logs for this batch
          const batchLogs = logs.slice(-5)
          await Campaign.findByIdAndUpdate(campaignId, {
            $push: { logs: { $each: batchLogs } },
            $set: { 
              successCount,
              failureCount 
            }
          })
          console.log(`Campaign ${campaignId}: Updated progress - ${successCount} sent, ${failureCount} failed`)
        } catch (updateError) {
          console.error(`Campaign ${campaignId}: Error updating progress:`, updateError)
        }
      }

      // Throttling - wait between messages
      // Increase delay to be safer with WhatsApp rate limits
      if (i < contacts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2 seconds
      }

    } catch (error) {
      console.error(`Campaign ${campaignId}: Unexpected error for ${contact.phone}:`, error)
      failureCount++
      
      const logEntry = {
        phone: contact.phone,
        status: 'failed',
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sentAt: new Date()
      }

      logs.push(logEntry)
    }
  }

  // Final update with all remaining logs
  try {
    await Campaign.findByIdAndUpdate(campaignId, {
      status: 'done',
      completedAt: new Date(),
      successCount,
      failureCount
    })

    console.log(`Campaign ${campaignId} completed: ${successCount} sent, ${failureCount} failed`)
  } catch (finalError) {
    console.error(`Campaign ${campaignId}: Error in final update:`, finalError)
    
    // Try to at least mark as completed even if logs fail
    try {
      await Campaign.findByIdAndUpdate(campaignId, {
        status: 'failed',
        completedAt: new Date(),
        successCount,
        failureCount
      })
    } catch (lastError) {
      console.error(`Campaign ${campaignId}: Failed to update final status:`, lastError)
    }
  }
}
