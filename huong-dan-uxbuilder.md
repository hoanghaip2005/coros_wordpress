# Cấu trúc UX Builder – Trang So sánh sản phẩm COROS

> **Cập nhật lần cuối:** Row mobile 5 cột, fixed+scale+slide animation cho col 1–3.

## Tổng quan

```
section.section-comparison
├── ROW 1 – Dropdown Row        (Desktop only – sticky)
├── ROW 2 – Desktop Image Row   (Desktop only – class: desktop-image-row)
├── ROW 3 – Mobile Image Row    (Mobile only  – class: mobile-image-row, 5 cột)
└── TABLE – TablePress data source
```

---

## ROW 1 – Dropdown Row (Desktop only)

**Class cần có:** `row align-middle align-center dropdown-sticky-row`  
**Hiển thị:** Desktop (`> 768px`). Ẩn hoàn toàn trên mobile.

```
row.dropdown-sticky-row
├── col (medium-3) .hide-duplicate-col          ← Cột 1: Toggle ẩn dòng trùng
│   └── .col-inner
│       └── .col.hide-duplicate-col
│           └── label.hide-duplicate-toggle
│               ├── span.toggle-label           "Hide Duplicated Details"
│               ├── input#hideDuplicateCheckbox [type="checkbox"]
│               └── span.toggle-slider
│
├── col (medium-3)                              ← Cột 2: Dropdown sản phẩm 1
│   └── .col-inner
│       └── .product-dropdown
│           ├── .dropdown-button
│           └── .dropdown-menu
│               └── .dropdown-item [×11]        data-value, data-column, data-img
│
├── col (medium-3)                              ← Cột 3: Dropdown sản phẩm 2
│   └── (cấu trúc giống cột 2)
│
└── col (medium-3)                              ← Cột 4: Dropdown sản phẩm 3
    └── (cấu trúc giống cột 2)
```

---

## ROW 2 – Desktop Image Row

**Class cần có:** `row align-middle desktop-image-row`  
**Hiển thị:** Desktop only. Ẩn trên mobile bằng CSS media query.

```
row.align-middle.desktop-image-row
├── col (medium-3)                              ← Cột 1: Trống (CSS display:none)
│
├── col (medium-3)                              ← Cột 2: Image box sản phẩm 1
│   └── .col-inner
│       ├── .gap-element                        (padding-top: 30px)
│       └── .box.anh-bien-doi.box-text-bottom
│           ├── .box-image
│           │   └── .image-cover
│           │       └── img [src="..."]        JS cập nhật src
│           └── .box-text.text-center
│               └── .box-text-inner
│                   ├── .text.product-title
│                   │   └── h4                 JS cập nhật giá
│                   └── a.button.primary.is-outline.expand
│                                              JS cập nhật href
│
├── col (medium-3)                              ← Cột 3: Image box sản phẩm 2
│   └── (cấu trúc giống cột 2)
│
└── col (medium-3)                              ← Cột 4: Image box sản phẩm 3
    └── (cấu trúc giống cột 2)
```

---

## ROW 3 – Mobile Image Row (5 cột)

**Class cần có:** `row mobile-image-row`  
**Hiển thị:** Mobile only (`≤ 768px`). Ẩn mặc định trên desktop.  
**Lưu ý quan trọng:** `.mobile-product-dropdown` là **sibling của `.anh-bien-doi`** bên trong `col-inner`, KHÔNG nằm trong `.box-text-inner`.

```
row.mobile-image-row
├── col (12/12)                                 ← Cột 1: Toggle full width
│   └── .col-inner.text-shadow-4               (text-shadow bị override = none bởi CSS)
│       └── .col.hide-duplicate-col
│           └── label.hide-duplicate-toggle
│               ├── span.toggle-label
│               ├── input#hideDuplicateCheckbox [type="checkbox"]
│               └── span.toggle-slider
│
├── col (6/12)                                  ← Cột 2: Ảnh + dropdown sản phẩm 1
│   └── .col-inner
│       ├── .box.anh-bien-doi.box-text-bottom   JS tắt transition, scale + overflow:hidden
│       │   ├── .box-image
│       │   │   └── .image-cover
│       │   │       └── img [src="..."]        JS cập nhật src
│       │   └── .box-text.text-center
│       │       └── .box-text-inner            (trống)
│       └── .mobile-product-dropdown            ← Sibling của .anh-bien-doi
│           └── .product-dropdown
│               ├── .dropdown-button
│               └── .dropdown-menu
│                   └── .dropdown-item [×11]
│
├── col (6/12)                                  ← Cột 3: Ảnh + dropdown sản phẩm 2
│   └── (cấu trúc giống cột 2)
│
├── col (6/12)                                  ← Cột 4: Giá + nút sản phẩm 1
│   └── .col-inner
│       └── ...
│           ├── .text.product-title
│           │   └── h4                         JS cập nhật giá
│           └── a.button.primary.is-outline.expand
│                                              JS cập nhật href
│
└── col (6/12)                                  ← Cột 5: Giá + nút sản phẩm 2
    └── (cấu trúc giống cột 4)
```

