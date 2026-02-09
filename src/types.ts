/**
 * Todo 1件の型。
 * 設計: docs/DESIGN.md 3.1 に準拠。
 * id はクライアント生成で一意。createdAt は並び順・デバッグ用。
 */
export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

/**
 * アプリ全体の状態。永続化時もこの形で JSON 化する。
 */
export interface TodoState {
  items: TodoItem[];
}
