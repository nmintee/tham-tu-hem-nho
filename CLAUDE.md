# Thám Tử Hẻm Nhỏ — ghi chú dự án

Game trinh thám tiếng Việt chạy trong trình duyệt, lấy cảm hứng từ https://thamtubanphim.netlify.app/ (Thám Tử Bàn Phím).
Người chơi ngồi trước một "máy tính giả lập" (Phố Xanh), mở app trên Dock, đọc tin nhắn, lướt web, ghim chi tiết và gửi tên thủ phạm.

Toàn bộ game nằm trong **một file `index.html`** (HTML + CSS + JS thuần, không thư viện, không build). Deploy bằng Netlify Drop hoặc GitHub Pages: chỉ cần upload `index.html`.

## Cấu trúc code (trong thẻ `<script>`)
- `SVG` — toàn bộ hình minh họa vẽ bằng SVG inline (không dùng file ảnh).
- **Chương** là nhóm nhiều **phần**; mỗi phần là một vụ án. `VOLS` — tên các chương (`{1:{title},2:{title,soon:true}}`). `CHAPTERS` — mảng các phần (vụ án) theo thứ tự chơi, mỗi phần có `vol` = số chương. Thêm phần/chương mới = thêm object vào mảng (và tên vào `VOLS`), không cần sửa code giao diện.
- `partLabel(i)` → "Chương 1 · Phần 2"; `nextLabel`, `soonVol()` — nhãn sang phần/chương sau, chương sắp ra mắt.
- `S` — state của chương đang chơi (`freshState(ci)` khởi tạo lại).
- `R` — các hàm render từng app: `chat`, `web`, `files`, `photos`, `nb` (Sổ vụ án), `file` (Hồ sơ), `trash` (Thùng rác).
- `confront(p, id)` — Đối chất: đưa chi tiết đã ghim `id` cho người `p`, ghi tin vào `S.cx[p]`, mở tệp ẩn qua `S.given`. `showsCoach(i)` — mẹo hiện ở phần đầu mỗi chương.
- `pwNorm`, `tryUnlock`, `tryRestore` — thư mục khóa và Thùng rác; `dockApps()` — app hiện trên Dock; `nextCh()` — chương đầu tiên chưa phá.
- `bind(k, c)` — gắn sự kiện sau mỗi lần render app `k`.
- `fbPage(u)` / `fbFind(q)` — trang Mặt Sách (Facebook giả).
- `openApp`, `focus`, `drag` — quản lý cửa sổ (đóng / thu nhỏ / phóng to / kéo thả).
- `nav(u)` / `histGo(d)` — lịch sử trình duyệt (nút ← →).
- `startChapter(ci)`, `goHome()`, `showIntro(ci)` — luồng game.
- Tiến độ chương đã phá lưu trong `localStorage` key `tthn-done`.

## Schema một chương
```
{ vol, title, place, day:"CN 14/9", start:[giờ,phút], deskLabel, art, intro, lead:"ti",
  people:{key:{n,i,c}},                    // danh bạ app Nhắn
  chats:{key:[{day}|{t,x,who?,link?,ev?}]}, // tin nhắn; link = URL mở trong app Lướt
  clues:{...},                              // (cũ) không còn dùng để hiển thị
  fbStart, profiles:{handle:{n,i,c,alias?,page?,bio,live,from?,friends:[handle],
            posts:[{t,x,svg?,likes,ev?,cm:[{h:handle | n:tên, t, x, ev?}]}]}},
  shop:[{n,p,s,t,d?,svg,k}], shopHint, news:[{h,t,svg?,x}],
  photos:{k:{n,svg,ev?}}, files:{k:{n,x,ev?,hidden?}},          // hidden: chỉ hiện khi nghi phạm gửi (confront.give)
  drive?:{n, folders:[{k,n,lock?:{hint,pass:[…]},files:{k:{n,x,m?}}}]},   // ổ đĩa có thư mục khóa (Tệp)
  trash?:[{k,n,by,when,from,kind:"file"|"photo",x?,svg?,info?}],          // app Thùng rác; khôi phục cần mật khẩu thư mục gốc
  confront?:{người:{ev:{reply:["…"|{x,ev?}],give?:"khóa tệp ẩn"},_:"câu đáp chung"}},  // Đối chất (app Nhắn, nút 📎)
  suspects:[{id,n,r}], form:{q, how?:{q,label,need,opts:[{v,l}],a}},
  check(n,how) -> {ok:1} | {m:"phản hồi khi sai"},   // n đã bỏ dấu, chữ thường
  culprit, win, solution, coach? }
```
- `ev` là nhãn ẩn cho Đối chất: đi theo khi ghim, không bao giờ hiển thị.
- Thời gian bài đăng viết dạng "Hôm nay lúc 06:20", "Hôm qua lúc 21:15", "12 tháng 9 lúc 21:00"; bài được tự sắp mới nhất lên trên.