### Attributes của `.dropdown-item`

| Attribute     | Ý nghĩa                              | Ví dụ                   |
|---------------|--------------------------------------|-------------------------|
| `data-value`  | ID sản phẩm (unique key)             | `"pace3"`, `"apex4-46"` |
| `data-column` | Số cột trong TablePress (2–13)       | `"2"`, `"4"`, `"11"`    |
| `data-img`    | URL ảnh sản phẩm (CloudFront CDN)    | `"https://d1teks..."`   |
| `.selected`   | Class đánh dấu item đang được chọn  | –                       |

---

## TABLE – TablePress data source

**ID:** `#tablepress-1`  
**Class:** `tablepress tablepress-id-1`

### Các row metadata (JS đọc, không hiển thị trong section so sánh)

| Row class | Nội dung              | JS dùng để                                  |
|-----------|-----------------------|---------------------------------------------|
| `row-1`   | Tên sản phẩm (header) | Định danh cột                               |
| `row-2`   | Giá sản phẩm          | Cập nhật `.product-title h4`                |
| `row-3`   | URL ảnh sản phẩm      | Cập nhật `img[src]` và `img[srcset]`        |
| `row-4`   | URL trang sản phẩm    | Cập nhật `a.button[href]`                   |
| `row-5+`  | Thông số so sánh      | Hiển thị trong bảng (ẩn nếu duplicate)      |

### Mapping cột sản phẩm

| `data-column` | Sản phẩm            |
|---------------|---------------------|
| 2             | COROS PACE 3        |
| 3             | COROS PACE 4        |
| 4             | COROS APEX 4 (46mm) |
| 5             | COROS NOMAD         |
| 6             | COROS APEX 2 Pro    |
| 7             | COROS VERTIX 2      |
| 8             | COROS PACE Pro      |
| 10            | COROS APEX 4 (42mm) |
| 11            | COROS VERTIX 2S     |
| 12            | COROS APEX 2        |
| 13            | COROS PACE 2        |

> **Lưu ý:** Không có cột 9. `column-1` luôn là cột nhãn tham số.

---

## Quy tắc hiển thị Desktop / Mobile

| Element                           | Desktop (`> 768px`) | Mobile (`≤ 768px`) |
|-----------------------------------|---------------------|--------------------|
| `.dropdown-sticky-row`            | Hiển thị (sticky)   | **Ẩn**             |
| `.desktop-image-row`              | Hiển thị            | **Ẩn**             |
| `.mobile-image-row`               | **Ẩn**              | Hiển thị           |
| `.mobile-product-dropdown`        | **Ẩn**              | Hiển thị           |

---

## Luồng hoạt động của JavaScript (`dropmenu-v2.js`)

