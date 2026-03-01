(function () {
    if (typeof jQuery === 'undefined') return;

    jQuery(document).ready(function ($) {
        function enforceLegacyDropdownRowVisibility() {
            var legacyRows = document.querySelectorAll('.dropdown-sticky-row');
            var isMobile = window.innerWidth <= 768;

            legacyRows.forEach(function (row) {
                if (isMobile) {
                    row.style.setProperty('display', 'none', 'important');
                } else {
                    row.style.removeProperty('display');
                }
            });
        }

        function isMobileView() {
            return window.innerWidth <= 768;
        }

        function getVisibleBySelector(selector) {
            return Array.from(document.querySelectorAll(selector)).filter(function (el) {
                return el.offsetParent !== null;
            });
        }

        function getActiveDropdowns() {
            var desktopDropdowns = getVisibleBySelector('.dropdown-sticky-row .product-dropdown');
            var mobileDropdowns = getVisibleBySelector('.mobile-product-dropdown');

            if (desktopDropdowns.length >= 2) return desktopDropdowns;
            if (mobileDropdowns.length >= 2) return mobileDropdowns;

            if (isMobileView() && mobileDropdowns.length > 0) return mobileDropdowns;
            if (!isMobileView() && desktopDropdowns.length > 0) return desktopDropdowns;

            return desktopDropdowns.length ? desktopDropdowns : mobileDropdowns;
        }

        enforceLegacyDropdownRowVisibility();
        window.addEventListener('resize', enforceLegacyDropdownRowVisibility);

        var dropdowns = getActiveDropdowns();
        if (dropdowns.length === 0) return;

        function ensureMobileImagesVisible() {
            // Đảm bảo ảnh trong mobile row luôn hiển thị
            var imgs = document.querySelectorAll('.mobile-image-row .anh-bien-doi img');
            // Fallback: nếu chưa có class mobile-image-row, target tất cả
            if (imgs.length === 0) {
                imgs = document.querySelectorAll('.row.align-middle:not(.dropdown-sticky-row) .anh-bien-doi img');
            }
            imgs.forEach(function (img) {
                img.classList.add('js-loaded');
                img.style.opacity = '1';
                img.style.visibility = 'visible';
            });
        }

        ensureMobileImagesVisible();

        var originalTableData = {};

        function cacheOriginalData() {
            var table = document.querySelector('.tablepress-id-1');
            if (!table) return;

            var rows = table.querySelectorAll('tbody tr');
            rows.forEach(function (row) {
                if (row.classList.contains('row-1')) return;

                var cells = row.querySelectorAll('td');
                cells.forEach(function (cell) {
                    var columnClass = Array.from(cell.classList).find(function (cls) {
                        return cls.startsWith('column-');
                    });

                    if (!columnClass) return;

                    var columnNumber = parseInt(columnClass.replace('column-', ''));
                    var rowClass = Array.from(row.classList).find(function (cls) {
                        return cls.startsWith('row-');
                    });

                    if (!originalTableData[columnNumber]) {
                        originalTableData[columnNumber] = {};
                    }

                    originalTableData[columnNumber][rowClass] = cell.innerHTML;
                });
            });
        }

        function getProductData(columnNumber) {
            if (!originalTableData[columnNumber]) return null;
            return {
                price: originalTableData[columnNumber]['row-2'] || '',
                imageUrl: originalTableData[columnNumber]['row-3'] || '',
                productUrl: originalTableData[columnNumber]['row-4'] || ''
            };
        }

        function sanitizeUrl(url) {
            return (url || '').trim().replace(/\s+/g, '');
        }

        function getDropdownSelectedImageUrl(dropdown) {
            if (!dropdown) return '';
            var selectedItem = dropdown.querySelector('.dropdown-item.selected');
            if (!selectedItem) return '';
            return sanitizeUrl(selectedItem.getAttribute('data-img') || '');
        }

        function getResolvedImageUrl(dropdown, productData) {
            var tableUrl = sanitizeUrl(productData && productData.imageUrl ? productData.imageUrl : '');
            if (tableUrl.indexOf('http://') === 0 || tableUrl.indexOf('https://') === 0) {
                return tableUrl;
            }
            return getDropdownSelectedImageUrl(dropdown);
        }

        function resolveImageBoxForDropdown(dropdown) {
            var allDropdowns = dropdowns;
            var dropdownIndex = allDropdowns ? allDropdowns.indexOf(dropdown) : -1;

            // Mobile path: dropdown nằm trong .mobile-product-dropdown → trả về .col chứa image box
            var mobileWrapper = dropdown.closest('.mobile-product-dropdown');
            if (mobileWrapper) {
                var mobileCol = mobileWrapper.closest('.col');
                if (mobileCol) return mobileCol;
            }

            // Desktop path: dropdown ở ROW 1 (.dropdown-sticky-row)
            // Image boxes ở row .desktop-image-row (row ngay sau ROW 1)
            var dropdownRow = dropdown.closest('.ux-row') || dropdown.closest('.row');
            if (!dropdownRow) return null;

            // Ưu tiên tìm bằng class .desktop-image-row (cần thêm class này trong UX Builder)
            var imageRow = document.querySelector('.desktop-image-row');
            // Fallback: dùng nextElementSibling nếu chưa có class
            if (!imageRow) {
                imageRow = dropdownRow.nextElementSibling;
                // Bỏ qua nếu nextSibling là mobile row
                if (imageRow && imageRow.classList.contains('mobile-image-row')) {
                    imageRow = imageRow.nextElementSibling;
                }
            }
            if (!imageRow) return null;

            var allCols = Array.from(imageRow.querySelectorAll('.col')).filter(function (col) {
                return col.querySelector('.anh-bien-doi') || col.querySelector('.box-image') || col.querySelector('img');
            });

            return allCols[dropdownIndex] || null;
        }

        function resolvePriceBoxForDropdown(dropdown) {
            // Mobile (cấu trúc mới): giá + button nằm ở col 4 hoặc col 5
            // tách riêng khỏi col chứa ảnh (col 2 hoặc col 3)
            var mobileWrapper = dropdown.closest('.mobile-product-dropdown');
            if (mobileWrapper) {
                var mobileRow = document.querySelector('.mobile-image-row');
                if (!mobileRow) return resolveImageBoxForDropdown(dropdown);

                var dropdownIndex = dropdowns.indexOf(dropdown);
                if (dropdownIndex === -1) return null;

                // Cấu trúc: col1(toggle), col2(img1), col3(img2), col4(price1), col5(price2)
                var allCols = Array.from(mobileRow.querySelectorAll(':scope > .col'));
                return allCols[dropdownIndex + 3] || null;
            }

            // Desktop: giá + button vẫn nằm cùng col với ảnh
            return resolveImageBoxForDropdown(dropdown);
        }

        function renderToPosition(sourceColumn, positionIndex) {
            var table = document.querySelector('.tablepress-id-1');
            if (!table || !originalTableData[sourceColumn]) return;

            var visibleColumns = [];
            var headerRow = table.querySelector('thead tr, tbody tr.row-1');
            if (headerRow) {
                var headers = headerRow.querySelectorAll('th, td');
                headers.forEach(function (header) {
                    var columnClass = Array.from(header.classList).find(function (cls) {
                        return cls.startsWith('column-');
                    });
                    if (columnClass) {
                        var colNum = parseInt(columnClass.replace('column-', ''));
                        if (colNum > 1) {
                            visibleColumns.push(colNum);
                        }
                    }
                });
            }

            visibleColumns.sort(function (a, b) { return a - b; });
            var targetColumn = visibleColumns[positionIndex];

            if (!targetColumn) return;

            var rows = table.querySelectorAll('tbody tr');
            rows.forEach(function (row) {
                if (row.classList.contains('row-1')) return;

                var rowClass = Array.from(row.classList).find(function (cls) {
                    return cls.startsWith('row-');
                });

                var targetCell = row.querySelector('.column-' + targetColumn);

                if (targetCell && originalTableData[sourceColumn] && originalTableData[sourceColumn][rowClass] !== undefined) {
                    targetCell.innerHTML = originalTableData[sourceColumn][rowClass];
                }
            });
        }

        cacheOriginalData();

        var dropdownMapping = {};
        var usedColumns = [];

        dropdowns.forEach(function (dropdown, index) {
            var items = dropdown.querySelectorAll('.dropdown-item');
            var selectedItem = dropdown.querySelector('.dropdown-item.selected');

            if (selectedItem) {
                var currentColumn = selectedItem.getAttribute('data-column');

                if (usedColumns.includes(currentColumn)) {
                    var availableItem = Array.from(items).find(function (item) {
                        var col = item.getAttribute('data-column');
                        return col && !usedColumns.includes(col);
                    });

                    if (availableItem) {
                        selectedItem.classList.remove('selected');
                        availableItem.classList.add('selected');
                        selectedItem = availableItem;
                        currentColumn = availableItem.getAttribute('data-column');

                        var button = dropdown.querySelector('.dropdown-button');
                        if (button) {
                            button.childNodes[0].textContent = availableItem.textContent.trim() + ' ';
                        }
                    }
                }

                if (currentColumn) {
                    usedColumns.push(currentColumn);
                    dropdownMapping[index] = parseInt(currentColumn);
                }
            }
        });

        dropdowns.forEach(function (dropdown, index) {
            if (dropdownMapping[index]) {
                renderToPosition(dropdownMapping[index], index);
            }
        });

        // Initialize all image boxes from TablePress after resolving conflicts
        dropdowns.forEach(function (dropdown, index) {
            if (!dropdownMapping[index]) return;

            var columnNumber = dropdownMapping[index];
            var productData = getProductData(columnNumber);
            if (!productData) return;

            var imageBox = resolveImageBoxForDropdown(dropdown);
            if (!imageBox) return;

            // Update image
            var img = imageBox.querySelector('img');
            if (img) {
                var cleanImgUrl = getResolvedImageUrl(dropdown, productData);
                if (cleanImgUrl) {
                    img.classList.remove('lazy-load', 'lazy-load-active', 'lazyload');
                    img.classList.add('js-loaded');
                    img.src = cleanImgUrl;
                    img.srcset = cleanImgUrl;
                    img.style.opacity = '1';
                    img.style.visibility = 'visible';
                }
            }

            // Update price + button (có thể ở col riêng trên mobile)
            var priceBox = resolvePriceBoxForDropdown(dropdown);
            var priceElement = priceBox ? priceBox.querySelector('.product-title h4') : null;
            if (priceElement && productData.price) {
                priceElement.innerHTML = productData.price.trim();
            }

            var button = priceBox ? priceBox.querySelector('.button') : null;
            if (button && productData.productUrl) {
                var cleanUrl = productData.productUrl.trim();
                if (cleanUrl) {
                    button.setAttribute('href', cleanUrl);
                    button.style.pointerEvents = 'auto';
                }
            }
        });

        dropdowns.forEach(function (dropdown, dropdownIndex) {
            var button = dropdown.querySelector('.dropdown-button');
            var menu = dropdown.querySelector('.dropdown-menu');
            var items = dropdown.querySelectorAll('.dropdown-item');

            if (!button || !menu) return;

            function getCorrespondingImageBox() {
                return resolveImageBoxForDropdown(dropdown);
            }

            button.addEventListener('click', function (e) {
                e.stopPropagation();
                var isActive = menu.classList.contains('active');

                document.querySelectorAll('.dropdown-menu.active').forEach(function (m) {
                    m.classList.remove('active');
                    m.previousElementSibling.classList.remove('active');
                });

                if (!isActive) {
                    menu.classList.add('active');
                    button.classList.add('active');
                }
            });

            items.forEach(function (item) {
                item.addEventListener('click', function (e) {
                    e.stopPropagation();

                    var productId = this.getAttribute('data-value');
                    var imgUrl = this.getAttribute('data-img');
                    var productName = this.textContent.trim();
                    var sourceColumn = parseInt(this.getAttribute('data-column'));

                    if (!productId || !sourceColumn) return;

                    var conflictIndex = null;
                    dropdowns.forEach(function (otherDropdown, otherIndex) {
                        if (otherIndex === dropdownIndex) return;
                        if (dropdownMapping[otherIndex] === sourceColumn) {
                            conflictIndex = otherIndex;
                        }
                    });

                    if (conflictIndex !== null) {
                        var currentColumn = dropdownMapping[dropdownIndex];
                        var conflictDropdown = dropdowns[conflictIndex];
                        var conflictItems = conflictDropdown.querySelectorAll('.dropdown-item');

                        var swapItem = null;
                        conflictItems.forEach(function (itm) {
                            if (parseInt(itm.getAttribute('data-column')) === currentColumn) {
                                swapItem = itm;
                            }
                        });

                        if (swapItem) {
                            var conflictSelected = conflictDropdown.querySelector('.dropdown-item.selected');
                            conflictSelected.classList.remove('selected');
                            swapItem.classList.add('selected');

                            var conflictButton = conflictDropdown.querySelector('.dropdown-button');
                            conflictButton.childNodes[0].textContent = swapItem.textContent.trim() + ' ';

                            dropdownMapping[conflictIndex] = currentColumn;
                            renderToPosition(currentColumn, conflictIndex);

                            // Update conflict dropdown's image box from TablePress
                            var conflictProductData = getProductData(currentColumn);
                            if (conflictProductData) {
                                var conflictImageBox = resolveImageBoxForDropdown(conflictDropdown);

                                if (conflictImageBox) {
                                    var conflictImg = conflictImageBox.querySelector('img');
                                    if (conflictImg) {
                                        var cleanImgUrl = getResolvedImageUrl(conflictDropdown, conflictProductData);
                                        if (cleanImgUrl) {
                                            conflictImg.classList.remove('lazy-load', 'lazy-load-active', 'lazyload');
                                            conflictImg.classList.add('js-loaded');
                                            conflictImg.src = cleanImgUrl;
                                            conflictImg.srcset = cleanImgUrl;
                                            conflictImg.style.opacity = '1';
                                            conflictImg.style.visibility = 'visible';
                                        }
                                    }

                                    var conflictPriceBox = resolvePriceBoxForDropdown(conflictDropdown);
                                    var conflictPriceElement = conflictPriceBox ? conflictPriceBox.querySelector('.product-title h4') : null;
                                    if (conflictPriceElement && conflictProductData.price) {
                                        conflictPriceElement.innerHTML = conflictProductData.price.trim();
                                    }

                                    var conflictButtonEl = conflictPriceBox ? conflictPriceBox.querySelector('.button') : null;
                                    if (conflictButtonEl && conflictProductData.productUrl) {
                                        var cleanUrl = conflictProductData.productUrl.trim();
                                        if (cleanUrl) {
                                            conflictButtonEl.setAttribute('href', cleanUrl);
                                            conflictButtonEl.style.pointerEvents = 'auto';
                                        }
                                    }
                                }
                            }
                        }
                    }

                    items.forEach(function (i) { i.classList.remove('selected'); });
                    this.classList.add('selected');
                    button.childNodes[0].textContent = productName + ' ';

                    menu.classList.remove('active');
                    button.classList.remove('active');

                    dropdownMapping[dropdownIndex] = sourceColumn;
                    renderToPosition(sourceColumn, dropdownIndex);

                    // Update current dropdown's image box from TablePress
                    var productData = getProductData(sourceColumn);
                    if (productData) {
                        var imageBox = getCorrespondingImageBox();
                        if (imageBox) {
                            var img = imageBox.querySelector('img');
                            if (img) {
                                var cleanImgUrl = getResolvedImageUrl(dropdown, productData);
                                if (cleanImgUrl) {
                                    img.classList.remove('lazy-load', 'lazy-load-active', 'lazyload');
                                    img.classList.add('js-loaded');
                                    img.src = cleanImgUrl;
                                    img.srcset = cleanImgUrl;
                                    img.style.opacity = '1';
                                    img.style.visibility = 'visible';
                                }
                            }

                            var priceBox = resolvePriceBoxForDropdown(dropdown);
                            var priceElement = priceBox ? priceBox.querySelector('.product-title h4') : null;
                            if (priceElement && productData.price) {
                                priceElement.innerHTML = productData.price.trim();
                            }

                            var buttonEl = priceBox ? priceBox.querySelector('.button') : null;
                            if (buttonEl && productData.productUrl) {
                                var cleanUrl = productData.productUrl.trim();
                                if (cleanUrl) {
                                    buttonEl.setAttribute('href', cleanUrl);
                                    buttonEl.style.pointerEvents = 'auto';
                                }
                            }
                        }
                    }
                });
            });
        });

        document.addEventListener('click', function () {
            document.querySelectorAll('.dropdown-menu.active').forEach(function (menu) {
                menu.classList.remove('active');
                menu.previousElementSibling.classList.remove('active');
            });
        });

        // Hide Duplicate Details Toggle
        var hideDuplicateCheckboxes = Array.from(document.querySelectorAll('#hideDuplicateCheckbox, .js-hide-duplicate-checkbox'));
        hideDuplicateCheckboxes = hideDuplicateCheckboxes.filter(function (checkbox, index, arr) {
            return arr.indexOf(checkbox) === index;
        });

        console.log('Hide Duplicate Checkbox count:', hideDuplicateCheckboxes.length);
        if (hideDuplicateCheckboxes.length > 0) {
            var hideDuplicateCheckbox = hideDuplicateCheckboxes[0];

            function syncToggleCheckboxes(sourceCheckbox) {
                hideDuplicateCheckboxes.forEach(function (checkbox) {
                    checkbox.checked = sourceCheckbox.checked;
                });
            }

            function updateAllToggleSliders() {
                document.querySelectorAll('.toggle-slider').forEach(function (slider) {
                    if (hideDuplicateCheckbox.checked) {
                        slider.classList.add('checked');
                    } else {
                        slider.classList.remove('checked');
                    }
                });
            }

            // Initialize slider state
            updateAllToggleSliders();

            function toggleDuplicateRows() {
                var table = document.querySelector('.tablepress-id-1');
                if (!table) return;

                var isHiding = hideDuplicateCheckbox.checked;
                var rows = table.querySelectorAll('tbody tr');

                // Get visible column numbers from dropdownMapping
                var visibleColumns = [
                    dropdownMapping[0],
                    dropdownMapping[1],
                    dropdownMapping[2]
                ].filter(Boolean);

                if (visibleColumns.length < 2) return;

                // Section header rows from tablepress.css
                var sectionHeaders = [5, 8, 12, 17, 22, 24, 28, 32, 39, 42, 45, 48, 56];

                rows.forEach(function (row) {
                    // Skip header row and metadata rows
                    if (row.classList.contains('row-1') ||
                        row.classList.contains('row-2') ||
                        row.classList.contains('row-3') ||
                        row.classList.contains('row-4')) {
                        return;
                    }

                    var rowClass = Array.from(row.classList).find(function (cls) {
                        return cls.startsWith('row-');
                    });

                    if (!rowClass) return;

                    var rowNumber = parseInt(rowClass.replace('row-', ''));

                    // Check if this is a section header
                    if (sectionHeaders.includes(rowNumber)) {
                        return; // Handle section headers separately
                    }

                    // Get values from the 3 visible columns
                    var values = visibleColumns.map(function (colNum) {
                        var cell = row.querySelector('.column-' + colNum);
                        return cell ? cell.textContent.trim() : '';
                    });

                    // Check if all 3 values are identical and not empty
                    var allSame = values.length >= 2 &&
                        values[0] !== '' &&
                        values.every(function (val) { return val === values[0]; });

                    if (isHiding && allSame) {
                        row.classList.add('duplicate-hidden');
                    } else {
                        row.classList.remove('duplicate-hidden');
                    }
                });

                // Handle section headers - hide if all child rows are hidden
                if (isHiding) {
                    sectionHeaders.forEach(function (headerRowNum) {
                        var headerRow = table.querySelector('tbody tr.row-' + headerRowNum);
                        if (!headerRow) return;

                        // Find next section header to determine range
                        var nextHeaderIndex = sectionHeaders.indexOf(headerRowNum) + 1;
                        var endRowNum = nextHeaderIndex < sectionHeaders.length ?
                            sectionHeaders[nextHeaderIndex] : 999;

                        // Check if all rows in this section are hidden
                        var allChildrenHidden = true;
                        for (var i = headerRowNum + 1; i < endRowNum; i++) {
                            var childRow = table.querySelector('tbody tr.row-' + i);
                            if (childRow && !childRow.classList.contains('duplicate-hidden') &&
                                !childRow.classList.contains('row-2') &&
                                !childRow.classList.contains('row-3') &&
                                !childRow.classList.contains('row-4')) {
                                allChildrenHidden = false;
                                break;
                            }
                        }

                        if (allChildrenHidden) {
                            headerRow.classList.add('duplicate-hidden');
                        } else {
                            headerRow.classList.remove('duplicate-hidden');
                        }
                    });
                } else {
                    // Show all section headers when unchecked
                    sectionHeaders.forEach(function (headerRowNum) {
                        var headerRow = table.querySelector('tbody tr.row-' + headerRowNum);
                        if (headerRow) {
                            headerRow.classList.remove('duplicate-hidden');
                        }
                    });
                }
            }

            hideDuplicateCheckboxes.forEach(function (checkbox) {
                checkbox.addEventListener('change', function () {
                    hideDuplicateCheckbox = checkbox;
                    syncToggleCheckboxes(checkbox);
                    updateAllToggleSliders();
                    toggleDuplicateRows();
                });
            });

            // Also trigger when dropdown selection changes
            var originalRenderToPosition = renderToPosition;
            renderToPosition = function (sourceColumn, positionIndex) {
                originalRenderToPosition(sourceColumn, positionIndex);
                if (hideDuplicateCheckbox.checked) {
                    setTimeout(toggleDuplicateRows, 100);
                }
            };
        }

        function setupMobileStickyImages() {
            var HEADER_H = 100;  // chiều cao header cố định
            var SCALE_RANGE = 200; // px scroll để scale từ 100% → 40%
            var MIN_SCALE = 0.4;

            var lastScrollY = window.scrollY || window.pageYOffset;
            var scrollingDown = true;

            // Đảm bảo ảnh luôn hiển thị
            function ensureVisible() {
                if (window.innerWidth > 768) return;
                var imgs = document.querySelectorAll('.mobile-image-row .anh-bien-doi img');
                if (imgs.length === 0) {
                    imgs = document.querySelectorAll('.row.align-middle:not(.dropdown-sticky-row) .anh-bien-doi img');
                }
                imgs.forEach(function (img) {
                    img.classList.add('js-loaded');
                    img.style.opacity = '1';
                    img.style.visibility = 'visible';
                });
            }

            // Cache kích thước tự nhiên của các col (đo khi chưa fixed)
            var naturalCache = null;

            function resetImgScale(imgCol1, imgCol2) {
                [imgCol1, imgCol2].forEach(function (col) {
                    var anh = col.querySelector('.anh-bien-doi');
                    if (anh) {
                        anh.style.transition = '';
                        anh.style.transform = '';
                        anh.style.transformOrigin = '';
                        anh.style.overflow = '';
                        anh.style.height = '';
                        anh.style.marginBottom = '';
                    }
                    var inner = col.querySelector('.col-inner');
                    if (inner) {
                        inner.style.height = '';
                        inner.style.overflow = '';
                    }
                    col.style.height = '';
                    col.style.overflow = '';
                });
            }

            function measureNatural(toggleCol, imgCol1, imgCol2) {
                // Reset về tự nhiên trước khi đo
                [toggleCol, imgCol1, imgCol2].forEach(function (col) {
                    col.style.position = '';
                    col.style.top = '';
                    col.style.left = '';
                    col.style.width = '';
                    col.style.zIndex = '';
                    col.style.background = '';
                    col.style.boxShadow = '';
                });
                resetImgScale(imgCol1, imgCol2);

                var tr = toggleCol.getBoundingClientRect();
                var i1 = imgCol1.getBoundingClientRect();
                var i2 = imgCol2.getBoundingClientRect();

                // Đo chiều cao tự nhiên của .anh-bien-doi và .mobile-product-dropdown
                var anh1 = imgCol1.querySelector('.anh-bien-doi');
                var anh2 = imgCol2.querySelector('.anh-bien-doi');
                var drop1 = imgCol1.querySelector('.mobile-product-dropdown');
                var drop2 = imgCol2.querySelector('.mobile-product-dropdown');

                naturalCache = {
                    toggleLeft: tr.left,
                    toggleWidth: tr.width,
                    toggleH: tr.height,
                    img1Left: i1.left,
                    img1Width: i1.width,
                    img1H: i1.height,
                    img2Left: i2.left,
                    img2Width: i2.width,
                    anh1H: anh1 ? anh1.offsetHeight : i1.height,
                    anh2H: anh2 ? anh2.offsetHeight : i2.height,
                    // chiều cao dropdown (cố định, không đổi khi scale)
                    drop1H: drop1 ? drop1.offsetHeight : 0,
                    drop2H: drop2 ? drop2.offsetHeight : 0,
                    // offsetTop của row tính từ document (không phụ thuộc scroll)
                    rowOffsetTop: getOffsetTop(toggleCol.closest('.mobile-image-row') || toggleCol.parentElement)
                };
            }

            function getOffsetTop(el) {
                var top = 0;
                while (el) {
                    top += el.offsetTop || 0;
                    el = el.offsetParent;
                }
                return top;
            }

            function applyScroll() {
                if (window.innerWidth > 768) return;

                var mobileRow = document.querySelector('.mobile-image-row');
                if (!mobileRow) return;

                var cols = mobileRow.querySelectorAll(':scope > .col');
                if (cols.length < 3) return;

                var toggleCol = cols[0];
                var imgCol1 = cols[1];
                var imgCol2 = cols[2];

                if (!naturalCache) {
                    measureNatural(toggleCol, imgCol1, imgCol2);
                    // Không set padding ở đây — chỉ set khi thực sự fixed
                }

                var scrollY = window.scrollY || window.pageYOffset;
                scrollingDown = scrollY > lastScrollY;
                lastScrollY = scrollY;

                // Khi nào row vượt qua dưới header thì bắt đầu fixed
                var triggerPoint = naturalCache.rowOffsetTop - HEADER_H;
                var shouldFix = scrollY >= triggerPoint;

                if (shouldFix) {
                    // Toggle col: luôn fixed, nhưng top thay đổi theo hướng scroll
                    // Kéo xuống → trượt lên khỏi màn hình (top = -toggleH)
                    // Kéo lên   → trượt xuống hiện ra   (top = HEADER_H)
                    var toggleTop = scrollingDown ? -naturalCache.toggleH : HEADER_H;
                    toggleCol.style.position = 'fixed';
                    toggleCol.style.top = toggleTop + 'px';
                    toggleCol.style.left = naturalCache.toggleLeft + 'px';
                    toggleCol.style.width = naturalCache.toggleWidth + 'px';
                    toggleCol.style.zIndex = '101';
                    toggleCol.style.background = '#fff';
                    toggleCol.style.boxShadow = 'none';
                    toggleCol.style.transition = 'top 0.25s ease';

                    // Image cols: fixed, top phụ thuộc vào toggle có hiển thị không
                    // Kéo xuống (toggle ẩn): imgTop = HEADER_H (lên sát header)
                    // Kéo lên (toggle hiện): imgTop = HEADER_H + toggleH
                    var imgTop = scrollingDown ? HEADER_H : HEADER_H + naturalCache.toggleH;
                    [
                        { col: imgCol1, left: naturalCache.img1Left, width: naturalCache.img1Width },
                        { col: imgCol2, left: naturalCache.img2Left, width: naturalCache.img2Width }
                    ].forEach(function (item) {
                        item.col.style.position = 'fixed';
                        item.col.style.top = imgTop + 'px';
                        item.col.style.left = item.left + 'px';
                        item.col.style.width = item.width + 'px';
                        item.col.style.zIndex = '100';
                        item.col.style.background = '#fff';
                        item.col.style.boxShadow = 'none';
                        item.col.style.transition = 'top 0.25s ease';
                    });

                    // Scale ảnh nhỏ dần khi scroll, từ 100% → 40% trong vòng SCALE_RANGE px
                    var scrollBeyond = scrollY - triggerPoint;
                    var scaleProgress = Math.min(scrollBeyond / SCALE_RANGE, 1);
                    var currentScale = 1 - (1 - MIN_SCALE) * scaleProgress;

                    var maxColH = 0;
                    [
                        { col: imgCol1, anhH: naturalCache.anh1H, dropH: naturalCache.drop1H },
                        { col: imgCol2, anhH: naturalCache.anh2H, dropH: naturalCache.drop2H }
                    ].forEach(function (item) {
                        var col = item.col;
                        var anhH = item.anhH;
                        var dropH = item.dropH;
                        // scaledAnhH tính đúng từ chiều cao của .anh-bien-doi (không bao gồm dropdown)
                        var scaledAnhH = anhH * currentScale;
                        var anh = col.querySelector('.anh-bien-doi');
                        if (anh) {
                            // Tắt CSS transition từ Flatsome .box.has-hover để scale + marginBottom sync ngay lập tức
                            anh.style.transition = 'none';
                            anh.style.transformOrigin = 'top center';
                            anh.style.transform = 'scale(' + currentScale + ')';
                            anh.style.overflow = 'hidden';
                            anh.style.height = '';
                            anh.style.marginBottom = '-' + (anhH - scaledAnhH) + 'px';
                        }
                        // Col + col-inner = ảnh đã scale + dropdown (dropdown không scale)
                        var colH = scaledAnhH + dropH;
                        if (colH > maxColH) maxColH = colH;
                        col.style.height = colH + 'px';
                        col.style.overflow = 'visible';

                        var inner = col.querySelector('.col-inner');
                        if (inner) {
                            inner.style.height = colH + 'px';
                            inner.style.overflow = 'visible';
                        }
                    });

                    // paddingTop bù cho toggleCol + imgCols đều bị lấy ra khỏi flow (luôn fixed)
                    mobileRow.style.paddingTop = (naturalCache.toggleH + maxColH) + 'px';
                } else {
                    // Chưa scroll tới → về tự nhiên, xóa padding + scale
                    mobileRow.style.paddingTop = '';
                    [toggleCol, imgCol1, imgCol2].forEach(function (col) {
                        col.style.position = '';
                        col.style.top = '';
                        col.style.left = '';
                        col.style.width = '';
                        col.style.zIndex = '';
                        col.style.background = '';
                        col.style.boxShadow = '';
                        col.style.transition = '';
                    });
                    resetImgScale(imgCol1, imgCol2);
                }
            }

            function onResize() {
                naturalCache = null; // đo lại kích thước khi resize
                var mobileRow = document.querySelector('.mobile-image-row');
                if (mobileRow) {
                    mobileRow.style.paddingTop = '';
                    var cols = mobileRow.querySelectorAll(':scope > .col');
                    if (cols.length >= 3) resetImgScale(cols[1], cols[2]);
                }
                ensureVisible();
                applyScroll();
            }

            ensureVisible();
            applyScroll();
            window.addEventListener('scroll', applyScroll, { passive: true });
            window.addEventListener('resize', onResize);
        }

        setupMobileStickyImages();
    });
})();