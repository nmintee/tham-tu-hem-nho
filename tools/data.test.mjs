import test from "node:test";
import assert from "node:assert/strict";
import {loadGame} from "./load-game.mjs";

const G = loadGame();

G.CHAPTERS.forEach((C, ci) => {
  const tag = `chương ${ci + 1}`;

  test(`${tag}: handle Mặt Sách đều tồn tại`, () => {
    const P = C.profiles;
    for (const [hd, p] of Object.entries(P)) {
      for (const f of p.friends) assert.ok(P[f], `${hd}.friends → ${f}`);
      for (const po of p.posts) for (const cm of po.cm)
        if (cm.h) assert.ok(P[cm.h], `${hd}: bình luận của ${cm.h}`);
    }
    for (const msgs of Object.values(C.chats)) for (const m of msgs)
      if (m.link && m.link.startsWith("matsach.vn/")) assert.ok(P[m.link.slice(11)], `link ${m.link}`);
    if (C.fbStart) assert.ok(P[C.fbStart], `fbStart ${C.fbStart}`);
  });

  test(`${tag}: chat lead tồn tại, mọi hội thoại có trong danh bạ`, () => {
    assert.equal(C.lead, "ti");
    assert.ok(C.chats[C.lead]);
    for (const k of Object.keys(C.chats)) assert.ok(C.people[k], `people.${k}`);
  });

  test(`${tag}: đáp án đúng được nhận, đáp án sai có phản hồi riêng`, () => {
    const how = C.form.how;
    const culprit = G.norm(C.culprit);
    assert.deepEqual({...C.check(culprit, how ? how.a : "")}, {ok: 1});
    if (how) for (const o of how.opts) if (o.v !== how.a) {
      const r = C.check(culprit, o.v);
      assert.ok(!r.ok && r.m && r.m.length > 10, `cách sai "${o.v}" thiếu phản hồi`);
    }
    const last = culprit.split(" ").pop();
    const generic = C.check("xyz khong co ten", how ? how.a : "").m;
    for (const s of C.suspects) {
      if (G.norm(s.n).split(" ").pop() === last) continue;
      const r = C.check(G.norm(s.n), how ? how.a : "");
      assert.ok(!r.ok && r.m && r.m !== generic, `nghi phạm ${s.n} thiếu phản hồi riêng`);
    }
  });
});
