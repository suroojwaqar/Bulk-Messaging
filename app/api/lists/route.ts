import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import List from '@/models/List'

export async function GET() {
  try {
    await connectToDatabase()
    const lists = await List.find({}).sort({ createdAt: -1 })
    return NextResponse.json(lists)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const list = new List({ name, description })
    await list.save()
    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    )
  }
}
