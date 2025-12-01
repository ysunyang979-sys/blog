(function () {
    // 查找所有的 pdf-wrapper
    var pdfWrappers = document.querySelectorAll('.pdf-wrapper');

    pdfWrappers.forEach(function (wrapper) {
        // 创建按钮
        var btn = document.createElement('button');
        btn.className = 'btn-expand-pdf';
        btn.innerText = '⤢ 展开 PDF'; // 默认文本

        // 点击事件
        btn.addEventListener('click', function () {
            wrapper.classList.toggle('expanded');

            if (wrapper.classList.contains('expanded')) {
                btn.innerText = '⤡ 收起 PDF';
                // 滚动到 wrapper 顶部，防止展开后找不到头
                wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                btn.innerText = '⤢ 展开 PDF';
                wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        // 添加按钮到 wrapper
        wrapper.appendChild(btn);
    });
})();