## Quy tắc thiết kế đã thống nhất với chủ dự án
- Nhân vật dân phòng giao việc tên **anh Ti** (không dùng tên khác).
- **Mọi** tin nhắn, bài đăng, bình luận, ảnh, tệp, món hàng đều ghim được; nút Ghim để **mờ** (chỉ là công cụ hỗ trợ), không được để lộ cái nào là manh mối thật. Không hiển thị "x/tổng" manh mối.
- Sổ vụ án lưu **nguyên văn** câu đã ghim (không tóm tắt sẵn ý suy luận).
- Tin nhắn trong chat không được lộ thẳng hung thủ; người chơi phải tự nối manh mối (tìm trên Mặt Sách, đọc bình luận, đối chiếu giờ giấc).
- Mặt Sách: tìm kiếm phải gõ **họ tên đầy đủ** (không dấu cũng được) hoặc tên tài khoản; gõ một chữ thì "Không tìm thấy". Có trang cá nhân, Bạn bè bấm được, bình luận có tên tách dòng riêng.
- Bài đăng mới hơn nằm trên.
- Hồ sơ: 3 lần gửi; sai mỗi lần có phản hồi riêng (gõ đúng người nhưng thiếu họ tên thì chỉ nhắc, không trừ lượt: `check` trả `{m, free:1}`); hết lượt thì có nút **Xem đáp án**; màn thắng/thua có nút **Màn hình chính**, **Chơi lại**, sang chương sau.
- Màn hình chính chỉ có **Chọn chương** (nút chính) và **Cách chơi** — không có nút "Bắt đầu chơi/Chơi tiếp", vì tiến độ chỉ lưu trong `localStorage` của từng máy.
- "Mẹo của thám tử" chỉ hiện ở **phần đầu tiên của mỗi chương** (dùng để hướng dẫn cơ chế mới của chương).
- Giao diện cố định tông sáng; nút/ô nhập phải có màu chữ rõ ràng (đã từng lỗi chữ trắng khi máy bật dark mode).
- Cửa sổ có 3 nút: đóng / thu nhỏ xuống Dock / phóng to (nhấp đôi thanh tiêu đề cũng phóng to).

## Nội dung hiện có
**Chương 1: Thám tử tập sự** (3 phần, độ khó tăng dần):
- **Phần 1 — Chậu lan biến mất** (Hẻm 42, Q.3, 14/9/2025). Thủ phạm: **Lê Minh Khoa**.
  Đường suy luận: chị Hà thấy chậu còn lúc 23g30 → Khoa nói với Tâm 23h đang ở nhà nhưng 01:20 khoe "chạy đơn" về → Khoa nợ tiền, từng khen chậu đáng nửa triệu → 05:12 `khoa.cayxanh` rao chậu men lam mẻ miệng trên Chợ Hẻm. Chú Tư ngoại phạm (ở Vũng Tàu).
