# Chương 3 "Ai đứng sau Hẻm Bàn Tán?" + cơ chế Thư mục khóa / Thùng rác — Thiết kế

Ngày: 2026-10-14 · Trạng thái: chờ duyệt

## 1. Mục tiêu

- Viết chương 3 với kịch bản mới, **khó hơn chương 2 một bậc**, không kẹt cứng (mục tiêu 25–40 phút).
- Thêm cơ chế điều tra mới: **thư mục khóa mật khẩu** trong app Tệp và app **Thùng rác**. Cả hai phải là mắt xích bắt buộc: không mở thư mục Lộc thì không nối được số điện thoại với hung thủ; không khôi phục Thùng rác thì không chứng minh được cách dựng ảnh.
- Thêm chương vẫn chỉ là thêm dữ liệu vào `CHAPTERS`. Chương 1, 2 không phải sửa dữ liệu (trừ hai trường nhãn ở mục 4).
- Giữ mọi quy tắc trong `CLAUDE.md` (anh Ti, ghim mờ cho mọi thứ, chat không lộ hung thủ, tìm Mặt Sách bằng họ tên đầy đủ, 3 lần gửi, Xem đáp án, giao diện sáng).

Ngoài phạm vi: vẽ lại toàn bộ hình theo phong cách mới (việc riêng, đang chờ chọn phong cách); phóng to giao diện trên màn hình lớn (việc riêng, đang chờ duyệt). Hình mới của chương 3 vẽ theo phong cách SVG hiện có.

## 2. Cơ chế mới

### 2.1 Dữ liệu (thêm vào schema chương, đều tùy chọn)

```
files:{k:{n,x,m?}},                       // thư mục "Vụ án" như cũ; m = "sửa lần cuối"
drive:{ n:"Máy chung NVH",
  folders:[{ k, n,                          // n hiển thị, vd "Lộc — Trịnh Văn Lộc"
             lock?:{ hint, pass:[…] },      // các mật khẩu chấp nhận
             files:{ k:{n, x, m?} } }] },
trash:[{ k, n, by, when, from,             // from = key thư mục gốc trong drive
         kind:"file"|"photo", x?, svg?, info? }],   // info = "Thông tin tệp" sau khôi phục
form:{ q, how?:{ q, label, need, opts:[{v,l}], a } }  // label/need: mới, xem mục 4
```

So mật khẩu: `norm(s).replace(/[^a-z0-9]/g,"")` (bỏ dấu, chữ thường, bỏ khoảng trắng/ký tự đặc biệt) so với từng `pass` đã chuẩn hóa cùng cách.

### 2.2 State

`freshState` thêm `unlocked:new Set()` (key thư mục đã mở), `restored:new Set()` (key mục thùng rác đã khôi phục), `folder` (thư mục đang xem trong Tệp), `pwErr:{}` (thông báo sai theo thư mục / mục thùng rác). Mất khi Chơi lại, như manh mối đã ghim.

### 2.3 App Tệp

- Cột trái: nhóm "Vụ án" (danh sách `files` như cũ) rồi nhóm `drive.n` với từng thư mục; thư mục có `lock` mà chưa mở hiện 🔒.
- Bấm thư mục khóa: khung giữa hiện tên chủ thư mục, dòng "Gợi ý mật khẩu: …", ô nhập + nút Mở. Sai: "Sai mật khẩu." (không giới hạn lần thử, không phạt). Đúng: thêm vào `S.unlocked`, hiện danh sách tệp.
- Thư mục chưa mở **không** hiện tên tệp, số tệp hay giờ sửa.
- Thư mục đã mở: mỗi tệp hiện "sửa lần cuối" (`m`). Tệp khôi phục từ thùng rác hiện trong thư mục gốc kèm nhãn "Khôi phục".
- Mỗi tệp ghim được (id `f:<folder>:<k>`, nguồn "Tệp"). Tệp vụ án giữ id cũ `f:<k>`.
- Mobile (≤720px): cột thư mục thu hẹp như `.files-list` hiện có.

### 2.4 App Thùng rác

