import React, { useState, useRef, useEffect } from "react";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { VoiceIcon } from "@/assets/svgs/VoiceIcon";
import { VoiceCancelIcon } from "@/assets/svgs/VoiceCancelIcon";
import { VoiceLoadingIcon } from "@/assets/svgs/VoiceLoadingIcon";
import VoiceFunctions from "./VoiceFunctions";
import { useVoiceChat } from "./VoiceChatContext";

import { traderVoicePrompt } from "@/lib/ai/prompts";
import { sessionUpdate } from "@/lib/ai/voiceTools/voiceTools";

interface VoiceChatProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

const VoiceChat = ({ chatId, append }: VoiceChatProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [events, setEvents] = useState<any>([]);
  // const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  const {
    sendClientEvent,
    dataChannel,
    setDataChannel,
    isOnVoiceMode,
    setIsOnVoiceMode,
  } = useVoiceChat();

  const startSession = async () => {
    try {
      setIsConnecting(true);

      const response = await fetch("/api/openai-realtime/openai-token", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to get OpenAI token");
      }

      const data = await response.json();
      const EPHEMERAL_KEY = data.data.client_secret.value;

      const pc = new RTCPeerConnection();

      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) =>
        ((audioElement.current as HTMLAudioElement).srcObject = e.streams[0]);

      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      const dc = pc.createDataChannel("oai-events");
      setDataChannel(dc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-mini-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const stopSession = () => {
    if (dataChannel) {
      dataChannel.close();
    }

    peerConnection.current?.getSenders().forEach((sender) => {
      sender.track?.stop();
    });

    peerConnection.current?.close();

    setIsOnVoiceMode(false);
    setDataChannel(null);
    peerConnection.current = null;
  };

  useEffect(() => {
    if (dataChannel) {
      dataChannel.addEventListener("message", (e) => {
        console.log(JSON.parse(e.data));
        setEvents((prev: any) => [JSON.parse(e.data), ...prev]);
      });

      dataChannel.addEventListener("open", () => {
        setIsOnVoiceMode(true);
        setIsConnecting(false);
        setEvents([]);
      });
    }
  }, [dataChannel]);

  useEffect(() => {
    if (isOnVoiceMode) {
      sendClientEvent(sessionUpdate);
      sendClientEvent({ type: "response.create" });
    }
  }, [isOnVoiceMode]);

  return (
    <div className="cursor-pointer">
      {isOnVoiceMode ? (
        <div>
          <VoiceCancelIcon onClick={stopSession} />
          <VoiceFunctions
            events={events}
            sendClientEvent={sendClientEvent}
            isSessionActive={isOnVoiceMode}
            chatId={chatId}
            append={append}
          />
        </div>
      ) : isConnecting ? (
        <VoiceLoadingIcon />
      ) : (
        <VoiceIcon onClick={startSession} />
      )}
    </div>
  );
};

export default VoiceChat;
