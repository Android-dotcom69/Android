import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

export default Project;