- `ICONS.trash`, `GEOM.trash`; `renderDock` chỉ hiện khi `CH.trash` có phần tử. Không có badge.
- Bảng: Tên (không đuôi tệp) · Tài khoản xóa · Lúc · Vị trí gốc. Vị trí gốc là thư mục có khóa thì ghi "🔒 Thư mục riêng", không lộ tên.
- Mỗi dòng ghim được (id `t:<k>`, nguồn "Thùng rác", nội dung = tên + người xóa + lúc).
- Nút **Khôi phục**: thư mục gốc không khóa → khôi phục ngay. Có khóa → hiện ô "Nhập mật khẩu của thư mục gốc" (không kèm gợi ý); đúng thì khôi phục **và** mở khóa luôn thư mục đó; sai thì "Sai mật khẩu."
- Sau khôi phục: dòng đó hiện "Đã khôi phục về <tên thư mục>". `kind:"file"` → hiện trong thư mục gốc ở Tệp. `kind:"photo"` → hiện trong app Ảnh (nhãn "Khôi phục"), xem lớn được, kèm `info`; ghim id `ph:t:<k>`.

### 2.5 Sổ vụ án

Danh sách nguồn thêm "Thùng rác" khi chương có `trash`.

## 3. Kịch bản

Toàn văn kịch bản v5 (nội dung người chơi thấy + đáp án + phản hồi khi sai) ở **Phụ lục A**. Đã qua 4 vòng chơi thử trên giấy bằng agent `playtester`; vòng cuối: Hấp dẫn 8 · Công bằng 7 · Độ khó 5 · Rõ ràng 8, sau đó sửa thêm 7 điểm (v5).

Tóm tắt: trang ẩn danh **Hẻm Bàn Tán** đăng ảnh ghép thịt ôi bôi nhọ tiệm Bánh Mì Chị Hai từ máy chung nhà văn hóa bằng tài khoản Khách. Thủ phạm **Trịnh Văn Lộc** (chủ nhà cho chị Hai thuê, muốn mặt bằng trống để cho chuỗi Cà phê Mây thuê 45 triệu/tháng). Cách: **ghép túi giấy của tiệm vào ảnh thịt ôi tải trên mạng**. Nghi phạm: cô Hòa (mồi chính, tắt live đúng giờ), Ngân (mồi bản nháp bóc phốt), Khang, Bin, chú Lộc.

Mật khẩu: Hòa `bong2019`/`bebong2019`, Ngân `pate`, Bin `muop`, Lộc `07121988`.

Dữ liệu chương: `title:"Ai đứng sau Hẻm Bàn Tán?"`, `place:"Khu phố 3, Quận 3 · 9/11/2025"`, `day:"CN 9/11"`, `start:[7,15]`, `deskLabel:"Vụ Hẻm Bàn Tán"`, `lead:"ti"`, không có `coach`. `check(n,how)`: chỉ chấp nhận họ tên đầy đủ "trinh van loc" (như chương 1–2) với `how==="ghep"`; mỗi nghi phạm sai (khớp khi tên chứa "hoa", "ngan", "khang", "bin", "hai") và mỗi cách sai có phản hồi riêng như Phụ lục A; tên lạ → "Không có ai tên vậy dùng máy NVH tối đó."; gõ "loc" không đủ họ tên → "Ghi đủ họ tên giùm anh."

Hình SVG mới (phong cách hiện tại, khoảng 12): ảnh nền chương (hẻm 7 có tiệm bánh mì), bài Hẻm Bàn Tán (khay thịt nhựa xanh + túi giấy), IMG_0847 (khay thịt, không túi, chữ mờ "anhmienphi.vn"), IMG_0848 (túi giấy trên nền ô bàn cờ trong suốt), xe Cub 52-S1 0712, live chợ đêm, vé xe Sài Gòn–Bến Tre, mèo Mướp, Bin với bà ngoại, góc phòng stream của Khang, mái hiên tiệm, tin cho thuê mặt bằng.

## 4. Sửa các chỗ đang viết cứng cho 2 chương

| Chỗ | Hiện tại | Sửa |
|---|---|---|
| Chọn chương | dòng cứng "3. Bóng đèn lồng tầng thượng · Khóa"; nhãn "Mới" chỉ `i===1` | liệt kê đủ `CHAPTERS`; "Mới" = chương đầu tiên chưa phá (trừ chương 1) |
| Nút Bắt đầu chơi, `goHome` | chỉ nhảy giữa chương 1 và 2 | `nextCh()` = chương đầu tiên chưa phá, hết thì chương cuối |
| Màn thắng | "Chương 3 sắp ra mắt" | "Chương mới sắp ra mắt" khi không còn chương sau |
| Đáp án khi hết lượt | "Cách vào kho:" cứng | `CH.form.how.label` |
| `accuse` khi chưa chọn cách | "Chọn luôn cách người đó vào kho…" cứng | `CH.form.how.need` |

