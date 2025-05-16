import mongoose, { Document, Schema } from 'mongoose'

export interface ICampaignLog {
  phone: string
  status: 'sent' | 'failed'
  error?: string
  sentAt: Date
}

export interface ICampaign extends Document {
  title: string
  message: string
  messageType: 'text' | 'media'
  mediaUrl?: string
  senderId: mongoose.Types.ObjectId
  listId: mongoose.Types.ObjectId
  status: 'draft' | 'sending' | 'done' | 'failed'
  logs: ICampaignLog[]
  totalContacts?: number
  successCount?: number
  failureCount?: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

const CampaignLogSchema = new Schema<ICampaignLog>({
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    required: true,
  },
  error: {
    type: String,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
})

const CampaignSchema = new Schema<ICampaign>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: false, // Make optional for media messages
  },
  messageType: {
    type: String,
    enum: ['text', 'media'],
    default: 'text',
  },
  mediaUrl: {
    type: String,
    required: false,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'Sender',
    required: true,
  },
  listId: {
    type: Schema.Types.ObjectId,
    ref: 'List',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sending', 'done', 'failed'],
    default: 'draft',
  },
  logs: [CampaignLogSchema],
  totalContacts: {
    type: Number,
    default: 0,
  },
  successCount: {
    type: Number,
    default: 0,
  },
  failureCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
})

// Index for better query performance
CampaignSchema.index({ status: 1 })
CampaignSchema.index({ senderId: 1 })
CampaignSchema.index({ listId: 1 })

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema)
