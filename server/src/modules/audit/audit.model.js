import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    environmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Environment', index: true },
    secretId: { type: mongoose.Schema.Types.ObjectId, ref: 'Secret', index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, default: '' },
    resourceName: { type: String, default: '' },
    status: { type: String, default: 'success' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    metadata: { type: Object, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
