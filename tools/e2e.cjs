// Chạy: PW=<thư mục playwright-core> node tools/e2e.cjs
const pw = require(process.env.PW || "playwright-core");
const {spawn} = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "tools", ".shots");
const URL = "http://127.0.0.1:8765/index.html";
fs.mkdirSync(OUT, {recursive: true});

const sleep = ms => new Promise(r => setTimeout(r, ms));
const closeAll = page => page.evaluate(() => {
  document.querySelectorAll(".coach,.hint-pop").forEach(c => c.remove()); // mẹo / gợi ý có thể che nút
  document.querySelectorAll(".win .x").forEach(b => b.click());
});
async function open(page, app){ await closeAll(page); await page.click(`.dock [data-open="${app}"]`); return page.locator(`.win[data-app="${app}"]`); }
async function startCh(page, i){
  await page.click("#b-chap"); await page.click(`[data-ch="${i}"]`); await page.click(".modal [data-ok]");
  await page.waitForSelector('.win[data-app="chat"]');
}
function expect(cond, msg){ if (!cond) throw new Error("FAIL: " + msg); }

(async () => {
  const srv = spawn("python3", ["-m", "http.server", "8765", "--bind", "127.0.0.1"], {cwd: ROOT, stdio: "ignore"});
  await sleep(800);
  const browser = await pw.chromium.launch({channel: "chrome", headless: true});
  const errors = [];
  try {
    // ---------- Desktop: chương 1 → 2 (luồng chương + nhãn chương 2) ----------
    let page = await browser.newPage({viewport: {width: 1280, height: 800}});
    page.on("pageerror", e => errors.push("desk: " + e.message));
    page.on("console", m => { if (m.type() === "error" && !/fonts\.g|Failed to load resource/.test(m.text())) errors.push("desk: " + m.text()); });
    page.on("response", r => { if (r.status() >= 400 && !/favicon\.ico$/.test(r.url())) errors.push(`desk: ${r.status()} ${r.url()}`); });
    await page.goto(URL);
    expect(await page.locator("#b-play").count() === 0, "không còn nút Bắt đầu chơi");
    expect((await page.textContent("#b-chap")).includes("Chương 1: Thám tử tập sự"), "nút Chọn chương là nút chính");
    await startCh(page, 0);
    let w = await open(page, "files");
    expect((await w.textContent()).includes("chưa có tệp"), "chương 1 Tệp trống");
    expect(await page.locator('.dock [data-open="trash"]').count() === 0, "chương 1 không có Thùng rác");
    w = await open(page, "file");
    await w.locator("#acc-in").fill("Lê Minh Khoa"); await w.locator("#acc-in").press("Enter");
    await w.locator(".stamp").waitFor();
    await w.locator("[data-next]").click(); await page.click(".modal [data-ok]");
    await page.waitForSelector('.win[data-app="chat"]');
    w = await open(page, "file");
    await w.locator("#acc-in").fill("Phạm Quốc Đức"); await w.locator("#acc-in").press("Enter");
    expect((await w.locator(".verdict").textContent()).includes("vào kho"), "chương 2 câu nhắc chọn cách");
    await page.click("#mb-home"); await page.click(".modal [data-ok]");
    await page.click("#b-chap");
    expect(/Phần 1\.[^]*?Đã phá/.test(await page.textContent(".chapters")), "phần 1 hiện Đã phá");
    await page.click(".modal [data-x]");

    // ---------- Desktop: Chương 1 · Phần 3 ----------
    await startCh(page, 2);
    await sleep(500);
    await page.screenshot({path: path.join(OUT, "ch1p3-desk-start.png")});
    expect(await page.locator('.dock [data-open="trash"]').count() === 1, "phần 3 có Thùng rác");

    // Thùng rác: khôi phục IMG_0847 cần mật khẩu Lộc
    w = await open(page, "trash");
    expect(!(await w.textContent()).includes("Lộc"), "Thùng rác không lộ Lộc");
    await w.locator('[data-rs="img47"]').click();
    const rin = w.locator('[data-rsf="img47"] input');
    await rin.fill("0712"); await rin.press("Enter");
    expect((await w.locator(".pw-err").textContent()).includes("Sai mật khẩu"), "khôi phục sai mật khẩu");
    await w.locator('[data-rsf="img47"] input').fill("0712 1988"); await w.locator('[data-rsf="img47"] input').press("Enter");
    expect((await w.textContent()).includes("Đã khôi phục về"), "khôi phục được IMG_0847");
    await w.locator('[data-rs="img48"]').click(); // thư mục Lộc đã mở → khôi phục ngay
    expect((await w.locator(".tr.done").count()) === 2, "IMG_0848 khôi phục không cần mật khẩu");
    await w.locator('[data-pin="t:img47"]').click({force: true});
    await page.screenshot({path: path.join(OUT, "ch1p3-desk-trash.png")});

    // Ảnh: xem ảnh gốc
    w = await open(page, "photos");
    await w.locator('[data-photo="t.img47"]').click();
    const viewer = await w.locator(".viewer").innerHTML();
    expect(viewer.includes("anhmienphi.vn") && viewer.includes("tài khoản Lộc"), "ảnh gốc có dấu mờ và thông tin tệp");

    // Tệp: thư mục Lộc đã mở; thư mục Hòa mở bằng mật khẩu có dấu
    w = await open(page, "files");
    await w.locator('[data-fold="loc"]').click();
    expect((await w.textContent()).includes("Nhap_hop_dong_Ca_phe_May.txt"), "thư mục Lộc đã mở sau khi khôi phục");
    await w.locator('[data-fold="hoa"]').click();
    expect(!(await w.textContent()).includes("Ke_hoach"), "thư mục Hòa còn khóa không lộ tệp");
    await w.locator("#pw-in").press("Enter");
    expect((await w.locator(".pw-err").textContent()).includes("Nhập mật khẩu"), "mật khẩu trống");
    await w.locator("#pw-in").fill("Bé Bông 2019"); await w.locator("#pw-in").press("Enter");
    expect((await w.textContent()).includes("Ke_hoach_ban_cho_dem_T7.txt"), "mở thư mục Hòa");
    const over = await w.locator(".files-list").evaluate(el => el.scrollWidth - el.clientWidth);
    expect(over <= 0, `cột thư mục tràn ngang ${over}px`);
    await page.screenshot({path: path.join(OUT, "ch1p3-desk-files.png")});

    // Sổ vụ án có mục Thùng rác đã ghim
    w = await open(page, "nb");
    expect((await w.textContent()).includes("IMG_0847"), "Sổ vụ án có mục đã ghim từ Thùng rác");

    // Hồ sơ: sai rồi đúng
    w = await open(page, "file");
    const cut = await page.evaluate(() => { const win = document.querySelector('.win[data-app="file"]'), b = win.querySelector(".act .btn.go");
      return b.getBoundingClientRect().bottom - win.getBoundingClientRect().bottom; });
    expect(cut <= 0, `nút Gửi bị cắt ${cut}px`);
    await w.locator("#acc-in").fill("Trịnh Lộc"); await w.locator("#how-ghep").check(); await w.locator("#acc-in").press("Enter");
    expect((await w.textContent()).includes("Còn 3/3"), "gõ thiếu họ tên không trừ lượt");
    await w.locator("#acc-in").fill("Nguyễn Thị Hòa"); await w.locator("#how-ghep").check(); await w.locator("#acc-in").press("Enter");
    expect((await w.locator(".verdict").textContent()).includes("trú mưa"), "phản hồi riêng cho cô Hòa");
    await w.locator("#acc-in").fill("Trịnh Văn Lộc"); await w.locator("#how-ghep").check(); await w.locator("#acc-in").press("Enter");
    await w.locator(".stamp").waitFor();
    expect((await w.textContent()).includes("Chương 2: Thám tử thực thụ"), "màn thắng phần cuối mời sang Chương 2");
    await page.screenshot({path: path.join(OUT, "ch1p3-desk-win.png")});
    // ---------- Desktop: Chương 2 · Phần 1 (đối chất) ----------
    await page.goto(URL);
    await startCh(page, 3);
    w = await open(page, "files");
    await w.locator('[data-fsel="case|don"]').click();
    await w.locator('.doc header [data-pin="f:don"]').click({force: true});
    await w.locator('[data-fsel="case|bienban"]').click();
    await w.locator('.doc header [data-pin="f:bienban"]').click({force: true});
    expect(!(await w.textContent()).includes("Anh_xac_nhan"), "tệp ảnh xác nhận còn ẩn");
    w = await open(page, "chat");
    await w.locator('[data-chat="huy"]').click();
    await w.locator("[data-cfopen]").click();
    await w.locator('[data-cf="f:don"]').click();
    expect((await w.locator(".msgs").textContent()).includes("em nói thiệt"), "Huy khai lại");
    await w.locator('[data-chat="bay"]').click();
    await w.locator("[data-cfopen]").click();
    await w.locator('[data-cf="f:bienban"]').click();
    expect((await w.locator(".msgs").textContent()).includes("tự khóa"), "cô Bảy nói khóa tự khóa");
    await page.screenshot({path: path.join(OUT, "ch2p1-confront.png")});
    w = await open(page, "files");
    expect((await w.textContent()).includes("Anh_xac_nhan_GN-88213.txt"), "Huy gửi tệp ảnh xác nhận");
    w = await open(page, "file");
    await w.locator("#acc-in").fill("Đỗ Minh Tú"); await w.locator("#how-bam").check(); await w.locator("#acc-in").press("Enter");
    await w.locator(".stamp").waitFor();
    expect((await w.textContent()).includes("Phần 2: Khoản chi không có trong sổ →"), "màn thắng chương 2 phần 1 mời sang phần 2");
    // ---------- Desktop: Chương 2 · Phần 2 (gợi ý, suy luận, Hồ sơ 3 câu) ----------
    await page.goto(URL);
    await startCh(page, 4);
    await page.click("#mb-hint");
    expect((await page.textContent(".hint-pop")).includes("bước 1/8"), "gợi ý bắt đầu ở bước 1");
    await page.click(".hint-pop [data-hmore]");
    expect(await page.locator(".hint-pop .tip").count() === 2, "mở nấc 2");
    await page.screenshot({path: path.join(OUT, "ch2p2-hint.png")});
    w = await open(page, "files");
    await w.locator('[data-fold="nganhang"]').click();
    expect((await w.textContent()).includes("72.500.000"), "sao kê hiện số dư");
    await w.locator('[data-fsel="nganhang|chitiet"]').click();
    await w.locator('.doc header [data-pin="f:nganhang:chitiet"]').click({force: true});
    await page.click("#mb-hint");
    expect((await page.textContent(".hint-pop")).includes("bước 3/8"), "gợi ý theo kịp sau khi đọc sao kê và chi tiết");
    w = await open(page, "chat");
    await w.locator('[data-chat="btc"]').click();
    await w.locator('[data-pin="c:btc:1"]').click({force: true});
    w = await open(page, "nb");
    await w.locator('[data-nb="deduce"]').click();
    await w.locator('[data-dsel="f:nganhang:chitiet"]').check();
    await w.locator('[data-dsel="c:btc:1"]').check();
    await w.locator("[data-dgo]").click();
    expect((await w.locator(".ded").first().textContent()).includes("tài khoản của anh Hiển"), "ghép ra suy luận d3");
    await page.screenshot({path: path.join(OUT, "ch2p2-deduce.png")});
    w = await open(page, "file");
    await w.locator("#acc-in").fill("Lâm Gia Hiển"); await w.locator("#how-ck").check(); await w.locator("#why-so").check();
    await w.locator("#acc-in").press("Enter");
    expect((await w.locator(".verdict").textContent()).includes("Suy luận"), "chưa đủ suy luận thì chưa nộp được");
    expect((await w.textContent()).includes("Còn 3/3"), "không trừ lượt");
    // đi tiếp tới hết vụ
    const confront = async (who, pid, must) => {
      const c = await open(page, "chat");
      await c.locator(`[data-chat="${who}"]`).click();
      await c.locator("[data-cfopen]").click();
      await c.locator(`[data-cf="${pid}"]`).click();
      expect((await c.locator(".msgs").textContent()).includes(must), `đối chất ${who} bằng ${pid}`);
    };
    const pinFile = async (fsel, pid, fold) => {
      const t = await open(page, "files");
      if (fold) await t.locator(`[data-fold="${fold}"]`).click();
      await t.locator(`[data-fsel="${fsel}"]`).click();
      await t.locator(`.doc header [data-pin="${pid}"]`).click({force: true});
    };
    const ghep = async (pids, must) => {
      const n = await open(page, "nb");
      await n.locator('[data-nb="deduce"]').click();
      for (const id of pids) await n.locator(`[data-dsel="${id}"]`).check();
      await n.locator("[data-dgo]").click();
      expect((await n.textContent()).includes(must), `ghép ra: ${must}`);
    };
    await pinFile("quy|hoadon", "f:quy:hoadon", "quy");
    await confront("van", "f:quy:hoadon", "9 giờ 5");
    await pinFile("case|mayin", "f:mayin");
    await ghep(["f:nganhang:chitiet", "f:quy:hoadon", "f:mayin"], "sau khi tiền đã đi");
    await pinFile("camgoc|camgoc", "f:camgoc:camgoc", "camgoc");
    await confront("quan", "f:camgoc:camgoc", "bê cái hộp");
    w = await open(page, "chat");
    await w.locator('[data-chat="btc"]').click();
    await w.locator('[data-pin="c:btc:15"]').click({force: true});
    await confront("quan", "c:btc:15", "kho ngoài");
    await pinFile("case|tinquan", "f:tinquan");
    await pinFile("case|soquy", "f:soquy");
    await ghep(["f:tinquan", "f:soquy"], "giấu cuốn sổ");
    w = await open(page, "file");
    await w.locator("#acc-in").fill("Lâm Gia Hiển"); await w.locator("#how-ck").check(); await w.locator("#why-so").check();
    await w.locator("#acc-in").press("Enter");
    await w.locator(".stamp").waitFor();
    expect((await w.textContent()).includes("Phá án với 3 gợi ý."), "màn thắng đếm gợi ý");
    await page.screenshot({path: path.join(OUT, "ch2p2-win.png")});
    await page.close();

    // ---------- Mobile: Chương 1 · Phần 3 ----------
    page = await browser.newPage({viewport: {width: 390, height: 844}});
    page.on("pageerror", e => errors.push("mobile: " + e.message));
    await page.goto(URL);
    await startCh(page, 2);
    w = await open(page, "files");
    await w.locator('[data-fold="ngan"]').click();
    await page.screenshot({path: path.join(OUT, "ch1p3-mobile-lock.png")});
    w = await open(page, "trash");
    await page.screenshot({path: path.join(OUT, "ch1p3-mobile-trash.png")});
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw <= 390, "mobile không cuộn ngang");
    await page.goto(URL);
    await startCh(page, 4);
    await page.click("#mb-hint");
    await sleep(300);
    await page.screenshot({path: path.join(OUT, "ch2p2-mobile-hint.png")});
    const mb = await page.evaluate(() => ({h: document.querySelector(".menubar").scrollHeight, w: document.documentElement.scrollWidth,
      pop: document.querySelector(".hint-pop").getBoundingClientRect().right}));
    expect(mb.h <= 30 && mb.w <= 390 && mb.pop <= 390, `mobile: thanh menu ${mb.h}px, rộng ${mb.w}px, gợi ý tới ${mb.pop}px`);
    await page.close();
  } finally {
    await browser.close(); srv.kill();
  }
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  console.log("E2E OK");
})().catch(e => { console.error(e); process.exit(1); });
