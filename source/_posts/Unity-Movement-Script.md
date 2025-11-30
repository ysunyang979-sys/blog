---
title: Unity基础：实现一个简单的角色移动脚本
date: 2025-12-01 14:00:00
categories: 
  - Unity开发
  - 游戏脚本
  - C#基础
tags: [Unity, C#, 教程]
---

这是我的第一篇 Unity 学习笔记。主要记录如何使用 `Transform` 组件来实现最基础的坦克式移动（前后移动 + 左右旋转）。
<!-- more -->
## 完整代码

下面是一个标准的 C# 脚本，请注意观察**关键字**（如 `public`, `void`）、**类名**（`Vector3`）和**注释**的颜色区别。

```csharp
using System.Collections;
using UnityEngine;

/// <summary>
/// 控制玩家移动的简单脚本
/// </summary>
public class PlayerController : MonoBehaviour
{
    [Header("基础设置")]
    [Tooltip("玩家移动的速度")]
    public float moveSpeed = 5.0f;
    
    [Tooltip("玩家旋转的速度")]
    public float rotateSpeed = 120.0f;

    // 私有变量，不需要在面板显示
    private float _verticalInput;
    private float _horizontalInput;

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("游戏开始，脚本已加载！");
    }

    // Update is called once per frame
    void Update()
    {
        HandleInput();
        Move();
    }

    /// <summary>
    /// 处理玩家输入
    /// </summary>
    void HandleInput()
    {
        // 获取键盘的 W/S 和 A/D 输入 (-1 到 1)
        _verticalInput = Input.GetAxis("Vertical");
        _horizontalInput = Input.GetAxis("Horizontal");

        // 测试空格键跳跃
        if (Input.GetKeyDown(KeyCode.Space))
        {
            Jump();
        }
    }

    /// <summary>
    /// 执行移动逻辑
    /// </summary>
    void Move()
    {
        // 前后移动：使用 Translate
        // Time.deltaTime 确保移动速度与帧率无关
        transform.Translate(Vector3.forward * _verticalInput * moveSpeed * Time.deltaTime);

        // 左右旋转：使用 Rotate
        transform.Rotate(Vector3.up * _horizontalInput * rotateSpeed * Time.deltaTime);
    }

    void Jump()
    {
        // 简单的日志输出
        Debug.Log("Player Jumped! (Wait for physics implementation)");
    }
}