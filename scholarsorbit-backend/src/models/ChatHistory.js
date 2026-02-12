import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false, timestamps: true }
);

const chatHistorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    messages: [messageSchema],
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

chatHistorySchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model('ChatHistory', chatHistorySchema);
