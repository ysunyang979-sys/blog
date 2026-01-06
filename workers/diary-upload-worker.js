/**
 * Diary Upload Worker - Cloudflare Worker
 * 用于将日记内容上传到 GitHub 仓库
 *
 * 环境变量:
 * - GITHUB_TOKEN: GitHub Personal Access Token
 * - DIARY_PASSWORD: 访问密码
 * - GITHUB_REPO: 仓库名称 (如 ysunyang979-sys/blog)
 */

export default {
  async fetch(request, env) {
    // CORS 配置
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 处理预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 只允许 POST 请求
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "仅支持 POST 请求" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { title, content, password } = await request.json();

      // 验证密码
      if (password !== env.DIARY_PASSWORD) {
        return new Response(JSON.stringify({ error: "密码错误" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 验证必填字段
      if (!title || !content) {
        return new Response(JSON.stringify({ error: "标题和内容不能为空" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 生成文件名和日期
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = now.toISOString().split("T")[1].substring(0, 8); // HH:mm:ss
      const fileName = `diary-${dateStr}-${Date.now()}.md`;
      const filePath = `source/_posts/${fileName}`;

      // 生成 Hexo 文章格式
      const frontMatter = `---
title: ${title}
date: ${dateStr} ${timeStr}
tags:
  - 日记
categories:
  - 日记
---

`;
      const fullContent = frontMatter + content;

      // 调用 GitHub API 创建文件
      const githubResponse = await createGitHubFile(
        env.GITHUB_TOKEN,
        env.GITHUB_REPO || "ysunyang979-sys/blog",
        filePath,
        fullContent,
        `📝 添加日记: ${title}`
      );

      if (!githubResponse.ok) {
        const errorData = await githubResponse.json();
        return new Response(
          JSON.stringify({
            error: "GitHub API 错误",
            details: errorData,
          }),
          {
            status: githubResponse.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const result = await githubResponse.json();
      return new Response(
        JSON.stringify({
          success: true,
          message: "日记上传成功！",
          file: result.content.path,
          url: result.content.html_url,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "服务器错误",
          message: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};

/**
 * 使用 GitHub API 创建文件
 */
async function createGitHubFile(token, repo, path, content, message) {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  // 将内容转换为 Base64
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