Chương 2 thêm `label:"Cách vào kho"`, `need:"Chọn luôn cách người đó vào kho rồi mới gửi nha."` để giữ nguyên câu chữ. Chương 3: `label:"Cách dựng ảnh"`, `need:"Chọn luôn cách ảnh được dựng rồi mới gửi nha."`.

Câu `showIntro` "Vụ này khó hơn. Sẵn sàng chưa?" giữ nguyên cho chương ≥2.

## 5. Kiểm tra

1. **Script kiểm tra dữ liệu** `tools/check-data.mjs` (Node, không thư viện): nạp phần `<script>` của `index.html` với DOM giả, rồi với mọi chương:
   - mọi handle trong `friends`, `cm.h`, link `matsach.vn/...` trong chat đều tồn tại;
   - `check(norm(culprit), how.a)` trả `{ok:1}`; mỗi nghi phạm khác và mỗi `how` sai trả `{m}` khác rỗng và khác nhau;
   - mỗi `lock.pass` qua hàm chuẩn hóa đều khớp; mỗi `trash.from` trỏ tới thư mục tồn tại;
   - không có id ghim trùng trong một chương.
2. **Chơi tự động bằng trình duyệt headless** (Playwright qua `npx`, dùng Chrome có sẵn nếu được): mở cả 3 chương; chương 3 mở khóa đủ 4 thư mục (thử sai trước), khôi phục 4 mục thùng rác, ghim, nộp sai 1 lần, nộp đúng; chụp màn hình desktop 1280×800 và mobile 390×844; không có lỗi console.
3. **Chơi thử thật** bằng agent `playtester` chế độ "chơi thật" (không đọc mã nguồn trước khi nộp Hồ sơ), sửa theo nhận xét nếu có lỗ hổng.

## 6. Hoàn tất

- Cập nhật `CLAUDE.md`: tóm tắt chương 3 (thủ phạm, cách, đường suy luận), schema mới (`drive`, `trash`, `form.how.label/need`), bỏ dòng "Bóng đèn lồng tầng thượng", ghi chú agent `playtester`.
- Commit + push lên `main` → GitHub Pages tự deploy; kiểm tra trang live trả về 200.

---

## Phụ lục A — Kịch bản chi tiết (v5)

Khu phố 3, Quận 3 · Chủ nhật 9/11/2025 · bắt đầu 07:15. (Cùng khu nhà văn hóa với chương 2.)

Cơ chế mới của chương:
- App **Tệp** có thêm ổ "Máy chung NVH" (máy tính dùng chung ở nhà văn hóa, anh Ti cấp quyền truy cập từ xa). Mỗi người dùng máy có **thư mục riêng khóa mật khẩu**, hiện họ tên chủ thư mục và dòng **gợi ý mật khẩu**. Thư mục còn khóa thì **không** hiện nội dung hay giờ sửa. Nhập sai không bị phạt, không giới hạn lần thử. Mật khẩu không phân biệt hoa thường, dấu, khoảng trắng. Mở khóa rồi thì mỗi tệp hiện "sửa lần cuối".
- App **Thùng rác** mới: thấy tên tệp, tài khoản đã xóa, lúc xóa. Tệp đến từ thư mục riêng thì cột vị trí gốc chỉ ghi "🔒 Thư mục riêng"; bấm **Khôi phục** phải nhập mật khẩu của thư mục gốc (không kèm gợi ý). Đúng mật khẩu thì tệp về lại thư mục đó và xem được nội dung.
- Mọi tin nhắn, bài đăng, bình luận, tệp, ảnh, mục thùng rác đều ghim được (nút Ghim mờ, như nhau).
- Hồ sơ: điền họ tên + chọn cách làm; 3 lần gửi.

=====================================================================
## PHẦN A — NGƯỜI CHƠI NHÌN THẤY GÌ
=====================================================================

