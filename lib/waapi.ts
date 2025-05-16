interface SendMessageResponse {
  success: boolean
  message?: string
  error?: string
  messageId?: string
  waId?: string
}

interface SendMessageParams {
  phone: string
  message: string
  token: string
  instanceId: string
  messageType?: 'text' | 'media'
  mediaUrl?: string
}

export async function sendWaAPIMessage({ phone, message, token, instanceId, messageType = 'text', mediaUrl }: SendMessageParams): Promise<SendMessageResponse> {
  try {
    // Clean phone number - remove any non-numeric characters except +
    let cleanPhone = phone.replace(/[^\d+]/g, '')
    
    // Remove + if present and ensure we have just numbers
    if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1)
    }
    
    // Validate phone number format
    if (cleanPhone.length < 10) {
      return {
        success: false,
        error: `Invalid phone number format: ${phone} (cleaned: ${cleanPhone})`
      }
    }

    // Choose the correct endpoint based on message type
    const endpoint = messageType === 'media' ? 'send-media' : 'send-message'
    const url = `https://waapi.app/api/v1/instances/${instanceId}/client/action/${endpoint}`

    // Prepare request body based on message type
    let requestBody: any = {
      chatId: `${cleanPhone}@c.us`
    }

    if (messageType === 'media') {
      if (!mediaUrl) {
        return {
          success: false,
          error: 'Media URL is required for media messages'
        }
      }
      requestBody.mediaUrl = mediaUrl
      // Add caption if message is provided
      if (message && message.trim()) {
        requestBody.caption = message
      }
    } else {
      requestBody.message = message
    }

    console.log('WaAPI Request:', {
      url,
      method: 'POST',
      headers: { 
        'authorization': `Bearer ${token}`,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: requestBody
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${token}`,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('WaAPI Response Status:', response.status)
    console.log('WaAPI Response Headers:', Object.fromEntries(response.headers.entries()))

    // Get response text first
    const responseText = await response.text()
    console.log('WaAPI Response Text:', responseText)
    
    if (!responseText || responseText.trim() === '') {
      return {
        success: false,
        error: `Empty response from WaAPI (Status: ${response.status})`
      }
    }

    // Try to parse JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      return {
        success: false,
        error: `Invalid JSON response (Status ${response.status}): ${responseText.substring(0, 200)}...`
      }
    }

    console.log('WaAPI Parsed Response:', data)

    // Check HTTP status
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || data.details || `HTTP ${response.status}: ${JSON.stringify(data)}`
      }
    }

    // WaAPI success response handling
    if (data.status === 'success' || data.success === true || response.ok) {
      return {
        success: true,
        message: data.message || `${messageType} message sent successfully`,
        messageId: data.data?.messageId || data.messageId || data.id,
        waId: data.data?.waId || data.waId
      }
    } else {
      return {
        success: false,
        error: data.error || data.message || data.details || `Unexpected response: ${JSON.stringify(data)}`
      }
    }
  } catch (error) {
    console.error('WaAPI Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    }
  }
}

export async function verifyWaAPIToken(token: string, instanceId: string): Promise<boolean> {
  try {
    // Use the correct domain and API path for verification
    const url = `https://waapi.app/api/v1/instances/${instanceId}/client/action/get-connection-state`
    console.log('Verifying token with URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${token}`,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
    })

    console.log('Token verification response:', response.status)

    // For token verification, we check if we get a proper response
    // 401 = invalid token, 200/other = valid token
    if (response.status === 401) {
      return false
    }

    // If we get any other status (including 404, 400, etc.), the token is probably valid
    return true
  } catch (error) {
    console.error('Token verification error:', error)
    // On network error, assume token might be valid
    return true
  }
}

// Check WaAPI service status using correct domain
export async function checkWaAPIStatus(): Promise<{ available: boolean; message: string }> {
  try {
    // Check the correct domain: waapi.app
    const response = await fetch('https://waapi.app', {
      method: 'HEAD',
    })
    
    return {
      available: response.ok,
      message: response.ok ? 'WaAPI service is available' : `WaAPI returned ${response.status}`
    }
  } catch (error) {
    return {
      available: false,
      message: 'Unable to reach WaAPI service'
    }
  }
}

// Get instance info using correct API path
export async function getInstanceInfo(token: string): Promise<{ instanceId?: string; error?: string }> {
  try {
    // Use correct API path: /api/v1/instances
    const response = await fetch('https://waapi.app/api/v1/instances', {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${token}`,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
    })

    console.log('Get instances response:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      return { error: `Failed to get instances: ${response.status} - ${errorText}` }
    }

    const data = await response.json()
    console.log('Instances data:', data)
    
    // WaAPI might return data in different formats
    // Check for common response structures
    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      return { instanceId: data.data[0].id }
    } else if (data && Array.isArray(data) && data.length > 0) {
      return { instanceId: data[0].id }
    } else if (data && data.instances && data.instances.length > 0) {
      return { instanceId: data.instances[0].id }
    }

    return { error: 'No instances found in response' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Test connection using the correct API structure
export async function testWaAPIConnection(token: string, instanceId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Try to get instance details using correct path
    const url = `https://waapi.app/api/v1/instances/${instanceId}`
    console.log('Testing connection with URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${token}`,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
    })

    const responseText = await response.text()
    console.log('Test connection response:', response.status, responseText)

    if (response.ok) {
      return {
        success: true,
        message: 'Connection successful'
      }
    } else {
      return {
        success: false,
        error: `Connection failed: ${response.status} - ${responseText}`
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
