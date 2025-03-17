"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface VoiceMessage {
  id: string;
  content: string;
  createdAt: Date;
  role: "user" | "assistant";
}

interface VoiceChatContextValue {
  dataChannel: RTCDataChannel | null;
  setDataChannel: (channel: RTCDataChannel | null) => void;
  sendClientEvent: (message: Record<string, any>) => void;
  toolProcessing: boolean;
  setToolProcessing: (value: boolean) => void;
  voiceMessages: VoiceMessage[];
  addVoiceMessage: (message: Omit<VoiceMessage, "createdAt">) => void;
  isOnVoiceMode: boolean;
  setIsOnVoiceMode: (value: boolean) => void;
}

const VoiceChatContext = createContext<VoiceChatContextValue | undefined>(
  undefined
);

export const useVoiceChat = () => {
  const context = useContext(VoiceChatContext);
  if (!context) {
    throw new Error("useVoiceChat must be used within a VoiceChatProvider");
  }
  return context;
};

export const VoiceChatProvider = ({ children }: { children: ReactNode }) => {
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [toolProcessing, setToolProcessing] = useState(false);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [isOnVoiceMode, setIsOnVoiceMode] = useState(false); // New state variable

  const sendClientEvent = (message: Record<string, any>) => {
    if (dataChannel) {
      const eventMessage = {
        ...message,
        event_id: message.event_id || crypto.randomUUID(),
      };
      dataChannel.send(JSON.stringify(eventMessage));
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message
      );
    }
  };

  const addVoiceMessage = (message: Omit<VoiceMessage, "createdAt">) => {
    setVoiceMessages((prev) => [
      ...prev,
      { ...message, createdAt: new Date() },
    ]);
  };

  const value: VoiceChatContextValue = {
    dataChannel,
    setDataChannel,
    sendClientEvent,
    toolProcessing,
    setToolProcessing,
    voiceMessages,
    addVoiceMessage,
    isOnVoiceMode,
    setIsOnVoiceMode,
  };

  return (
    <VoiceChatContext.Provider value={value}>
      {children}
    </VoiceChatContext.Provider>
  );
};
