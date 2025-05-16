import mongoose, { Document, Schema } from 'mongoose'

export interface IList extends Document {
  name: string
  description?: string
  createdAt: Date
}

const ListSchema = new Schema<IList>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.List || mongoose.model<IList>('List', ListSchema)
