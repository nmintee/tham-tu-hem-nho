# Chương 2 · Phần 1 "Căn phòng khóa trái" + cơ chế Đối chất — Thiết kế

Ngày: 2026-10-15 · Trạng thái: đã duyệt trong hội thoại (cơ chế, hướng dẫn, kịch bản v1). Không chạy người chơi thử (theo yêu cầu).

## 1. Mục tiêu
- Mở **Chương 2: Thám tử thực thụ** (tên tạm, đổi được trong `VOLS[2].title`) với phần 1 là vụ án mạng "Căn phòng khóa trái".
- Cơ chế điều tra mới, khác chương 1: **Đối chất bằng chứng** — nhắn thẳng với nghi phạm và đưa chi tiết đã ghim để họ phải khai lại.
- Hướng dẫn cách chơi cho cơ chế mới, không lộ lời giải.
- Không dùng hình minh họa cho manh mối (ảnh xác nhận, ảnh nhậu… được mô tả bằng chữ). Chỉ có một SVG nền cho màn giới thiệu.
- Án mạng không tả máu me ("ngã, chấn thương vùng đầu").

## 2. Cơ chế Đối chất

### 2.1 Dữ liệu (tùy chọn, chương 1 không đổi)
- Nhãn ẩn `ev:"<khóa>"` trên tin nhắn chat (`chats[k][i].ev`), bài đăng và bình luận Mặt Sách (`po.ev`, `cm.ev`), tệp (`files[k].ev`), ảnh (`photos[k].ev`), món Chợ Hẻm (`shop[i].ev`). Khi ghim, `ev` đi theo vào `S.pinData[id].ev`. Không hiển thị ở đâu.
- Tệp ẩn: `files[k].hidden:true` — chỉ hiện (cả trong đếm badge Tệp) sau khi được một nghi phạm "gửi".
- Bảng phản ứng:
```
confront:{ <người>: { <ev>: { reply:[ "chuỗi" | {x, ev?} ], give?:"<khóa tệp ẩn>" }, _:"câu đáp chung" } }
```

### 2.2 Luật
- Chỉ người có mục trong `confront` mới có nút **📎 Đưa bằng chứng** trong khung chat.
- Chọn một chi tiết đã ghim → thêm tin "của mình" (`📎 ` + nguyên văn chi tiết) vào cuộc trò chuyện, rồi:
  - `ev` có trong bảng của người đó và chưa dùng → thêm các tin `reply` (tin dạng `{x,ev}` mang nhãn để ghim và đưa tiếp); `give` → tệp ẩn hiện ra. Kết quả "trúng".
  - `ev` đã dùng với người đó → "Cái này hỏi rồi mà."
  - Không có `ev` hoặc không khớp → câu `_`. Không bị phạt.
- Mọi tin thêm vào (của mình lẫn trả lời) đều ghim được. Giờ của tin = đồng hồ game hiện tại.
- State mới trong `freshState`: `cx:{}` (tin đối chất theo người), `cfUsed:Set` (`người:ev` đã dùng), `given:Set` (tệp ẩn đã nhận), `cfOpen:false`. Chơi lại thì mất.

### 2.3 Giao diện
- Chân khung chat: nút **📎 Đưa bằng chứng** + dòng "Biết thủ phạm rồi thì gửi trong Hồ sơ."
- Bấm nút → bảng chọn ngay trên chân chat: "Chọn chi tiết đã ghim để đưa cho <tên>", danh sách chi tiết đã ghim (nguồn + nguyên văn, cắt 2 dòng). Sổ vụ án trống → "Chưa có gì để đưa. Ghim một chi tiết (📌) trước đã." Đổi cuộc trò chuyện thì bảng đóng.
- Tin "của mình" nằm bên phải, nền `--chat-me`.
- Trúng → toast "Lời khai của <tên> đã thay đổi"; có `give` → thêm " · <tên> vừa gửi thêm một tệp".

## 3. Hướng dẫn cách chơi
1. Anh Ti giới thiệu cơ chế trong chat dẫn chuyện đầu phần.
2. "Mẹo của thám tử" hiện ở **phần đầu tiên của mỗi chương** (`partNo(i)===1` và chương có `coach`). Phần 1 chương 2 có `coach` giải thích 3 bước. (Đổi quy tắc cũ "chỉ chương 1".)
3. Nút 📎 khi Sổ vụ án trống: câu nhắc ghim trước.
4. Toast khi đối chất trúng (2.3).
5. Màn **Cách chơi** thêm đoạn: "Có chương cho bạn nhắn thẳng với nghi phạm: bấm 📎 Đưa bằng chứng trong khung chat để đối chất bằng một chi tiết đã ghim."

