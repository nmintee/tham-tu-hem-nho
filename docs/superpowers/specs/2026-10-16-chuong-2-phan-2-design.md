# Chương 2 · Phần 2 "Khoản chi không có trong sổ" + Gợi ý theo bước + Ghép suy luận — Thiết kế

Ngày: 2026-10-16 · Nguồn: bản kịch bản "Chiếc hộp không có trong sổ" chủ dự án gửi, đã sửa lỗ hổng logic.
Chủ dự án giao: tự làm trọn tới khi push; tự so phương án và chọn; văn nói tự nhiên; có gợi ý theo bước (chỉ cho vụ mới).

## 1. Quyết định đã chọn (và phương án bị loại)

| Vấn đề | Phương án | Chọn | Lý do |
|---|---|---|---|
| Vị trí vụ | (a) Chương 2 · Phần 2 · (b) Chương 3 mới | **a** | Cùng mạch "Thám tử thực thụ", dùng lại cơ chế Đối chất vừa dạy ở phần 1. |
| Tên vụ | (a) "Chiếc hộp không có trong sổ" · (b) **"Khoản chi không có trong sổ"** | **b** | Sau khi sửa logic, thứ "không có trong sổ" là khoản chi 7,5 triệu, không phải cái hộp. |
| Lỗ hổng "dựng chuyện mất hộp không che được giao dịch ngân hàng" | (a) Hộp chứa tiền mặt · (b) **Hộp chứa sổ quỹ giấy có chữ ký** | **b** | Sổ giấy ghi đủ các khoản chi tiền mặt; không có "Minh Phát". Giấu hộp = giấu cuốn sổ, để báo cáo sáng mai dựa vào hóa đơn khống. Có động cơ thật cho việc giấu hộp. |
| Hai khoản cùng 6 triệu | giữ / đổi | **đổi khoản biển thủ thành 7.500.000đ** | Tránh nhầm (chi hợp lệ 6 triệu ≠ biển thủ 7,5 triệu). Số dư cuối 72.500.000đ. |
| Cả nhóm đã thấy "đã gửi 80 triệu" | — | Hiển **không** nói hộp có 80 triệu; nói hộp có "sổ quỹ với chứng từ" | Hết vô lý. |
| Trùng tên/ngày với vụ cũ | — | Bảo → **Lâm Gia Hiển**, Mai → **Đoàn Minh Thư**, giữ **Quân**, **Vân**; NVH **Khu phố 5**, hội chợ **CN 23/11/2025** | Không trùng Chương 1 · Phần 2 (KP3, 5/10) và tên ở Chương 2 · Phần 1. |
| Nối tài khoản nhận tiền với hung thủ | (a) Lịch sử tên trang ẩn danh · (b) Địa chỉ Minh Phát trùng nhà Hiển · (c) **Số tài khoản trùng tin cũ của Hiển** | **c** | Một mắt xích đủ chắc, cần đọc kỹ tin cũ; (a)(b) quá lộ. |
| Nhật ký máy in ở đâu | (a) Thùng rác máy ban tổ chức (bản gốc) · (b) **Vân gửi khi bị đối chất** | **b** | Máy in ở tiệm Vân, log không thể nằm trên máy ban tổ chức. |
| Tin nhắn Hiển–Quân, Hiển–Vân | (a) Hiện sẵn · (b) **Người trong cuộc chụp gửi khi bị đối chất** | **b** | Người chơi không đọc được điện thoại người khác; bằng chứng tới từ đối chất. |
| Ảnh camera | ảnh SVG / **mô tả chữ** | **mô tả chữ** | Chủ dự án không muốn hình giả. Bản cắt và bản gốc là hai tệp chữ ở hai thư mục. |
| Cơ chế mới | tìm kiếm tệp · dựng dòng thời gian kéo thả · lưu tiến độ khi tải lại · **ghép suy luận** · **gợi ý theo bước** · **báo cáo 3 câu** · **đối chất có điều kiện** · **tệp gửi nhiều** | 4 cái in đậm | YAGNI: kéo thả khó trên điện thoại và trùng vai trò với ghép suy luận; tệp ít nên chưa cần tìm kiếm; game chưa lưu tiến độ giữa chừng ở mọi vụ. |
| Gợi ý | theo ghim · theo thời gian · **theo dấu vết hành động** | **dấu vết** | Bám đúng bước người chơi đang kẹt, chỉ cần dữ liệu. |

