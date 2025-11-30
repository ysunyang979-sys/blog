---
title: one
categories:
  - Unity开发
  - 学习笔记
tags:
  - Unity
  - C#
date: 2025-12-01 00:41:02
---

## 🎯 需求描述
<!-- 简述要实现什么功能 -->

## 🛠️ 实现步骤
<!-- 1. 2. 3. -->

## 💻 核心代码
<!-- 放代码 -->
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

```