(function () {
    // --- 核心处理函数 ---
    function processPre(pre) {
        // 1. Check if it's a code block
        if (!pre.querySelector('code')) return;

        // 2. Check if already wrapped
        if (pre.parentNode.classList.contains('code-wrapper')) return;

        // 3. Create wrapper
        var wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';

        // 4. Insert wrapper before pre
        pre.parentNode.insertBefore(wrapper, pre);

        // 5. Move pre into wrapper
        wrapper.appendChild(pre);

        // --- 功能 A: 添加复制按钮 (添加到 wrapper) ---
        var copyBtn = document.createElement('button');
        copyBtn.className = 'btn-copy';
        copyBtn.innerText = '复制';
        wrapper.appendChild(copyBtn);

        // --- 功能 B: 添加折叠功能 ---
        // 延时 100ms 确保 PrismJS 渲染完，高度计算准确
        setTimeout(function () {
            var actualHeight = pre.scrollHeight;
            var limitHeight = 300; // 超过 300px 折叠

            if (actualHeight > limitHeight + 30) {
                wrapper.classList.add('collapsed'); // 默认折叠

                var expandDiv = document.createElement('div');
                expandDiv.className = 'btn-expand-container';
                expandDiv.innerHTML = '<button class="btn-expand">▼ 展开代码</button>';
                wrapper.appendChild(expandDiv);

                // 点击展开/收起
                expandDiv.addEventListener('click', function (e) {
                    e.stopPropagation();
                    if (wrapper.classList.contains('collapsed')) {
                        // 展开
                        wrapper.classList.remove('collapsed');
                        expandDiv.style.position = 'absolute'; // 保持在底部，或者 relative?
                        // 展开后，wrapper 高度自动，pre 高度自动。
                        // 按钮应该在最底部。
                        // 如果 wrapper 是 relative, 按钮 absolute bottom 0, 会盖住最后一行代码。
                        // 这是一个问题。
                        // 解决方案：展开时，按钮变成 relative，放在 wrapper 底部（文档流中）。
                        expandDiv.style.position = 'relative';
                        expandDiv.style.background = 'transparent';
                        expandDiv.innerHTML = '<button class="btn-expand" style="background:rgba(0,0,0,0.1);color:#333;border:1px solid #ccc">▲ 收起代码</button>';
                    } else {
                        // 收起
                        wrapper.classList.add('collapsed');
                        expandDiv.style.position = 'absolute';
                        expandDiv.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(45, 45, 45, 0.9))';
                        expandDiv.innerHTML = '<button class="btn-expand">▼ 展开代码</button>';
                        wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                });
            }
        }, 100);
    }

    // --- 1. 立即处理当前页面已有的代码块 ---
    document.querySelectorAll('pre').forEach(processPre);

    // --- 2. 开启“监控眼” (MutationObserver) ---
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType === 1) {
                    if (node.tagName === 'PRE') {
                        processPre(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('pre').forEach(processPre);
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // --- 初始化复制功能 ---
    if (typeof ClipboardJS !== 'undefined') {
        var clipboard = new ClipboardJS('.btn-copy', {
            target: function (trigger) {
                // trigger 是 wrapper 里的按钮，pre 是 wrapper 的子元素
                return trigger.parentNode.querySelector('code');
            }
        });
        clipboard.on('success', function (e) {
            var originalText = e.trigger.innerText;
            e.trigger.innerText = '成功!';
            setTimeout(function () { e.trigger.innerText = originalText; }, 2000);
            e.clearSelection();
        });
    }
})();