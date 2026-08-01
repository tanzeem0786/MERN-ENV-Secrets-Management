import mongoose from 'mongoose';

const secretSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    encryptedValue: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    description: { type: String, trim: true, default: '' },
    environmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Environment', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Unique key per environment
secretSchema.index({ environmentId: 1, key: 1 }, { unique: true });

export default mongoose.model('Secret', secretSchema);
