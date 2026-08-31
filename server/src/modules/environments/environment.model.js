import mongoose from "mongoose";

const environmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true, default: "" },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

environmentSchema.index({ projectId: 1, slug: 1 }, { unique: true });
environmentSchema.index({ projectId: 1 });

export default mongoose.model("Environment", environmentSchema);