## 4. Thay đổi khác
- `VOLS[2] = {title:"Thám tử thực thụ"}` (bỏ `soon`). Phần cuối chương 1 mời "Chương 2: Thám tử thực thụ →"; phần cuối chương 2 báo "Chương mới sắp ra mắt".
- App Ảnh khi chương không có ảnh: "Chưa có ảnh nào trong vụ này."
- `check()` chương 2 so tên theo **từ** (`n.split(" ").includes(...)`) để "tu" không khớp nhầm.

## 5. Kiểm tra
- Unit (`node --test tools/*.test.mjs`): `ev` theo ghim; `confront` trúng/sai/lặp/người không có bảng; tệp ẩn; tin trả lời mang `ev`; `freshState` xóa; HTML chat có/không nút 📎, bảng trống/có ghim, tin "của mình"; mẹo theo phần đầu mỗi chương; dữ liệu chương 2: mọi `ev` trong `confront` có ở một chi tiết nào đó, mọi `give` là tệp ẩn có thật, đáp án và phản hồi sai.
- E2E (`tools/e2e.cjs`): chơi phần 1 chương 2: ghim lịch sử đơn → đối chất Huy → tệp ảnh xác nhận xuất hiện; đối chất cô Bảy bằng biên bản; nộp Hồ sơ đúng.

## 6. Hoàn tất
Cập nhật CLAUDE.md (schema `ev`/`hidden`/`confront`, quy tắc Mẹo, nội dung chương 2), commit, push, kiểm tra trang live.

---

## Phụ lục A — Kịch bản v1

Án mạng · Khó · Dãy trọ hẻm 51, Bình Thạnh · tối thứ Sáu 14/11/2025, phát hiện sáng thứ Bảy 15/11.
Game bắt đầu: T7 15/11, 08:40. Cơ chế mới: **Đối chất bằng chứng** (nhắn thẳng với nghi phạm, 📎 Đưa bằng chứng đã ghim).
Không tả máu me: nạn nhân "ngã, chấn thương vùng đầu".

=====================================================================
## PHẦN A — NGƯỜI CHƠI NHÌN THẤY GÌ (trước khi đối chất)
=====================================================================

### Giới thiệu
"Sáng nay chủ trọ mở cửa phòng 4 bằng chìa dự phòng: anh shipper Phúc nằm bất động cạnh bàn. Cửa khóa trái, ổ khóa còn nguyên, điện thoại biến mất. Trên bàn có hai hộp cơm, dù ai cũng nói Phúc sống một mình."

### App Nhắn
**Anh Ti dân phòng** (dẫn chuyện, hiện dần):
- 08:21 "Em ơi, vụ này nặng. Phúc, shipper ở dãy trọ hẻm 51, được phát hiện tử vong sáng nay trong phòng khóa trái."
- 08:22 "Công an đang làm việc. Phúc là người quen của anh nên anh nhờ em xem giúp mấy manh mối, có gì anh báo lại."
- 08:23 "Anh chép biên bản hiện trường, lịch sử đơn và thông báo trên laptop của Phúc (công an cho sao lại), cả nhật ký camera đầu hẻm, để hết trong app Tệp."
- 08:24 "Vụ này anh xin được số của cả năm người liên quan rồi, em nhắn thẳng cho họ được."
- 08:25 "Ai khai không khớp thì ghim cái chứng cứ đó, vào khung chat của người ta bấm 📎 Đưa bằng chứng. Đưa trúng chỗ thì họ hết chối."
- 08:26 "Lần này ghi họ tên người gây ra chuyện, và cách người đó ra khỏi căn phòng khóa trái."

**Cô Bảy · Chủ trọ**:
- 08:10 "Sáng 7g tui gõ cửa thu tiền điện, gọi hoài không ai trả lời."
- 08:12 "Tới 8g10 tui lấy chìa dự phòng mở thì thấy thằng Phúc… trời ơi."
- 08:13 "Cửa khóa trái đàng hoàng, ổ khóa không ai phá."
- 08:14 "Chìa dự phòng tui treo trên bảng trong nhà, không ai mượn. Tối qua tui đi đám cưới cháu ở Gò Vấp, 10g rưỡi mới về."

