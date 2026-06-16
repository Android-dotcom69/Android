import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Announcement =
    mongoose.models.Announcement ||
    mongoose.model("Announcement", AnnouncementSchema);

export default Announcement;
