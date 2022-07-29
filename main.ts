import { serve } from "https://deno.land/std@0.150.0/http/server.ts";
import * as echarts from "https://cdn.jsdelivr.net/npm/echarts/dist/echarts.esm.js";
import { CSS, render } from "https://deno.land/x/gfm@0.1.22/mod.ts";

serve(async (request) => {
  const searchParams = new URL(request.url).searchParams;
  const option = searchParams.get("option");

  if (option == null) {
    const readme = await Deno.readTextFile("./README.md");
    const body = render(readme);
    const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chart Service</title>
        <style>
          body {
            margin: 0;
            background-color: var(--color-canvas-default);
            color: var(--color-fg-default);
          }
          main {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }
          ${CSS}
        </style>
      </head>
      <body data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
        <main class="markdown-body">
          ${body}
        </main>
      </body>
    </html>`;
    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=utf-8",
      },
    });
  }

  const width = parseInt(searchParams.get("w") ?? "500");
  const height = parseInt(searchParams.get("h") ?? "300");

  try {
    const optionObj = JSON.parse(option);
    const chart = echarts.init(undefined, "light", {
      renderer: "svg",
      ssr: true,
      width,
      height,
    });
    chart.setOption(optionObj);
    const svg = chart.renderToSVGString();

    return new Response(svg, {
      headers: { "content-type": "image/svg+xml" },
    });
  } catch (error) {
    const msg: string = error.message ?? "error";
    // 计算 msg 在画布中的字体大小
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
    <rect x='0' y='0' width='${width}' height='${height}' fill='#fdd'/>
    <text x='50%' y='50%' style='dominant-baseline:middle;text-anchor:middle;font-size:14px' fill='#000'>${msg}</text>
  </svg>`;

    return new Response(svg, {
      headers: { "content-type": "image/svg+xml" },
    });
  }
});