**Võ Ngọc Trâm**:
- 08:30 "Em nghe cô Bảy gọi rồi… em không tin nổi."
- 08:31 "Tối qua em có qua, khoảng 10g. Gõ cửa hoài không ai mở, đèn trong phòng vẫn sáng."
- 08:32 "Hơn 11g ảnh còn nhắn em 'Đừng tới nữa'. Em tức quá nên chặn luôn."
- 08:33 "Em giận ảnh thôi, em không có làm gì ảnh hết."

**Trần Gia Bảo**:
- 08:35 "Em dọn ra từ đầu tháng 10 rồi anh."
- 08:36 "Em có nợ Phúc thiệt, nhưng đang trả dần."
- 08:37 "Tối qua em làm ca đêm ở xưởng in bên Tân Bình tới 6g sáng."

**Lê Quang Huy · Shipper giao cơm**:
- 08:28 "Tối qua em giao cơm cho anh Phúc nè anh."
- 08:29 "Khoảng 9g10, em gõ cửa, ảnh ra lấy, còn cảm ơn em."
- 08:30 "Lúc em đi thì ảnh vẫn bình thường mà."

**Đỗ Minh Tú · Đồng nghiệp**:
- 08:40 "Trời ơi em mới hay. Tối qua 9g40 em gọi Phúc mà không ai bắt máy."
- 08:41 "Từ 10g em nhậu với anh em trong đội ở quán Ba Khía tới khuya, ai cũng thấy."
- 08:42 "Tối qua em không có ghé phòng nó."

**Nhóm Dãy trọ 51** (hiện họ tên người gửi):
- 15/10 · Cô Bảy: "Phòng 4 thay ổ khóa mới rồi nha, chìa cũ hết xài."
- T6 14/11 · 20:52 · Chị Mai phòng 3: "Phòng nào làm rớt gì mà cái rầm vậy?"
- T6 14/11 · 21:06 · Chị Mai phòng 3: "Ai đóng cửa mạnh dữ vậy trời."
- T7 15/11 · 08:20 · Cô Bảy: "Phòng 4 có chuyện rồi, mọi người đừng ra vô hành lang nha."

### Mặt Sách
- **Lâm Văn Phúc** (lamvanphuc): "Shipper Giao Nhanh · đội Bình Thạnh 3".
  - 13 tháng 11 lúc 22:00: "Có người trong đội làm ăn không sạch. Tui biết hết rồi đó, tự lên tiếng trước đi." — bình luận Đỗ Minh Tú: "Ai vậy ông, nói rõ coi"; bình luận khác: "Gì căng vậy Phúc?"
  - 2 tháng 11: "Có người nợ 8 triệu mà né hoài." — bình luận Trần Gia Bảo: "Tui trả từ từ mà, đừng đăng vậy chứ."
  - 20 tháng 9: "Chạy 42 đơn hôm nay, mệt mà vui."
- **Đỗ Minh Tú** (dominhtu): "Giao Nhanh · đội Bình Thạnh 3".
  - Hôm qua lúc 23:10 · tại Quán Ba Khía: "Nhậu với anh em đội 3 🍻" — bình luận bạn: "Ủa sao ông để hai cái điện thoại trên bàn vậy? Cái ốp dán sticker mèo vàng của ai đó?"; Tú: "Máy phụ, chạy hai app."
  - 10 tháng 11: "Đôi giày bảo hộ mới, cam chói luôn."
- **Võ Ngọc Trâm** (vongoctram): Hôm qua lúc 22:10: "Có những người mình cứ chờ hoài…"
- **Trần Gia Bảo** (trangiabao): Hôm nay lúc 03:05: "Ca đêm xưởng in, 3g sáng còn chạy máy." — bình luận tổ trưởng: "Bảo đứng máy tới 6g nha, chăm ghê."
- **Nhà trọ Cô Bảy** (trang): Hôm qua lúc 21:30: "Đám cưới cháu gái ở Gò Vấp 💐" — bình luận: "Cô Bảy hát hay quá!"
- **Lê Quang Huy** (lequanghuy): Hôm qua lúc 23:00: "Tối thứ Sáu chạy 38 đơn, mệt xỉu."

