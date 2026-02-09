/**
 * エントリポイント。
 * 設計: 起動時に localStorage から復元し、UI を初期化する。
 */
import "./style.css";
import { init } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  init();
});