### Giới thiệu chương (màn intro)
"Tối qua, trang ẩn danh Hẻm Bàn Tán đăng ảnh khay thịt ôi cạnh túi Bánh Mì Chị Hai. Sáng nay tiệm vắng tanh. Trang ấy vẫn còn đăng nhập trên máy tính chung của nhà văn hóa — nhưng máy đó cả khu phố cùng dùng."

### App Nhắn
**Anh Ti dân phòng** (tin hiện dần):
- 07:02 "Em ơi vụ này hơi gắt nha. Trang Hẻm Bàn Tán đăng bài nói tiệm bánh mì chị Hai bán thịt ôi."
- 07:02 link matsach.vn/hembantan
- 07:03 "Bài đó 300 lượt chia sẻ rồi. Sáng nay tiệm chị Hai bán được có 4 ổ."
- 07:05 "Sáng nay Khang mở cửa nhà văn hóa thì thấy máy tính chung vẫn đang đăng nhập trang đó, bằng tài khoản Khách. Ai ngồi máy cũng dùng được tài khoản Khách, khỏi mật khẩu."
- 07:06 "Anh mở quyền truy cập máy đó cho em rồi, vào app Tệp mà xem. Thùng rác của máy hình như chưa ai dọn."
- 07:07 "Máy đó ai hay dùng thì hỏi Khang."

**Chị Hai bánh mì**:
- 06:50 "Tui bán bánh mì ở hẻm 7 sáu năm nay, chưa ai chê một tiếng. Ảnh đó đâu phải bếp tui."
- 06:52 "Cô Hòa xe bánh mì đối diện thì xưa giờ không ưa tui, mà tui không tin cô làm vậy."
- 06:55 "Con Ngân hồi tháng rồi tui cho nghỉ vì đi trễ hoài, nó có giận."
- 06:58 "Mặt bằng tui thuê, hợp đồng còn tới 2027. Giờ khách bỏ hết thì lấy gì trả tiền nhà."

**Võ Minh Khang · Quản lý NVH**:
- 06:40 "Máy chung có 4 người hay dùng có thư mục riêng: cô Hòa với chú Lộc (lớp tin học người cao tuổi), chị Ngân (hay ghé in hồ sơ ban ngày), với thằng Bin. Còn lại ai cũng vào tài khoản Khách được."
- 06:41 "Thư mục riêng mỗi người tự đặt mật khẩu, máy có dòng gợi ý. Em không biết mật khẩu ai hết."
- 06:43 "Tối thứ Bảy em khóa cửa lúc 22h rồi về phòng trọ bên Bình Thạnh. Sau 22h ai cần vô thì mở hộp chìa có mã gắn ngoài cửa, lớp tin học với ban điều hành KP3 mới biết mã. Mượn thì tự ghi vô sổ giấy treo cạnh hộp chìa, bắt buộc để số điện thoại. Ghi số bậy là sáng em gọi không được, báo ban điều hành đổi mã liền, nên mấy cô chú lớp tin học lần nào cũng ghi đúng số."
- 06:44 "Sáng nay em chụp sổ gõ lại vô thư mục Chung, chưa kịp gọi ai. Có dòng chữ ký nguệch ngoạc em đọc không ra. Camera cửa thì tự xuất file lúc 6h sáng, em không sửa được."

**Nhóm Cư dân KP3** (nhóm chat, hiện họ tên đầy đủ người gửi):
- T7 21:10 Nguyễn Thị Hòa: "Tối nay cô ra chợ đêm bán nha bà con, ghé ủng hộ."
- T7 21:50 Phan Văn Tài: "Mưa to quá bà con ơi, ai còn ngoài đường nhớ mặc áo mưa."
- T7 22:52 Phan Văn Tài: "Ủa ai đăng bài vụ tiệm chị Hai vậy trời"
- CN 06:30 Lê Thị Mỹ: "Hèn chi sáng nay tiệm chị Hai vắng"