```
DOMReady
│
├── 1. enforceLegacyDropdownRowVisibility()
│      → Ẩn .dropdown-sticky-row trên mobile bằng JS (hỗ trợ CSS)
│
├── 2. getActiveDropdowns()
│      → Desktop: lấy visible .dropdown-sticky-row .product-dropdown (ưu tiên ≥ 2)
│      → Mobile:  lấy visible .mobile-product-dropdown (từ .mobile-image-row)
│      → Gán vào biến `dropdowns` (dùng xuyên suốt)
│
├── 3. ensureMobileImagesVisible()
│      → Target .mobile-image-row .anh-bien-doi img
│      → Thêm .js-loaded, bật opacity/visibility
│
├── 4. cacheOriginalData()
│      → Đọc toàn bộ TablePress → lưu vào originalTableData[columnNumber][rowClass]
│
├── 5. Resolve conflicts (dropdownMapping[])
│      → Đảm bảo mỗi dropdown chọn một cột khác nhau
│      → Cập nhật .dropdown-button text nếu cần swap
│
├── 6. renderToPosition(sourceColumn, positionIndex)
│      → Ghi dữ liệu từ cột nguồn vào cột hiển thị trong bảng
│
├── 7. Init image / price / button cho từng dropdown
│      → resolveImageBoxForDropdown(dropdown):
│         • Mobile:  dropdown.closest('.mobile-product-dropdown') → .col cha
│         • Desktop: tìm .desktop-image-row → lọc .col có .anh-bien-doi → theo index
│      → resolvePriceBoxForDropdown(dropdown):
│         • Mobile:  allCols[dropdownIndex + 3]  ← col 4 hoặc col 5
│         • Desktop: cùng col với ảnh
│      → getResolvedImageUrl():
│         • Ưu tiên URL từ TablePress row-3 (qua sanitizeUrl)
│         • Fallback sang data-img trên .dropdown-item.selected
│      → Gán img.src / img.srcset, h4.innerHTML (giá), a.button[href]
│
├── 8. Event listeners trên từng dropdown
│      → Click button → toggle .dropdown-menu.active
│      → Click item:
│         • Kiểm tra conflict (cột đang chọn ở dropdown khác)
│         • Nếu conflict → swap 2 dropdown, cập nhật bảng + ảnh + giá + nút
│         • Cập nhật bảng + ảnh + giá + nút cho dropdown hiện tại
│
├── 9. Hide Duplicate Toggle
│      → Sync tất cả #hideDuplicateCheckbox / .js-hide-duplicate-checkbox
│      → Ẩn row trùng (giá trị các cột visible giống nhau)
│      → Ẩn section header nếu tất cả row con đều bị ẩn
│      → Hook vào renderToPosition để re-check sau khi đổi dropdown
│
└── 10. setupMobileStickyImages()   ← Chỉ chạy trên mobile (≤ 768px)
        → Xem chi tiết bên dưới
```

---

## setupMobileStickyImages() – Chi tiết

### Hằng số

| Hằng số      | Giá trị | Ý nghĩa                                         |
|--------------|---------|-------------------------------------------------|
| `HEADER_H`   | `100`   | Chiều cao header (px), offset khi fixed          |
| `SCALE_RANGE`| `200`   | Số px scroll để ảnh scale từ 100% → 40%         |
| `MIN_SCALE`  | `0.4`   | Tỷ lệ scale nhỏ nhất (40%)                      |

### naturalCache – đo 1 lần khi chưa fixed

| Key           | Nội dung                                               |
|---------------|--------------------------------------------------------|
| `toggleLeft`  | `getBoundingClientRect().left` của col 1               |
| `toggleWidth` | `getBoundingClientRect().width` của col 1              |
| `toggleH`     | `getBoundingClientRect().height` của col 1             |
| `img1Left/2`  | left của col 2/3                                       |
| `img1Width/2` | width của col 2/3                                      |
| `img1H`       | height của col 2 (toàn col, gồm ảnh + dropdown)       |
| `anh1H/2H`    | `offsetHeight` của `.anh-bien-doi` (chỉ phần ảnh)     |
| `drop1H/2H`   | `offsetHeight` của `.mobile-product-dropdown`          |
| `rowOffsetTop`| offsetTop của `.mobile-image-row` tính từ document    |

### Hành vi scroll

**Trigger point:** `rowOffsetTop - HEADER_H`

Khi `scrollY >= triggerPoint`:

| Hành động               | Scroll xuống (kéo xuống)        | Scroll lên (kéo lên)              |
|-------------------------|---------------------------------|-----------------------------------|
| **Col 1 (toggle)**      | `top = -toggleH` (trượt lên ẩn) | `top = HEADER_H` (trượt xuống hiện) |
| **Col 2/3 (ảnh)**       | `top = HEADER_H` (lên sát header) | `top = HEADER_H + toggleH`       |
| **Transition**          | `top 0.25s ease` (mượt)         | `top 0.25s ease` (mượt)           |
| **paddingTop row**      | `toggleH + maxColH`             | `toggleH + maxColH`               |

Tất cả 3 cols: `position: fixed`, `background: #fff`, `boxShadow: none`.

### Scale ảnh

- `scaledAnhH = anh1H * currentScale` (chiều cao sau scale của `.anh-bien-doi`)
- `anh.style.transform = scale(currentScale)` + `transformOrigin: top center`
- `anh.style.transition = 'none'` → tắt Flatsome `.box.has-hover` transition để tránh lag
- `anh.style.overflow = 'hidden'` → clip content
- `anh.style.marginBottom = -(anh1H - scaledAnhH)px` → kéo dropdown sát ảnh đã scale
- `col.style.height = scaledAnhH + dropH` → col thu hẹp theo
- `col-inner.style.height = scaledAnhH + dropH` → col-inner thu hẹp theo
- `col/col-inner.overflow = 'visible'` → dropdown không bị clip

