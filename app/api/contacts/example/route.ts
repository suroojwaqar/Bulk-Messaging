import { NextResponse } from 'next/server'

export async function GET() {
  // Create example CSV content
  const csvContent = `name,phone
John Doe,+1234567890
Jane Smith,+0987654321
Mike Johnson,+1555123456
Sarah Wilson,+44207123456
David Brown,+61412345678
Lisa Garcia,+34612345678
Tom Anderson,+49301234567
Emily Davis,+33142345678
Chris Miller,+81312345678
Amanda Taylor,+86138123456`

  // Create response with CSV headers
  const response = new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="contacts-example.csv"',
    },
  })

  return response
}