### Mặt Sách
- **Hẻm Bàn Tán** (trang): bio "Người trong hẻm nói thật" · "Trang tạo ngày 8/11/2025 · 1 bài viết". Bài **Hôm qua lúc 22:47**: ảnh khay thịt ôi (khay nhựa xanh) đặt cạnh túi giấy in logo Bánh Mì Chị Hai; chữ: "Một người bán bánh mì lâu năm trong hẻm nói thật: đừng ăn ở đây." Bình luận: nhiều người hoang mang; một người hỏi "Ủa ảnh này chụp ở đâu vậy?" — trang không trả lời.
- **Bánh Mì Chị Hai** (trang, tìm được bằng tên trang): bio "Bánh mì thịt nướng · 18 hẻm 7, KP3". Bài cũ (6 tháng 10): "Cảm ơn chủ nhà đã cho tiệm thêm mái hiên trước mùa mưa" (không nêu tên, chủ nhà không bình luận).
- **Nguyễn Thị Hòa** (cô Hòa): bài 4 tháng 11 khen cháu nội "Bé Bông nhà bà, sinh năm 2019, giờ đã biết đọc". Bài **Hôm qua lúc 21:25** (video live): "Live bán đêm ở chợ đêm Hồ Thị Kỷ nè bà con" + bình luận 21:40 "Xe cô đông khách ghê". Bài **Hôm qua lúc 22:00**: "Mưa to quá, cô tắt live dẹp hàng đi trú mưa, lát tạnh bán tiếp." Bài **Hôm qua lúc 23:20** (video live): "Tạnh rồi, bán tiếp tới 0g nha" + bình luận 23:35 "Cô ơi chừa con 2 ổ". Bài cũ (tháng 8): cãi nhau với chị Hai chuyện giành chỗ đậu xe trước tiệm.
- **Đặng Kim Ngân**: thứ Sáu 7/11: "Có những chỗ làm bóc lột người ta mà ngoài mặt thì hiền lắm." Bài cũ: "Ghét nhất đời là pate, làm tiệm bánh mì mà ghét pate mới ghê." Bài **Hôm qua lúc 21:30**: ảnh vé xe khách Sài Gòn → Bến Tre 21:45; bình luận 22:50 của Ngân: "Tới Trung Lương rồi nè"; bình luận 23:55 của Đặng Thị Thu (má Ngân): "Má đón con ở bến Mỏ Cày nè".
- **Trịnh Văn Lộc**: bio "Hưu trí · Học tin học ở NVH KP3". Bài 2 tháng 11: ảnh chiếc Cub cũ: "Chiếc Cub 52-S1 0712, mua năm 1988, chiếc xe đầu tiên đời tôi." Bài 5 tháng 11: "Tuổi già học gõ văn bản, làm bảng tính cũng vui." Không có bài nào tối thứ Bảy.
- **Lý Gia Bin**: Bạn bè có Trần Thị Mai (mẹ). Bài "con mèo Mướp nhà em". Bài **Hôm qua lúc 20:00** (mẹ đăng, gắn thẻ Bin nên hiện trên trang Bin): "Tối nay cho Bin ngủ bên ngoại ở Thủ Đức, mai mới về" + ảnh hai bà cháu.
- **Võ Minh Khang**: bài **Hôm qua lúc 22:30** "Livestream rank tối nay tới 1h, có bật cam nha anh em" + bình luận 22:45 "Thấy Khang gào trên cam kìa 🤣", 23:40 "Khang gánh team ghê".
- Tìm kiếm phải gõ họ tên đầy đủ hoặc tên tài khoản.

### Chợ Hẻm
- "Cho thuê mặt bằng KP3, mặt tiền 5m, **trống từ 1/12**, giá thương lượng. LH 0913 418 052." (đăng 3 tháng 11)
- Vài món không liên quan (nồi chiên, xe đạp…).

### Tin Phố
- "Chuỗi Cà phê Mây đang săn mặt bằng trong hẻm Q.3, trả giá cao" (1/11/2025).
- "Tin giả trên mạng xã hội: trước khi chia sẻ, hãy hỏi nguồn" (28/10).

### App Tệp
**Vụ án** (không khóa): "Ghi chú của anh Ti" — bài đăng 22:47 T7, tài khoản Khách, máy chung NVH.

