import type { VercelApiHandler, VercelRequestQuery } from '@vercel/node'
import { init } from 'echarts'

export type RequestQuery = VercelRequestQuery & {
  w?: string
  h?: string
  option: string
}

const PREFERS_COLOR_SCHEME = 'Sec-CH-Prefers-Color-Scheme'.toLowerCase()

const handler: VercelApiHandler = (req, res) => {
  const query = req.query as RequestQuery
  const width = Number.parseInt(query.w ?? '500')
  const height = Number.parseInt(query.h ?? '300')

  res.setHeader('Content-Type', 'image/svg+xml')
  res.setHeader('Accept-CH', PREFERS_COLOR_SCHEME)
  res.setHeader('Vary', PREFERS_COLOR_SCHEME)

  const theme = req.headers[PREFERS_COLOR_SCHEME] ?? 'light'

  let svg: string

  try {
    if (!query.option) {
      throw new Error('`query.option` in url is required')
    }
    const chart = init(undefined, theme, {
      renderer: 'svg',
      ssr: true,
      width,
      height,
    })
    chart.setOption(JSON.parse(query.option))
    svg = chart.renderToSVGString()
  } catch (error) {
    console.error(error)
    // 计算 msg 在画布中的字体大小
    svg = /* HTML */ `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${width}"
        height="${height}"
      >
        <rect
          x="0"
          y="0"
          width="${width}"
          height="${height}"
          fill="#fdd"
        />
        <text
          x="50%"
          y="50%"
          style="dominant-baseline:middle;text-anchor:middle;font-size:14px"
          fill="#000"
        >
          ${(error as Error).message || 'error'}
        </text>
      </svg>
    `
  }

  res.end(svg)
}

export default handler