### Chợ Hẻm / Tin Phố
- Tin Phố: "Shipper và chuyện tiền thu hộ: nhiều tài xế bị dùng chung tài khoản" (12/11).
- Chợ Hẻm: không có tin rao (game báo "Chợ Hẻm chưa có tin rao nào"), vì chương 2 không dùng hình minh họa.

### App Tệp (anh Ti chép lại)
1. **Bien_ban_hien_truong.txt**
   - Phòng 4, cửa gỗ, ổ khóa tay nắm tròn, **không có dấu hiệu bị phá**. Cửa sổ có song sắt.
   - Ô thông gió gạch bông gió cao 2m, mỗi lỗ khoảng 8cm.
   - Trên bàn: **2 hộp cơm tấm còn nguyên nắp**, **2 đôi đũa chưa bóc**, ấm nước.
   - Lịch bloc trên tường còn tờ **thứ Sáu 14/11** (hàng xóm nói Phúc hay xé lịch trước khi ngủ).
   - Quạt đứng đang chạy, đèn huỳnh quang bật.
   - **Không tìm thấy điện thoại** của Phúc. Áo Giao Nhanh treo trên cây móc.
   - Nạn nhân nằm cạnh bàn, chấn thương vùng đầu. Ước tính tử vong: **tối thứ Sáu, 20:00–23:30**.
2. **Lich_su_don_Phuc.txt**: Đơn #GN-88213 · đặt **20:05** · **2 phần** cơm tấm · tài xế Lê Quang Huy · trạng thái "**Giao thành công 20:31**" · có ảnh xác nhận (không xem được trên laptop).
3. **Thong_bao_laptop_14-11.txt** (trung tâm thông báo, đồng bộ từ điện thoại):
   - 19:52 · Thư: đã lưu nháp "Báo cáo đơn COD bất thường".
   - 20:01 · Nhắn · Tú: "Đừng báo công ty, 8h tui qua nói…"
   - 20:02 · Nhắn: "Tú đã thu hồi một tin nhắn."
   - 20:05 · Giao Nhanh: Đặt món thành công.
   - 20:31 · Giao Nhanh: Đơn đã giao.
   - 21:40 · Cuộc gọi nhỡ: Tú.
   - 23:12 · Nhắn · Đã gửi tới Trâm: "Đừng tới nữa."
4. **Nhap_email_COD.txt**: "Kính gửi Giao Nhanh, tài khoản của em có 7 đơn COD em không hề chạy, tiền thu hộ khoảng 30 triệu chưa nộp. Em nghi có người trong đội dùng tài khoản em. Người đó là" (bỏ dở).
5. **Camera_dau_hem_14-11.txt** (camera chỉ quay lối vào hẻm; người đội mũ bảo hiểm không thấy mặt):
   | Giờ | |
   |---|---|
   | 19:40 | vào · shipper áo xanh Giao Nhanh |
   | 19:43 | ra · shipper áo xanh Giao Nhanh |
   | 19:55 | vào · chị Mai phòng 3 (thấy mặt), xách đồ chợ |
   | 20:18 | vào · shipper áo xanh Giao Nhanh |
   | 20:31 | vào · shipper áo xanh Giao Nhanh |
   | 20:33 | ra · shipper áo xanh Giao Nhanh |
   | 20:47 | vào · shipper áo cam (hãng khác) |
   | 20:50 | ra · shipper áo cam |
   | 21:07 | ra · shipper áo xanh Giao Nhanh, đi nhanh |
   | 21:58 | vào · cô gái tóc dài áo trắng (thấy mặt) |
   | 22:04 | ra · cô gái tóc dài áo trắng |
   | 22:31 | vào · cô Bảy (thấy mặt) |

=====================================================================
## PHẦN B — ĐỐI CHẤT (bằng chứng → phản ứng)
=====================================================================
Mỗi người có một câu đáp chung khi bằng chứng không liên quan. Đưa lại cái đã đưa: "Cái này hỏi rồi mà."

