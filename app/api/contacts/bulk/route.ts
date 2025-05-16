import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Contact from '@/models/Contact'
import Papa from 'papaparse'

interface ContactRow {
  name: string
  phone: string
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const formData = await request.formData()
    const file = formData.get('file') as File
    const listId = formData.get('listId') as string

    if (!file || !listId) {
      return NextResponse.json(
        { error: 'File and listId are required' },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    
    // Parse CSV with Papa Parse
    const parseResult = Papa.parse<ContactRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing errors', details: parseResult.errors },
        { status: 400 }
      )
    }

    const validContacts: ContactRow[] = []
    const errors: string[] = []

    // Validate each row
    parseResult.data.forEach((row, index) => {
      if (!row.name || !row.phone) {
        errors.push(`Row ${index + 1}: Missing name or phone`)
        return
      }
      validContacts.push(row)
    })

    if (validContacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid contacts found in CSV' },
        { status: 400 }
      )
    }

    // Insert contacts in batches
    const batchSize = 100
    const inserted = []
    
    for (let i = 0; i < validContacts.length; i += batchSize) {
      const batch = validContacts.slice(i, i + batchSize)
      const contacts = batch.map(contact => ({
        ...contact,
        listId,
        createdAt: new Date()
      }))
      
      const insertResult = await Contact.insertMany(contacts, { ordered: false })
      inserted.push(...insertResult)
    }

    return NextResponse.json({
      message: `Successfully imported ${inserted.length} contacts`,
      imported: inserted.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    )
  }
}
