import test from "node:test";
import assert from "node:assert/strict";
import {loadGame} from "./load-game.mjs";

const FIX3 = {
  vol: 9, title: "Vụ thử gợi ý", place: "Nơi thử · 1/1/2025", day: "CN 1/1", start: [8, 0], deskLabel: "Vụ thử",
  art: "<svg></svg>", intro: "", lead: "ti",
  people: {ti: {n: "Anh Ti dân phòng", i: "T", c: "#000"}, an: {n: "An", i: "A", c: "#111"}},
  chats: {ti: [{t: "07:00", x: "chào"}], an: [{t: "07:01", x: "Tui không biết.", ev: "loi"}]},
  clues: {}, profiles: {}, shop: [], shopHint: "", news: [], photos: {},
  files: {sk: {n: "Sao_ke.txt", x: "20:05 chuyển 7,5 triệu", ev: "saoke"}, hd: {n: "Hoa_don.txt", x: "18:30", ev: "hoadon"},
          log: {n: "May_in.txt", x: "21:05", ev: "mayin", hidden: true}},
  confront: {an: {_: "Không liên quan.",
    hoadon: {reply: ["Tui in lúc 9 giờ."], give: ["log"]},
    saoke: {needs: ["cf:an:hoadon"], early: "Hỏi chuyện hóa đơn trước đi.", reply: ["Ờ thì tui có chuyển."]}}},
  deduce: [{id: "d1", title: "Hóa đơn làm sau khi chuyển tiền", x: "…",
    need: [{ev: ["saoke"], l: "giao dịch ngân hàng"}, {ev: ["hoadon"], l: "hóa đơn"}, {ev: ["mayin"], l: "giờ in thật"}]}],
  hints: [
    {done: ["file:sk"], tips: ["Nấc 1 bước 1", "Nấc 2 bước 1", "Nấc 3 bước 1"]},
    {done: [["cf:an:hoadon", "cf:an:saoke"]], tips: ["Nấc 1 bước 2", "Nấc 2 bước 2", "Nấc 3 bước 2"]},
    {done: ["deduce:d1"], tips: ["a", "b", "c"]}],
  suspects: [{id: "an", n: "An", r: "x"}],
  form: {q: "?", how: {q: "Cách?", label: "Cách", need: "Chọn cách.", opts: [{v: "a", l: "A"}, {v: "b", l: "B"}], a: "a"},
         why: {q: "Vì sao?", label: "Lý do", need: "Chọn lý do.", opts: [{v: "x", l: "X"}, {v: "y", l: "Y"}], a: "x"}, proof: ["d1"]},
  check: (n, how, why) => n === "tran van an" && how === "a" && why === "x" ? {ok: 1} : {m: "Sai rồi."},
  culprit: "Trần Văn An", win: "Thắng", solution: "Giải",
};
function G3(){ const G = loadGame(); G.CHAPTERS.push(FIX3); G.setCh(G.CHAPTERS.length - 1); return G; }
const show = (G, k) => { G.S.folder = "case"; G.S.fileSel = k; G.R.files(); };

test("mở tệp, mở chat, đối chất trúng để lại dấu vết", () => {
  const G = G3();
  show(G, "sk"); assert.ok(G.S.traces.has("file:sk"));
  G.S.chat = "an"; G.R.chat(); assert.ok(G.S.traces.has("chat:an"));
  show(G, "hd"); G.pin("f:hd"); G.confront("an", "f:hd");
  assert.ok(G.S.traces.has("cf:an:hoadon") && G.S.traces.has("pin:hoadon"));
});

test("gợi ý bám bước đầu tiên chưa xong, mở từng nấc, đếm số gợi ý", () => {
  const G = G3();
  assert.equal(G.hintStep(), 0);
  G.hintMore(); G.hintMore();
  assert.match(G.hintHTML(), /Nấc 2 bước 1/); assert.ok(!G.hintHTML().includes("Nấc 3 bước 1"));
  assert.equal(G.S.hintsUsed, 2);
  G.hintMore(); G.hintMore(); // hết nấc thì không tính thêm
  assert.equal(G.S.hintsUsed, 3);
  show(G, "sk");
  assert.equal(G.hintStep(), 1);
  G.trace("cf:an:saoke"); // "một trong các"
  assert.equal(G.hintStep(), 2);
  G.trace("deduce:d1");
  assert.equal(G.hintStep(), -1);
  assert.match(G.hintHTML(), /mở Hồ sơ nộp đi/);
});

test("tự nhắc sau 4 phút không tiến triển, mỗi bước một lần", () => {
  const G = G3();
  const t0 = G.S.lastProg;
  assert.equal(G.nudgeCheck(t0 + 60000), false);
  assert.equal(G.nudgeCheck(t0 + 241000), true);
  assert.match(G.S.extra.at(-1).x, /Bấm 💡 Gợi ý/);
  assert.equal(G.nudgeCheck(t0 + 600000), false);
  G.setCh(1); assert.equal(G.nudgeCheck(Date.now() + 999999), false); // vụ không có hints
});

