import { serve } from "https://deno.land/std@0.149.0/http/server.ts";
import * as echarts from "https://cdn.jsdelivr.net/npm/echarts/dist/echarts.esm.js";

serve((request) => {
  const searchParams = new URL(request.url).searchParams;
  const option = searchParams.get("option") ?? "{}";
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