## 2. Cơ chế

### 2.1 Dấu vết (traces)
`S.traces: Set`. `trace(k)` thêm dấu vết và cập nhật `S.lastProg = Date.now()`. Ghi khi:
- hiển thị một tệp: `file:<khóa tệp>` (vụ án, ổ đĩa, tệp khôi phục `t.<k>`);
- mở cuộc trò chuyện: `chat:<người>`; mở trang Mặt Sách: `url:<đường dẫn>`;
- đối chất trúng: `cf:<người>:<ev>`; ghép được suy luận: `deduce:<id>`;
- mở khóa thư mục `unlock:<k>`, khôi phục `restore:<k>`, ghim `pin:<ev>`.

### 2.2 Gợi ý theo bước
Dữ liệu `hints:[{done:[ "trace" | ["trace", "trace"] ], tips:["nấc 1","nấc 2","nấc 3"]}]` (mảng con = "một trong các"). Bước hiện tại = bước đầu tiên chưa `done`. Hết bước → câu chốt "Đủ chứng cứ rồi đó em, mở Hồ sơ nộp đi…".
- Nút **💡 Gợi ý** trên thanh menu, chỉ hiện khi chương có `hints`. Bấm → khung gợi ý của anh Ti, hiện các nấc đã mở của bước hiện tại; lần đầu tự mở nấc 1. Nút "Gợi ý rõ hơn" mở nấc kế. Mỗi nấc mở = 1 gợi ý (`S.hintsUsed`).
- Tự nhắc: kiểm tra mỗi 15 giây; nếu 4 phút không có dấu vết mới và bước hiện tại chưa được nhắc, anh Ti nhắn "Bí hả em? Bấm 💡 Gợi ý trên thanh menu, anh chỉ cho nè." Không tự lộ gợi ý.
- Màn thắng (khi chương có `hints`): "Phá án với N gợi ý." hoặc **"Phá án không cần gợi ý luôn ta, gớm dữuuuu"**.

### 2.3 Ghép suy luận (Sổ vụ án → 🧩 Suy luận)
Dữ liệu `deduce:[{id, title, x, need:[{ev:[…], l:"nhãn loại chứng cứ"}]}]`.
- Người chơi tick các chi tiết đã ghim rồi bấm **Ghép**. Lấy tập `ev` của các chi tiết đã chọn.
- Có suy luận chưa tìm mà mọi nhóm `need` đều được phủ → tìm được: thẻ suy luận (tiêu đề + diễn giải) hiện trong mục Suy luận, toast "Ghép được: …", dấu vết `deduce:<id>`.
- Không đủ: lấy suy luận chưa tìm phủ nhiều nhóm nhất (≥1) → "Hướng này có lý, nhưng còn thiếu chứng cứ về: <nhãn nhóm thiếu>." Không có → "Mấy chi tiết này chưa nối được với nhau." Không phạt.
- Đã tìm rồi mà ghép lại đúng nó → "Cái này em ghép ra rồi."

### 2.4 Đối chất có điều kiện, gửi nhiều tệp
Luật đối chất thêm `needs:[trace…]` và `early:"…"`: chưa đủ điều kiện → trả `early` (hoặc `_`), không đánh dấu đã dùng. `give` nhận chuỗi hoặc mảng.

### 2.5 Hồ sơ 3 câu + điều kiện suy luận
`form.why = {q, label, need, opts, a}` (câu thứ ba); `check(n, how, why)`. `form.proof = [id suy luận]`: nộp khi chưa đủ → nhắc "Linh cảm của em có thể đúng, nhưng chưa chứng minh được. Vô Sổ vụ án → 🧩 Suy luận ghép chứng cứ trước đã (còn thiếu N suy luận quan trọng)." — không trừ lượt.

## 3. Quy chuẩn văn nói (B)
Tin nhắn, bài đăng, bình luận: câu ngắn, giọng Sài Gòn đời thường ("nha", "nè", "hông", "ủa", "trời"), xưng hô theo vai (anh/chị/em/tui), có cảm xúc, có khi gõ vội. Giấy tờ (sao kê, hóa đơn, biên nhận, nhật ký) giữ văn bản chuẩn. Gợi ý của anh Ti cũng văn nói.

