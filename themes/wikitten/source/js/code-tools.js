// 等待页面所有资源加载完毕，再延迟一点点，确保代码块被PrismJS渲染撑开
window.addEventListener('load', function () {
    setTimeout(function() {
        initCodeTools();
    }, 100);
});

function initCodeTools() {
    // 找到所有的 pre 标签 (PrismJS 渲染后的代码块)
    var codeBlocks = document.querySelectorAll('pre');

    codeBlocks.forEach(function (pre) {
        // 如果 pre 里面没有 code 标签，可能不是代码块，跳过
        if (!pre.querySelector('code')) return;

        // 防止重复添加
        if (pre.querySelector('.btn-copy')) return;

        // --- 1. 添加复制按钮 ---
        var copyBtn = document.createElement('button');
        copyBtn.className = 'btn-copy';
        copyBtn.innerText = '复制';
        pre.appendChild(copyBtn);

        // --- 2. 添加折叠功能 ---
        // 获取代码块的真实高度
        var actualHeight = pre.scrollHeight;
        var limitHeight = 300; // 超过300px就折叠

        // 如果高度超过限制，就折叠
        if (actualHeight > limitHeight + 20) { 
            pre.classList.add('code-collapsed');

            // 创建“展开”按钮
            var expandDiv = document.createElement('div');
            expandDiv.className = 'btn-expand-container';
            expandDiv.innerHTML = '<button class="btn-expand">▼ 展开代码</button>';
            pre.appendChild(expandDiv);

            // 点击展开/收起
            expandDiv.addEventListener('click', function (e) {
                e.stopPropagation();
                if (pre.classList.contains('code-collapsed')) {
                    // 展开
                    pre.classList.remove('code-collapsed');
                    expandDiv.style.position = 'relative'; 
                    expandDiv.style.background = 'transparent'; 
                    expandDiv.innerHTML = '<button class="btn-expand" style="background:#eee;color:#333">▲ 收起代码</button>';
                } else {
                    // 收起
                    pre.classList.add('code-collapsed');
                    expandDiv.style.position = 'absolute';
                    expandDiv.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(45, 45, 45, 0.9))';
                    expandDiv.innerHTML = '<button class="btn-expand">▼ 展开代码</button>';
                    pre.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        }
    });

    // --- 初始化复制功能 ---
    var clipboard = new ClipboardJS('.btn-copy', {
        target: function (trigger) {
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
}