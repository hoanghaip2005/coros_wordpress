(function () {
    if (typeof jQuery === 'undefined') return;

    jQuery(document).ready(function ($) {
        var dropdowns = document.querySelectorAll('.product-dropdown');
        if (dropdowns.length === 0) return;

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

        dropdowns.forEach(function (dropdown, dropdownIndex) {
            var button = dropdown.querySelector('.dropdown-button');
            var menu = dropdown.querySelector('.dropdown-menu');
            var items = dropdown.querySelectorAll('.dropdown-item');

            if (!button || !menu) return;

            function getCorrespondingImage() {
                var allDropdowns = Array.from(document.querySelectorAll('.product-dropdown'));
                var index = allDropdowns.indexOf(dropdown);
                var dropdownRow = dropdown.closest('.ux-row') || dropdown.closest('.row');
                if (!dropdownRow) return null;
                var imageRow = dropdownRow.nextElementSibling;
                if (!imageRow) return null;
                var allImages = imageRow.querySelectorAll('img');
                return allImages[index] || null;
            }

            var selectedItem = dropdown.querySelector('.dropdown-item.selected');
            if (selectedItem) {
                var defaultImgUrl = selectedItem.getAttribute('data-img');
                var img = getCorrespondingImage();
                if (img && defaultImgUrl) {
                    img.classList.remove('lazy-load', 'lazy-load-active', 'lazyload');
                    img.src = defaultImgUrl;
                    img.srcset = defaultImgUrl;
                    img.style.opacity = '1';
                    img.style.visibility = 'visible';
                }
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

                            var allConflictDropdowns = Array.from(document.querySelectorAll('.product-dropdown'));
                            var cIndex = allConflictDropdowns.indexOf(conflictDropdown);
                            var conflictDropdownRow = conflictDropdown.closest('.ux-row') || conflictDropdown.closest('.row');
                            var conflictImageRow = conflictDropdownRow ? conflictDropdownRow.nextElementSibling : null;

                            if (conflictImageRow) {
                                var conflictImages = conflictImageRow.querySelectorAll('img');
                                var conflictImg = conflictImages[cIndex] || null;

                                var conflictImgUrl = swapItem.getAttribute('data-img');
                                if (conflictImg && conflictImgUrl) {
                                    conflictImg.classList.remove('lazy-load', 'lazy-load-active', 'lazyload');
                                    conflictImg.src = conflictImgUrl;
                                    conflictImg.srcset = conflictImgUrl;
                                    conflictImg.style.opacity = '1';
                                    conflictImg.style.visibility = 'visible';
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

                    var img = getCorrespondingImage();
                    if (img && imgUrl) {
                        img.classList.remove('lazy-load', 'lazy-load-active', 'lazyload');
                        img.src = imgUrl;
                        img.srcset = imgUrl;
                        img.style.opacity = '1';
                        img.style.visibility = 'visible';
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
    });
})();