---
title: unity字体TMP设置
date: 2024-05-21 18:00:00
tags: [guide, efficiency, markdown]
categories: 
    - unity
    - 效率/技巧
    - TMP设置
---
# Unity TextMeshPro (TMP) 设置

## 1. 环境准备 (首次使用必做)

如果是新项目，必须导入 TMP 基础资源，否则无法正常使用。

1.  菜单栏点击 **Window** > **TextMeshPro** > **Import TMP Essential Resources**。
2.  在弹窗中点击 **Import**。

## 2. 创建 TMP 对象

*   **UI 文本 (最常用):** 
    *   在 Hierarchy 面板右键 > **UI** > **Text - TextMeshPro**。
*   **3D 世界文本 (头顶血条等):** 
    *   在 Hierarchy 面板右键 > **3D Object** > **Text - TextMeshPro**。

---

## 3. Inspector 面板核心设置

选中 TMP 对象，在 Inspector 中找到 `TextMeshPro UGUI` 组件进行设置：

### A. 文本与字体 (Main Settings)
*   **Text Input:** 输入文字区域。支持富文本（如 `<color=red>红</color>`）。
*   **Font Asset:** 字体资产文件（默认不支持中文，需自制，详见第5节）。
*   **Font Style:** `B`(粗体), `I`(斜体), `U`(下划线), `S`(删除线), `ab`(全大写)。
*   **Vertex Color:** 文本的主体颜色。
*   **Color Gradient:** 勾选后可设置四角渐变色。

### B. 排版与布局 (Paragraph Settings)
*   **Alignment:** 对齐方式（左中右，上中下）。
*   **Wrapping (换行):** 
    *   *Enabled:* 宽度不够时自动换行。
    *   *Disabled:* 不换行，文字一直向后延伸。
*   **Overflow (溢出):**
    *   *Overflow:* 超出框体继续显示。
    *   *Ellipsis:* 超出部分显示省略号 (...)。
    *   *Truncate:* 直接截断不显示。

### C. 性能优化 (Extra Settings)
*   **Raycast Target:** 如果这只是纯展示文本（不需要点击交互），**请取消勾选**，可提升 UI 性能。

---

## 4. 特效设置 (Material / Shader)

在组件最下方的材质球（Material）折叠栏中，可以开启强大的视觉特效：

*   **Outline (描边):** 勾选后调节 `Thickness` (厚度) 和 `Color`。
*   **Underlay (阴影/投影):** 勾选后调节 `Offset X/Y` (偏移) 和 `Dilate` (模糊)。
*   **Glow (外发光):** 制作霓虹灯效果。

---

## 5. 解决中文乱码 (制作中文字体)

默认字体不包含中文。你需要制作 Font Asset：

1.  准备一个 `.ttf` 或 `.otf` 中文字体文件放入 Unity。
2.  点击菜单 **Window** > **TextMeshPro** > **Font Asset Creator**。
3.  **Source Font File:** 拖入你的中文字体。
4.  **Atlas Resolution:** 设为 `2048x2048` 或 `4096x4096` (取决于字数)。
5.  **Character Set:** 选 `Custom Range`，填入常用汉字范围（如下方代码块）。
6.  点击 **Generate Font Atlas**，生成后点击 **Save**。
7.  ttf文件的命名为**小写英文符号，不可有空格等特殊符号**

**常用汉字 Unicode 范围 (复制填入 Custom Range):**

#### `32-126,8200-9999,19968-40869,65281-65374`


## 6. 代码控制 (C# 脚本)

在脚本中操作 TMP，必须引用 TMPro 命名空间。

```csharp
using UnityEngine;
using TMPro; // 1. 必须引用这个命名空间

public class TextController : MonoBehaviour
{
    // 2. 在 Inspector 中将 TMP 对象拖入此变量
    [SerializeField] private TextMeshProUGUI myText; 

    void Start()
    {
        // 设置文本内容
        myText.text = "Hello, Unity!";

        // 设置颜色
        myText.color = new Color(1f, 0.5f, 0f); // 橙色

        // 设置字体大小
        myText.fontSize = 48;

        // 使用富文本 (Rich Text)
        myText.text = "获得物品: <color=yellow>传说之剑</color>";
    }

    // 动态更新分数的示例
    public void UpdateScore(int score)
    {
        // SetText 比 text = string 性能更好，因为它避免了产生垃圾内存(GC)
        myText.SetText("当前分数: {0}", score);
    }
}
```





























