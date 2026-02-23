# Hướng dẫn setup bảng so sánh trong UX Builder

## Cấu trúc layout

### 1. Row chính với 4 cột

```
[Row]
  └─ [Col 1] - COROS PACE 4 (Cố định)
  └─ [Col 2] - COROS APEX 4 (46mm) (Cố định)
  └─ [Col 3] - COROS APEX 2 Pro (Cố định)
  └─ [Col 4] - Dropdown chọn thêm sản phẩm (Ẩn mặc định, hiện khi chọn)
```

### 2. Cột 1, 2, 3 (3 sản phẩm cố định)

Mỗi cột chứa:

- **Image Box** với class `anh-bien-doi`
  - Thêm ảnh sản phẩm
- **Text/Heading** với class `product-title`
  - Tên sản phẩm (VD: COROS PACE 4)

### 3. Cột 4 (Dropdown sản phẩm thêm)

Thêm class cho cột: `col-extra`

Nội dung cột:

- **HTML Element**: Paste code dropdown từ file `dropmenu.html`
- **Image Box** với class `anh-bien-doi`
  - Ảnh placeholder hoặc để trống
- **Text/Heading** với class `product-title`
  - Text: "-- Chọn sản phẩm --"

## CSS cần thêm vào Custom CSS

```css
/* Ẩn cột thứ 4 mặc định */
.row-comparison .col:nth-child(4) {
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Hiện cột 4 khi có class active */
.row-comparison .col:nth-child(4).active {
  display: block;
  opacity: 1;
}
```

## JavaScript cần thêm

Thêm vào cuối file `dropmenu.html` hoặc trong Custom JS:

```javascript
// Hiện cột 4 khi chọn sản phẩm
document
  .querySelector(".product-selector-extra")
  .addEventListener("change", function () {
    const col4 = document.querySelector(".row-comparison .col:nth-child(4)");
    if (this.value && col4) {
      col4.classList.add("active");
    }
  });
```

## Bảng TablePress

### Cấu trúc cột trong TablePress:

- **Cột A**: Tên thông số (Dimensions, Weight...)
- **Cột B**: COROS PACE 4
- **Cột C**: COROS APEX 4 (46mm)
- **Cột D**: COROS APEX 2 Pro
- **Cột E**: Sản phẩm từ dropdown (sẽ update bằng JS)

### Ẩn/Hiện cột E:

- Mặc định: Ẩn cột E
- Khi chọn sản phẩm từ dropdown: JS sẽ update dữ liệu vào cột E và hiện cột

## Lưu ý quan trọng

1. **Class names phải đúng**:
   - `.anh-bien-doi` cho Image Box
   - `.product-title` cho tên sản phẩm
   - `.row-comparison` cho Row chính
   - `.col-extra` cho cột 4

2. **Data attributes trong bảng**:
   Thêm `data-spec` cho mỗi row trong TablePress để JS có thể update:

   ```html
   <tr data-spec="dimensions"></tr>
   <tr data-spec="weight"></tr>
   <tr data-spec="displaySize"></tr>
   ```

3. **Product data object**:
   Cập nhật đầy đủ thông số sản phẩm trong object `productData` trong file `dropmenu.html`

## Demo flow

1. Trang load → Hiện 3 sản phẩm cố định
2. User click dropdown → Chọn "COROS PACE 3"
3. Cột 4 xuất hiện với animation
4. Ảnh, tên, và dữ liệu trong bảng tự động update
5. User có thể chọn sản phẩm khác → Cột 4 update lại
6. Chọn "-- So sánh thêm --" → Cột 4 ẩn đi
