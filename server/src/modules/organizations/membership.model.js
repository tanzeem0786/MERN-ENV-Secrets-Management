import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "developer", "viewer"],
      default: "viewer",
    },
  },
  { timestamps: true },
);

membershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Membership", membershipSchema);
