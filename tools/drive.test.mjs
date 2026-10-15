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

test("Dock chỉ có Thùng rác khi chương có trash", () => {
  const G = withFix();
  assert.ok(G.dockApps().includes("trash"));
  G.setCh(1);
  assert.ok(!G.dockApps().includes("trash"));
});

test("Thùng rác không lộ thư mục gốc có khóa, loại tệp hay nội dung", () => {
  const G = withFix();
  const html = G.R.trash();
  assert.ok(html.includes("IMG_1") && html.includes("🔒 Thư mục riêng") && html.includes("Khách"));
  assert.ok(html.includes("Chung"), "thư mục gốc không khóa thì ghi tên");
  for (const leak of ["Trần Văn An", "ANHGOC", "NHÁP CỦA AN", "tạo T5", ">Ảnh<"]) assert.ok(!html.includes(leak), leak);
  assert.ok(html.includes('data-pin="t:t1"'));
});

test("khôi phục cần mật khẩu thư mục gốc, đúng thì mở khóa luôn", () => {
  const G = withFix();
  assert.equal(G.tryRestore("t1", ""), false);
  assert.equal(G.S.pwErr["t:t1"], "Nhập mật khẩu trước đã.");
  assert.equal(G.tryRestore("t1", "sai"), false);
  assert.equal(G.S.pwErr["t:t1"], "Sai mật khẩu.");
  assert.equal(G.tryRestore("t1", "Mướp"), true);
  assert.ok(G.S.unlocked.has("a"));
  assert.ok(G.R.trash().includes("Đã khôi phục về <b>An — Trần Văn An</b>"));
  assert.ok(G.R.photos().includes("IMG_1"));
  G.S.photo = "t.t1";
  const v = G.R.photos();
  assert.ok(v.includes("ANHGOC") && v.includes("tạo T5 bằng tài khoản An") && v.includes('data-pin="ph:t.t1"'));
});

test("thư mục gốc đã mở thì khôi phục không cần mật khẩu, khôi phục hai lần không nhân đôi", () => {
  const G = withFix();
  G.tryUnlock("a", "muop");
  assert.equal(G.tryRestore("t2", ""), true);
  assert.equal(G.tryRestore("t2", ""), true);
  G.S.folder = "a"; G.S.fileSel = "t.t2";
  const html = G.R.files();
  assert.ok(html.includes("NHÁP CỦA AN") && html.includes("Khôi phục"));
  assert.equal(html.split('data-fsel="a|t.t2"').length - 1, 1);
});

test("mục từ thư mục không khóa khôi phục ngay; chơi lại thì thùng rác đầy lại", () => {
  const G = withFix();
  assert.equal(G.tryRestore("t3", ""), true);
  G.setCh(G.CHAPTERS.length - 1);
  assert.equal(G.S.restored.size, 0);
  assert.ok(!G.R.photos().includes("IMG_1"));
});

test("Sổ vụ án có nguồn Thùng rác chỉ khi chương có trash", () => {
  const G = withFix();
  assert.ok(G.R.nb().includes("Thùng rác"));
  G.setCh(1);
  assert.ok(!G.R.nb().includes("Thùng rác"));
});