**Huy** (chung: "Em chạy đơn cả ngày, nhớ sao nổi chi tiết anh ơi.")
- ← **Lịch sử đơn** (20:31): "Dạ… em nói thiệt. 20:31 em tới, để túi cơm trước cửa rồi chụp ảnh xác nhận, không gõ cửa, sợ trễ đơn sau. Công ty biết là em bị phạt." / "20:33 em ra khỏi hẻm rồi, app có ghi hành trình. Em gửi anh ảnh xác nhận nè." → **gửi tệp `Anh_xac_nhan_GN-88213.txt`**: "Ảnh chụp 20:31 trước cửa phòng 4: túi cơm trên bậc cửa; cạnh cửa có đôi dép tổ ong và **một đôi giày bảo hộ màu cam**."
- ← **Camera**: "Tối qua shipper ra vô hẻm đó cả chục lượt, sao anh biết lượt nào là em?"

**Tú** (chung: "Cái này liên quan gì tui?")
- ← **Thông báo laptop** (tin thu hồi): "…Ừ thì tui có nhắn. Tui có ghé chút, nói chuyện tiền nong thôi. Tầm 8g rưỡi tui về, Phúc còn khỏe re." *(mâu thuẫn: camera không có lượt shipper xanh nào ra quanh 20:30 ngoài Huy 20:33, người kia ra 21:07)*
- ← **Ảnh xác nhận** (giày cam): "Giày bảo hộ cam shipper nào chẳng mang. Ông nghi tui hả?"
- ← **Nháp email COD**: "Tài khoản ai nấy chạy. Phúc nghi bậy đó."
- ← **Lời Trâm về ốp mèo vàng**: "…Tui không nói chuyện nữa. Có gì gặp công an."
- ← **Camera**: "Camera đâu thấy mặt ai mà ông nói. Shipper áo xanh đầy hẻm."

**Trâm** (chung: "Em không biết gì thêm hết.")
- ← **Biên bản** (không thấy điện thoại) hoặc **bài nhậu của Tú / bình luận về ốp mèo vàng**: "Điện thoại anh Phúc có cái ốp dán sticker mèo vàng, em tặng hồi sinh nhật, tự tay em dán." / (nếu là bài nhậu) "Khoan… cái ốp mèo vàng đó là của anh Phúc. Sao nó nằm trên bàn nhậu lúc 11g đêm?" → tin nhắn này ghim được (bằng chứng để đưa cho Tú).
- ← **Camera**: "Cô gái 21:58 là em đó. Em gõ cửa không ai mở, đèn vẫn sáng, em về liền."

**Cô Bảy** (chung: "Tui già rồi, mấy cái này tui không rành.")
- ← **Biên bản** (ổ khóa không bị phá): "Ổ khóa thay hồi tháng 10 là loại tay nắm bấm. Bấm cái nút bên trong rồi kéo cửa là nó tự khóa, khỏi cần chìa. Mấy đứa trọ bị nhốt ngoài hoài."
- ← **Camera**: "Tui về 22:31 đó, camera có quay. Tui đi thẳng vô nhà ngủ, không ghé phòng 4."
- ← **Tin nhóm trọ "thay ổ khóa"**: cô giải thích khóa tay nắm bấm, đóng cửa là tự khóa (như với Biên bản).

**Bảo** (chung: "Em ở xưởng cả đêm, anh hỏi tổ trưởng em.")
- ← **Bài "nợ 8 triệu"**: "Em trả 2 triệu rồi, còn 6. Phúc biết mà, ảnh đăng cho em quê thôi."
- ← **Biên bản** hoặc **tin nhóm trọ "thay ổ khóa"**: "Ổ khóa đổi rồi mà, chìa cũ em còn giữ chứ mở không được. Anh hỏi cô Bảy coi."

=====================================================================
## PHẦN C — ĐÁP ÁN
=====================================================================
Thủ phạm: **Đỗ Minh Tú**. Cách rời phòng: **bấm chốt khóa tay nắm rồi kéo cửa sập lại**.

Sự thật: Tú ôm khoảng 30 triệu tiền COD, có đơn chạy bằng tài khoản Phúc. Phúc định báo công ty. 20:01 Tú nhắn hẹn rồi thu hồi; 20:05 Phúc đặt 2 phần cơm chờ khách; 20:18 Tú vào hẻm (áo Giao Nhanh, mũ bảo hiểm); 20:31 Huy để cơm trước cửa, chụp ảnh (giày cam của Tú cạnh cửa), 20:33 ra; ~20:50 cãi nhau, xô xát, Phúc ngã đập đầu (chị Mai nghe "rầm" 20:52); 21:05 Tú bấm khóa tay nắm, kéo cửa (chị Mai nghe đóng cửa mạnh 21:06), lấy điện thoại Phúc; 21:07 ra khỏi hẻm; 21:40 gọi vào máy Phúc đang nằm trong túi mình; 23:12 dùng máy Phúc nhắn Trâm "Đừng tới nữa" để tạo mốc giả "Phúc còn sống lúc 23:12" khi mình đang ngồi nhậu.