**Máy chung NVH**
- **Chung** (không khóa):
  - "Sổ mượn chìa NVH" (Khang gõ lại từ sổ giấy sáng CN):
    - T5 6/11 · 22:10 Khang đóng cửa.
    - T7 8/11 · 19:30–21:00 · Nguyễn Thị Hòa · lấy xe đẩy bánh mì gửi trong kho · 0938 207 114.
    - T7 8/11 · 22:05 · (chữ ký đọc không ra) · mượn lấy loa · 0913 418 052 · trả 23:10.
  - "Camera cửa NVH T7 8/11" (tự xuất 06:00 CN): 19:31 một người lớn vào · 20:58 người đó đẩy xe bánh mì ra · 22:00 Khang khóa cửa ra về · 22:06 một người lớn vào (áo mưa trùm kín, đội nón) · 23:09 người đó ra tay không, khóa cửa · không ai khác ra vào tới 06:00.
  - "Nhật ký máy NVH T7 8/11": 19:40 Hòa đăng nhập · 20:50 Hòa đăng xuất · 22:07 Khách đăng nhập · 22:12 Khách mở một thư mục riêng (nhập đúng mật khẩu) · 22:41 Khách mở matsach.vn/hembantan · 22:47 Khách đăng bài lên Hẻm Bàn Tán · 23:02 Khách xóa 2 tệp · 23:05 Khách khóa màn hình (không đăng xuất).
  - "Lịch lớp tin học": lớp người cao tuổi T3, T5 18g–20g. Điểm danh T5 6/11: có mặt Trịnh Văn Lộc; vắng Nguyễn Thị Hòa (đi bán).
- **Hòa — Nguyễn Thị Hòa** 🔒 gợi ý: "tên cháu nội + năm sinh" (bong2019 hoặc bebong2019) → "Thực đơn xe bánh mì" (sửa T3 4/11), "Kế hoạch bán chợ đêm T7" (sửa **T7 8/11 20:15**).
- **Ngân — Đặng Kim Ngân** 🔒 gợi ý: "món tui ghét nhất" (pate) → "CV xin việc quán cơm Tấm Mơ", "Thư xin việc gửi 7/11" (sửa T6 7/11 10:20).
- **Bin — Lý Gia Bin** 🔒 gợi ý: "tên con mèo" (muop) → thư mục ảnh chế (sửa T3 4/11).
- **Lộc — Trịnh Văn Lộc** 🔒 gợi ý: "4 số cuối biển số chiếc xe đầu tiên + năm mua" (07121988) →
  - "Nháp hợp đồng thuê Cà phê Mây" (sửa T6 7/11): "Bên cho thuê: Trịnh Văn Lộc · SĐT 0913 418 052 · nhà số 18 hẻm 7, KP3. Bên thuê: Chuỗi Cà phê Mây. Giá 45 triệu/tháng. Bên cho thuê bàn giao mặt bằng trống từ 1/12/2025."
  - "Ghi chú lớp tin học: cách tách nền, cách ghép hai ảnh" (sửa T5 6/11).

### App Thùng rác
| Tên | Tài khoản xóa | Lúc | Vị trí gốc |
|---|---|---|---|
| ban-nhap | Ngân | T5 6/11 15:40 | 🔒 Thư mục riêng |
| meme-co-giao | Bin | T3 4/11 17:15 | 🔒 Thư mục riêng |
| IMG_0847 | Khách | **T7 8/11 23:02** | 🔒 Thư mục riêng |
| IMG_0848 | Khách | **T7 8/11 23:02** | 🔒 Thư mục riêng |

Khôi phục (nhập mật khẩu thư mục gốc) thì thấy:
- ban-nhap (về thư mục Ngân): bản nháp bóc phốt tiệm chị Hai "trả lương trễ, bắt làm thêm giờ" — không nhắc gì thịt ôi.
- meme-co-giao (về thư mục Bin): ảnh chế cô giáo chủ nhiệm.
- IMG_0847 (về thư mục Lộc): đúng khay thịt nhựa xanh đó nhưng **không có túi giấy**, góc dưới mờ chữ "anhmienphi.vn". Thông tin tệp: "tải về T5 6/11 19:18, tài khoản Lộc".
- IMG_0848 (về thư mục Lộc): túi giấy Bánh Mì Chị Hai đã tách nền, nền trong suốt. Thông tin tệp: "tạo T5 6/11 19:20, tài khoản Lộc".

### Hồ sơ
- "Ai đứng sau trang Hẻm Bàn Tán?" (gõ họ tên)
- "Ảnh trong bài được dựng bằng cách nào?"
  a. Ghép túi giấy của tiệm vào ảnh thịt ôi tải trên mạng
  b. Lẻn vào bếp tiệm, chụp thịt thật
  c. Mua khay thịt hư ngoài chợ, đặt cạnh túi giấy thật của tiệm rồi chụp
  d. Nhờ nhân viên cũ chụp hộ trong bếp
