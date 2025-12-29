
import os
import re
import json
from bs4 import BeautifulSoup

# Paths
INPUT_FILE = r'e:\Tools\Written\source\tools\BookStore.html'
OUTPUT_FILE = r'e:\Tools\Written\source\tools\BookStore.html' # Overwrite self

def parse_bookmarks(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    categories = []
    
    # The structure is usually DL -> DT -> H3 (Category) -> DL -> DT -> A (Link)
    # We will traverse the top-level DLs
    
    # Find the main list (usually under the first H1 or just the first DL)
    root_dl = soup.find('dl')
    if not root_dl:
        return []

    # Iterate over top-level DTs (Categories or Folders)
    for dt in root_dl.find_all('dt', recursive=False):
        h3 = dt.find('h3')
        if h3:
            category_name = h3.get_text().strip()
            links = []
            
            # The next sibling DL contains the items
            sub_dl = dt.find('dl')
            if sub_dl:
                for link_tag in sub_dl.find_all('a'):
                    title = link_tag.get_text().strip()
                    url = link_tag.get('href')
                    icon = link_tag.get('icon', '')
                    
                    if title and url:
                        links.append({
                            'name': title,
                            'url': url,
                            'icon': icon
                        })
            
            if links:
                categories.append({
                    'category': category_name,
                    'items': links
                })
        else:
            # Handle loose links at top level if any? 
            # (Usually bookmarks bar has folders)
            pass
            
    return categories

def generate_html(categories):
    json_data = json.dumps(categories, ensure_ascii=False, indent=2)
    
    html_template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的数字图书馆 · BookStore</title>
    <style>
        :root {{
            --bg-color: #0f172a;
            --sidebar-bg: #1e293b;
            --card-bg: rgba(30, 41, 59, 0.7);
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --accent: #38bdf8;
            --hover-bg: #334155;
        }}

        body {{
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            display: flex;
            height: 100vh;
            overflow: hidden;
        }}

        /* Sidebar Sidebar */
        .sidebar {{
            width: 260px;
            background-color: var(--sidebar-bg);
            display: flex;
            flex-direction: column;
            border-right: 1px solid rgba(255,255,255,0.05);
            transition: transform 0.3s ease;
            z-index: 100;
        }}

        .sidebar-header {{
            padding: 25px;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent);
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }}

        .nav-links {{
            flex: 1;
            overflow-y: auto;
            padding: 10px;
        }}

        .nav-item {{
            padding: 12px 15px;
            margin-bottom: 5px;
            border-radius: 8px;
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 0.95rem;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}

        .nav-item:hover, .nav-item.active {{
            background-color: var(--hover-bg);
            color: var(--text-primary);
        }}
        
        .nav-item.active {{
            border-left: 3px solid var(--accent);
        }}

        .count-badge {{
            font-size: 0.75rem;
            background: rgba(255,255,255,0.1);
            padding: 2px 8px;
            border-radius: 10px;
        }}

        /* Main Content */
        .main-content {{
            flex: 1;
            overflow-y: auto;
            padding: 0;
            scroll-behavior: smooth;
            position: relative;
        }}

        .category-section {{
            padding: 40px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }}

        .category-title {{
            font-size: 1.8rem;
            font-weight: 600;
            margin-bottom: 25px;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 15px;
        }}
        
        .category-title::before {{
            content: '#';
            color: var(--accent);
            font-weight: 300;
        }}

        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }}

        .card {{
            background: var(--card-bg);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }}

        .card:hover {{
            transform: translateY(-4px);
            background: rgba(56, 189, 248, 0.1);
            border-color: var(--accent);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }}

        .card-icon {{
            width: 40px;
            height: 40px;
            border-radius: 8px;
            object-fit: cover;
            background: rgba(0,0,0,0.2);
            padding: 4px;
            flex-shrink: 0;
        }}

        .card-info {{
            flex: 1;
            min-width: 0;
        }}

        .card-title {{
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
        }}

        .card-url {{
            font-size: 0.8rem;
            color: var(--text-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }}

        /* Search Bar */
        .search-container {{
            position: sticky;
            top: 0;
            z-index: 50;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px 40px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .search-input {{
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 20px;
            color: white;
            width: 300px;
            outline: none;
            transition: all 0.3s;
        }}

        .search-input:focus {{
            border-color: var(--accent);
            background: rgba(255,255,255,0.1);
            width: 400px;
        }}

        /* Scrollbar */
        ::-webkit-scrollbar {{
            width: 8px;
        }}
        ::-webkit-scrollbar-track {{
            background: var(--bg-color);
        }}
        ::-webkit-scrollbar-thumb {{
            background: #334155;
            border-radius: 4px;
        }}
        ::-webkit-scrollbar-thumb:hover {{
            background: #475569;
        }}

        /* Mobile Responsive */
        @media (max-width: 768px) {{
            .sidebar {{
                position: fixed;
                transform: translateX(-100%);
            }}
            .sidebar.open {{
                transform: translateX(0);
            }}
            .search-container {{
                padding: 15px 20px;
            }}
            .search-input {{
                width: 100%;
            }}
            .category-section {{
                padding: 20px;
            }}
        }}
    </style>
</head>
<body>

    <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <span>📚 BookStore</span>
        </div>
        <div class="nav-links" id="sidebar-links">
            <!-- Navigation items will be injected here -->
        </div>
    </div>

    <div class="main-content">
        <div class="search-container">
            <input type="text" class="search-input" id="searchInput" placeholder="搜索书签 / Search...">
        </div>
        <div id="content-area">
            <!-- Categories and cards will be injected here -->
        </div>
    </div>

    <script>
        const bookmarkData = {json_data};

        const contentArea = document.getElementById('content-area');
        const sidebarLinks = document.getElementById('sidebar-links');
        const searchInput = document.getElementById('searchInput');

        function renderBookmarks(data) {{
            contentArea.innerHTML = '';
            sidebarLinks.innerHTML = '';

            data.forEach((cat, index) => {{
                // Create Sidebar Link
                const link = document.createElement('div');
                link.className = 'nav-item';
                link.innerHTML = `
                    <span>${{cat.category}}</span>
                    <span class="count-badge">${{cat.items.length}}</span>
                `;
                link.onclick = () => {{
                    document.getElementById('cat-' + index).scrollIntoView({{ behavior: 'smooth' }});
                    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                    link.classList.add('active');
                }};
                sidebarLinks.appendChild(link);

                // Create Section
                const section = document.createElement('div');
                section.className = 'category-section';
                section.id = 'cat-' + index;
                
                const title = document.createElement('div');
                title.className = 'category-title';
                title.textContent = cat.category;
                section.appendChild(title);

                const grid = document.createElement('div');
                grid.className = 'grid';

                cat.items.forEach(item => {{
                    const card = document.createElement('a');
                    card.className = 'card';
                    card.href = item.url;
                    card.target = '_blank';
                    
                    // Fallback icon logic
                    let iconSrc = item.icon || `https://www.google.com/s2/favicons?sz=64&domain_url=${{item.url}}`;
                    if (!iconSrc || iconSrc.startsWith('data:image/png;base64,') === false && !item.icon) {{
                         iconSrc = `https://www.google.com/s2/favicons?sz=64&domain=${{new URL(item.url).hostname}}`;
                    }}

                    card.innerHTML = `
                        <img class="card-icon" src="${{iconSrc}}" onerror="this.src='https://via.placeholder.com/40?text=L'">
                        <div class="card-info">
                            <div class="card-title">${{item.name}}</div>
                            <div class="card-url">${{new URL(item.url).hostname}}</div>
                        </div>
                    `;
                    grid.appendChild(card);
                }});

                section.appendChild(grid);
                contentArea.appendChild(section);
            }});
        }}

        // Search Function
        searchInput.addEventListener('input', (e) => {{
            const term = e.target.value.toLowerCase();
            const sections = document.querySelectorAll('.category-section');
            
            sections.forEach(section => {{
                const cards = section.querySelectorAll('.card');
                let hasVisible = false;
                
                cards.forEach(card => {{
                    const text = card.innerText.toLowerCase();
                    if (text.includes(term)) {{
                        card.style.display = 'flex';
                        hasVisible = true;
                    }} else {{
                        card.style.display = 'none';
                    }}
                }});

                section.style.display = hasVisible ? 'block' : 'none';
            }});
        }});

        // Initial Render
        renderBookmarks(bookmarkData);

    </script>
</body>
</html>
"""
    return html_template

def main():
    print("Parsing bookmarks...")
    try:
        categories = parse_bookmarks(INPUT_FILE)
        print(f"Found {len(categories)} categories.")
        
        html_content = generate_html(categories)
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        print(f"Successfully wrote beautiful HTML to {OUTPUT_FILE}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
