export type AuraComponentType = 'text' | 'textarea' | 'image' | 'button'
export type TextAlignment = 'left' | 'center' | 'right' | 'justify'

export interface AuraComponentProps {
  text: string
  alt: string
  src: string
  href: string
  variant: 'contained' | 'outlined' | 'text'
  color: string
  bgColor: string
  fontSize: number
  borderRadius: number
  textAlign: TextAlignment
}

export interface AuraCanvasItem {
  id: string
  type: AuraComponentType
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  props: AuraComponentProps
}

export interface EditorState {
  items: AuraCanvasItem[]
  selectedId: string | null
}

export type PreviewMode = 'desktop' | 'mobile'
