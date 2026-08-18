import { useState } from 'react'
import { Box, Stack, Typography, IconButton } from '@mui/material'
import { TextFields, Notes, Image, SmartButton, DeleteOutline, DragIndicator } from '@mui/icons-material'
import type { AuraCanvasItem, AuraComponentType } from '../types'

interface LayersPanelProps {
  items: AuraCanvasItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onReorder: (fromId: string, toIndex: number) => void
}

const iconFor = (type: AuraComponentType) => {
  switch (type) {
    case 'text':
      return <TextFields fontSize="small" />
    case 'textarea':
      return <Notes fontSize="small" />
    case 'image':
      return <Image fontSize="small" />
    case 'button':
      return <SmartButton fontSize="small" />
    default:
      return null
  }
}

const labelFor = (item: AuraCanvasItem) => {
  if (item.type === 'image') return item.props.alt || 'Image'
  const text = item.props.text?.trim()
  if (text) return text.length > 24 ? `${text.slice(0, 24)}…` : text
  return item.type
}

export const LayersPanel = ({ items, selectedId, onSelect, onRemove, onReorder }: LayersPanelProps) => {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  // GrapesJS shows the layer stack top-to-bottom matching visual stacking (topmost first)
  const stacked = [...items].reverse()

  if (items.length === 0) {
    return (
      <Box className="layers-empty">
        <Typography color="text.secondary" variant="body2">
          No elements yet. Drag something from Blocks onto the canvas.
        </Typography>
      </Box>
    )
  }

  return (
    <Stack className="layers-list" spacing={0.5}>
      {stacked.map((item, visualIndex) => {
        const isSelected = item.id === selectedId
        const isDropTarget = overIndex === visualIndex && dragId !== null && dragId !== item.id
        return (
          <Box
            key={item.id}
            className={`layer-row${isSelected ? ' layer-row-selected' : ''}${isDropTarget ? ' layer-row-drop' : ''}`}
            draggable
            onDragStart={() => setDragId(item.id)}
            onDragOver={(event) => {
              event.preventDefault()
              setOverIndex(visualIndex)
            }}
            onDragLeave={() => setOverIndex((prev) => (prev === visualIndex ? null : prev))}
            onDrop={(event) => {
              event.preventDefault()
              if (dragId && dragId !== item.id) {
                // Convert the visual (reversed) drop index back into the underlying array index
                const targetArrayIndex = items.length - 1 - visualIndex
                onReorder(dragId, targetArrayIndex)
              }
              setDragId(null)
              setOverIndex(null)
            }}
            onDragEnd={() => {
              setDragId(null)
              setOverIndex(null)
            }}
            onClick={() => onSelect(item.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              py: 0.75,
              borderRadius: '6px',
              cursor: 'pointer',
              background: isSelected ? 'rgba(79, 102, 255, 0.12)' : isDropTarget ? 'rgba(79, 102, 255, 0.06)' : 'transparent',
              border: isSelected ? '1px solid #4f66ff' : '1px solid transparent',
              borderTop: isDropTarget ? '2px solid #4f66ff' : undefined,
              '&:hover': {
                background: isSelected ? 'rgba(79, 102, 255, 0.16)' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            <DragIndicator fontSize="small" sx={{ color: '#aaa', cursor: 'grab' }} />
            <Box sx={{ display: 'flex', color: '#667eea' }}>{iconFor(item.type)}</Box>
            <Typography variant="body2" sx={{ flex: 1, textTransform: 'capitalize' }}>
              {labelFor(item)}
            </Typography>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation()
                onRemove(item.id)
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Box>
        )
      })}
    </Stack>
  )
}