Đường suy luận:
1. Biên bản: cơm còn nguyên, đũa chưa bóc, lịch còn tờ 14, đèn quạt còn bật → Phúc chết ngay sau khi cơm tới (20:31), trước khi ăn. Tin "Đừng tới nữa" 23:12 không phải Phúc gửi.
2. Đối chất Huy bằng lịch sử đơn → Huy rời 20:33 (lời khai 21:10 là để che lỗi không gõ cửa). Ảnh xác nhận: có đôi giày bảo hộ cam trước cửa → lúc 20:31 có khách trong phòng.
3. Camera: ghép vào–ra (19:40/19:43, 20:31/20:33 = Huy, 20:47/20:50 áo cam) → còn dư người áo xanh vào 20:18, ra 21:07 (khớp tiếng đóng cửa 21:06).
4. Mặt Sách Tú: giày bảo hộ cam. Thông báo laptop: Tú hẹn 8h rồi thu hồi. Đối chất Tú → nhận có ghé, nói về 8g rưỡi — sai với camera.
5. Ảnh nhậu 23:10: hai điện thoại, một ốp mèo vàng. Đối chất Trâm → ốp mèo vàng là của Phúc → Tú cầm điện thoại Phúc, chính Tú gửi tin 23:12.
6. Động cơ: bài "làm ăn không sạch" + bình luận của Tú + nháp email COD.
7. Đối chất cô Bảy bằng biên bản → khóa tay nắm bấm, đóng là tự khóa → không cần chìa.

Gỡ nghi:
- Trâm: camera thấy mặt 21:58–22:04, khi đó Phúc đã chết; tin 23:12 gửi **cho** cô.
- Bảo: ổ khóa đã thay tháng 10, chìa cũ vô dụng; ca đêm có tổ trưởng xác nhận.
- Cô Bảy: về 22:31 (sau khi Phúc chết); mốc 23:12 là giả nên giả thuyết "cô Bảy vào phòng sau 22:31" sụp; chìa dự phòng trên bảng.
- Huy: nói dối giờ, nhưng rời hẻm 20:33 và chính ảnh của Huy chỉ ra đôi giày cam.

Hồ sơ:
- "Ai đã gây ra cái chết của Phúc? (ghi đầy đủ họ tên)"
- "Hung thủ rời căn phòng khóa trái bằng cách nào?"
  a. Bấm chốt khóa tay nắm rồi kéo cửa sập lại ✅
  b. Dùng chìa dự phòng của chủ trọ
  c. Dùng chìa cũ của bạn cùng phòng
  d. Thò tay qua ô bông gió để khóa từ ngoài

Phản hồi khi sai (dự kiến):
- Trâm: "Camera thấy rõ mặt Trâm lúc 21:58, khi đó hai hộp cơm đã nguội từ lâu. Tin 23:12 là gửi cho Trâm chứ đâu phải Trâm gửi."
- Bảo: "Ổ khóa phòng 4 đã thay từ tháng 10, chìa cũ của Bảo không mở được. Tổ trưởng còn xác nhận Bảo đứng máy tới 6g."
- Cô Bảy: "Cô Bảy về lúc 22:31. Phúc mất từ trước khi kịp ăn hộp cơm giao lúc 20:31."
- Huy: "Huy có nói dối giờ giao thật, nhưng GPS ghi Huy rời hẻm lúc 20:33. Mà nhìn kỹ tấm ảnh Huy chụp trước cửa xem, có đôi giày của ai ngoài dép của Phúc?"
- Đúng Tú, sai cách: (b) "Chìa dự phòng treo trong nhà cô Bảy cả tối, cô đi đám cưới." (c) "Ổ khóa đã thay từ tháng 10, chìa cũ hết xài." (d) "Ô bông gió cao 2m, lỗ chỉ 8cm, không thò tay tới ổ khóa được."
- Gõ thiếu họ tên Tú: nhắc ghi đủ họ tên, không trừ lượt.
