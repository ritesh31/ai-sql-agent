"use client";

import { useState, useEffect, useCallback } from "react";
import type { UIMessage } from "ai";
import { ChatInterface } from "./components/ChatInterface";
import { ConversationSidebar } from "./components/ConversationSidebar";

type Conversation = {
  id: string;
  title: string;
  updatedAt: string | null;
};

export default function Page() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string>(
    () => crypto.randomUUID()
  );
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    setConversations(data);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleNewChat = () => {
    setConversationId(crypto.randomUUID());
    setInitialMessages([]);
  };

  const handleSelectConversation = async (id: string) => {
    const res = await fetch(`/api/conversations/${id}`);
    const data = await res.json();
    setInitialMessages(data.messages ?? []);
    setConversationId(id);
  };

  return (
    <div className="flex h-screen">
      <ConversationSidebar
        conversations={conversations}
        activeId={conversationId}
        onNew={handleNewChat}
        onSelect={handleSelectConversation}
      />
      <ChatInterface
        key={conversationId}
        conversationId={conversationId}
        initialMessages={initialMessages}
        onSaved={loadConversations}
      />
    </div>
  );
}
