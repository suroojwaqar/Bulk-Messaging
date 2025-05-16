import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Sender from '@/models/Sender'
import { getInstanceInfo, verifyWaAPIToken } from '@/lib/waapi'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Find all senders without instanceId
    const sendersWithoutInstanceId = await Sender.find({
      $or: [
        { instanceId: { $exists: false } },
        { instanceId: '' },
        { instanceId: null }
      ]
    })

    console.log(`Found ${sendersWithoutInstanceId.length} senders without instance ID`)

    const results = []

    for (const sender of sendersWithoutInstanceId) {
      console.log(`Processing sender: ${sender.name}`)
      
      try {
        // Try to get instance ID from token
        const instanceInfo = await getInstanceInfo(sender.token)
        
        if (instanceInfo.instanceId) {
          // Update sender with detected instance ID
          await Sender.findByIdAndUpdate(sender._id, {
            instanceId: instanceInfo.instanceId
          })

          // Verify the connection with the new instance ID
          const isValid = await verifyWaAPIToken(sender.token, instanceInfo.instanceId)
          
          // Update status based on verification
          await Sender.findByIdAndUpdate(sender._id, {
            status: isValid ? 'connected' : 'disconnected'
          })

          results.push({
            senderId: sender._id,
            senderName: sender.name,
            success: true,
            instanceId: instanceInfo.instanceId,
            status: isValid ? 'connected' : 'disconnected'
          })

          console.log(`✓ Updated ${sender.name} with instance ID: ${instanceInfo.instanceId}`)
        } else {
          results.push({
            senderId: sender._id,
            senderName: sender.name,
            success: false,
            error: instanceInfo.error || 'Could not detect instance ID'
          })

          console.log(`✗ Failed to get instance ID for ${sender.name}: ${instanceInfo.error}`)
        }
      } catch (error) {
        results.push({
          senderId: sender._id,
          senderName: sender.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        console.log(`✗ Error processing ${sender.name}:`, error)
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      message: `Migration completed: ${successCount} success, ${failureCount} failed`,
      totalProcessed: sendersWithoutInstanceId.length,
      successCount,
      failureCount,
      results
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
