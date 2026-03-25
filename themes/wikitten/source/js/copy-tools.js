/**
 * 点击复制工具 - 全局智能版
 * 
 * 自动识别并包裹以下内容为可点击复制：
 *   - 日期 (2024-06-01, 2024.06, 2024-06 等)
 *   - 电话号码 (11位数字)
 *   - 邮箱地址
 *   - 身份证号 (18位)
 *   - 表格中的纯文本值单元格
 */

document.addEventListener('DOMContentLoaded', function () {

  // === 仅在特定的文章（即在 md 中设置了 auto_copy: true 的文章）开启此功能 ===
  var entry = document.querySelector('.article-entry.enable-auto-copy');
  if (!entry) return;

  // 创建 toast
  if (!document.getElementById('copy-toast')) {
    var toast = document.createElement('div');
    toast.id = 'copy-toast';
    toast.className = 'copy-toast';
    document.body.appendChild(toast);
  }

  // === 定义要识别的模式 ===
  var patterns = [
    { regex: /\b\d{16,19}\b/g,                       name: '银行卡号等长串数字' }, // 16-19位数字
    { regex: /\b\d{17}[\dXx]\b/g,                   name: '身份证号' },     // 身份证 18位
    { regex: /\b1[3-9]\d{9}\b/g,                     name: '手机号' },       // 手机号
    { regex: /[\w.-]+@[\w.-]+\.\w+/g,                name: '邮箱' },         // 邮箱
    { regex: /\b\d{4}[-/.]\d{2}[-/.]\d{2}\b/g,       name: '日期' },         // 完整日期
    { regex: /\b\d{4}[-/.]\d{2}\b/g,                  name: '年月' },         // 年月
  ];

  // === 处理所有文本节点 ===
  processNode(entry);

  // === 表格单元格：让没有被模式匹配到的纯值单元格整体可点击 ===
  var cells = entry.querySelectorAll('td');
  cells.forEach(function (td) {
    var text = td.textContent.trim();
    if (!text) return;
    // 如果里面已经有 .copy-item 了，说明已经被模式处理过，跳过整体点击
    if (td.querySelector('.copy-item')) return;
    // 跳过标题列（加粗文字）
    if (td.querySelector('strong') && td.childNodes.length === 1) return;

    td.classList.add('copy-cell');
    td.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') return;
      doCopy(text, td);
    });
  });

  // === 列表：整块点击一键复制所有内容 ===
  var lists = entry.querySelectorAll('ul, ol');
  lists.forEach(function (list) {
    var items = list.querySelectorAll('li');
    if (!items.length) return;

    list.classList.add('copy-cell');
    list.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') return;
      if (e.target.closest('.copy-item')) return;
      // 收集所有 li 的纯文本，去掉前导符号
      var allText = [];
      items.forEach(function (li) {
        allText.push(li.textContent.trim());
      });
      doCopy(allText.join('\n'), list);
    });
  });

  // === 递归处理文本节点，用正则包裹匹配内容 ===
  function processNode(node) {
    if (node.nodeType === 3) { // 文本节点
      var text = node.textContent;
      var hasMatch = false;

      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i].regex.test(text)) {
          hasMatch = true;
          break;
        }
      }
      // 重置 regex lastIndex
      patterns.forEach(function (p) { p.regex.lastIndex = 0; });

      if (!hasMatch) return;

      // 构建替换后的 HTML
      var html = text;
      patterns.forEach(function (p) {
        p.regex.lastIndex = 0;
        html = html.replace(p.regex, function (match) {
          return '<span class="copy-item" title="点击复制">' + match + '</span>';
        });
      });

      if (html !== text) {
        var wrapper = document.createElement('span');
        wrapper.innerHTML = html;
        node.parentNode.replaceChild(wrapper, node);
      }

    } else if (node.nodeType === 1) { // 元素节点
      // 不处理 script, style, 已处理的 copy-item, 链接
      var tag = node.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'A' ||
          node.classList.contains('copy-item') || node.classList.contains('copy-toast')) {
        return;
      }
      // 对子节点做快照后遍历（因为 replaceChild 会改变 childNodes）
      var children = Array.prototype.slice.call(node.childNodes);
      children.forEach(function (child) {
        processNode(child);
      });
    }
  }

  // === 给所有 .copy-item 绑定点击事件 ===
  entry.addEventListener('click', function (e) {
    var item = e.target.closest('.copy-item');
    if (item) {
      e.stopPropagation();
      doCopy(item.textContent.trim(), item);
    }
  });
});

// === 复制函数 ===
function doCopy(text, el) {
  navigator.clipboard.writeText(text).then(function () {
    showToast('✅ 已复制: ' + text);
  }).catch(function () {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('✅ 已复制: ' + text);
  });

  if (el) {
    el.classList.add('copied');
    setTimeout(function () { el.classList.remove('copied'); }, 1200);
  }
}

// === 整节复制（可选） ===
function copySectionText(sectionId) {
  var el = document.getElementById(sectionId);
  if (!el) return;
  var text = (el.innerText || el.textContent).replace(/\n{3,}/g, '\n\n').trim();
  doCopy(text, null);
}

// === Toast 提示 ===
function showToast(msg) {
  var toast = document.getElementById('copy-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window._copyToastTimer);
  window._copyToastTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 2000);
}
