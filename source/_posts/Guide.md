---
title: Guide
date: 2024-05-21 18:00:00
tags: [guide, efficiency, markdown]
categories: 
    - unity
    - 效率/技巧
    - 写文章
---

这篇文章旨在帮助你更高效地撰写博客文章，涵盖了 Markdown 基础、代码块使用、PDF 嵌入以及新增的样式工具（按钮、提示框、颜色）。

<!-- more -->

## 1. 基础 Markdown 语法

### 标题
使用 `#` 来表示标题层级：
```markdown
# 一级标题 (H1) - 通常用于文章标题
## 二级标题 (H2) - 主要章节
### 三级标题 (H3) - 子章节
```

### 列表
- 无序列表使用 `-` 或 `*`。
1. 有序列表使用 `1.`。

### 强调
- **加粗**：`**text**`
- *斜体*：`*text*`
- ~~删除线~~：`~~text~~`

### 引用
> 这是一个引用块。
> 使用 `>` 符号。

---

## 2. 代码块 (Code Blocks)

我们已经对代码块进行了增强，支持**横向滚动**、**竖向滚动（折叠时）**以及**固定按钮**。

### 基础用法
使用三个反引号 \`\`\` 加上语言名称：

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

### 效果展示
```python
# 这是一个 Python 代码示例
def long_function_name_to_test_horizontal_scrolling(parameter_one, parameter_two, parameter_three):
    print(f"Parameter 1: {parameter_one}, Parameter 2: {parameter_two}, Parameter 3: {parameter_three}")
    return True
```

### 特性说明
- **复制按钮**：右上角点击即可复制。
- **展开/收起**：如果代码超过 300px 高度，会自动折叠，点击底部按钮展开。
- **滚动**：长代码支持横向滚动，折叠状态支持内部竖向滚动。

---


## 3. 增强样式 (New Styles)

为了让文章更生动，我们添加了一些自定义样式类。你可以直接在 Markdown 中使用 HTML 标签来调用它们。

### 3.1 按钮 (Buttons)

使用 `<a class="btn ...">` 或 `<span class="btn ...">`。

**语法：**
```html
<a href="#" class="btn">默认按钮</a>
<a href="#" class="btn btn-primary">主要按钮</a>
<a href="#" class="btn btn-success">成功按钮</a>
<a href="#" class="btn btn-danger">危险按钮</a>
<a href="#" class="btn btn-warning">警告按钮</a>
<a href="#" class="btn btn-info">信息按钮</a>
```

**效果：**
<a href="#" class="btn">Default</a>
<a href="#" class="btn btn-primary">Primary</a>
<a href="#" class="btn btn-success">Success</a>
<a href="#" class="btn btn-danger">Danger</a>
<a href="#" class="btn btn-warning">Warning</a>
<a href="#" class="btn btn-info">Info</a>

### 3.2 提示框 (Alerts)

用于突出显示重要信息。

**语法：**
```html
<div class="alert alert-info">这是一条信息提示。</div>
<div class="alert alert-success">这是一条成功提示。</div>
<div class="alert alert-warning">这是一条警告提示。</div>
<div class="alert alert-danger">这是一条错误提示。</div>
```

**效果：**
<div class="alert alert-info">
    <strong>Info:</strong> 这里可以放一些提示信息。
</div>
<div class="alert alert-success">
    <strong>Success:</strong> 操作成功！
</div>
<div class="alert alert-warning">
    <strong>Warning:</strong> 注意，这里可能有个坑。
</div>
<div class="alert alert-danger">
    <strong>Error:</strong> 发生了一个错误。
</div>

### 3.3 文字颜色与背景

**语法：**
```html
<span class="text-red">红色文字</span>
<span class="text-blue">蓝色文字</span>
<span class="text-green">绿色文字</span>
<span class="bg-yellow">黄色背景</span>
```

**效果：**
这是一段 <span class="text-red">红色文字</span>，这是 <span class="text-blue">蓝色文字</span>。
这里有一个 <span class="bg-yellow">高亮背景</span> 和 <span class="bg-green">绿色背景</span>。

---

## 4. VS Code 效率插件与代码片段

我们在 `.vscode/blog.code-snippets` 中配置了快捷指令：

1.  **新建文章头 (Front Matter)**
    - 输入 `hexo-post` 并按 Tab，自动生成 title, date, tags 等信息。

2.  **阅读更多 (Read More)**
    - 输入 `more` 并按 Tab，插入 `<!-- more -->` 分隔符。

3.  **插入图片**
    - 输入 `img` 并按 Tab，插入 `![alt](url)` 结构。

---































