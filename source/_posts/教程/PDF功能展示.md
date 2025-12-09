---
title: 博客新功能：PDF 在线阅读
date: 2025-12-08 22:50:00
tags: [教程, 功能, PDF]
categories: Site Features
keywords: [PDF, hexo-pdf, 在线阅读]
description: 本文介绍了如何在博客文章中直接嵌入和阅读 PDF 文件。
---

# PDF 在线阅读功能

很高兴地通知大家，本博客现在支持直接在网页上阅读 PDF 文件了！这意味着你无需下载文件，即可直接查看文档内容。

## 如何使用

我们使用了 `hexo-pdf` 插件来实现这一功能。使用非常简单，只需要在 Markdown 文件中使用以下标签：

```markdown
{% pdf https://your-site.com/path/to/file.pdf %}
```

## 演示示例

下面是一个嵌入的 PDF 示例：

{% pdf /downloads/filename.pdf %}

> [!NOTE]
> 如果你看不到上面的 PDF，可能是因为网络原因无法访问 PDF 源文件。
> 建议将 PDF 文件放入博客的 `source/downloads/` 目录中，然后使用 `{% pdf /downloads/filename.pdf %}` 进行引用，这样加载最快且最稳定。


## 高级用法

你不需要额外的配置，插件会自动处理。如果 PDF 文件较大，可能会有一定的加载延迟，请耐心等待。

Enjoy reading!
