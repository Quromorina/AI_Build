import type { TodoItem, TodoState } from "./types.js";

/** localStorage のキー。設計書で固定としている。 */
const STORAGE_KEY = "todo-app-v1";

/** 現在の状態。単一のソース of トゥルス。 */
let state: TodoState = { items: [] };

/** 変更を購読するコールバックのリスト。UI の再描画用。 */
type Listener = () => void;
const listeners: Listener[] = [];

function emit(): void {
  listeners.forEach((fn) => fn());
}

/** 一意な id を生成。日時 + 乱数で衝突を極力避ける。 */
function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 状態を localStorage に保存。変更のたびに呼ぶ。 */
function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ストレージ満杯等は無視し、アプリは継続
  }
}

/**
 * localStorage から復元。不正 JSON や型不整合の場合は空で扱う（設計書方針）。
 * 常に state を更新し、テストの beforeEach でクリア→load したときに状態がリセットされるようにする。
 */
export function load(): TodoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) {
      state = { items: [] };
      return state;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
      state = { items: [] };
      return state;
    }
    const items = (parsed.items as unknown[]).filter(isValidTodoItem);
    state = { items };
    return state;
  } catch {
    state = { items: [] };
    return state;
  }
}

function isValidTodoItem(x: unknown): x is TodoItem {
  return (
    typeof x === "object" &&
    x !== null &&
    "id" in x &&
    typeof (x as TodoItem).id === "string" &&
    "title" in x &&
    typeof (x as TodoItem).title === "string" &&
    "completed" in x &&
    typeof (x as TodoItem).completed === "boolean" &&
    "createdAt" in x &&
    typeof (x as TodoItem).createdAt === "string"
  );
}

/** 現在の一覧を取得。追加順（createdAt 昇順）で返す。 */
export function getItems(): TodoItem[] {
  return [...state.items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/**
 * Todo を1件追加。空タイトルは許可しない（設計書: 空は許可しない）。
 * @returns 追加したアイテム、または null（空の場合は追加しない）
 */
export function addItem(title: string): TodoItem | null {
  const trimmed = title.trim();
  if (trimmed === "") return null;
  const item: TodoItem = {
    id: createId(),
    title: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  state.items.push(item);
  save();
  emit();
  return item;
}

/** 指定 id の完了フラグをトグル。存在しなければ何もしない。 */
export function toggleItem(id: string): void {
  const item = state.items.find((i) => i.id === id);
  if (item) {
    item.completed = !item.completed;
    save();
    emit();
  }
}

/** 指定 id の Todo を削除。 */
export function removeItem(id: string): void {
  const before = state.items.length;
  state.items = state.items.filter((i) => i.id !== id);
  if (state.items.length !== before) {
    save();
    emit();
  }
}

/** 状態変更の購読。戻り値は購読解除関数。 */
export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i !== -1) listeners.splice(i, 1);
  };
}
