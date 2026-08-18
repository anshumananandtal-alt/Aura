import { useMemo } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import type { AuraCanvasItem } from '../types'

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

const handleCursor: Record<ResizeHandle, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
}

const handlePosition = (handle: ResizeHandle): React.CSSProperties => {
  const offset = -5
  const styles: React.CSSProperties = { position: 'absolute' }
  if (handle.includes('n')) styles.top = offset
  if (handle.includes('s')) styles.bottom = offset
  if (handle.includes('w')) styles.left = offset
  if (handle.includes('e')) styles.right = offset
  if (handle === 'n' || handle === 's') {
    styles.left = '50%'
    styles.transform = 'translateX(-50%)'
  }
  if (handle === 'e' || handle === 'w') {
    styles.top = '50%'
    styles.transform = 'translateY(-50%)'
  }
  return styles
}

const renderResizeHandles = (
  item: AuraCanvasItem,
  isSelected: boolean,
  onItemResizeStart: CanvasPanelProps['onItemResizeStart'],
) => {
  if (!isSelected) return null
  return (
    <>
      {HANDLES.map((handle) => (
        <Box
          key={handle}
          className={`resize-handle resize-handle-${handle}`}
          onMouseDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onItemResizeStart(item.id, handle, event)
          }}
          sx={{
            ...handlePosition(handle),
            width: 10,
            height: 10,
            background: '#4f66ff',
            border: '1.5px solid #fff',
            borderRadius: '2px',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
            cursor: handleCursor[handle],
            zIndex: 20,
          }}
        />
      ))}
    </>
  )
}

interface CanvasPanelProps {
  items: AuraCanvasItem[]
  selectedId: string | null
  draggingGhost: { type: AuraCanvasItem['type']; x: number; y: number } | null
  onCanvasClick: () => void
  onItemMouseDown: (itemId: string, event: React.MouseEvent<HTMLElement>) => void
  onItemResizeStart: (itemId: string, handle: ResizeHandle, event: React.MouseEvent<HTMLElement>) => void
  onItemTextChange: (itemId: string, text: string) => void
  onItemSelect: (itemId: string) => void
  canvasRef: React.Ref<HTMLDivElement>
}

export const CanvasPanel = ({
  items,
  selectedId,
  draggingGhost,
  onCanvasClick,
  onItemMouseDown,
  onItemResizeStart,
  onItemTextChange,
  onItemSelect,
  canvasRef,
}: CanvasPanelProps) => {
  const instructions = useMemo(
    () => ['Click to select', 'Drag to move', 'Double-click text to edit'],
    [],
  )

  return (
    <Paper
      className="canvas-frame"
      elevation={3}
      onMouseDown={onCanvasClick}
      sx={{
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
        border: '2px dashed #ddd',
        transition: 'border-color 0.3s ease',
        '&:hover': {
          borderColor: '#667eea',
        },
      }}
    >
      <Box className="canvas-toolbar">
        <Typography variant="subtitle2" color="text.secondary">
          Canvas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {instructions.join(' · ')}
        </Typography>
      </Box>

      <Box className="canvas-area" id="canvas-area" ref={canvasRef}>
        {items.map((item) => {
          const isSelected = item.id === selectedId
          const sharedStyles: React.CSSProperties = {
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
            zIndex: item.zIndex,
            border: isSelected ? '2px solid #4f66ff' : '1px solid transparent',
            borderRadius: item.props.borderRadius,
            background: item.type === 'image' ? 'transparent' : item.props.bgColor,
            color: item.props.color,
            fontSize: item.props.fontSize,
            textAlign: item.props.textAlign as React.CSSProperties['textAlign'],
            display: 'flex',
            alignItems: item.type === 'textarea' ? 'flex-start' : 'center',
            justifyContent: item.type === 'button' ? 'center' : 'flex-start',
            padding: item.type === 'image' ? 0 : 2,
            overflow: 'hidden',
            cursor: 'move',
            userSelect: 'none',
            boxSizing: 'border-box',
            whiteSpace: item.type === 'textarea' ? 'pre-wrap' : 'normal',
            boxShadow: isSelected ? '0 0 0 2px rgba(102, 126, 234, 0.2), inset 0 0 0 1px rgba(102, 126, 234, 0.3)' : 'none',
            transition: 'all 0.2s ease',
          }

          if (item.type === 'image') {
            return (
              <Box
                key={item.id}
                className="canvas-item"
                sx={sharedStyles}
                onMouseDown={(event) => onItemMouseDown(item.id, event)}
                onClick={(event) => {
                  event.stopPropagation()
                  onItemSelect(item.id)
                }}
              >
                <img
                  src={item.props.src}
                  alt={item.props.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: item.props.borderRadius }}
                />
                {renderResizeHandles(item, isSelected, onItemResizeStart)}
              </Box>
            )
          }

          if (item.type === 'button') {
            return (
              <Button
                key={item.id}
                className="canvas-item"
                variant={item.props.variant}
                sx={{
                  ...sharedStyles,
                  minWidth: 80,
                  background: item.props.bgColor,
                  color: item.props.color,
                  borderRadius: `${item.props.borderRadius}px`,
                  pointerEvents: 'auto',
                }}
                onMouseDown={(event) => onItemMouseDown(item.id, event)}
                onClick={(event) => {
                  event.stopPropagation()
                  onItemSelect(item.id)
                }}
              >
                {item.props.text}
                {renderResizeHandles(item, isSelected, onItemResizeStart)}
              </Button>
            )
          }

          return (
            <Box
              key={item.id}
              className="canvas-item"
              sx={sharedStyles}
              onMouseDown={(event) => onItemMouseDown(item.id, event)}
              onClick={(event) => {
                event.stopPropagation()
                onItemSelect(item.id)
              }}
            >
              <Box
                component="div"
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onInput={(event) => onItemTextChange(item.id, event.currentTarget.textContent ?? '')}
                onDoubleClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                sx={{ width: '100%', height: '100%', outline: 'none' }}
              >
                {item.props.text}
              </Box>
              {renderResizeHandles(item, isSelected, onItemResizeStart)}
            </Box>
          )
        })}

        {draggingGhost ? (
          <Box
            className="canvas-ghost"
            sx={{
              position: 'fixed',
              left: draggingGhost.x,
              top: draggingGhost.y,
              width: 140,
              height: 60,
              pointerEvents: 'none',
              background: 'rgba(79, 102, 255, 0.12)',
              border: '1px dashed #4f66ff',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d2ef6',
              zIndex: 999,
            }}
          >
            {draggingGhost.type}
          </Box>
        ) : null}
      </Box>
    </Paper>
  )
}