- **Phần 2 — Ai ăn bánh trung thu?** (Nhà văn hóa KP3, 5/10/2025). Thủ phạm: **Phạm Quốc Đức**, cách vào kho: **dùng chìa đánh thêm từ chìa dự phòng**.
  Đường suy luận: Đức cầm chìa dự phòng 20 phút → tiệm khóa Ba Tèo 20:40 đánh chìa kho cho người đeo balo móc cá mập cam → Đức gọi móc cá mập là "bùa hộ mệnh", đang nợ hụi → về sau cùng bằng cổng sau → camera 02:14 + móc cá mập rơi trong kho → tin rao bánh có số 0909 888 215 của Đức. Tuấn ngoại phạm (thư viện 02:12), Vy ngoại phạm (ca trà sữa).
- **Phần 3 — Ai đứng sau Hẻm Bàn Tán?** (KP3, 9/11/2025). Thủ phạm: **Trịnh Văn Lộc**, cách: **ghép túi giấy của tiệm vào ảnh thịt ôi tải trên mạng**.
  Cơ chế mới: thư mục khóa mật khẩu trên "Máy chung NVH" + app Thùng rác. Mật khẩu: Hòa bong2019/bebong2019, Ngân pate, Bin muop, Lộc 07121988.
  Đường suy luận: nhật ký máy 22:47 Khách đăng bài → camera chỉ 1 người lớn 22:06–23:09, sổ chìa SĐT 0913 418 052 (chỉ nối được qua thư mục Lộc) → mở thư mục Lộc (biển Cub 0712 trong bài + năm mua 1988 trong bình luận): hợp đồng Cà phê Mây nhà 18 hẻm 7 cùng SĐT, khớp tin Chợ Hẻm "trống từ 1/12" → Thùng rác khôi phục bằng mật khẩu Lộc: ảnh thịt anhmienphi.vn + túi giấy tách nền, tạo trong buổi học T5 cô Hòa vắng. Mồi: cô Hòa tắt live 22:00–23:20; Ngân có bản nháp bóc phốt (xóa từ thứ Năm). Kịch bản đầy đủ: docs/superpowers/specs/2026-10-14-chuong-1-phan-3-design.md.

**Chương 2: Thám tử thực thụ** — cơ chế **Đối chất bằng chứng**: nhắn thẳng với nghi phạm, bấm 📎 đưa chi tiết đã ghim; đưa trúng mâu thuẫn thì họ khai lại / gửi thêm tệp.
- **Phần 1 — Căn phòng khóa trái** (dãy trọ hẻm 51, Bình Thạnh, 14–15/11/2025). Án mạng (không tả máu me). Thủ phạm: **Đỗ Minh Tú**, cách rời phòng: **bấm chốt khóa tay nắm rồi kéo cửa sập lại**.
  Đường suy luận: 2 hộp cơm còn nguyên + lịch còn tờ 14 → mốc 23:12 là giả → đối chất Huy bằng lịch sử đơn (20:31) → Huy gửi ảnh xác nhận có giày bảo hộ cam → camera dư shipper áo xanh vào 20:18 ra 21:07 → Tú có giày cam, nhắn hẹn 8h rồi thu hồi, bị đối chất thì nói về 8g rưỡi (sai camera) → đối chất Trâm: ốp mèo vàng của Phúc nằm trên bàn nhậu của Tú 23:10 → đối chất cô Bảy: khóa bấm tự khóa. Động cơ: Tú ôm 30 triệu COD bằng tài khoản Phúc. Mồi: Trâm, Bảo (nợ, chìa cũ), cô Bảy (chìa dự phòng, về 22:31), Huy (nói dối giờ). Kịch bản đầy đủ: docs/superpowers/specs/2026-10-15-chuong-2-phan-1-design.md.

## Ý tưởng tiếp theo đã nêu
- Gợi ý có giới hạn cho người chơi bị bí.

## Kiểm thử
- Unit test: `node --test tools/*.test.mjs` (nạp `<script>` của index.html trong `node:vm` với DOM giả).
- Chơi tự động: `PW=<thư mục playwright-core> node tools/e2e.cjs` (Chrome headless, ảnh chụp ở `tools/.shots/`).
- Agent `playtester` (`.claude/agents/playtester.md`): chơi thử mỗi chương mới, trên giấy hoặc trên trình duyệt.