## 4. Kiểm tra
Unit: dấu vết, bước gợi ý và nấc, tự nhắc, ghép suy luận (đủ/thiếu/không liên quan/lặp), đối chất `needs`, `give` mảng, Hồ sơ 3 câu + điều kiện suy luận, dữ liệu vụ (mọi dấu vết trong gợi ý có thể xảy ra; mọi ev trong deduce/confront có ở chi tiết ghim được; sổ tiền khớp). E2E: đi trọn vụ bằng gợi ý + đối chất + ghép + nộp. Review độc lập cuối nhánh.

---

## Phụ lục A — Kịch bản (văn nói)

**Khung:** Nhà văn hóa Khu phố 5, Bình Thạnh. Hội chợ gây quỹ sửa thư viện Chủ nhật 23/11/2025. Game bắt đầu Thứ Hai 24/11, 07:30; 08:00 phải nộp báo cáo quỹ cho phường. Phi bạo lực.

**Sự thật:** Lâm Gia Hiển (trưởng ban, đồng chủ tài khoản quỹ) chuyển 7.500.000đ ra tài khoản "MINH PHAT DV" — thật ra là tài khoản riêng của Hiển (số trùng tin thu tiền áo đồng phục tháng 9). Hiển làm hóa đơn khống Minh Phát ghi lùi ngày 18:30, nhờ Vân in lúc 21:05, rồi sai Quân bê **hộp quỹ sắt (chỉ còn cuốn sổ quỹ giấy)** ra kho ngoài, báo "mất hộp", đổ cho thủ quỹ Thư, lập trang ẩn danh tố Thư. Sáng ra Hiển gửi báo cáo "sổ giấy mất, đối chiếu theo hóa đơn". Quân biết mình giấu hộp nhưng không biết chuyện tiền. Vân không biết hóa đơn giả. Thư có nợ riêng nhưng làm đúng.

**Sổ tiền:** thu 86.000.000 → chi tiền mặt hợp lệ 6.000.000 (ghi trong sổ giấy) → gửi quỹ 80.000.000 (19:00) → Hiển chuyển 7.500.000 (20:05) → số dư 72.500.000.

**Dòng thời gian thật (CN 23/11):** 15:30 mở hội chợ · 18:45 chốt 86 triệu · 18:50 chi 6 triệu tiền mặt, Thư ghi sổ giấy, bỏ vào hộp quỹ · 19:00 Thư gửi 80 triệu · 19:40 Hiển đăng nhập tài khoản quỹ · 20:05 chuyển 7,5 triệu · 20:11 Hiển nhắn "đừng sửa sổ" · 20:18 tạo file hóa đơn · 20:40–20:46 nhờ Vân in · 21:05 Vân in · 21:20 Hiển sai Quân bê hộp · 21:42 camera hành lang · 21:48 Quân ra cổng sau · 22:00 Hiển báo mất hộp · 22:25 đổ cho Thư · 22:31 lập trang "Người Khu Phố 5" · 22:40 bài tố Thư · 22:56–23:04 Hiển dặn Quân, thu hồi tin · T2 07:00 Hiển gửi báo cáo.

(Nội dung chi tiết từng tin nhắn, bài đăng, tệp, đối chất, suy luận, gợi ý, Hồ sơ: xem dữ liệu chương trong `index.html`, object `CHƯƠNG 2 · PHẦN 2`; mọi câu chữ người chơi thấy nằm ở đó.)

**Đường suy luận chuẩn:** sao kê (7,5 triệu ra lúc 20:05) → chi tiết giao dịch (STK 0071 0023 4567) → tin 13/9 của Hiển cùng STK → *suy luận: tiền về tay Hiển* → đưa hóa đơn cho Vân → nhật ký máy in 21:05 + tin Hiển nhờ in → *suy luận: hóa đơn làm sau khi tiền đã đi* → camera bản gốc (Quân bê hộp quỹ) → đối chất Quân → tin Hiển sai bê hộp + dặn giấu → đưa báo cáo 7:00 cho Quân → ảnh sổ quỹ giấy (6 khoản, không có Minh Phát) → *suy luận: Hiển giấu hộp để giấu cuốn sổ* → Hồ sơ: Lâm Gia Hiển · chuyển tiền + hóa đơn khống + giấu hộp có sổ · giấu sổ để không lộ khoản chi không có thật.
