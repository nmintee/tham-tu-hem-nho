import test from "node:test";
import assert from "node:assert/strict";
import {loadGame} from "./load-game.mjs";

export const FIX = {
  title: "Vụ thử", place: "Nơi thử · 1/1/2025", day: "CN 1/1", start: [7, 0], deskLabel: "Vụ thử",
  art: "<svg></svg>", intro: "", lead: "ti",
  people: {ti: {n: "Anh Ti dân phòng", i: "T", c: "#000"}}, chats: {ti: [{t: "07:00", x: "chào"}]},
  clues: {}, profiles: {}, shop: [], shopHint: "", news: [],
  photos: {p1: {n: "Ảnh có sẵn", svg: "<svg></svg>"}},
  files: {note: {n: "Ghi chú vụ án", x: "nội dung vụ án"}},
  drive: {n: "Máy chung", folders: [
    {k: "chung", n: "Chung", files: {log: {n: "Nhật ký", x: "dòng một", m: "T7 8/11"}}},
    {k: "a", n: "An — Trần Văn An", lock: {hint: "tên con mèo", pass: ["Mướp"]},
     files: {bi: {n: "Bí mật của An", x: "BÍ MẬT XYZ", m: "T6 7/11"}}}]},
  trash: [
    {k: "t1", n: "IMG_1", by: "Khách", when: "T7 23:02", from: "a", kind: "photo", svg: "<svg><text>ANHGOC</text></svg>", info: "tạo T5 bằng tài khoản An"},
    {k: "t2", n: "nhap", by: "An", when: "T5 15:40", from: "a", kind: "file", x: "NHÁP CỦA AN"},
    {k: "t3", n: "cong-khai", by: "Khách", when: "T7 21:00", from: "chung", kind: "file", x: "CÔNG KHAI"}],
  suspects: [], form: {q: "?"}, check: () => ({m: "x"}), culprit: "X", win: "", solution: "",
};

export function withFix(){
  const G = loadGame();
  G.CHAPTERS.push(FIX);
  G.setCh(G.CHAPTERS.length - 1);
  return G;
}

test("pwNorm bỏ dấu, chữ hoa, khoảng trắng, ký tự đặc biệt", () => {
  const G = loadGame();
  assert.equal(G.pwNorm("Bé Bông 2019"), "bebong2019");
  assert.equal(G.pwNorm(" 0712-1988 "), "07121988");
  assert.equal(G.pwNorm("Mướp"), "muop");
});

test("thư mục khóa không lộ tên tệp, giờ sửa, nội dung", () => {
  const G = withFix();
  G.S.folder = "a";
  const html = G.R.files();
  assert.ok(html.includes("tên con mèo"));
  assert.ok(html.includes('id="pw-f"'));
  for (const leak of ["Bí mật của An", "BÍ MẬT XYZ", "T6 7/11"]) assert.ok(!html.includes(leak), leak);
});

test("mật khẩu trống và sai báo khác nhau, đúng thì mở", () => {
  const G = withFix();
  G.S.folder = "a";
  assert.equal(G.tryUnlock("a", "   "), false);
  assert.equal(G.S.pwErr["d:a"], "Nhập mật khẩu trước đã.");
  assert.equal(G.tryUnlock("a", "meo"), false);
  assert.equal(G.S.pwErr["d:a"], "Sai mật khẩu.");
  assert.ok(G.R.files().includes("Sai mật khẩu."));
  assert.equal(G.tryUnlock("a", "  MUOP "), true);
  const html = G.R.files();
  for (const s of ["Bí mật của An", "BÍ MẬT XYZ", "T6 7/11", 'data-pin="f:a:bi"']) assert.ok(html.includes(s), s);
  assert.ok(!html.includes("Sai mật khẩu."));
});

test("thư mục không khóa và tệp vụ án xem được ngay", () => {
  const G = withFix();
  let html = G.R.files();
  assert.ok(html.includes("nội dung vụ án") && html.includes('data-pin="f:note"'));
  assert.ok(html.includes('data-fold="chung"') && html.includes('data-fold="a"'));
  G.S.folder = "chung";
  html = G.R.files();
  assert.ok(html.includes("dòng một") && html.includes("T7 8/11"));
});

test("chơi lại thì khóa lại", () => {
  const G = withFix();
  G.tryUnlock("a", "muop");
  G.setCh(G.CHAPTERS.length - 1);
  assert.equal(G.S.unlocked.size, 0);
});

test("chương 1 và 2 hiển thị Tệp như cũ", () => {
  const G = loadGame();
  G.setCh(0);
  assert.ok(G.R.files().includes("Thư mục vụ án này chưa có tệp nào."));
  G.setCh(1);
  const html = G.R.files();
  assert.ok(html.includes("So_truc_NVH_04-10.txt") && html.includes('data-pin="f:log"'));
  assert.ok(!html.includes("data-fold"));
});
