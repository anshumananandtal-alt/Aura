import type { AuraCanvasItem } from '../types'

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const itemStyle = (item: AuraCanvasItem) => {
  const { x, y, width, height, zIndex, props } = item
  return [
    `position:absolute`,
    `left:${x}px`,
    `top:${y}px`,
    `width:${width}px`,
    `height:${height}px`,
    `z-index:${zIndex}`,
    `box-sizing:border-box`,
    `color:${props.color}`,
    `background:${props.bgColor}`,
    `border-radius:${props.borderRadius}px`,
    `font-size:${props.fontSize}px`,
    `text-align:${props.textAlign}`,
  ].join(';')
}

export const buildHtml = (items: AuraCanvasItem[]) => {
  const markup = items
    .map((item) => {
      const style = itemStyle(item)
      switch (item.type) {
        case 'text':
          return `<div style="${style};padding:8px;min-height:36px">${escapeHtml(item.props.text)}</div>`
        case 'textarea':
          return `<div style="${style};padding:10px;white-space:pre-wrap;overflow-wrap:break-word">${escapeHtml(item.props.text)}</div>`
        case 'image':
          return `<img src="${escapeHtml(item.props.src)}" alt="${escapeHtml(item.props.alt)}" style="${style};object-fit:cover"/>`
        case 'button':
          return `<button style="${style};border:none;cursor:pointer;">${escapeHtml(item.props.text)}</button>`
        default:
          return ''
      }
    })
    .join('')
  return `<div style="position:relative;width:100%;min-height:680px;background:#fafbff;border:1px solid #e2e5ef;border-radius:24px;overflow:hidden">${markup}</div>`
}
