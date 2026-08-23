import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  Clock3,
  History,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import {
  hasPermission,
  PERMISSIONS,
} from "@/shared/permissions/permissions";
import { conversationsApi, sendAgentMessage } from "../api";

const promptOptions = [
  {
    permission: PERMISSIONS.REPORTS_PROFIT_READ,
    prompt: "Give me a summary of business performance",
  },
  {
    permission: PERMISSIONS.REPORTS_MONTHLY_SALES_READ,
    prompt: "Show sales for the last 6 months",
  },
  {
    permission: PERMISSIONS.REPORTS_TOP_PRODUCTS_READ,
    prompt: "Show the top 5 products by revenue",
  },
  {
    permission: PERMISSIONS.REPORTS_RECEIVABLES_READ,
    prompt: "Show me the overdue customer receivables",
  },
  {
    permission: PERMISSIONS.INVENTORY_LOW_STOCK_READ,
    prompt: "Show me the low stock products",
  },
  {
    permission: PERMISSIONS.REPORTS_INVENTORY_VALUATION_READ,
    prompt: "Summarize the current inventory value",
  },
  {
    permission: PERMISSIONS.INVENTORY_READ,
    prompt: "Give me an overview of stock by warehouse",
  },
  {
    permission: PERMISSIONS.SALES_ORDERS_READ,
    prompt: "Show me the latest sales orders",
  },
  {
    permission: PERMISSIONS.QUOTATIONS_READ,
    prompt: "Show quotations waiting for a customer decision",
  },
  {
    permission: PERMISSIONS.CUSTOMERS_READ,
    prompt: "Give me a summary of our customers",
  },
  {
    permission: PERMISSIONS.PURCHASE_ORDERS_APPROVE,
    prompt: "Show purchase orders waiting for my approval",
  },
  {
    permission: PERMISSIONS.PURCHASE_ORDERS_READ,
    prompt: "Show me the latest purchase orders",
  },
  {
    permission: PERMISSIONS.GOODS_RECEIPTS_READ,
    prompt: "Show recently received purchase orders",
  },
  {
    permission: PERMISSIONS.SUPPLIERS_READ,
    prompt: "Give me a summary of active suppliers",
  },
  {
    permission: PERMISSIONS.INVOICES_READ,
    prompt: "Show me the latest invoices",
  },
  {
    permission: PERMISSIONS.PAYMENTS_READ,
    prompt: "Summarize recent customer payments",
  },
  {
    permission: PERMISSIONS.ACCOUNTS_READ,
    prompt: "Give me an overview of the chart of accounts",
  },
  {
    permission: PERMISSIONS.JOURNAL_ENTRIES_READ,
    prompt: "Show me the latest journal entries",
  },
  {
    permission: PERMISSIONS.PRODUCTS_READ,
    prompt: "Show me the active products",
  },
  {
    permission: PERMISSIONS.AUDIT_READ,
    prompt: "Show me the latest system activity",
  },
];

const friendlyError =
  "The AI Assistant could not process your request. Please try again.";

const createMessage = (role, content, isError = false) => ({
  id: crypto.randomUUID(),
  role,
  content,
  isError,
});

