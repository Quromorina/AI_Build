import type { TodoItem } from "./types.js";
import {
  getItems,
  addItem,
  toggleItem,
  removeItem,
  subscribe,
  load,
} from "./store.js";

/** #app のルート要素。 */
let root: HTMLElement;

/** 入力フィールドの参照（クリア用）。 */
let inputEl: HTMLInputElement;

/**
 * 未完了件数を表示する要素（任意表示）。
 */
function getOrCreateRoot(): HTMLElement {
  if (root) return root;
  const el = document.getElementById("app");
  if (!el) throw new Error("#app が見つかりません");
  root = el;
  return root;
}

/**
 * 入力エリア（テキスト + 追加ボタン）を生成する。
 * Tailwind: フレックスレイアウト、入力フィールド、ボタンにhover効果。
 */
function renderInput(parent: HTMLElement): void {
  const wrap = document.createElement("div");
  wrap.className = "flex gap-2 mb-4";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "やることを入力";
  input.className = "flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";
  input.autocomplete = "off";
  inputEl = input;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium";
  btn.textContent = "追加";

  btn.addEventListener("click", () => handleAdd());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleAdd();
  });

  wrap.append(input, btn);
  parent.appendChild(wrap);
}

function handleAdd(): void {
  if (!inputEl) return;
  const title = inputEl.value;
  const added = addItem(title);
  if (added) {
    inputEl.value = "";
  }
}

/**
 * 1件の Todo を行として描画。チェックボックス + ラベル + 削除ボタン。
 * Tailwind: カード内のアイテム、完了時は打ち消し線、削除ボタンにhover効果。
 */
function renderItem(parent: HTMLElement, item: TodoItem): void {
  const row = document.createElement("div");
  row.className = "flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors";
  row.dataset.id = item.id;

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = item.completed;
  check.className = "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer";
  check.addEventListener("change", () => toggleItem(item.id));

  const label = document.createElement("label");
  label.className = `flex-1 cursor-pointer text-sm ${item.completed ? "line-through text-gray-500" : "text-gray-900"}`;
  label.textContent = item.title;
  label.addEventListener("click", () => toggleItem(item.id));

  const del = document.createElement("button");
  del.type = "button";
  del.className = "w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1";
  del.textContent = "×";
  del.setAttribute("aria-label", "削除");
  del.addEventListener("click", () => removeItem(item.id));

  row.append(check, label, del);
  parent.appendChild(row);
}

/**
 * リスト領域をいったん空にして、現在の items で再描画する。
 */
function renderList(container: HTMLElement): void {
  container.innerHTML = "";
  const items = getItems();
  items.forEach((item) => renderItem(container, item));
}

/**
 * フッタ（未完了件数）を更新する。
 * Tailwind: 控えめなテキストスタイル。
 */
function renderFooter(footer: HTMLElement): void {
  const count = getItems().filter((i) => !i.completed).length;
  footer.textContent = `未完了 ${count} 件`;
}

/**
 * 全体の DOM を組み立て、購読でリスト・フッタを更新する。
 * Tailwind: 中央寄せレイアウト、カードUI、業務アプリらしいシンプルなデザイン。
 */
export function init(): void {
  load();
  const app = getOrCreateRoot();
  app.innerHTML = "";
  // 中央寄せ: 画面全体を中央に配置
  app.className = "min-h-screen flex items-center justify-center bg-gray-50 p-4";

  // カードコンテナ: 白背景、影、角丸、最大幅
  const card = document.createElement("div");
  card.className = "w-full max-w-2xl bg-white rounded-lg shadow-md border border-gray-200 p-6";
  app.appendChild(card);

  // ヘッダ: タイトル
  const header = document.createElement("header");
  header.className = "text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200";
  header.textContent = "ToDo アプリ";
  card.appendChild(header);

  // 入力エリア
  renderInput(card);

  // リストエリア: カード内のリストコンテナ
  const listWrap = document.createElement("div");
  listWrap.className = "mb-4";
  const listEl = document.createElement("div");
  listEl.className = "border border-gray-200 rounded-md overflow-hidden";
  listWrap.appendChild(listEl);
  card.appendChild(listWrap);

  // フッタ: 未完了件数
  const footer = document.createElement("footer");
  footer.className = "text-xs text-gray-500 text-center pt-4 border-t border-gray-100";
  card.appendChild(footer);

  function update(): void {
    renderList(listEl);
    renderFooter(footer);
  }

  update();
  subscribe(update);
}
