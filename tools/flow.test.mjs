import test from "node:test";
import assert from "node:assert/strict";
import {loadGame} from "./load-game.mjs";

test("nextCh: chương đầu tiên chưa phá, phá hết thì chương cuối", () => {
  const G = loadGame();
  const last = G.CHAPTERS.length - 1;
  assert.equal(G.nextCh(), 0);
  G.done.add(0); assert.equal(G.nextCh(), 1);
  for (let i = 0; i <= last; i++) G.done.add(i);
  assert.equal(G.nextCh(), last);
});

test("danh sách chương liệt kê đủ, không còn dòng khóa cứng", () => {
  const G = loadGame();
  G.done.add(0);
  const html = G.chapterListHTML();
  for (const c of G.CHAPTERS) assert.ok(html.includes(c.title), c.title);
  assert.ok(!html.includes("Bóng đèn lồng"));
  assert.ok(!html.includes(">Khóa<"));
  assert.match(html, /data-ch="1"[\s\S]*?chip new">Mới/);
  assert.match(html, /data-ch="0"[\s\S]*?Đã phá/);
});

test("chương 2: nhãn đáp án và câu nhắc lấy từ dữ liệu", () => {
  const G = loadGame();
  G.setCh(1);
  assert.equal(G.CH.form.how.label, "Cách vào kho");
  G.accuse("Phạm Quốc Đức", "");
  assert.equal(G.S.verdict, "Chọn luôn cách người đó vào kho rồi mới gửi nha.");
  G.S.tries = 0; G.S.reveal = true;
  assert.ok(G.R.file().includes("Cách vào kho: <b>Dùng chìa đánh thêm từ chìa dự phòng</b>"));
});

test("màn thắng chương cuối báo chương mới sắp ra mắt", () => {
  const G = loadGame();
  G.setCh(G.CHAPTERS.length - 1);
  G.S.solved = true;
  assert.ok(G.R.file().includes("Chương mới sắp ra mắt"));
});
