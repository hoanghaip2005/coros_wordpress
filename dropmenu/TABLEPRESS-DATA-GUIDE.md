# Hướng dẫn nhập data vào TablePress

## Cấu trúc bảng TablePress ID-1

### Các dòng data đặc biệt (ẨN - không hiển thị trên bảng)

| Row | Column 1 (Label) | Column 2 | Column 3 | Column 4 | Column 5... |
|-----|------------------|----------|----------|----------|-------------|
| **1** | **(TÊN SẢN PHẨM - ẨN)** | COROS PACE 3 | COROS PACE 4 | COROS APEX 4 (46mm) | ... |
| **2** | **Price** | `$249` | `$299` | `$349` | `$399` |
| **3** | **Image URL** | `https://d1teks7lx8pls2.cloudfront.net/filters:format(webp)/filters:quality(90)/fit-in/354x354/coros-web-faq/upload/images/2d52ad862503a5b469f6d22c6663de2e.png` | `https://d1teks7lx8pls2.cloudfront.net/...cea9586b...png` | ... | ... |
| **4** | **Product URL** | `https://coros.com.vn/san-pham/pace-3` | `https://coros.com.vn/san-pham/pace-4` | ... | ... |

### Tiếp theo là các specs (HIỂN THỊ trên bảng)

| Row | Column 1 (Label) | Column 2 | Column 3 | Column 4 |
|-----|------------------|----------|----------|----------|
| **5** | **SIZE AND WEIGHT** | | | |
| **6** | Dimensions | 41.9 x 41.9 x 11.7mm | 46.2 x 46.2 x 13.2mm | ... |
| **7** | Weight | 39g | 64g | ... |
| **8** | **DISPLAY** | | | |
| **9** | Display Size | 1.2 inches | 1.3 inches | ... |
| ... | ... | ... | ... | ... |

---

## Cách nhập data

### 1. Row 2 - Price (Giá sản phẩm)
- **Column 1**: Ghi `Price`
- **Column 2-20**: Nhập giá theo format: `$249` hoặc tùy chỉnh HTML
- Ví dụ: 
  ```html
  <h4 class="font-bold">$249</h4>
  ```

### 2. Row 3 - Image URL (Link ảnh sản phẩm)
- **Column 1**: Ghi `Image URL`
- **Column 2-20**: Paste **CHÍNH XÁC** link ảnh CloudFront
- **LƯU Ý**: Chỉ paste URL, KHÔNG có thẻ HTML `<img>`
- Ví dụ:
  ```
  https://d1teks7lx8pls2.cloudfront.net/filters:format(webp)/filters:quality(90)/fit-in/354x354/coros-web-faq/upload/images/2d52ad862503a5b469f6d22c6663de2e.png
  ```

### 3. Row 4 - Product URL (Link trang sản phẩm)
- **Column 1**: Ghi `Product URL`
- **Column 2-20**: Paste link trang chi tiết sản phẩm
- Button **SHOP NOW** sẽ tự động dẫn tới link này
- Ví dụ:
  ```
  https://coros.com.vn/san-pham/coros-pace-3
  ```

---

## Mapping với Dropdown HTML

### File: `dropmenu.html`

Mỗi dropdown item cần có `data-column` trùng với số cột trong TablePress:

```html
<div class="dropdown-item selected" 
     data-value="pace3" 
     data-column="2">     <!-- Column 2 trong TablePress -->
  COROS PACE 3
</div>

<div class="dropdown-item" 
     data-value="pace4" 
     data-column="3">     <!-- Column 3 trong TablePress -->
  COROS PACE 4
</div>
```

**LƯU Ý**: 
- ❌ Không cần `data-img` trong HTML nữa (code tự đọc từ TablePress)
- ✅ Giữ lại `data-img` vẫn OK (backward compatible), nhưng ưu tiên dùng TablePress

---

## Flow hoạt động

1. User chọn sản phẩm từ dropdown (VD: COROS PACE 4)
2. JavaScript đọc `data-column="3"` → Biết sản phẩm này ở cột 3
3. Đọc data từ TablePress:
   - Row 2, Column 3 → Lấy giá `$299`
   - Row 3, Column 3 → Lấy URL ảnh CloudFront
   - Row 4, Column 3 → Lấy link trang sản phẩm
4. Tự động render:
   - ✅ Đổi ảnh trong Image Box
   - ✅ Đổi giá trong `.product-title h4`
   - ✅ Update link button **SHOP NOW**
   - ✅ Đổi specs trong bảng Table

---

## Ưu điểm của cách làm này

✅ **Quản lý tập trung** - Tất cả data ở 1 chỗ (TablePress)
✅ **Dễ maintain** - Sửa giá/ảnh/link chỉ cần edit table
✅ **Scalable** - Thêm sản phẩm mới = thêm 1 cột vào table
✅ **Không cần code** - Content editor có thể tự update

---

## Checklist khi thêm sản phẩm mới

- [ ] Thêm cột mới vào TablePress (VD: Column 5)
- [ ] Điền đầy đủ Row 2 (Price), Row 3 (Image URL), Row 4 (Product URL)
- [ ] Điền đầy đủ specs từ Row 5 trở xuống
- [ ] Thêm item vào 3 dropdown trong `dropmenu.html`:
  ```html
  <div class="dropdown-item" 
       data-value="ten-san-pham" 
       data-column="5">
    TÊN SẢN PHẨM MỚI
  </div>
  ```
- [ ] Test trên trang web: Chọn sản phẩm → Kiểm tra ảnh/giá/button/specs

---

## Troubleshooting

### ❌ Ảnh không hiển thị
- Kiểm tra Row 3 có đúng URL ảnh CloudFront không
- URL phải bắt đầu bằng `https://d1teks7lx8pls2.cloudfront.net/...`
- **Không** wrap URL trong thẻ `<img>` hoặc HTML khác

### ❌ Giá không đổi
- Kiểm tra Row 2 có data không
- Kiểm tra class `.product-title h4` có tồn tại trong Image Box không

### ❌ Button không có link
- Kiểm tra Row 4 có URL không
- URL phải là đường dẫn đầy đủ (có `https://`)

### ❌ Specs không đổi
- Kiểm tra `data-column` trong HTML có khớp với số cột trong table không
- Console browser có báo lỗi không

---

**Tác giả**: GitHub Copilot  
**Ngày cập nhật**: 23/02/2026
