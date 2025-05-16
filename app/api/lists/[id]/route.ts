import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import List from '@/models/List'
import Contact from '@/models/Contact'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const list = await List.findById(params.id)
    
    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(list)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch list' },
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
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const list = await List.findByIdAndUpdate(
      params.id,
      { name, description },
      { new: true }
    )

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(list)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update list' },
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
    
    // Check if list has contacts
    const contactCount = await Contact.countDocuments({ listId: params.id })
    if (contactCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete list with ${contactCount} contacts` },
        { status: 400 }
      )
    }

    const list = await List.findByIdAndDelete(params.id)

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'List deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    )
  }
}