export function AiAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const examplePrompts = promptOptions
    .filter(({ permission }) => hasPermission(user, permission))
    .slice(0, 4)
    .map(({ prompt }) => prompt);

  const refreshConversations = async () => {
    try {
      const items = await conversationsApi.list();
      setConversations(items);
    } catch {
      // Chat remains usable even if history cannot be loaded.
    }
  };

  useEffect(() => {
    if (isOpen) void refreshConversations();
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const sendMessage = async (value = input) => {
    const message = value.trim();
    if (!message || isLoading) return;

    setMessages((current) => [...current, createMessage("user", message)]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendAgentMessage(message, activeConversationId);
      if (!response.answer?.trim()) throw new Error("Empty assistant response");
      setActiveConversationId(response.conversation_id);
      setMessages((current) => [
        ...current,
        createMessage("assistant", response.answer),
      ]);
      void refreshConversations();
    } catch {
      setMessages((current) => [
        ...current,
        createMessage("assistant", friendlyError, true),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  const openConversation = async (conversationId) => {
    if (isLoading || historyLoading) return;
    setHistoryLoading(true);
    try {
      const conversation = await conversationsApi.get(conversationId);
      setActiveConversationId(conversation.id);
      setMessages(
        conversation.messages.map((message) => ({
          id: `saved-${message.id}`,
          role: message.role,
          content: message.content,
        })),
      );
      if (window.innerWidth <= 760) setHistoryOpen(false);
    } catch {
      setMessages([createMessage("assistant", friendlyError, true)]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const deleteCurrentConversation = async () => {
    if (!activeConversationId || isLoading) return;
    try {
      await conversationsApi.remove(activeConversationId);
      startNewConversation();
      await refreshConversations();
    } catch {
      setMessages((current) => [
        ...current,
        createMessage("assistant", "The conversation could not be deleted.", true),
      ]);
    }
  };

  const formatConversationDate = (value) =>
    new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(value));

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const handleInput = (event) => {
    setInput(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 144)}px`;
  };

  return (
    <>
      <Button
        variant="outline"
        className="ai-assistant-trigger"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Sparkles />
        <span>AI Assistant</span>
      </Button>

      {isOpen && createPortal(
        <div className="ai-assistant-layer">
          <button
            className="ai-assistant-overlay"
            onClick={() => setIsOpen(false)}
            aria-label="Close AI Assistant"
          />
          <aside
            className={`ai-assistant-drawer ${historyOpen ? "history-open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-assistant-title"
          >
            <header className="ai-assistant-header">
              <div className="ai-assistant-heading-icon"><Sparkles /></div>
              <div>
                <strong id="ai-assistant-title">ERP AI Assistant</strong>
                <span>Ask questions about your ERP</span>
              </div>
              <div className="ai-assistant-header-actions">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHistoryOpen((current) => !current)}
                  aria-label="Toggle conversation history"
                  title="Conversation history"
                >
                  <Menu />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={startNewConversation}
                  disabled={isLoading}
                  aria-label="New conversation"
                  title="New conversation"
                >
                  <Plus />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void deleteCurrentConversation()}
                  disabled={!activeConversationId || isLoading}
                  aria-label="Delete conversation"
                  title="Delete conversation"
                >
                  <Trash2 />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close AI Assistant"
                >
                  <X />
                </Button>
              </div>
            </header>

            <div className="ai-assistant-workspace">
              <aside className={`ai-conversation-history ${historyOpen ? "open" : ""}`}>
                <div className="ai-history-heading">
                  <span><History /> Conversations</span>
                  <button onClick={startNewConversation} aria-label="New conversation">
                    <Plus />
                  </button>
                </div>
                <div className="ai-history-list">
                  {historyLoading && conversations.length === 0 ? (
                    <p className="ai-history-state">Loading conversations...</p>
                  ) : conversations.length === 0 ? (
                    <div className="ai-history-empty">
                      <MessageSquare />
                      <p>Your conversations will appear here.</p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        className={activeConversationId === conversation.id ? "active" : ""}
                        onClick={() => void openConversation(conversation.id)}
                      >
                        <MessageSquare />
                        <span>
                          <strong>{conversation.title}</strong>
                          <small><Clock3 /> {formatConversationDate(conversation.updated_at)}</small>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </aside>
              <div className="ai-assistant-chat">
              <div className="ai-assistant-messages" aria-live="polite">
              {messages.length === 0 ? (
                <div className="ai-assistant-empty">
                  <div className="ai-assistant-welcome-icon"><Bot /></div>
                  <h2>ERP AI Assistant</h2>
                  <p>
                    Ask questions about your products, inventory, customers and
                    business reports.
                  </p>
                  <div className="ai-assistant-prompts">
                    {examplePrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => void sendMessage(prompt)}
                        disabled={isLoading}
                      >
                        <Sparkles />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <article
                    key={message.id}
                    className={`ai-message ${message.role}${message.isError ? " error" : ""}`}
                  >
                    <div className="ai-message-avatar">
                      {message.role === "user" ? <User /> : <Bot />}
                    </div>
                    <div>
                      <strong>
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </strong>
                      <p>{message.content}</p>
                    </div>
                  </article>
                ))
              )}
              {isLoading && (
                <article className="ai-message assistant thinking">
                  <div className="ai-message-avatar"><Bot /></div>
                  <div>
                    <strong>AI Assistant</strong>
                    <p><span /><span /><span /> AI Assistant is thinking...</p>
                  </div>
                </article>
              )}
              <div ref={endRef} />
            </div>

            <form
              className="ai-assistant-composer"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <div className="ai-assistant-input-wrap">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your ERP..."
                  rows={1}
                  disabled={isLoading}
                  aria-label="Message to AI Assistant"
                />
                <Button
                  size="icon"
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                >
                  <Send />
                </Button>
              </div>
              <small>Enter to send · Shift + Enter for a new line</small>
            </form>
              </div>
            </div>
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
}
