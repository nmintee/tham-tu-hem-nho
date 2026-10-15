import test from "node:test";
import assert from "node:assert/strict";
import {loadGame} from "./load-game.mjs";

export const FIX2 = {
  vol: 9, title: "Vụ thử đối chất", place: "Nơi thử · 1/1/2025", day: "CN 1/1", start: [8, 0], deskLabel: "Vụ thử",
  art: "<svg></svg>", intro: "", lead: "ti",
  people: {ti: {n: "Anh Ti dân phòng", i: "T", c: "#000"}, an: {n: "An · Nhân chứng", i: "A", c: "#111"}},
  chats: {ti: [{t: "07:00", x: "chào"}], an: [{t: "07:01", x: "Tui không biết gì."}]},
  clues: {}, profiles: {}, shop: [], shopHint: "", news: [], photos: {},
  files: {note: {n: "Hoa_don.txt", x: "giao 20:31", ev: "hoadon"}, secret: {n: "Anh_xac_nhan.txt", x: "GIAY CAM", hidden: true, ev: "giay"}},
  confront: {an: {hoadon: {reply: ["Thôi được, tui khai.", {x: "Đôi giày cam đó tui thấy rồi.", ev: "khai"}], give: "secret"}, _: "Không liên quan."}},
  suspects: [], form: {q: "?"}, check: () => ({m: "x"}), culprit: "X", win: "", solution: "",
};
export function withFix2(){ const G = loadGame(); G.CHAPTERS.push(FIX2); G.setCh(G.CHAPTERS.length - 1); return G; }

test("ghim mang theo nhãn ev", () => {
  const G = withFix2();
  G.R.files(); G.pin("f:note");
  assert.equal(G.S.pinData["f:note"].ev, "hoadon");
});

test("tệp ẩn không hiện trước khi được gửi", () => {
  const G = withFix2();
  const html = G.R.files();
  assert.ok(html.includes("Hoa_don.txt") && !html.includes("Anh_xac_nhan.txt"));
});

test("đưa bằng chứng không liên quan → câu đáp chung, không phạt", () => {
  const G = withFix2();
  G.S.chat = "ti"; G.R.chat(); G.pin("c:ti:0");
  const r = G.confront("an", "c:ti:0");
  assert.equal(r.hit, false);
  const box = G.S.cx.an;
  assert.ok(box[0].me && box[0].x.startsWith("📎 "));
  assert.equal(box.at(-1).x, "Không liên quan.");
  assert.equal(G.S.tries, 3);
});

test("đưa đúng → khai lại, gửi tệp ẩn; đưa lại → hỏi rồi", () => {
  const G = withFix2();
  G.R.files(); G.pin("f:note");
  const r = G.confront("an", "f:note");
  assert.equal(r.hit, true); assert.equal(r.gave, "secret");
  assert.ok(G.S.cx.an.some(m => m.x === "Thôi được, tui khai."));
  assert.ok(G.R.files().includes("Anh_xac_nhan.txt"));
  const n = G.S.cx.an.length;
  assert.equal(G.confront("an", "f:note").hit, false);
  assert.equal(G.S.cx.an.at(-1).x, "Cái này hỏi rồi mà.");
  assert.equal(G.S.cx.an.length, n + 2);
  assert.equal(G.S.given.size, 1);
});

test("tin trả lời mang ev, ghim được để đưa tiếp", () => {
  const G = withFix2();
  G.R.files(); G.pin("f:note"); G.confront("an", "f:note");
  G.S.chat = "an"; G.R.chat();
  const i = 1 + G.S.cx.an.findIndex(m => m.ev === "khai"); // chats.an có 1 tin gốc
  G.pin(`c:an:${i}`);
  assert.equal(G.S.pinData[`c:an:${i}`].ev, "khai");
});

test("người không có bảng hoặc chi tiết đã bỏ ghim → null, không thêm tin", () => {
  const G = withFix2();
  G.R.files(); G.pin("f:note");
  assert.equal(G.confront("ti", "f:note"), null);
  G.pin("f:note"); // bỏ ghim
  assert.equal(G.confront("an", "f:note"), null);
  assert.equal(G.S.cx.an, undefined);
});

test("chơi lại xóa lời khai và tệp đã nhận", () => {
  const G = withFix2();
  G.R.files(); G.pin("f:note"); G.confront("an", "f:note");
  G.setCh(G.CHAPTERS.length - 1);
  assert.deepEqual({...G.S.cx}, {}); assert.equal(G.S.given.size, 0);
});

test("nút 📎 chỉ có ở người có bảng đối chất; chương 1 không có", () => {
  const G = withFix2();
  G.S.chat = "an"; assert.ok(G.R.chat().includes("data-cfopen"));
  G.S.chat = "ti"; assert.ok(!G.R.chat().includes("data-cfopen"));
  G.setCh(0); assert.ok(!G.R.chat().includes("data-cfopen"));
});

test("bảng chọn: trống thì nhắc ghim, có ghim thì liệt kê", () => {
  const G = withFix2();
  G.S.chat = "an"; G.S.cfOpen = true;
  assert.ok(G.R.chat().includes("Chưa có gì để đưa. Ghim một chi tiết (📌) trước đã."));
  G.R.files(); G.pin("f:note");
  const html = G.R.chat();
  assert.ok(html.includes('data-cf="f:note"') && html.includes("Chọn chi tiết đã ghim để đưa cho An"));
});

test("tin của mình nằm bên phải và ghim được", () => {
  const G = withFix2();
  G.R.files(); G.pin("f:note"); G.confront("an", "f:note");
  G.S.chat = "an";
  const html = G.R.chat();
  assert.ok(html.includes('class="msg me"') && html.includes("📎 Hoa_don.txt"));
  assert.ok(html.includes('data-pin="c:an:1"'));
});
