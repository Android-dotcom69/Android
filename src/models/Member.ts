import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, enum: ["head", "member"], required: true },
    email: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
});

const Member = mongoose.models.Member || mongoose.model("Member", MemberSchema);

export default Member;
