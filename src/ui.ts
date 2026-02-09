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
 */
function renderInput(parent: HTMLElement): void {
  const wrap = document.createElement("div");
  wrap.className = "todo-input-wrap";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "やることを入力";
  input.className = "todo-input";
  input.autocomplete = "off";
  inputEl = input;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "todo-add-btn";
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
 */
function renderItem(parent: HTMLElement, item: TodoItem): void {
  const row = document.createElement("div");
  row.className = "todo-item";
  row.dataset.id = item.id;
  if (item.completed) row.classList.add("todo-item--completed");

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = item.completed;
  check.className = "todo-check";
  check.addEventListener("change", () => toggleItem(item.id));

  const label = document.createElement("label");
  label.className = "todo-label";
  label.textContent = item.title;

  const del = document.createElement("button");
  del.type = "button";
  del.className = "todo-del-btn";
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
 */
function renderFooter(footer: HTMLElement): void {
  const count = getItems().filter((i) => !i.completed).length;
  footer.textContent = `未完了 ${count} 件`;
}

/**
 * 全体の DOM を組み立て、購読でリスト・フッタを更新する。
 */
export function init(): void {
  load();
  const app = getOrCreateRoot();
  app.innerHTML = "";
  app.className = "todo-app";

  const header = document.createElement("header");
  header.className = "todo-header";
  header.textContent = "ToDo アプリ";
  app.appendChild(header);

  renderInput(app);

  const listWrap = document.createElement("div");
  listWrap.className = "todo-list-wrap";
  const listEl = document.createElement("div");
  listEl.className = "todo-list";
  listWrap.appendChild(listEl);
  app.appendChild(listWrap);

  const footer = document.createElement("footer");
  footer.className = "todo-footer";
  app.appendChild(footer);

  function update(): void {
    renderList(listEl);
    renderFooter(footer);
  }

  update();
  subscribe(update);
}
