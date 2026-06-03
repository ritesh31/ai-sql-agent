"use client";

import { useState, useEffect, useCallback } from "react";
import type { UIMessage } from "ai";
import { ChatInterface } from "./components/ChatInterface";
import { ConversationSidebar } from "./components/ConversationSidebar";
import { ConfirmDialog } from "./components/ConfirmDialog";

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const handleDeleteConversation = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await fetch(`/api/conversations/${deleteConfirmId}`, { method: "DELETE" });
      await loadConversations();
      // If deleted conversation was active, create new chat
      if (deleteConfirmId === conversationId) {
        setConversationId(crypto.randomUUID());
        setInitialMessages([]);
      }
    } catch (e) {
      console.error("Failed to delete conversation:", e);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="flex h-screen">
      <ConversationSidebar
        conversations={conversations}
        activeId={conversationId}
        onNew={handleNewChat}
        onSelect={handleSelectConversation}
        onDelete={handleDeleteConversation}
      />
      <ChatInterface
        key={conversationId}
        conversationId={conversationId}
        initialMessages={initialMessages}
        onSaved={loadConversations}
      />
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Delete Conversation?"
        message="This conversation and all its messages will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
