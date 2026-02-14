import mongoose from 'mongoose';

const suggestedQuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    subject: {
      type: String,
      enum: ['Math', 'Physics', 'Chemistry', 'Biology', 'Exam Prep', 'Other'],
      required: true,
    },
    globalCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

suggestedQuestionSchema.index({ subject: 1, globalCount: -1 });
suggestedQuestionSchema.index({ text: 1 }, { unique: true });

export default mongoose.model('SuggestedQuestion', suggestedQuestionSchema);
