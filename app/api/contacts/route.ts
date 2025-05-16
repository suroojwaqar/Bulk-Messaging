import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Contact from '@/models/Contact'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const listId = searchParams.get('listId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const filter = listId ? { listId } : {}
    
    const contacts = await Contact.find(filter)
      .populate('listId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Contact.countDocuments(filter)

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { name, phone, listId } = await request.json()

    if (!name || !phone || !listId) {
      return NextResponse.json(
        { error: 'Name, phone, and listId are required' },
        { status: 400 }
      )
    }

    const contact = new Contact({ name, phone, listId })
    await contact.save()
    await contact.populate('listId', 'name')
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}
