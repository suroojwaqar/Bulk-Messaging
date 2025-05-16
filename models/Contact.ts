import mongoose, { Document, Schema } from 'mongoose'

export interface IContact extends Document {
  name: string
  phone: string
  listId: mongoose.Types.ObjectId
  createdAt: Date
}

const ContactSchema = new Schema<IContact>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  listId: {
    type: Schema.Types.ObjectId,
    ref: 'List',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for better query performance
ContactSchema.index({ listId: 1 })
ContactSchema.index({ phone: 1 })

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema)
