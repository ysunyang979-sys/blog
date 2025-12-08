---
title: 基础知识
date: 2024-10-00 01:00:00
categories:
    - unity
    - 四部曲
    - 入门
---

# Unity 基础知识
---
| 数据类型 | 名称 | 描述 | 示例代码 |
| :--- | :--- | :--- | :--- |
| `int` | 整型 | 用于存储整数，如分数、数量、等级。 | `int score = 100;` |
| `float` | 浮点型 | 用于存储带小数的数字，如生命值、坐标、速度。**值后面必须加 `f`**。 | `float health = 99.5f;` |
| `bool` | 布尔型 | 用于存储真 (`true`) 或假 (`false`) 的状态。 | `bool isAlive = true;` |
| `string` | 字符串 | 用于存储文本信息，如名字、对话。**值需要用双引号 `""` 包围**。 | `string playerName = "Hero";` |
| `Debug.Log()` | 调试打印 | 一个非常有用的函数，可以将变量或信息打印到 Unity 的控制台窗口，用于检查代码。 | `Debug.Log("Hello Unity!");` |

---
### C# 核心基础：运算符

| 运算符类型 | 符号 | 名称 | 描述与示例 |
| :--- | :--- | :--- | :--- |
| **算术运算符** | `+` | 加 | `5 + 2` 结果是 `7` |
| | `-` | 减 | `5 - 2` 结果是 `3` |
| | `*` | 乘 | `5 * 2` 结果是 `10` |
| | `/` | 除 | `5 / 2` 结果是 `2` (整数相除)；`5f / 2f` 结果是 `2.5` |
| | `%` | 取余 | `5 % 2` 结果是 `1` (5除以2的余数) |
| **赋值运算符** | `=` | 赋值 | `int health = 100;` |
| | `+=` | 加法赋值 | `health += 10;` (等同于 `health = health + 10;`) |
| | `-=` | 减法赋值 | `health -= 10;` (等同于 `health = health - 10;`) |

---

### C# 核心基础：比较与逻辑运算符

| 运算符类型 | 符号 | 名称 | 描述与示例 |
| :--- | :--- | :--- | :--- |
| **比较运算符** | `==` | 等于 | `health == 100` (判断 health 是否等于 100) |
| | `!=` | 不等于 | `ammo != 0` (判断弹药是否不为 0) |
| | `>` | 大于 | `score > 1000` (判断分数是否超过 1000) |
| | `<` | 小于 | `level < 5` (判断等级是否低于 5) |
| | `>=` | 大于等于 | `age >= 18` |
| | `<=` | 小于等于 | `price <= 50` |
| **逻辑运算符** | `&&` | 与 (AND) | `(level > 10) && (hasKey == true)` (等级大于10 **并且** 拥有钥匙) |
| | `||` | 或 (OR) | `(isVIP == true) || (money > 1000)` (是VIP **或者** 金钱大于1000) |

---


### C# 逻辑流程：条件语句

| 关键字 | 名称 | 描述 | 示例代码 |
| :--- | :--- | :--- | :--- |
| `if` | 如果 | 如果 `()` 内的条件为 `true`，则执行 `{}` 内的代码。 | `if (health > 0) { Debug.Log("玩家还活着"); }` |
| `else` | 否则 | 如果 `if` 的条件为 `false`，则执行 `else` 后面 `{}` 内的代码。 | `else { Debug.Log("玩家已阵亡"); }` |
| `else if` | 否则如果 | 在第一个 `if` 条件不满足时，提供一个新的判断条件。可以连续使用多个。 | `if (score > 100) { ... } else if (score > 50) { ... }` |

**完整结构示例：**

```csharp
if (condition1)
{
    // 如果 condition1 为 true，执行这里
}
else if (condition2)
{
    // 如果 condition1 为 false，但 condition2 为 true，执行这里
}
else
{
    // 如果以上所有条件都为 false，执行这里
}
```

---
### C# 逻辑流程：条件语句

| 关键字 | 名称 | 描述 | 示例代码 |
| :--- | :--- | :--- | :--- |
| `if` | 如果 | 如果 `()` 内的条件为 `true`，则执行 `{}` 内的代码。 | `if (health > 0) { Debug.Log("玩家还活着"); }` |
| `else if` | 否则如果 | 在前一个 `if` 或 `else if` 条件不满足时，提供一个新的判断条件。可以连续使用多个。 | `if (score > 100) { ... } else if (score > 50) { ... }` |
| `else` | 否则 | 如果以上所有 `if` 和 `else if` 的条件都为 `false`，则执行 `else` 后面 `{}` 内的代码。 | `else { Debug.Log("玩家已阵亡"); }` |

