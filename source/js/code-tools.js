document.addEventListener('DOMContentLoaded', function () {
    // 1. 找到所有 PrismJS 生成的代码块 (pre 标签)
    var codeBlocks = document.querySelectorAll('pre[class*="language-"]');

    codeBlocks.forEach(function (pre) {
        // --- 功能 A: 添加复制按钮 ---
        var copyBtn = document.createElement('button');
        copyBtn.className = 'btn-copy';
        copyBtn.innerText = '复制';
        pre.appendChild(copyBtn);

        // --- 功能 B: 添加折叠功能 ---
        // 获取代码块的实际高度
        var actualHeight = pre.offsetHeight;
        var limitHeight = 300; // 超过 300px 就折叠

        if (actualHeight > limitHeight) {
            // 1. 给代码块加上折叠类
            pre.classList.add('code-collapsed');

            // 2. 创建底部“展开”按钮容器
            var expandDiv = document.createElement('div');
            expandDiv.className = 'btn-expand-container';
            expandDiv.innerHTML = '<button class="btn-expand">▼ 展开代码</button>';
            pre.appendChild(expandDiv);

            // 3. 点击事件
            expandDiv.addEventListener('click', function () {
                if (pre.classList.contains('code-collapsed')) {
                    // 展开
                    pre.classList.remove('code-collapsed');
                    expandDiv.style.position = 'relative'; // 不再绝对定位覆盖底部
                    expandDiv.style.background = 'transparent'; // 去掉遮罩
                    expandDiv.innerHTML = '<button class="btn-expand" style="background:#eee;color:#333">▲ 收起代码</button>';
                } else {
                    // 收起
                    pre.classList.add('code-collapsed');
                    expandDiv.style.position = 'absolute';
                    expandDiv.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(45, 45, 45, 0.9))';
                    expandDiv.innerHTML = '<button class="btn-expand">▼ 展开代码</button>';
                    // 稍微滚回去一点，方便定位
                    pre.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        }
    });

    // --- 初始化 ClipboardJS (复用之前的逻辑) ---
    var clipboard = new ClipboardJS('.btn-copy', {
        target: function (trigger) {
            // 按钮是 pre 的子元素，但我们只需要复制 pre 里的 code 文本
            // Prism 的结构通常是 pre > code
            return trigger.parentNode.querySelector('code') || trigger.parentNode;
        }
    });

    clipboard.on('success', function (e) {
        var btn = e.trigger;
        var originalText = btn.innerText;
        btn.innerText = '成功!';
        setTimeout(function () {
            btn.innerText = originalText;
        }, 2000);
        e.clearSelection();
    });
});