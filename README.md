# Khẩu Xà Tâm Phật

Ứng dụng web đi chùa trực tuyến — dùng được trên cả máy tính và điện thoại.

## Chạy

```bash
npm start            # hoặc: node server.js
# mở http://localhost:3000
```

Chạy ở máy không cần cài thư viện (Node ≥ 12). Chỉ khi bật `OBFUSCATE=1` mới cần `npm install`
(thư viện `javascript-obfuscator`; Render tự cài khi build).

| Biến môi trường | Ý nghĩa |
|---|---|
| `PORT` | Cổng (mặc định `3000`) |
| `OBFUSCATE=1` | Làm rối `game.js` lúc khởi động (đổi tên biến, mã hoá chuỗi) để người chơi khó đọc code mà sửa dữ liệu. Đặt trên Render; chạy ở máy để trống cho dễ sửa lỗi |

## Nhạc nền

Chọn bài bằng nút loa. Mặc định là tiếng mõ + chuông tổng hợp (không cần file).

Các bản tụng có sẵn trong `public/assets/` là của **Kittisaro & Thanissara** (Spirit Rock Meditation
Center, 2004), lấy từ [Dharma Seed](https://dharmaseed.org), giấy phép
[CC BY-NC-ND 4.0](http://creativecommons.org/licenses/by-nc-nd/4.0/): chỉ dùng phi thương mại,
phải ghi nguồn, không chỉnh sửa file. Danh sách chi tiết: `public/assets/README.txt`.

## Tính năng

- **Pháp danh**: lưu trong localStorage; lần sau ô nhập tự điền tên cũ. Bỏ trống → "Phật tử".
- **Chính điện**: tượng Phật giữa điện, nền gạch, tông nâu, cột đỏ, lư hương, đèn lồng.
- **Nhân vật**: đầu tròn, áo lam, không tóc/mặt; đi lại (phím mũi tên/WASD hoặc chạm nền),
  Ngồi / Quỳ / Lạy (nút dưới màn hình hoặc phím 2–4); đi lại là tự đứng dậy.
- **Chat**: Enter để gõ, chữ hiện trên đầu 10 giây.
- **Mọi người chơi chung**: ai vào app (ở mạng nào cũng vậy) đều chung một chùa, một văn phòng và một nhà hàng
  (tối đa 60 người mỗi nơi; kín thì được mời sang khu khác).
- **Nhiệm vụ hằng ngày — chép kinh**: mỗi ngày một bài (xoay vòng). Chép đúng từng ký tự
  (không cho dán) → hoàn thành. Điểm hiện trên áo, mọi người đều thấy.
  Dữ liệu chỉ lưu ở máy người dùng — xoá dữ liệu trình duyệt là mất hết.

Khi so sánh bài chép: chuẩn hoá Unicode (NFC — tránh lệch do bộ gõ), bỏ khoảng trắng thừa ở
cuối dòng/đầu-cuối bài; mọi ký tự khác (chữ, dấu, dấu câu, xuống dòng) phải khớp tuyệt đối.
