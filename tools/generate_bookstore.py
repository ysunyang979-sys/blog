
import os
import io
import re
import json
from bs4 import BeautifulSoup

# 配置路径
BASE_DIR = r'e:\Tools\Written\source\tools'
SOURCE_FILE = os.path.join(BASE_DIR, 'bookmarks.html')
OUTPUT_FILE = os.path.join(BASE_DIR, 'BookStore.html')

# === 1. 解析 Netscape 书签文件 ===
def parse_netscape_bookmarks(file_path):
    if not os.path.exists(file_path):
        print(f"Error: 找不到源文件 {file_path}")
        return []

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')
    categories = []
    
    # 找到所有分类头
    headers = soup.find_all('h3')
    for h3 in headers:
        cat_name = h3.get_text().strip()
        
        # 忽略根级目录名，或者保留
        # 找到对应的 DL 列表
        next_sibling = h3.find_next_sibling()
        while next_sibling and next_sibling.name != 'dl':
            next_sibling = next_sibling.find_next_sibling()
            
        if next_sibling and next_sibling.name == 'dl':
            links = []
            # 遍历 DL 下的 DT
            for item in next_sibling.find_all('a'):
                title = item.get_text().strip()
                href = item.get('href')
                icon = item.get('icon', '')
                add_date = item.get('add_date', '')
                
                if href:
                    links.append({
                        'name': title,
                        'url': href,
                        'icon': icon,
                        'date': add_date
                    })
            
            if links:
                categories.append({
                    'category': cat_name,
                    'items': links
                })
                
    # 过滤掉空的或者不需要的分类
    filtered_cats = [c for c in categories if len(c['items']) > 0 and c['category'] not in ['书签栏']]
    
    # 如果解析结果为空（可能是只粘贴了片段），我们提供一些默认数据用于测试
    if not filtered_cats:
        print("Warning: 解析结果为空，使用测试数据。")
        return get_mock_data()
        
    return filtered_cats

def get_mock_data():
    return [
        {
            "category": "常用推荐",
            "items": [
                {"name": "GitHub", "url": "https://github.com", "icon": ""},
                {"name": "Google", "url": "https://google.com", "icon": ""},
                {"name": "Bilibili", "url": "https://bilibili.com", "icon": ""}
            ]
        }
    ]