- Nghi phạm trong Sổ vụ án: Cô Hòa, Ngân, Khang, Bin, Chú Lộc.

=====================================================================
## PHẦN B — ĐÁP ÁN (CHỈ ĐỌC SAU KHI ĐÃ TỰ GIẢI)
=====================================================================
Thủ phạm: **Trịnh Văn Lộc**, cách: **(a) ghép túi giấy vào ảnh thịt tải trên mạng**.

Đường suy luận dự kiến:
1. Nhật ký máy: bài đăng 22:47 từ chính máy NVH, tài khoản Khách; 22:12 Khách mở một thư mục riêng bằng đúng mật khẩu; 23:02 xóa 2 tệp.
2. Camera (tự xuất, không sửa được) + sổ chìa: sau 22:00 chỉ đúng một người lớn vào 22:06, ra 23:09, có mã hộp chìa (lớp tin học / ban điều hành), để SĐT thật 0913 418 052.
3. Loại trừ bằng ngoại phạm công khai: Ngân (trên xe, má đón 23:55), Bin (ngủ bên ngoại, không có mã), Khang (về Bình Thạnh 22:00, live có cam 22:45). **Còn lại hai người không có ngoại phạm 22:00–23:20: cô Hòa (tắt live đi trú mưa, có mã, có động cơ, khớp câu "người bán bánh mì lâu năm") và chú Lộc (có mã, không đăng gì tối đó).**
4. SĐT trùng tin Chợ Hẻm "mặt bằng KP3 trống từ 1/12" — nhưng chưa biết của ai.
5. Mở khóa thư mục: Hòa (bong2019) chỉ có thực đơn, kế hoạch bán. Lộc (07121988 từ bài xe Cub: 4 số cuối + năm mua): hợp đồng "Bên cho thuê Trịnh Văn Lộc · SĐT 0913 418 052 · nhà số 18 hẻm 7" → SĐT trong sổ là của Lộc; trang tiệm "18 hẻm 7" → Lộc là chủ nhà tiệm chị Hai, muốn mặt bằng trống từ 1/12 dù hợp đồng chị còn tới 2027 → động cơ. Ghi chú "tách nền, ghép hai ảnh". 
6. Thùng rác: IMG_0847/0848 (Khách xóa 23:02) chỉ khôi phục được bằng 07121988 → hai tệp nằm trong thư mục Lộc: ảnh thịt gốc không có túi giấy, có "anhmienphi.vn"; túi giấy tách nền → cách (a), loại (b), (c), (d). Thông tin tệp: tải/tạo bằng tài khoản Lộc trong buổi học T5 6/11 19:18–19:20, buổi cô Hòa vắng → chặn giả thuyết cô Hòa gài bẫy Lộc (cô không thể ngồi tài khoản Lộc trong buổi học mình vắng). Camera "ra tay không" → lý do "mượn lấy loa" là bịa.

Phản hồi khi gửi sai (dự kiến):
- Hòa: "Cô Hòa có tắt live đi trú mưa thật. Nhưng số điện thoại trong sổ chìa đâu phải của cô, còn hai tấm ảnh được làm từ buổi học tối thứ Năm, buổi đó cô vắng."
- Ngân: "Bản nháp đó Ngân xóa từ chiều thứ Năm, mà đâu có nói gì thịt ôi. Tối thứ Bảy Ngân đang trên xe về Bến Tre."
- Khang: "Camera ghi Khang khóa cửa về lúc 22:00, 22:45 người xem live còn thấy mặt Khang trên cam ở phòng trọ."
- Bin: "Tối đó Bin ngủ bên ngoại ở Thủ Đức, mà Bin cũng đâu biết mã hộp chìa."
- Chị Hai: "Ai lại đi bôi nhọ tiệm của chính mình?"
- Đúng Lộc, sai cách: (b)/(d) "Ảnh thịt gốc trong thùng rác là ảnh tải trên mạng, đâu phải chụp trong bếp." (c) "Ảnh thịt gốc không hề có túi giấy. Túi giấy là ảnh tách nền ghép vào."