**完整结构示例：**
```csharp
int score = 85;

if (score >= 90)
{
    // 如果 score >= 90，执行这里
    Debug.Log("评价：优秀！");
}
else if (score >= 60)
{
    // 如果 score < 90，但 >= 60，执行这里
    Debug.Log("评价：良好！");
}
else
{
    // 如果 score < 60，执行这里
    Debug.Log("评价：需要继续努力！");
}
```
---



<style>
  /* 设置整个页面的字体 */
  html, body, .markdown-body {
    font-family: KaiTi,"Microsoft YaHei",Georgia, sans, serif;
    font-size: 15px;
  }

  /* 只设置 markdown 字体 */
  .markdown-body {
    font-family: KaiTi,"Microsoft YaHei",Georgia, sans, serif;
    font-size: 15px;
  }
</style>





# 知识点：字符串的拼接
---

固定语法：`string.Format("待拼接的内容", 内容1, 内容2......);`
```csharp
//拼接内容中的固定规则
//想要被拼接的内容用占位符替代（数字）数字:0~n 依次往后
string str2 = string.Format("我是{0},我今年{1}岁,我想要{2}", "xxx", 18, "天天学习,好好向上");
Console.WriteLine(str2);

//WriteLine/Write都提供了string.Format的方法，后面的内容可以直接写，多填可以少填报错
Console.WriteLine("A{0}B{1}C{2}",1,true,false);
Console.Write("A{0}B{1}C{2}",1,true,false);
``` 

---
## 练习
`要求： 定义两个变量，一个存储客户的姓名，另一个存储年龄，然后在屏幕上显示：“xxx yyy岁了”。`

```csharp
// 声明一个字符串变量来存储姓名
string customerName = "张三";
// C#会自动将变量 customerName 的值填充到 {customerName} 的位置
Console.WriteLine($"你好, {customerName}"); 

// 另一种方法：使用传统的 '+' 号拼接
// Console.WriteLine("你好, " + customerName);

// 另一种方法：使用 string.Format
// Console.WriteLine(string.Format("你好, {0}", customerName));
``` 
输出：`你好，张三`

---

`要求： 定义两个变量，一个存储客户的姓名，另一个存储年龄，然后在屏幕上显示：“xxx yyy岁了”。（根据示例“唐老师18岁了”，格式应为 “姓名+年龄+岁了”）`

```csharp
// 声明变量分别存储姓名和年龄
string Name = "xxx";
int age = 18;

// 使用字符串内插来组合字符串和数字
// C#会自动将int类型的age转换为字符串进行拼接
Console.WriteLine($"{Name}{age}岁了");

``` 
输出：`xxx18岁了`

---

`要求： 当我们去面试时，前台会要求我们填一张表格，有姓名，年龄，邮箱，家庭住址，期望工资，请把这些信息在控制台输出。`

```csharp
// 定义一系列变量来存储个人信息
string fullName = "李四";
int personAge = 25;
string email = "lisi@example.com";
string address = "中国北京市朝阳区123号";
decimal desiredSalary = 15000.50m; // 使用decimal类型存储薪资更精确

// 在控制台逐行清晰地输出这些信息
Console.WriteLine("--- 面试信息登记表 ---");
Console.WriteLine($"姓名: {fullName}");
Console.WriteLine($"年龄: {personAge}岁");
Console.WriteLine($"邮箱: {email}");
Console.WriteLine($"家庭住址: {address}");
Console.WriteLine($"期望工资: {desiredSalary:C}"); // :C 格式化为本地货币符号（如￥）
``` 
输出：
`--- 面试信息登记表 ---
姓名: 李四
年龄: 25岁
邮箱: lisi@example.com
家庭住址: 中国北京市朝阳区123号
期望工资: ¥15,000.50
`

---

`要求： 请用户输入用户名、年龄、班级，最后一起用占位符形式打印出来。这个练习需要从控制台读取用户的输入。`

```csharp
// 提示并读取用户名
Console.Write("请输入您的用户名: "); // 使用Write而不是WriteLine，让用户在同一行输入
string? userName = Console.ReadLine();

// 提示并读取年龄
Console.Write("请输入您的年龄: ");
// Console.ReadLine()返回的是字符串，需要转换为整数(int)
// int.Parse() 可以完成转换，但如果输入不是数字会报错，实际开发中建议使用 int.TryParse()
int userAge = Convert.ToInt32(Console.ReadLine()); 

// 提示并读取班级
Console.Write("请输入您的班级: ");
string? className = Console.ReadLine();

Console.WriteLine("\n--- 用户信息确认 ---");
// 使用占位符形式（字符串内插）将收集到的信息整合并打印出来
Console.WriteLine($"您好，{userName}！您的年龄是 {userAge} 岁，所在班级是 {className}。");
``` 
输出:
`请输入您的用户名: 王五
请输入您的年龄: 20
请输入您的班级: 计算机科学与技术2班
--- 用户信息确认 ---
您好，王五！您的年龄是 20 岁，所在班级是 计算机科学与技术2班。
`


