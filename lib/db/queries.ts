"use server";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { User, Chat, Message, Vote, Document, Suggestion } from "./schema";

// User Functions
export async function getUser(email: string) {
  return await User.findOne({ email });
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);
  return await User.create({ email, password: hash });
}

// Chat Functions
export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  return await Chat.create({ id, userId, title });
}

export async function deleteChatById({ id }: { id: string }) {
  await Vote.deleteMany({ chatId: id });
  await Message.deleteMany({ chatId: id });
  return await Chat.deleteOne({ id });
}

export async function getChatsByUserId({ id }: { id: string }) {
  return await Chat.find({ userId: id }).sort({ createdAt: -1 });
}

export async function getChatById({ id }: { id: string }) {
  return await Chat.findOne({ id });
}

// Message Functions
export async function saveMessages({
  messages,
}: {
  messages: Array<{
    id: string;
    chatId: string;
    role: string;
    content: string;
    createdAt?: Date;
  }>;
}) {
  return await Message.insertMany(messages);
}

export async function getMessagesByChatId({ id }: { id: string }) {
  return await Message.find({ chatId: id }).sort({ createdAt: 1 });
}

export async function getMessageById({ id }: { id: string }) {
  return await Message.findOne({ id });
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  return await Message.deleteMany({ chatId, createdAt: { $gte: timestamp } });
}

// Vote Functions
export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  return await Vote.findOneAndUpdate(
    { chatId, messageId },
    { isUpvoted: type === "up" },
    { upsert: true, new: true }
  );
}

export async function getVotesByChatId({ id }: { id: string }) {
  return await Vote.find({ chatId: id });
}

// Document Functions
export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: string;
  content: string;
  userId: string;
}) {
  return await Document.create({ id, title, kind, content, userId });
}

export async function getDocumentsById({ id }: { id: string }) {
  return await Document.find({ id }).sort({ createdAt: 1 });
}

export async function getDocumentById({ id }: { id: string }) {
  return await Document.findOne({ id }).sort({ createdAt: -1 });
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  await Suggestion.deleteMany({
    documentId: id,
    documentCreatedAt: { $gt: timestamp },
  });
  return await Document.deleteMany({ id, createdAt: { $gt: timestamp } });
}

// Suggestion Functions
export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<{ documentId: string; content: string }>;
}) {
  return await Suggestion.insertMany(suggestions);
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  return await Suggestion.find({ documentId });
}

// Chat Visibility Update
export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  return await Chat.findOneAndUpdate(
    { id: chatId },
    { visibility },
    { new: true }
  );
}
