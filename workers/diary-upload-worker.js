/**
 * Diary Upload Worker - Cloudflare Worker
 * 支持日记文本和图片上传到 GitHub 仓库
 * 支持跨设备读取日记列表
 *
 * 环境变量:
 * - GITHUB_TOKEN: GitHub Personal Access Token
 * - DIARY_PASSWORD: 访问密码
 * - GITHUB_REPO: 仓库名称 (如 ysunyang979-sys/blog)
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "仅支持 POST 请求" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const action = url.pathname.replace(/^\/+/, "") || "diary";

    try {
      const data = await request.json();

      // 验证密码
      if (data.password !== env.DIARY_PASSWORD) {
        return new Response(JSON.stringify({ error: "密码错误" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 路由处理
      if (action === "list") {
        return await handleListDiaries(data, env, corsHeaders);
      } else if (action === "image" || action === "upload-image") {
        return await handleImageUpload(data, env, corsHeaders);
      } else if (action === "delete") {
        return await handleDeleteDiary(data, env, corsHeaders);
      } else {
        return await handleDiaryUpload(data, env, corsHeaders);
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "服务器错误", message: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  },
};

/**
 * 获取日记列表
 */
async function handleListDiaries(data, env, corsHeaders) {
  const repo = env.GITHUB_REPO || "ysunyang979-sys/blog";
  const path = "source/_diary";
  
  try {
    // 获取 _posts 目录下的文件列表
    const listUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
    const listResponse = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Diary-Upload-Worker",
      },
    });

    if (!listResponse.ok) {
      return new Response(
        JSON.stringify({ error: "获取文件列表失败" }),
        { status: listResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const files = await listResponse.json();
    
    // 过滤日记文件 (diary-*.md)
    const diaryFiles = files.filter(f => f.name.startsWith("diary-") && f.name.endsWith(".md"));
    
    // 获取每个日记的内容
    const diaries = [];
    for (const file of diaryFiles.slice(0, 20)) { // 最多获取20篇
      try {
        const contentResponse = await fetch(file.download_url);
        const content = await contentResponse.text();
        
        // 解析 Front Matter
        const parsed = parseFrontMatter(content);
        diaries.push({
          id: file.sha,
          fileName: file.name,
          path: file.path,
          title: parsed.title || file.name,
          date: parsed.date || "",
          content: parsed.content,
          imageUrl: parsed.cover || extractFirstImage(parsed.content),
        });
      } catch (e) {
        console.error(`Error parsing ${file.name}:`, e);
      }
    }

    // 按日期倒序排列
    diaries.sort((a, b) => new Date(b.date) - new Date(a.date));

    return new Response(
      JSON.stringify({ success: true, diaries }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "获取日记列表失败", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * 解析 Front Matter
 */
function parseFrontMatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { content };
  
  const frontMatter = match[1];
  const body = match[2].trim();
  
  const titleMatch = frontMatter.match(/title:\s*(.+)/);
  const dateMatch = frontMatter.match(/date:\s*(.+)/);
  const coverMatch = frontMatter.match(/cover:\s*(.+)/);
  
  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    date: dateMatch ? dateMatch[1].trim().split(" ")[0] : "",
    cover: coverMatch ? coverMatch[1].trim() : "",
    content: body,
  };
}

/**
 * 提取第一张图片
 */
function extractFirstImage(content) {
  const match = content.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
}

/**
 * 删除日记
 */
async function handleDeleteDiary(data, env, corsHeaders) {
  const { fileName, sha } = data;
  
  if (!fileName || !sha) {
    return new Response(JSON.stringify({ error: "缺少文件名或 SHA" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const repo = env.GITHUB_REPO || "ysunyang979-sys/blog";
  const path = `source/_diary/${fileName}`;
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Diary-Upload-Worker",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `🗑️ 删除日记: ${fileName}`,
      sha: sha,
      branch: "main",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return new Response(
      JSON.stringify({ error: "删除失败", details: error }),
      { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: "日记已删除" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * 处理日记上传
 */
async function handleDiaryUpload(data, env, corsHeaders) {
  const { title, content, imageUrl } = data;

  if (!title || !content) {
    return new Response(JSON.stringify({ error: "标题和内容不能为空" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toISOString().split("T")[1].substring(0, 8);
  const fileName = `diary-${dateStr}-${Date.now()}.md`;
  const filePath = `source/_diary/${fileName}`;

  // 日记内容（不需要 front matter，因为不会被 Hexo 渲染）
  let finalContent = content;
  if (imageUrl) {
    finalContent = `![${title}](${imageUrl})\n\n${content}`;
  }

  const diaryContent = `# ${title}\n\ndate: ${dateStr} ${timeStr}\ncover: ${imageUrl || ''}\n\n---\n\n${finalContent}`;

  const githubResponse = await createGitHubFile(
    env.GITHUB_TOKEN,
    env.GITHUB_REPO || "ysunyang979-sys/blog",
    filePath,
    diaryContent,
    `📝 添加日记: ${title}`
  );

  if (!githubResponse.ok) {
    const errorData = await githubResponse.json();
    return new Response(
      JSON.stringify({ error: "GitHub API 错误", details: errorData }),
      { status: githubResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const result = await githubResponse.json();
  return new Response(
    JSON.stringify({
      success: true,
      message: "日记上传成功！",
      file: result.content.path,
      fileName: fileName,
      sha: result.content.sha,
      url: result.content.html_url,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * 处理图片上传
 */
async function handleImageUpload(data, env, corsHeaders) {
  const { imageData, fileName } = data;

  if (!imageData) {
    return new Response(JSON.stringify({ error: "图片数据不能为空" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 从 base64 数据中提取纯数据部分
  const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!base64Match) {
    return new Response(JSON.stringify({ error: "无效的图片格式" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const imageExt = base64Match[1];
  const base64Content = base64Match[2];

  // 生成文件名
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const imageName = fileName || `diary-${dateStr}-${Date.now()}.${imageExt}`;
  const imagePath = `source/images/diary/${imageName}`;

  // 上传到 GitHub
  const githubResponse = await createGitHubFileRaw(
    env.GITHUB_TOKEN,
    env.GITHUB_REPO || "ysunyang979-sys/blog",
    imagePath,
    base64Content,
    `🖼️ 上传日记图片: ${imageName}`
  );

  if (!githubResponse.ok) {
    const errorData = await githubResponse.json();
    return new Response(
      JSON.stringify({ error: "图片上传失败", details: errorData }),
      { status: githubResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const result = await githubResponse.json();
  
  // 返回多种 CDN 链接供选择
  const repo = env.GITHUB_REPO || "ysunyang979-sys/blog";
  const [owner, repoName] = repo.split("/");
  
  const cdnUrls = {
    // GitHub raw 链接
    github: `https://raw.githubusercontent.com/${repo}/main/${imagePath}`,
    // jsDelivr CDN
    jsdelivr: `https://cdn.jsdelivr.net/gh/${repo}@main/${imagePath}`,
    // GitHub Pages (如果启用)
    pages: `https://${owner}.github.io/${imagePath.replace('source/', '')}`,
  };

  return new Response(
    JSON.stringify({
      success: true,
      message: "图片上传成功！",
      file: result.content.path,
      url: cdnUrls.jsdelivr, // 默认使用 jsDelivr CDN
      urls: cdnUrls,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * 创建文本文件
 */
async function createGitHubFile(token, repo, path, content, message) {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const base64Content = btoa(unescape(encodeURIComponent(content)));

  return fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Diary-Upload-Worker",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
      content: base64Content,
      branch: "main",
    }),
  });
}

/**
 * 创建二进制文件（图片等）
 */
async function createGitHubFileRaw(token, repo, path, base64Content, message) {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Diary-Upload-Worker",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
      content: base64Content,
      branch: "main",
    }),
  });
}
