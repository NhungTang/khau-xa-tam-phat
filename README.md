# Khẩu Xà Tâm Phật

Ứng dụng web đi chùa trực tuyến — dùng được trên cả máy tính và điện thoại.

## Chạy

```bash
npm start            # hoặc: node server.js
# mở http://localhost:3000
```

Không cần cài thư viện nào (Node ≥ 12).

| Biến môi trường | Ý nghĩa |
|---|---|
| `PORT` | Cổng (mặc định `3000`) |

## Nhạc nền Chú Đại Bi

Đặt file nhạc vào `public/assets/chu-dai-bi.mp3` (bản thu có bản quyền nên không đi kèm).
Nếu chưa có file, ứng dụng tự phát tiếng mõ + chuông tổng hợp để thay thế.

## Tính năng

- **Pháp danh**: lưu trong localStorage; lần sau ô nhập tự điền tên cũ. Bỏ trống → "Phật tử".
- **Chính điện**: tượng Phật giữa điện, nền gạch, tông nâu, cột đỏ, lư hương, đèn lồng.
- **Nhân vật**: đầu tròn, áo lam, không tóc/mặt; đi lại (phím mũi tên/WASD hoặc chạm nền),
  Ngồi / Quỳ / Lạy (nút dưới màn hình hoặc phím 2–4); đi lại là tự đứng dậy.
- **Chat**: Enter để gõ, chữ hiện trên đầu 10 giây.
- **Mọi người chơi chung**: ai vào app (ở mạng nào cũng vậy) đều chung một chùa và một văn phòng
  (tối đa 30 người mỗi nơi).
- **Nhiệm vụ hằng ngày — chép kinh**: mỗi ngày một bài (xoay vòng). Chép đúng từng ký tự
  (không cho dán) → hoàn thành. Điểm hiện trên áo, mọi người đều thấy.
  Dữ liệu chỉ lưu ở máy người dùng — xoá dữ liệu trình duyệt là mất hết.

Khi so sánh bài chép: chuẩn hoá Unicode (NFC — tránh lệch do bộ gõ), bỏ khoảng trắng thừa ở
cuối dòng/đầu-cuối bài; mọi ký tự khác (chữ, dấu, dấu câu, xuống dòng) phải khớp tuyệt đối.
