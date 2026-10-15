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
  document.querySelectorAll(".coach").forEach(c => c.remove()); // mẹo chương 1 có thể che nút
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
    expect((await page.textContent("#b-play em")).includes("Chương 1"), "nút Bắt đầu chơi trỏ chương 1");
    await page.click("#b-play"); await page.click(".modal [data-ok]");
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
    expect((await page.textContent("#b-play em")).includes("Chương 2"), "Bắt đầu chơi trỏ chương 2 sau khi phá chương 1");

    // ---------- Desktop: chương 3 ----------
    await startCh(page, 2);
    await sleep(500);
    await page.screenshot({path: path.join(OUT, "ch3-desk-start.png")});
    expect(await page.locator('.dock [data-open="trash"]').count() === 1, "chương 3 có Thùng rác");

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
    await page.screenshot({path: path.join(OUT, "ch3-desk-trash.png")});

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
    await page.screenshot({path: path.join(OUT, "ch3-desk-files.png")});

    // Sổ vụ án có mục Thùng rác đã ghim
    w = await open(page, "nb");
    expect((await w.textContent()).includes("IMG_0847"), "Sổ vụ án có mục đã ghim từ Thùng rác");

    // Hồ sơ: sai rồi đúng
    w = await open(page, "file");
    await w.locator("#acc-in").fill("Nguyễn Thị Hòa"); await w.locator("#how-ghep").check(); await w.locator("#acc-in").press("Enter");
    expect((await w.locator(".verdict").textContent()).includes("trú mưa"), "phản hồi riêng cho cô Hòa");
    await w.locator("#acc-in").fill("Trịnh Văn Lộc"); await w.locator("#how-ghep").check(); await w.locator("#acc-in").press("Enter");
    await w.locator(".stamp").waitFor();
    expect((await w.textContent()).includes("Chương mới sắp ra mắt"), "màn thắng chương cuối");
    await page.screenshot({path: path.join(OUT, "ch3-desk-win.png")});
    await page.close();

    // ---------- Mobile: chương 3 ----------
    page = await browser.newPage({viewport: {width: 390, height: 844}});
    page.on("pageerror", e => errors.push("mobile: " + e.message));
    await page.goto(URL);
    await startCh(page, 2);
    w = await open(page, "files");
    await w.locator('[data-fold="ngan"]').click();
    await page.screenshot({path: path.join(OUT, "ch3-mobile-lock.png")});
    w = await open(page, "trash");
    await page.screenshot({path: path.join(OUT, "ch3-mobile-trash.png")});
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw <= 390, "mobile không cuộn ngang");
    await page.close();
  } finally {
    await browser.close(); srv.kill();
  }
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  console.log("E2E OK");
})().catch(e => { console.error(e); process.exit(1); });
