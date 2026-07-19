export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export type HistoryItem = {
  id: string;
  title: string;
  type: string;
  date: string;
  iconName: string;
  bg: string;
  color: string;
  messages?: ChatMessage[];
  updatedAt: number;
};

const HISTORY_KEY = 'legal_advisories_history';

export function getHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data).sort((a: HistoryItem, b: HistoryItem) => (b.updatedAt || 0) - (a.updatedAt || 0)) : [];
  } catch (e) {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  // dispatch an event so other components can know about the change
  if (typeof window !== "undefined") window.dispatchEvent(new Event("history-updated"));
}

export function addHistoryItem(title: string, type: string = "Chat", messages: ChatMessage[] = []): string {
  const items = getHistory();
  const id = Math.random().toString(36).substring(2, 9);
  const newItem: HistoryItem = {
    id,
    title,
    type,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    iconName: type === "Chat" ? "MessageSquare" : "Wand2",
    bg: "bg-blue-100",
    color: "text-blue-600",
    messages,
    updatedAt: Date.now()
  };
  saveHistory([newItem, ...items]);
  return id;
}

export function updateHistoryItemMessages(id: string, messages: ChatMessage[]) {
  const items = getHistory();
  const itemIndex = items.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    items[itemIndex].messages = messages;
    items[itemIndex].updatedAt = Date.now();
    saveHistory(items);
  }
}

export function deleteHistoryItem(id: string) {
  const items = getHistory();
  saveHistory(items.filter(item => item.id !== id));
}

export function renameHistoryItem(id: string, newTitle: string) {
  const items = getHistory();
  const itemIndex = items.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    items[itemIndex].title = newTitle;
    items[itemIndex].updatedAt = Date.now();
    saveHistory(items);
  }
}

export function getHistoryItem(id: string): HistoryItem | undefined {
  return getHistory().find(item => item.id === id);
}
