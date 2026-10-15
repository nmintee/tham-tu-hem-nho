import test from "node:test";
import assert from "node:assert/strict";
import {loadGame} from "./load-game.mjs";

const idx = G => G.CHAPTERS.findIndex(c => c.vol === 2 && c.title === "Khoản chi không có trong sổ");
const ch = () => { const G = loadGame(); G.setCh(idx(G)); return G; };
const showD = (G, fo, k) => { G.S.folder = fo; G.S.fileSel = k; G.R.files(); };
const pinBtc = (G, ev) => { G.S.chat = "btc"; G.R.chat(); const i = G.CH.chats.btc.findIndex(m => m.ev === ev); G.pin(`c:btc:${i}`); return `c:btc:${i}`; };

test("Chương 2 · Phần 2 có gợi ý, suy luận, Hồ sơ 3 câu", () => {
  const G = ch();
  assert.equal(G.partLabel(idx(G)), "Chương 2 · Phần 2");
  assert.equal(G.CH.hints.length, 8);
  assert.ok(G.CH.deduce.length >= 4 && G.CH.form.why && G.CH.form.proof.length === 3);
});

test("mọi dấu vết trong gợi ý đều có thể xảy ra", () => {
  const C = ch().CH;
  const fileKeys = new Set([...Object.keys(C.files), ...C.drive.folders.flatMap(f => Object.keys(f.files)), ...C.trash.map(t => "t." + t.k)]);
  for (const st of C.hints) {
    assert.equal(st.tips.length, 3);
    for (const c of st.done.flat()) {
      const [kind, a, b] = c.split(":");
      if (kind === "file") assert.ok(fileKeys.has(a), c);
      else if (kind === "cf") assert.ok(C.confront[a] && C.confront[a][b], c);
      else if (kind === "deduce") assert.ok(C.deduce.some(d => d.id === a), c);
      else assert.fail("dấu vết lạ " + c);
    }
  }
});

test("mọi ev trong suy luận và đối chất có ở một chi tiết ghim được; give là tệp ẩn", () => {
  const C = ch().CH, evs = new Set();
  const add = o => { if (o && o.ev) evs.add(o.ev); };
  Object.values(C.chats).flat().forEach(add);
  Object.values(C.files).forEach(add);
  C.drive.folders.forEach(f => Object.values(f.files).forEach(add));
  C.trash.forEach(add);
  Object.values(C.profiles).forEach(p => p.posts.forEach(po => { add(po); po.cm.forEach(add); }));
  for (const d of C.deduce) for (const g of d.need) assert.ok(g.ev.some(e => evs.has(e)), `${d.id}: ${g.l}`);
  for (const [p, r] of Object.entries(C.confront)) for (const [k, v] of Object.entries(r)) if (k !== "_") {
    assert.ok(evs.has(k), `${p}.${k}`);
    for (const g of [].concat(v.give || [])) assert.ok(C.files[g] && C.files[g].hidden, `${p}.${k} give ${g}`);
  }
});

test("sổ tiền khớp: 86 − 6 = 80 gửi, 80 − 7,5 = 72,5", () => {
  const C = ch().CH, f = k => C.drive.folders.flatMap(x => Object.entries(x.files)).find(([kk]) => kk === k)[1].x;
  assert.match(f("tongket"), /86\.000\.000/); assert.match(f("tongket"), /80\.000\.000/);
  assert.match(f("saoke"), /-7\.500\.000\s+72\.500\.000/);
  assert.match(C.files.soquy.x, /Cộng chi:\s+6\.000\.000/);
});

test("đi trọn vụ theo đúng các bước gợi ý rồi phá án", () => {
  const G = ch();
  assert.equal(G.hintStep(), 0);
  showD(G, "nganhang", "saoke"); assert.equal(G.hintStep(), 1);
  showD(G, "nganhang", "chitiet"); assert.equal(G.hintStep(), 2);
  G.pin("f:nganhang:chitiet"); const stk = pinBtc(G, "stkhien");
  assert.equal(G.deduceTry(["f:nganhang:chitiet", stk]).found.id, "d3"); assert.equal(G.hintStep(), 3);
  showD(G, "quy", "hoadon"); G.pin("f:quy:hoadon");
  assert.deepEqual([...G.confront("van", "f:quy:hoadon").gave], ["mayin", "tinvan"]); assert.equal(G.hintStep(), 4);
  showD(G, "case", "mayin"); G.pin("f:mayin");
  assert.equal(G.deduceTry(["f:nganhang:chitiet", "f:quy:hoadon", "f:mayin"]).found.id, "d2"); assert.equal(G.hintStep(), 5);
  showD(G, "camgoc", "camgoc"); G.pin("f:camgoc:camgoc");
  assert.equal(G.confront("quan", "f:camgoc:camgoc").gave, "tinquan"); assert.equal(G.hintStep(), 6);
  const bc = pinBtc(G, "baocao");
  assert.equal(G.confront("quan", bc).gave, "soquy"); assert.equal(G.hintStep(), 7);
  showD(G, "case", "tinquan"); G.pin("f:tinquan"); showD(G, "case", "soquy"); G.pin("f:soquy");
  assert.equal(G.deduceTry(["f:tinquan", "f:soquy"]).found.id, "d4"); assert.equal(G.hintStep(), -1);
  assert.ok(G.confront("hien", "f:soquy").hit);
  assert.ok(G.S.cx.hien.some(m => /xin lỗi Thư/.test(m.x)));
  G.accuse("Lâm Gia Hiển", "ck", "so");
  assert.equal(G.S.solved, true);
  assert.ok(G.R.file().includes("Phá án không cần gợi ý luôn ta, gớm dữuuuu"));
});

test("Quân chưa bị đối chất bằng camera gốc thì chưa khai cuốn sổ", () => {
  const G = ch();
  const bc = pinBtc(G, "baocao");
  assert.equal(G.confront("quan", bc).hit, false);
  assert.equal(G.S.cx.quan.at(-1).x, "Báo cáo gì em hông rành, anh hỏi anh Hiển đi.");
});

test("chưa đủ suy luận thì không nộp được; nghi phạm sai sau khi đủ thì trừ lượt", () => {
  const G = ch();
  G.accuse("Đoàn Minh Thư", "thieu", "no");
  assert.match(G.S.verdict, /Suy luận/); assert.equal(G.S.tries, 3);
  G.S.dFound.push("d2", "d3", "d4");
  G.accuse("Đoàn Minh Thư", "thieu", "no");
  assert.equal(G.S.tries, 2); assert.match(G.S.verdict, /biên nhận/);
  G.accuse("Hiển", "ck", "so"); assert.equal(G.S.tries, 2);
});
