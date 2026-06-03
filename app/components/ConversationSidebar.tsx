type Conversation = {
  id: string;
  title: string;
  updatedAt: string | null;
};

type Props = {
  conversations: Conversation[];
  activeId: string;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ConversationSidebar({
  conversations,
  activeId,
  onNew,
  onSelect,
  onDelete,
}: Props) {
  return (
    <div className="w-56 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-900 shrink-0 h-screen">
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onNew}
          className="w-full px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left font-medium"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 p-3">
            No conversations yet.
          </p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`group px-3 py-2.5 text-sm border-b border-zinc-100 dark:border-zinc-800 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 min-w-0 ${
              c.id === activeId
                ? "bg-zinc-200 dark:bg-zinc-700"
                : ""
            }`}
          >
            <button
              onClick={() => onSelect(c.id)}
              className="flex-1 text-left min-w-0"
            >
              <div className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                {c.title}
              </div>
              {c.updatedAt && (
                <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {new Date(c.updatedAt).toLocaleDateString()}
                </div>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              className="flex-shrink-0 px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 dark:hover:bg-red-900/50"
              title="Delete conversation"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
