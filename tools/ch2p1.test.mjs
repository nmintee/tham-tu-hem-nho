import test from "node:test";
import assert from "node:assert/strict";
import {loadGame} from "./load-game.mjs";

const idx = G => G.CHAPTERS.findIndex(c => c.vol === 2);
const ch = () => { const G = loadGame(); G.setCh(idx(G)); return G; };

test("Chương 2 phần 1 tồn tại, có mẹo và bảng đối chất", () => {
  const G = ch();
  assert.equal(G.CH.title, "Căn phòng khóa trái");
  assert.equal(G.partLabel(idx(G)), "Chương 2 · Phần 1");
  assert.equal(G.showsCoach(idx(G)), true);
  assert.deepEqual(Object.keys(G.CH.confront).sort(), ["bao", "bay", "huy", "tram", "tu"]);
});

test("mọi ev trong bảng đối chất có ở một chi tiết; mọi give là tệp ẩn có thật", () => {
  const C = ch().CH;
  const evs = new Set();
  const add = o => { if (o && o.ev) evs.add(o.ev); };
  Object.values(C.chats).flat().forEach(add);
  Object.values(C.files).forEach(add);
  Object.values(C.profiles).forEach(p => p.posts.forEach(po => { add(po); po.cm.forEach(add); }));
  Object.values(C.confront).forEach(r => Object.values(r).forEach(v => v.reply && v.reply.forEach(m => typeof m === "object" && add(m))));
  for (const [p, r] of Object.entries(C.confront)) {
    assert.ok(typeof r._ === "string" && r._, `${p} thiếu câu chung`);
    for (const [k, v] of Object.entries(r)) if (k !== "_") {
      assert.ok(evs.has(k), `${p}.${k} không có chi tiết nào mang ev này`);
      if (v.give) assert.ok(C.files[v.give] && C.files[v.give].hidden, `${p}.${k}.give`);
    }
  }
});

test("đường suy luận chính đi được bằng đối chất", () => {
  const G = ch();
  const open = k => { G.S.folder = "case"; G.S.fileSel = k; G.R.files(); };
  open("don"); G.pin("f:don");
  assert.equal(G.confront("huy", "f:don").gave, "anhxn");
  G.S.fileSel = "anhxn"; G.S.folder = "case";
  assert.match(G.R.files(), /giày bảo hộ màu cam/);
  open("bienban"); G.pin("f:bienban");
  assert.ok(G.confront("bay", "f:bienban").hit);
  assert.ok(G.S.cx.bay.some(m => /tự khóa/.test(m.x)));
  assert.ok(G.confront("tram", "f:bienban").hit);
  assert.ok(G.S.cx.tram.some(m => m.ev === "meovang"));
});

test("tin nhắn chat không nêu hung thủ là nghi phạm", () => {
  const C = ch().CH;
  for (const k of ["ti", "bay", "tram", "bao", "huy"]) for (const m of C.chats[k]) assert.ok(!/Tú.*(giết|hung thủ)/.test(m.x || ""));
});

test("Hồ sơ: đúng người đúng cách; thiếu họ tên không trừ lượt", () => {
  const G = ch();
  assert.deepEqual({...G.CH.check("do minh tu", "bam")}, {ok: 1});
  G.accuse("Tú", "bam"); assert.equal(G.S.tries, 3);
  G.accuse("anh Đỗ Minh Tú", "bam"); assert.equal(G.S.solved, true);
});
