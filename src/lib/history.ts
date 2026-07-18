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
};

const HISTORY_KEY = 'legal_advisories_history';

export function getHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
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
    messages
  };
  saveHistory([newItem, ...items]);
  return id;
}

export function updateHistoryItemMessages(id: string, messages: ChatMessage[]) {
  const items = getHistory();
  const itemIndex = items.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    items[itemIndex].messages = messages;
    saveHistory(items);
  }
}
