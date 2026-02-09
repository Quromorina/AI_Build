import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  load,
  getItems,
  addItem,
  toggleItem,
  removeItem,
  subscribe,
} from "./store.js";

// テストでは localStorage をモックして永続化の影響を分離する。
// 実際の store は load() で state を上書きするため、各テストで load を呼ぶか
// モックの localStorage を差し替える必要がある。
// ここでは beforeEach で localStorage をクリアし、load() で空状態から開始する。

const STORAGE_KEY = "todo-app-v1";

describe("store", () => {
  beforeEach(() => {
    localStorage.clear();
    load();
  });

  describe("load", () => {
    it("何もないときは空の items を返す", () => {
      const s = load();
      expect(s.items).toEqual([]);
    });

    it("正しい JSON を復元する", () => {
      const items = [
        {
          id: "a",
          title: "やること",
          completed: false,
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
      const s = load();
      expect(s.items).toHaveLength(1);
      expect(s.items[0].title).toBe("やること");
    });

    it("不正な JSON の場合は空で返す", () => {
      localStorage.setItem(STORAGE_KEY, "invalid json{{{");
      const s = load();
      expect(s.items).toEqual([]);
    });

    it("items が配列でない場合は空で返す", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: "not-array" }));
      const s = load();
      expect(s.items).toEqual([]);
    });

    it("型が不正な要素は除外する", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          items: [
            { id: "1", title: "ok", completed: false, createdAt: "2025-01-01T00:00:00.000Z" },
            { id: "2", title: "bad", completed: "not boolean", createdAt: "" },
            null,
          ],
        })
      );
      const s = load();
      expect(s.items).toHaveLength(1);
      expect(s.items[0].id).toBe("1");
    });
  });

  describe("addItem", () => {
    it("1件追加できる", () => {
      const item = addItem("牛乳を買う");
      expect(item).not.toBeNull();
      expect(item!.title).toBe("牛乳を買う");
      expect(item!.completed).toBe(false);
      expect(item!.id).toBeTruthy();
      expect(item!.createdAt).toBeTruthy();
      expect(getItems()).toHaveLength(1);
    });

    it("空文字は追加しない", () => {
      expect(addItem("")).toBeNull();
      expect(addItem("   ")).toBeNull();
      expect(getItems()).toHaveLength(0);
    });

    it("前後の空白はトリムして保存する", () => {
      const item = addItem("  レポートを書く  ");
      expect(item!.title).toBe("レポートを書く");
    });
  });

  describe("getItems", () => {
    it("追加順（createdAt 昇順）で返す", () => {
      addItem("first");
      addItem("second");
      addItem("third");
      const items = getItems();
      expect(items.map((i) => i.title)).toEqual(["first", "second", "third"]);
    });
  });

  describe("toggleItem", () => {
    it("完了フラグがトグルされる", () => {
      const added = addItem("タスク");
      expect(added).not.toBeNull();
      expect(getItems()[0].completed).toBe(false);
      toggleItem(added!.id);
      expect(getItems()[0].completed).toBe(true);
      toggleItem(added!.id);
      expect(getItems()[0].completed).toBe(false);
    });

    it("存在しない id では何もしない", () => {
      addItem("ひとつ");
      toggleItem("nonexistent-id");
      expect(getItems()[0].completed).toBe(false);
    });
  });

  describe("removeItem", () => {
    it("指定 id のアイテムが削除される", () => {
      const a = addItem("消す");
      addItem("残す");
      removeItem(a!.id);
      const items = getItems();
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("残す");
    });

    it("存在しない id では何もしない", () => {
      addItem("ひとつ");
      removeItem("nonexistent-id");
      expect(getItems()).toHaveLength(1);
    });
  });

  describe("subscribe", () => {
    it("状態変更時にコールバックが呼ばれる", () => {
      const fn = vi.fn();
      subscribe(fn);
      addItem("test");
      expect(fn).toHaveBeenCalled();
    });

    it("解除するとその後は呼ばれない", () => {
      const fn = vi.fn();
      const unsubscribe = subscribe(fn);
      unsubscribe();
      addItem("test");
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe("persistence", () => {
    it("追加後に localStorage に保存されている", () => {
      addItem("永続化テスト");
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.items).toHaveLength(1);
      expect(parsed.items[0].title).toBe("永続化テスト");
    });
  });
});