Khi `scrollY < triggerPoint` → reset tất cả về `''`.

---

## Các class quan trọng – bảng tra cứu nhanh

| Class                            | Mục đích                                               |
|---------------------------------|--------------------------------------------------------|
| `.dropdown-sticky-row`          | Row dropdown desktop (sticky, ẩn trên mobile)          |
| `.desktop-image-row`            | **[THÊM VÀO UX BUILDER]** Row ảnh desktop             |
| `.mobile-image-row`             | **[THÊM VÀO UX BUILDER]** Row ảnh mobile (5 cột)      |
| `.hide-duplicate-col`           | Cột chứa toggle ẩn dòng trùng                          |
| `.hide-duplicate-toggle`        | Label bao quanh checkbox toggle                        |
| `.toggle-label`                 | Text "Hide Duplicated Details"                         |
| `.toggle-slider`                | Pseudo-element tạo hiệu ứng toggle switch              |
| `.js-hide-duplicate-checkbox`   | Class thay thế cho `#hideDuplicateCheckbox`            |
| `.product-dropdown`             | Container dropdown chọn sản phẩm                       |
| `.dropdown-button`              | Nút hiển thị tên sản phẩm đang chọn                   |
| `.dropdown-menu`                | Danh sách sản phẩm (ẩn/hiện với `.active`)            |
| `.dropdown-item`                | Một option trong dropdown                              |
| `.dropdown-item.selected`       | Option đang được chọn                                  |
| `.anh-bien-doi`                 | Box chứa ảnh sản phẩm (JS scale + clip khi fixed)     |
| `.mobile-product-dropdown`      | Wrapper dropdown trong col 2/3 của mobile-image-row   |
| `.duplicate-hidden`             | JS thêm vào để ẩn row trùng trong bảng                |
| `.js-loaded`                    | JS thêm vào `img` để tắt opacity ẩn của CSS           |

---

## Các file liên quan

| File                        | Vai trò                                                       |
|----------------------------|---------------------------------------------------------------|
| `dropmenu-v2.js`           | Toàn bộ logic JS (dropdown, ảnh, bảng, toggle, mobile fixed) |
| `dropmenu.css`             | Style dropdown, image box, mobile/desktop row, text-shadow override |
| `sticky-dropdown-row.css`  | Style sticky cho `.dropdown-sticky-row` (desktop)            |
| `tablepress.css`           | Style bảng so sánh (section headers, responsive)              |
| `json.json`                | HTML mẫu hiện tại lấy từ WordPress (chỉ đọc, không sửa)      |

---

## Checklist khi thêm class vào UX Builder

- [ ] Row 1 (dropdown desktop): class `dropdown-sticky-row` ✓
- [ ] Row 2 (image desktop): thêm class `desktop-image-row`
- [ ] Row 3 (image mobile): thêm class `mobile-image-row`

---

## Lưu ý khi chỉnh sửa

1. **Cấu trúc col mobile:** `.mobile-product-dropdown` PHẢI là sibling của `.anh-bien-doi` bên trong `col-inner`, không được đặt bên trong `.box-text-inner` — JS `measureNatural()` đo `drop1H` từ vị trí này.

2. **Thêm sản phẩm mới:** thêm `data-column` vào tất cả 3 desktop dropdown (ROW 1) + 2 mobile dropdown (ROW 3) cùng lúc, và thêm cột tương ứng vào TablePress.

3. **`HEADER_H = 100`** hardcoded. Nếu header thay đổi chiều cao, cập nhật hằng số này trong `setupMobileStickyImages()`.

4. **`#hideDuplicateCheckbox`** xuất hiện 2 lần trong DOM (ROW 1 + ROW 3) — JS tự sync cả hai.

5. **`resolveImageBoxForDropdown()`** phải dùng biến `dropdowns` (outer scope), **không** gọi `getActiveDropdowns()` lại — sẽ trả về array khác, làm `indexOf()` ra `-1`.

6. **Flatsome `.box.has-hover` có CSS transition** — JS override `transition: none` trước khi set `transform: scale()` để tránh scale lag gây ảnh tràn qua dropdown.

7. **`naturalCache` bị xóa khi resize** → `onResize()` set `naturalCache = null`, đo lại lần scroll tiếp theo.

8. **URL ảnh trong TablePress `row-3`:** không được có khoảng trắng — JS có `sanitizeUrl()` nhưng tốt nhất fix từ nguồn.