# === 2. 生成 HTML ===
def generate_html(data):
    # 将 Python 对象转换为 JSON 字符串嵌入 JS
    json_data = json.dumps(data, ensure_ascii=False, indent=2)

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infinity Bookmark · 数智图书馆</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {{
            /* 米白色主题 (Cream/Off-White) */
            --bg-body: #f9f9f6;
            --bg-sidebar: #f2f2ee;
            --bg-card: rgba(255, 255, 255, 0.7);
            --bg-card-hover: #ffffff;
            --border-color: rgba(0, 0, 0, 0.06);
            --text-main: #2c3e50;
            --text-sub: #64748b;
            --accent-color: #10b981; 
            --accent-gradient: linear-gradient(135deg, #10b981, #34d399);
            --glass-blur: blur(20px);
            --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            --shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
        }}

        * {{ box-sizing: border-box; margin: 0; padding: 0; }}

        body {{
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            height: 100vh;
            display: flex;
            overflow: hidden;
            /* 柔和的背景纹理 */
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.03), transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(52, 211, 153, 0.03), transparent 40%);
        }}
        
        /* 滚动条美化 (Light) */
        ::-webkit-scrollbar {{ width: 6px; }}
        ::-webkit-scrollbar-track {{ background: transparent; }}
        ::-webkit-scrollbar-thumb {{ background: #d1d5db; border-radius: 3px; }}
        ::-webkit-scrollbar-thumb:hover {{ background: #9ca3af; }}

        /* 侧边栏 */
        .sidebar {{
            width: 250px;
            background: var(--bg-sidebar);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            padding: 24px 0;
            z-index: 10;
        }}

        .logo {{
            padding: 0 24px 24px;
            font-size: 1.4rem;
            font-weight: 800;
            letter-spacing: -0.5px;
            background: var(--accent-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 12px;
        }}

        .nav-menu {{
            flex: 1;
            overflow-y: auto;
            padding: 8px 16px;
        }}

        .nav-item {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 16px;
            margin-bottom: 4px;
            border-radius: 8px;
            color: var(--text-sub);
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.95rem;
            font-weight: 500;
        }}

        .nav-item:hover, .nav-item.active {{
            background: rgba(0, 0, 0, 0.04);
            color: var(--text-main);
        }}
        
        .nav-item.active {{
            background: rgba(16, 185, 129, 0.08);
            color: var(--accent-color);
        }}
        
        .cat-count {{
            font-size: 0.75rem;
            background: rgba(0, 0, 0, 0.05);
            padding: 1px 7px;
            border-radius: 10px;
            color: var(--text-sub);
        }}

        /* 主内容区 */
        .main-content {{
            flex: 1;
            overflow-y: auto;
            padding: 0 48px 48px;
            position: relative;
            scroll-behavior: smooth;
        }}

        /* 顶部搜索栏 */
        .header {{
            position: sticky;
            top: 0;
            padding: 32px 0 24px;
            background: linear-gradient(to bottom, var(--bg-body) 80%, rgba(249, 249, 246, 0.5));
            z-index: 20;
            display: flex;
            justify-content: space-between;
            align-items: center;
            backdrop-filter: blur(8px);
        }}

        .search-box {{
            position: relative;
            width: 100%;
            max-width: 500px;
        }}

        .search-box input {{
            width: 100%;
            background: #ffffff;
            border: 1px solid var(--border-color);
            padding: 14px 20px 14px 48px;
            border-radius: 12px;
            color: var(--text-main);
            font-size: 1rem;
            outline: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow-card);
        }}

        .search-box input:focus {{
            border-color: var(--accent-color);
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }}
        
        .search-box input::placeholder {{
            color: #9ca3af;
        }}

        .search-icon {{
            position: absolute;
            left: 18px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
            font-size: 1rem;
        }}

        /* 分类区块 */
        .category-section {{
            margin-bottom: 56px;
            scroll-margin-top: 100px;
        }}

        .category-header {{
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
        }}

        .category-header h2 {{
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-main);
            display: flex;
            align-items: center;
            letter-spacing: -0.02em;
        }}
        
        .category-header h2::before {{
            content: '#';
            margin-right: 8px;
            color: var(--accent-color);
            font-weight: 400;
            opacity: 0.8;
        }}

        /* 卡片网格 */
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 20px;
        }}

        .card {{
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 16px;
            display: flex;
            gap: 16px;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
            height: 100%;
            box-shadow: var(--shadow-card);
        }}
        
        .card:hover {{
            transform: translateY(-4px);
            background: var(--bg-card-hover);
            border-color: rgba(16, 185, 129, 0.3);
            box-shadow: var(--shadow-hover);
        }}

        .card-icon {{
            width: 44px;
            height: 44px;
            border-radius: 10px;
            object-fit: contain;
            background: #f1f5f9;
            padding: 6px;
            flex-shrink: 0;
        }}

        .card-content {{
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }}

        .card-title {{
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }}

        .card-url {{
            font-size: 0.8rem;
            color: var(--text-sub);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: 0.7;
        }}

        /* 响应式 */
        @media (max-width: 768px) {{
            body {{ flex-direction: column; overflow-y: auto; }}
            .sidebar {{ 
                width: 100%; 
                height: 64px; 
                flex: 0 0 auto;
                flex-direction: row; 
                align-items: center; 
                padding: 0 20px;
                border-right: none;
                border-bottom: 1px solid var(--border-color);
                position: sticky;
                top: 0;
                z-index: 50;
            }}
            .logo {{ padding: 0; margin-right: 20px; font-size: 1.2rem; }}
            .nav-menu {{ display: none; }} 
            .main-content {{ padding: 0 20px 40px; overflow: visible; }}
            .header {{ top: 64px; padding: 20px 0; }}
            .grid {{ grid-template-columns: 1fr; }}
        }}
    </style>
