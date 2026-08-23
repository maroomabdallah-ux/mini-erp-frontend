import { apiRequest } from "@/shared/api/api-client";

export function sendAgentMessage(message, conversationId = null) {
  return apiRequest("/agent/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    }),
  });
}

export const conversationsApi = {
  list: () => apiRequest("/agent/conversations"),
  get: (id) => apiRequest(`/agent/conversations/${id}`),
  remove: (id) =>
    apiRequest(`/agent/conversations/${id}`, { method: "DELETE" }),
};