test("ghép suy luận: đủ, thiếu, không liên quan, lặp", () => {
  const G = G3();
  show(G, "sk"); G.pin("f:sk"); show(G, "hd"); G.pin("f:hd");
  G.S.chat = "an"; G.R.chat(); G.pin("c:an:0");
  assert.deepEqual([...G.deduceTry(["c:an:0"]).none ? ["none"] : []], ["none"]);
  assert.deepEqual([...G.deduceTry(["f:sk", "f:hd"]).missing], ["giờ in thật"]);
  G.confront("an", "f:hd"); show(G, "log"); G.pin("f:log");
  assert.equal(G.deduceTry(["f:sk", "f:hd", "f:log"]).found.id, "d1");
  assert.ok(G.S.traces.has("deduce:d1"));
  assert.equal(G.deduceTry(["f:sk", "f:hd", "f:log"]).again, true);
});

test("đối chất có điều kiện: chưa đủ thì đáp câu early, không tính là đã dùng", () => {
  const G = G3();
  show(G, "sk"); G.pin("f:sk");
  assert.equal(G.confront("an", "f:sk").hit, false);
  assert.equal(G.S.cx.an.at(-1).x, "Hỏi chuyện hóa đơn trước đi.");
  show(G, "hd"); G.pin("f:hd");
  const r = G.confront("an", "f:hd");
  assert.deepEqual([...r.gave], ["log"]); assert.ok(G.S.given.has("log"));
  assert.equal(G.confront("an", "f:sk").hit, true);
});

test("Hồ sơ 3 câu: thiếu lý do thì nhắc; chưa đủ suy luận thì nhắc, không trừ lượt", () => {
  const G = G3();
  G.accuse("Trần Văn An", "a", "");
  assert.equal(G.S.verdict, "Chọn lý do."); assert.equal(G.S.tries, 3);
  G.accuse("Trần Văn An", "a", "x");
  assert.match(G.S.verdict, /Suy luận/); assert.equal(G.S.tries, 3);
  G.trace("deduce:d1"); G.S.dFound.push("d1");
  G.accuse("Trần Văn An", "a", "y"); assert.equal(G.S.tries, 2);
  G.accuse("Trần Văn An", "a", "x"); assert.equal(G.S.solved, true);
});

test("màn thắng ghi số gợi ý đã dùng", () => {
  const G = G3();
  G.S.solved = true;
  assert.ok(G.R.file().includes("Phá án không cần gợi ý luôn ta, gớm dữuuuu"));
  G.hintMore();
  assert.ok(G.R.file().includes("Phá án với 1 gợi ý."));
});

test("Sổ vụ án có mục Suy luận khi chương có deduce; Hồ sơ có câu thứ ba", () => {
  const G = G3();
  G.S.nbFilter = "deduce";
  const nb = G.R.nb();
  assert.ok(nb.includes("🧩 Suy luận") && nb.includes("data-dgo"));
  assert.ok(G.R.file().includes('name="why"'));
  G.setCh(1); assert.ok(!G.R.nb().includes("🧩 Suy luận")); assert.ok(!G.R.file().includes('name="why"'));
});

test("ghép lẫn chi tiết không liên quan thì không ra suy luận (chống tick hết)", () => {
  const G = G3();
  show(G, "sk"); G.pin("f:sk"); show(G, "hd"); G.pin("f:hd");
  G.S.chat = "an"; G.R.chat(); G.pin("c:an:0");
  G.confront("an", "f:hd"); show(G, "log"); G.pin("f:log");
  assert.equal(G.deduceTry(["f:sk", "f:hd", "f:log", "c:an:0"]).extra, true);
  assert.equal(G.S.dFound.length, 0);
  assert.equal(G.deduceTry(["f:sk", "f:hd", "f:log"]).found.id, "d1");
  assert.equal(G.deduceTry(["f:sk", "f:hd", "f:log"]).again, true);
});

test("sau khi phá án, mở gợi ý không tính thêm; tin nhắc theo giờ game", () => {
  const G = G3();
  G.S.solved = true; G.openHints();
  assert.equal(G.S.hintsUsed, 0);
  const H = G3();
  H.nudgeCheck(H.S.lastProg + 241000);
  assert.equal(H.S.extra.at(-1).t, "08:00");
});

test("bỏ ghim thì bỏ chọn trong Ghép; tên trong Hồ sơ còn sau khi bị chặn", () => {
  const G = G3();
  show(G, "sk"); G.pin("f:sk"); G.S.dSel.add("f:sk"); G.pin("f:sk");
  assert.equal(G.S.dSel.has("f:sk"), false);
  G.accuse("Trần Văn An", "a", "x");
  assert.ok(G.R.file().includes('value="Trần Văn An"'));
});
