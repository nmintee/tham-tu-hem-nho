import test from "node:test";
import assert from "node:assert/strict";
import {loadGame} from "./load-game.mjs";

const ch3 = () => { const G = loadGame(); G.setCh(2); return G; };

test("chương 3 tồn tại, không có mẹo", () => {
  const G = ch3();
  assert.equal(G.CH.title, "Ai đứng sau Hẻm Bàn Tán?");
  assert.equal(G.CH.coach, undefined);
  assert.equal(G.CH.culprit, "Trịnh Văn Lộc");
});

test("mật khẩu từng thư mục, kể cả cách gõ khác", () => {
  const cases = {hoa: ["Bé Bông 2019", "bong2019"], ngan: ["Pate"], bin: ["Mướp"], loc: ["0712 1988", "07121988"]};
  for (const [k, ps] of Object.entries(cases)) for (const p of ps) {
    const G = ch3();
    assert.equal(G.tryUnlock(k, "0712"), false, `${k} không mở bằng mật khẩu sai`);
    assert.equal(G.tryUnlock(k, p), true, `${k} mở bằng "${p}"`);
  }
});

test("mỗi mục thùng rác trỏ tới thư mục có thật và khôi phục được bằng mật khẩu của nó", () => {
  const pass = {ngan: "pate", bin: "muop", loc: "07121988"};
  for (const t of loadGame().CHAPTERS[2].trash) {
    const G = ch3(); // bản mới cho từng mục: thư mục chưa mở khóa
    const f = G.CH.drive.folders.find(x => x.k === t.from);
    assert.ok(f && f.lock, `${t.k}.from`);
    assert.equal(G.tryRestore(t.k, "sai"), false);
    assert.equal(G.tryRestore(t.k, pass[t.from]), true, t.k);
  }
});

test("tên thư mục có họ tên đầy đủ để tìm Mặt Sách", () => {
  const G = ch3();
  const P = Object.values(G.CH.profiles).map(p => p.n);
  for (const f of G.CH.drive.folders.filter(f => f.lock)) {
    const full = f.n.split(" — ")[1];
    assert.ok(P.includes(full), `${f.n} → hồ sơ ${full}`);
  }
});

test("Thùng rác và chat không lộ hung thủ", () => {
  const G = ch3();
  assert.ok(!G.R.trash().includes("Lộc"));
  for (const m of G.CH.chats.ti) assert.ok(!(m.x || "").includes("Lộc"), m.x);
  for (const m of G.CH.chats.hai) assert.ok(!(m.x || "").includes("Lộc"), m.x);
});

test("gõ thiếu họ tên hung thủ thì nhắc ghi đủ", () => {
  const G = ch3();
  assert.match(G.CH.check("loc", "ghep").m, /đủ họ tên/);
  assert.match(G.CH.check("chu loc", "ghep").m, /đủ họ tên/);
});

test("trang Hẻm Bàn Tán và Bánh Mì Chị Hai tìm được bằng tên trang", () => {
  const G = ch3();
  const n = G.norm;
  for (const name of ["Hẻm Bàn Tán", "Bánh Mì Chị Hai", "Trịnh Văn Lộc", "Trần Thị Mai"]) {
    const hit = Object.values(G.CH.profiles).some(p => n(p.n).includes(n(name)) && n(name).split(" ").length >= 2);
    assert.ok(hit, name);
  }
});

test("gõ thiếu họ tên không bị trừ lượt gửi", () => {
  for (const [ci, name, how] of [[2, "chú Lộc", "ghep"], [1, "Đức", "copy"], [0, "Khoa", ""]]) {
    const G = loadGame(); G.setCh(ci);
    G.accuse(name, how);
    assert.equal(G.S.tries, 3, `chương ${ci + 1}: "${name}"`);
    assert.match(G.S.verdict, /họ tên/);
  }
  const G = ch3(); G.accuse("Nguyễn Thị Hòa", "ghep");
  assert.equal(G.S.tries, 2, "nghi phạm sai vẫn bị trừ lượt");
});

test("số điện thoại người mượn chìa chỉ nối được qua thư mục Lộc", () => {
  const C = ch3().CH;
  const pub = JSON.stringify([C.shop, C.news, C.profiles, C.chats]);
  assert.ok(!pub.includes("0913 418 052"), "SĐT không được nằm ở chỗ công khai");
  assert.ok(C.drive.folders.find(f => f.k === "loc").files.hd.x.includes("0913 418 052"));
});

test("mật khẩu Lộc phải ghép hai chỗ: biển số và năm mua không chung một câu", () => {
  const C = ch3().CH;
  const texts = Object.values(C.profiles).flatMap(p => p.posts.flatMap(po => [po.x, ...po.cm.map(c => c.x)]));
  assert.ok(texts.some(x => x.includes("0712")) && texts.some(x => x.includes("1988")));
  assert.ok(!texts.some(x => x.includes("0712") && x.includes("1988")));
});

test("đáp án cách dựng ảnh không phải phương án duy nhất nói tới ảnh trên mạng", () => {
  const how = ch3().CH.form.how;
  const wrong = how.opts.filter(o => o.v !== how.a);
  assert.ok(wrong.some(o => /mạng/.test(o.l)));
});

test("học viên khác về trước giờ tạo ảnh; ảnh hẻm không ghi buổi sáng", () => {
  const C = ch3().CH;
  assert.match(C.drive.folders.find(f => f.k === "chung").files.lop.x, /về lúc 19:00/);
  assert.ok(!/sáng/.test(C.photos.hem.n));
});

test("lời giải không nói số điện thoại trùng tin Chợ Hẻm (tin đó không có số)", () => {
  assert.ok(!/cùng số với tin/.test(ch3().CH.solution));
});

test("họ tên đầy đủ kèm danh xưng hoặc dấu câu vẫn được nhận", () => {
  for (const [ci, name, how] of [[2, "chú Trịnh Văn Lộc.", "ghep"], [1, "anh Phạm Quốc Đức!", "copy"], [0, "Lê Minh Khoa.", ""]]) {
    const G = loadGame(); G.setCh(ci);
    G.accuse(name, how);
    assert.equal(G.S.solved, true, `chương ${ci + 1}: "${name}" → ${G.S.verdict}`);
  }
});
