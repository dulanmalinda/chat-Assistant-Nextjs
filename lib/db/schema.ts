"use server";

import mongoose from "mongoose";

const { Schema } = mongoose;

if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGO_URI!);
}

// User Schema
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Chat Schema
const ChatSchema = new Schema({
  id: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  visibility: { type: String, enum: ["private", "public"], default: "private" },
});

// Message Schema
const MessageSchema = new Schema({
  id: { type: String, required: true, unique: true },
  chatId: { type: String, required: true },
  role: { type: String, required: true }, // Added role field
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Vote Schema
const VoteSchema = new Schema({
  chatId: { type: String, required: true },
  messageId: { type: String, required: true },
  isUpvoted: { type: Boolean, required: true },
});

// Document Schema
const DocumentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  kind: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Suggestion Schema
const SuggestionSchema = new Schema({
  documentId: { type: String, required: true },
  documentCreatedAt: { type: Date, required: true },
  content: { type: String, required: true },
});

// Export Models
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
export const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const Vote = mongoose.models.Vote || mongoose.model("Vote", VoteSchema);
export const Document =
  mongoose.models.Document || mongoose.model("Document", DocumentSchema);
export const Suggestion =
  mongoose.models.Suggestion || mongoose.model("Suggestion", SuggestionSchema);
