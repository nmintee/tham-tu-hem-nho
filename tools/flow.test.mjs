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

test("ba vụ án là ba phần của Chương 1", () => {
  const G = loadGame();
  assert.deepEqual([...G.CHAPTERS.map(c => c.vol)], [1, 1, 1, 2, 2]);
  assert.equal(G.partLabel(0), "Chương 1 · Phần 1");
  assert.equal(G.partLabel(2), "Chương 1 · Phần 3");
});

test("màn chọn chương nhóm theo chương, có Chương 2 sắp ra mắt", () => {
  const G = loadGame();
  const html = G.chapterListHTML();
  assert.ok(html.includes("Chương 1: Thám tử tập sự"));
  assert.ok(html.includes("<b>Phần 1.</b> Chậu lan biến mất"));
  assert.ok(html.includes("<b>Phần 3.</b> Ai đứng sau Hẻm Bàn Tán?"));
  assert.ok(html.includes("Chương 2: Thám tử thực thụ") && html.includes("<b>Phần 1.</b> Căn phòng khóa trái") && !html.includes("Sắp ra mắt"));
});

test("màn thắng mời sang phần tiếp theo", () => {
  const G = loadGame();
  G.setCh(0); G.S.solved = true;
  assert.ok(G.R.file().includes("Phần 2: Ai ăn bánh trung thu? →"));
});

test("màn hình chính không còn nút Bắt đầu chơi; Chọn chương là nút chính", async () => {
  const fs = await import("node:fs");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.ok(!html.includes('id="b-play"'));
  assert.ok(!html.includes("Bắt đầu chơi"));
  assert.match(html, /<button class="primary" id="b-chap">/);
});

test("mẹo hiện ở phần đầu tiên của mỗi chương có coach", () => {
  const G = loadGame();
  assert.equal(G.showsCoach(0), true);
  assert.equal(G.showsCoach(1), false); // phần 2 có coach nhưng không phải phần đầu
  G.CHAPTERS.push({vol: 9, coach: "x"}, {vol: 9, coach: "y"});
  const n = G.CHAPTERS.length;
  assert.equal(G.showsCoach(n - 2), true);
  assert.equal(G.showsCoach(n - 1), false);
});

test("Cách chơi nhắc tới Đưa bằng chứng; app Ảnh trống có câu báo", async () => {
  const fs = await import("node:fs");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /Cách chơi<\/strong>[\s\S]*📎 Đưa bằng chứng/);
  const G = loadGame();
  G.CHAPTERS.push({...G.CHAPTERS[0], vol: 9, photos: {}});
  G.setCh(G.CHAPTERS.length - 1);
  assert.ok(G.R.photos().includes("Chưa có ảnh nào trong vụ này."));
});

test("phần cuối chương 1 mời sang Chương 2", () => {
  const G = loadGame();
  G.setCh(2); G.S.solved = true;
  assert.ok(G.R.file().includes("Chương 2: Thám tử thực thụ →"));
});
