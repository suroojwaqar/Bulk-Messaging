import { NextRequest, NextResponse } from 'next/server'
import { sendWaAPIMessage } from '@/lib/waapi'

export async function POST(request: NextRequest) {
  try {
    const { phone, message, token, instanceId, messageType, mediaUrl } = await request.json()

    if (!phone || !token || !instanceId) {
      return NextResponse.json(
        { error: 'Phone, token, and instanceId are required' },
        { status: 400 }
      )
    }

    if (messageType === 'media' && !mediaUrl) {
      return NextResponse.json(
        { error: 'Media URL is required for media messages' },
        { status: 400 }
      )
    }

    console.log('Testing media send with:', {
      phone,
      messageType,
      mediaUrl,
      hasCaption: !!message
    })

    const result = await sendWaAPIMessage({
      phone,
      message: message || '',
      token,
      instanceId,
      messageType: messageType || 'text',
      mediaUrl
    })

    return NextResponse.json({
      success: result.success,
      message: result.message,
      error: result.error,
      messageId: result.messageId
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    )
  }
}
