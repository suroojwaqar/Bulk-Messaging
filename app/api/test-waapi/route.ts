import { NextRequest, NextResponse } from 'next/server'
import { sendWaAPIMessage, verifyWaAPIToken, checkWaAPIStatus, getInstanceInfo, testWaAPIConnection } from '@/lib/waapi'

export async function POST(request: NextRequest) {
  try {
    const { token, phone, message, instanceId } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Test 1: Check WaAPI service availability
    const serviceStatus = await checkWaAPIStatus()
    console.log('WaAPI Service Status:', serviceStatus)

    // Test 2: Get instance ID if not provided
    let finalInstanceId = instanceId
    if (!finalInstanceId) {
      const instanceInfo = await getInstanceInfo(token)
      if (instanceInfo.error) {
        console.log('Instance detection error:', instanceInfo.error)
        return NextResponse.json({
          success: false,
          error: `Could not get instance ID: ${instanceInfo.error}`,
          details: {
            serviceStatus,
            instanceError: instanceInfo.error
          }
        })
      }
      finalInstanceId = instanceInfo.instanceId!
    }

    console.log('Using instance ID:', finalInstanceId)

    // Test 3: Test basic connection
    const connectionTest = await testWaAPIConnection(token, finalInstanceId)
    console.log('Connection test result:', connectionTest)

    // Test 4: Verify token
    const tokenValid = await verifyWaAPIToken(token, finalInstanceId)
    console.log('Token Valid:', tokenValid)

    // Test 5: Send test message if phone and message provided
    let testMessageResult = null
    if (phone && message) {
      testMessageResult = await sendWaAPIMessage({ phone, message, token, instanceId: finalInstanceId })
      console.log('Test Message Result:', testMessageResult)

      return NextResponse.json({
        success: testMessageResult.success,
        message: testMessageResult.message,
        error: testMessageResult.error,
        details: {
          serviceStatus,
          connectionTest,
          tokenValid,
          instanceId: finalInstanceId,
          testMessageResult
        }
      })
    }

    // Just return connection test results
    return NextResponse.json({
      success: connectionTest.success,
      message: connectionTest.message || 'Connection test completed',
      error: connectionTest.error,
      details: {
        serviceStatus,
        connectionTest,
        tokenValid,
        instanceId: finalInstanceId
      }
    })

  } catch (error) {
    console.error('Test WaAPI Error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
