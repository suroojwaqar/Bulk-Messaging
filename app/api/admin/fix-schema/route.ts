import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Sender from '@/models/Sender'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    console.log('Starting schema fix for senders...')
    
    // Get all senders
    const senders = await Sender.find({})
    console.log(`Found ${senders.length} senders`)
    
    const results = []
    
    // Update each sender to ensure instanceId field exists
    for (const sender of senders) {
      try {
        // Check if instanceId field exists
        const hasInstanceId = sender.hasOwnProperty('instanceId')
        console.log(`Sender ${sender.name}: hasInstanceId = ${hasInstanceId}, value = ${sender.instanceId}`)
        
        // Update the sender to ensure the field exists in the database
        const updatedSender = await Sender.findByIdAndUpdate(
          sender._id,
          { 
            $set: { 
              name: sender.name,
              token: sender.token,
              status: sender.status,
              instanceId: sender.instanceId || null,  // Ensure field exists
              createdAt: sender.createdAt
            }
          },
          { 
            new: true, 
            upsert: false,
            runValidators: false  // Skip validation for this fix
          }
        )
        
        results.push({
          senderId: sender._id,
          senderName: sender.name,
          before: {
            hasInstanceId,
            instanceId: sender.instanceId
          },
          after: {
            instanceId: updatedSender?.instanceId
          },
          success: true
        })
        
        console.log(`✓ Fixed sender ${sender.name}`)
        
      } catch (error) {
        console.error(`✗ Error fixing sender ${sender.name}:`, error)
        results.push({
          senderId: sender._id,
          senderName: sender.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    // Also run a collection update to ensure all documents have the field
    console.log('Running collection-wide update...')
    const bulkUpdate = await Sender.updateMany(
      {},
      { 
        $set: { 
          instanceId: { $ifNull: ['$instanceId', null] }
        }
      }
    )
    
    console.log('Schema fix completed')
    
    return NextResponse.json({
      message: 'Schema fix completed',
      totalSenders: senders.length,
      results,
      bulkUpdate: {
        matched: bulkUpdate.matchedCount,
        modified: bulkUpdate.modifiedCount
      }
    })
    
  } catch (error) {
    console.error('Schema fix error:', error)
    return NextResponse.json(
      { error: 'Schema fix failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