</head>
<body>

    <nav class="sidebar">
        <div class="logo">
            <i class="fa-solid fa-infinity"></i> 数智图书馆
        </div>
        <div class="nav-menu" id="nav-container">
            <!-- 导航 -->
        </div>
    </nav>

    <main class="main-content">
        <header class="header">
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" id="searchInput" placeholder="Search resources...">
            </div>
        </header>

        <div id="bookmarks-container">
            <!-- 内容 -->
        </div>
    </main>

    <script>
        // 数据源
        const data = {json_data};

        const navContainer = document.getElementById('nav-container');
        const container = document.getElementById('bookmarks-container');
        const searchInput = document.getElementById('searchInput');

        function getFavicon(item) {{
            // 优先使用导入的 icon (base64)
            if (item.icon && item.icon.length > 50) return item.icon;
            try {{
                const host = new URL(item.url).hostname;
                return `https://www.google.com/s2/favicons?sz=64&domain=${{host}}`;
            }} catch(e) {{
                return 'https://via.placeholder.com/64?text=?';
            }}
        }}

        function render() {{
            navContainer.innerHTML = '';
            container.innerHTML = '';

            data.forEach((cat, index) => {{
                // 忽略空分类
                if (!cat.items || cat.items.length === 0) return;

                // 侧边栏
                const nav = document.createElement('div');
                nav.className = 'nav-item';
                nav.innerHTML = `
                    <span>${{cat.category}}</span>
                    <span class="cat-count">${{cat.items.length}}</span>
                `;
                nav.onclick = () => {{
                    document.getElementById('cat-' + index).scrollIntoView({{ behavior: 'smooth' }});
                    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
                    nav.classList.add('active');
                }};
                navContainer.appendChild(nav);

                // 内容区
                const section = document.createElement('div');
                section.className = 'category-section';
                section.id = 'cat-' + index;
                
                // 标题
                const header = document.createElement('div');
                header.className = 'category-header';
                header.innerHTML = `<h2>${{cat.category}}</h2>`;
                section.appendChild(header);

                // 网格
                const grid = document.createElement('div');
                grid.className = 'grid';

                cat.items.forEach(item => {{
                    const card = document.createElement('a');
                    card.href = item.url;
                    card.className = 'card';
                    card.target = '_blank';
                    
                    const iconSrc = getFavicon(item);
                    
                    card.innerHTML = `
                        <img src="${{iconSrc}}" class="card-icon" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNTU1IiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PC9zdmc+'">
                        <div class="card-content">
                            <div class="card-title">${{item.name}}</div>
                            <div class="card-url">${{item.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}}</div>
                        </div>
                    `;
                    grid.appendChild(card);
                }});
                
                section.appendChild(grid);
                container.appendChild(section);
            }});
        }}

        // 搜索
        searchInput.addEventListener('input', (e) => {{
            const val = e.target.value.toLowerCase();
            const sections = document.querySelectorAll('.category-section');
            
            sections.forEach(sec => {{
                const cards = sec.querySelectorAll('.card');
                let hasVisible = false;
                cards.forEach(card => {{
                    const title = card.querySelector('.card-title').textContent.toLowerCase();
                    const url = card.querySelector('.card-url').textContent.toLowerCase();
                    if (title.includes(val) || url.includes(val)) {{
                        card.style.display = 'flex';
                        hasVisible = true;
                    }} else {{
                        card.style.display = 'none';
                    }}
                }});
                sec.style.display = hasVisible ? 'block' : 'none';
            }});
        }});

        render();
        
        // 默认激活第一个导航
        if (navContainer.firstChild) navContainer.firstChild.classList.add('active');
    </script>
</body>
</html>
"""
    return html

# === Main ===
def main():
    print("正在查找 bookmarks.html...")
    if os.path.exists(SOURCE_FILE):
        print(f"找到文件: {SOURCE_FILE}，开始解析...")
        data = parse_netscape_bookmarks(SOURCE_FILE)
        print(f"解析到 {len(data)} 个分类。")
    else:
        print("未找到 bookmarks.html，使用内置模拟数据生成示例。")
        data = get_mock_data()

    content = generate_html(data)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"成功生成: {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
