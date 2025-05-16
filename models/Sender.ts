import mongoose, { Document, Schema } from 'mongoose'

export interface ISender extends Document {
  name: string
  token: string
  instanceId?: string  // Make this optional
  status: 'connected' | 'disconnected'
  createdAt: Date
}

const SenderSchema = new Schema<ISender>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  instanceId: {
    type: String,
    required: false,  // Make this optional
    default: null,    // Add default value
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected'],
    default: 'disconnected',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Sender || mongoose.model<ISender>('Sender', SenderSchema)
