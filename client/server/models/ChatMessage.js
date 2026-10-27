import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'assistant'],
    },
    content: {
      type: String,
      required: true,
      maxlength: [4000, 'Message cannot exceed 4000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

ChatMessageSchema.index({ caseId: 1, createdAt: 1 });

export const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
