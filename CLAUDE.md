# Thám Tử Hẻm Nhỏ — ghi chú dự án

Game trinh thám tiếng Việt chạy trong trình duyệt, lấy cảm hứng từ https://thamtubanphim.netlify.app/ (Thám Tử Bàn Phím).
Người chơi ngồi trước một "máy tính giả lập" (Phố Xanh), mở app trên Dock, đọc tin nhắn, lướt web, ghim chi tiết và gửi tên thủ phạm.

Toàn bộ game nằm trong **một file `index.html`** (HTML + CSS + JS thuần, không thư viện, không build). Deploy bằng Netlify Drop hoặc GitHub Pages: chỉ cần upload `index.html`.

## Cấu trúc code (trong thẻ `<script>`)
- `SVG` — toàn bộ hình minh họa vẽ bằng SVG inline (không dùng file ảnh).
- `CHAPTERS` — mảng dữ liệu các chương. Thêm chương mới = thêm một object vào mảng, không cần sửa code giao diện.
- `S` — state của chương đang chơi (`freshState(ci)` khởi tạo lại).
- `R` — các hàm render từng app: `chat`, `web`, `files`, `photos`, `nb` (Sổ vụ án), `file` (Hồ sơ).
- `bind(k, c)` — gắn sự kiện sau mỗi lần render app `k`.
- `fbPage(u)` / `fbFind(q)` — trang Mặt Sách (Facebook giả).
- `openApp`, `focus`, `drag` — quản lý cửa sổ (đóng / thu nhỏ / phóng to / kéo thả).
- `nav(u)` / `histGo(d)` — lịch sử trình duyệt (nút ← →).
- `startChapter(ci)`, `goHome()`, `showIntro(ci)` — luồng game.
- Tiến độ chương đã phá lưu trong `localStorage` key `tthn-done`.

## Schema một chương
```
{ title, place, day:"CN 14/9", start:[giờ,phút], deskLabel, art, intro, lead:"ti",
  people:{key:{n,i,c}},                    // danh bạ app Nhắn
  chats:{key:[{day}|{t,x,who?,link?}]},     // tin nhắn; link = URL mở trong app Lướt
  clues:{...},                              // (cũ) không còn dùng để hiển thị
  fbStart, profiles:{handle:{n,i,c,alias?,page?,bio,live,from?,friends:[handle],
            posts:[{t,x,svg?,likes,cm:[{h:handle | n:tên, t, x}]}]}},
  shop:[{n,p,s,t,d?,svg,k}], shopHint, news:[{h,t,svg?,x}],
  photos:{k:{n,svg}}, files:{k:{n,x}},
  suspects:[{id,n,r}], form:{q, how?:{q,opts:[{v,l}],a}},
  check(n,how) -> {ok:1} | {m:"phản hồi khi sai"},   // n đã bỏ dấu, chữ thường
  culprit, win, solution, coach? }
```
- Thời gian bài đăng viết dạng "Hôm nay lúc 06:20", "Hôm qua lúc 21:15", "12 tháng 9 lúc 21:00"; bài được tự sắp mới nhất lên trên.

## Quy tắc thiết kế đã thống nhất với chủ dự án
- Nhân vật dân phòng giao việc tên **anh Ti** (không dùng tên khác).
- **Mọi** tin nhắn, bài đăng, bình luận, ảnh, tệp, món hàng đều ghim được; nút Ghim để **mờ** (chỉ là công cụ hỗ trợ), không được để lộ cái nào là manh mối thật. Không hiển thị "x/tổng" manh mối.
- Sổ vụ án lưu **nguyên văn** câu đã ghim (không tóm tắt sẵn ý suy luận).
- Tin nhắn trong chat không được lộ thẳng hung thủ; người chơi phải tự nối manh mối (tìm trên Mặt Sách, đọc bình luận, đối chiếu giờ giấc).
- Mặt Sách: tìm kiếm phải gõ **họ tên đầy đủ** (không dấu cũng được) hoặc tên tài khoản; gõ một chữ thì "Không tìm thấy". Có trang cá nhân, Bạn bè bấm được, bình luận có tên tách dòng riêng.
- Bài đăng mới hơn nằm trên.
- Hồ sơ: 3 lần gửi; sai mỗi lần có phản hồi riêng; hết lượt thì có nút **Xem đáp án**; màn thắng/thua có nút **Màn hình chính**, **Chơi lại**, sang chương sau.
- "Mẹo của thám tử" chỉ hiện ở **chương 1**.
- Giao diện cố định tông sáng; nút/ô nhập phải có màu chữ rõ ràng (đã từng lỗi chữ trắng khi máy bật dark mode).
- Cửa sổ có 3 nút: đóng / thu nhỏ xuống Dock / phóng to (nhấp đôi thanh tiêu đề cũng phóng to).

## Nội dung hiện có
- **Chương 1 — Chậu lan biến mất** (Hẻm 42, Q.3, 14/9/2025). Thủ phạm: **Lê Minh Khoa**.
  Đường suy luận: chị Hà thấy chậu còn lúc 23g30 → Khoa nói với Tâm 23h đang ở nhà nhưng 01:20 khoe "chạy đơn" về → Khoa nợ tiền, từng khen chậu đáng nửa triệu → 05:12 `khoa.cayxanh` rao chậu men lam mẻ miệng trên Chợ Hẻm. Chú Tư ngoại phạm (ở Vũng Tàu).
- **Chương 2 — Ai ăn bánh trung thu?** (Nhà văn hóa KP3, 5/10/2025). Thủ phạm: **Phạm Quốc Đức**, cách vào kho: **dùng chìa đánh thêm từ chìa dự phòng**.
  Đường suy luận: Đức cầm chìa dự phòng 20 phút → tiệm khóa Ba Tèo 20:40 đánh chìa kho cho người đeo balo móc cá mập cam → Đức gọi móc cá mập là "bùa hộ mệnh", đang nợ hụi → về sau cùng bằng cổng sau → camera 02:14 + móc cá mập rơi trong kho → tin rao bánh có số 0909 888 215 của Đức. Tuấn ngoại phạm (thư viện 02:12), Vy ngoại phạm (ca trà sữa).
- **Chương 3 — Bóng đèn lồng tầng thượng**: mới có tên, đang khóa, chưa viết.

## Ý tưởng tiếp theo đã nêu
- Viết chương 3.
- Gợi ý có giới hạn cho người chơi bị bí.
- App Thùng rác (file đã xóa chứa manh mối).
