import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Box, Stack, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { Undo, Redo, DesktopWindows } from '@mui/icons-material'
import { PalettePanel } from './components/PalettePanel'
import { CanvasPanel } from './components/CanvasPanel'
import { PropertiesPanel } from './components/PropertiesPanel'
import { useHistoryState } from './hooks/useHistoryState'
import type { AuraCanvasItem, AuraComponentType, EditorState } from './types'
import { buildHtml } from './lib/htmlSerializer'
import './App.css'

const STORAGE_KEY = 'aura-aura-editor-state'

const defaultPropsFor = (type: AuraComponentType) => {
  const base = {
    text: type === 'button' ? 'Click Me' : type === 'textarea' ? 'Editable multiline text' : 'Editable text',
    alt: 'Placeholder image',
    src: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&w=800&q=80',
    href: '#',
    variant: 'contained' as const,
    color: '#1f2937',
    bgColor: type === 'button' ? '#4f66ff' : '#ffffff',
    fontSize: type === 'button' ? 16 : 18,
    borderRadius: 0,
    textAlign: 'left' as const,
  }
  return base
}

const createCanvasItem = (type: AuraComponentType, x: number, y: number): AuraCanvasItem => ({
  id: crypto.randomUUID(),
  type,
  x,
  y,
  width: type === 'image' ? 260 : type === 'button' ? 140 : type === 'textarea' ? 240 : 160,
  height: type === 'image' ? 170 : type === 'button' ? 40 : type === 'textarea' ? 100 : 40,
  zIndex: 10,
  props: defaultPropsFor(type),
})

const loadEditorState = (): EditorState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], selectedId: null }
    const parsed = JSON.parse(raw) as EditorState
    if (!Array.isArray(parsed.items)) return { items: [], selectedId: null }
    return parsed
  } catch {
    return { items: [], selectedId: null }
  }
}

export default function App() {
  const [dragGhost, setDragGhost] = useState<{ type: AuraComponentType; x: number; y: number } | null>(null)
  const [isDraggingPalette, setIsDraggingPalette] = useState(false)
  const [moveState, setMoveState] = useState<{
    itemId: string
    originX: number
    originY: number
    startX: number
    startY: number
  } | null>(null)
  
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [copyStatus, setCopyStatus] = useState('')

  const { present: editor, set: setEditor, undo, redo, canUndo, canRedo } = useHistoryState<EditorState>(loadEditorState(), 80)

  const selectedItem = useMemo(
    () => editor.items.find((item) => item.id === editor.selectedId) ?? null,
    [editor.items, editor.selectedId],
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(editor))
  }, [editor])

  useEffect(() => {
    if (!copyStatus) return
    const timer = window.setTimeout(() => setCopyStatus(''), 2200)
    return () => window.clearTimeout(timer)
  }, [copyStatus])

  const setSelectedId = useCallback(
    (id: string | null) => {
      setEditor((prev) => ({ ...prev, selectedId: id }))
    },
    [setEditor],
  )

  const updateItem = useCallback(
    (itemId: string, patch: Partial<AuraCanvasItem['props']>) => {
      setEditor((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, props: { ...item.props, ...patch } } : item,
        ),
      }))
    },
    [setEditor],
  )

  const updateItemFull = useCallback(
    (updatedItem: AuraCanvasItem) => {
      setEditor((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      }))
    },
    [setEditor],
  )

  const updateItemPosition = useCallback(
    (itemId: string, x: number, y: number) => {
      setEditor((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === itemId ? { ...item, x, y } : item)),
      }))
    },
    [setEditor],
  )

  const updateItemSize = useCallback(
    (itemId: string, width: number, height: number) => {
      setEditor((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, width: Math.max(60, width), height: Math.max(40, height) } : item,
        ),
      }))
    },
    [setEditor],
  )

  const setDragStart = (type: AuraComponentType, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDraggingPalette(true)
    setDragGhost({ type, x: event.clientX + 12, y: event.clientY + 12 })
  }

  const handleItemMouseDown = (itemId: string, event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const item = editor.items.find((entry) => entry.id === itemId)
    if (!item) return
    setSelectedId(itemId)
    setMoveState({
      itemId,
      originX: item.x,
      originY: item.y,
      startX: event.clientX,
      startY: event.clientY,
    })
  }

  

  const handleCanvasClick = () => setSelectedId(null)

  const handleItemTextChange = (itemId: string, text: string) => {
    updateItem(itemId, { text })
  }

  const handleImageUpload = useCallback(
    (itemId: string, file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result === 'string') {
          updateItem(itemId, { src: result })
        }
      }
      reader.readAsDataURL(file)
    },
    [updateItem],
  )

  const removeItem = useCallback(
    (itemId: string) => {
      setEditor((prev) => ({
        ...prev,
        items: prev.items.filter((it) => it.id !== itemId),
        selectedId: prev.selectedId === itemId ? null : prev.selectedId,
      }))
    },
    [setEditor],
  )

  const handlePaletteDrop = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return
      const bounds = canvasRef.current.getBoundingClientRect()
      if (clientX < bounds.left || clientX > bounds.right || clientY < bounds.top || clientY > bounds.bottom) {
        return
      }
      setEditor((prev) => {
        if (!isDraggingPalette) return prev
        const type = dragGhost?.type
        if (!type) return prev
        const item = createCanvasItem(type, clientX - bounds.left - 20, clientY - bounds.top - 20)
        return { items: [...prev.items, item], selectedId: item.id }
      })
    },
    [dragGhost, isDraggingPalette, setEditor],
  )

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (isDraggingPalette) {
        setDragGhost((ghost) => (ghost ? { ...ghost, x: event.clientX + 12, y: event.clientY + 12 } : null))
      }
      if (moveState) {
        const dx = event.clientX - moveState.startX
        const dy = event.clientY - moveState.startY
        updateItemPosition(moveState.itemId, Math.max(0, moveState.originX + dx), Math.max(0, moveState.originY + dy))
      }
      
    }

    const endDrag = (event: MouseEvent) => {
      if (isDraggingPalette) {
        handlePaletteDrop(event.clientX, event.clientY)
        setIsDraggingPalette(false)
        setDragGhost(null)
      }
      if (moveState) {
        setMoveState(null)
      }
      
    }

    if (isDraggingPalette || moveState) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', endDrag)
      return () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', endDrag)
      }
    }
  }, [handlePaletteDrop, isDraggingPalette, moveState, updateItemPosition, updateItemSize])

  const selectedControls = useMemo(() => {
    if (!selectedItem) return null
    return (
      <PropertiesPanel
        selectedItem={selectedItem}
        onChange={updateItemFull}
        onImageUpload={handleImageUpload}
        copyHtml={() => {
          const html = buildHtml(editor.items)
          navigator.clipboard.writeText(html)
          setCopyStatus('Copied HTML to clipboard')
        }}
        copyStatus={copyStatus}
        onRemove={removeItem}
      />
    )
  }, [copyStatus, editor.items, selectedItem, handleImageUpload, updateItemFull, removeItem])

  const htmlPreview = useMemo(() => buildHtml(editor.items), [editor.items])

  const openPreviewWindow = useCallback(() => {
    const previewWindow = window.open('', '_blank', 'width=1000,height=750')
    if (!previewWindow) return
    previewWindow.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Aura Preview</title><style>body{margin:0;padding:24px;background:#eef2ff;font-family:system-ui, sans-serif;} .preview-shell{max-width:1200px;margin:0 auto;}</style></head><body><div class="preview-shell">${htmlPreview}</div></body></html>`)
    previewWindow.document.close()
  }, [htmlPreview])

  return (
    <Box className="app-shell">
      <Container fluid className="app-toolbar" as="header">
        <Stack direction="row" gap={3} className="toolbar-content">
          <Box>
            <Typography variant="h4">Aura</Typography>
            <Typography color="text.secondary" variant="body2">
              No-code layout editor with native drag, live properties, undo/redo, preview, and HTML export.
            </Typography>
          </Box>

          <Stack direction="row" gap={1} className="toolbar-actions">
            <Button variant="outlined" startIcon={<Undo />} disabled={!canUndo} onClick={undo}>
              Undo
            </Button>
            <Button variant="outlined" startIcon={<Redo />} disabled={!canRedo} onClick={redo}>
              Redo
            </Button>
            <Button variant="contained" startIcon={<DesktopWindows />} onClick={openPreviewWindow}>
              Open Preview
            </Button>
          </Stack>
        </Stack>
      </Container>

      <Container fluid className="editor-layout">
        <Row>
          <Col xs={12} lg={3} className="panel-col">
            <Box className="panel card-panel">
              <PalettePanel onDragStart={setDragStart} />
            </Box>
          </Col>

          <Col xs={12} lg={6} className="panel-col">
            <Box className="panel card-panel">
              <CanvasPanel
                items={editor.items}
                selectedId={editor.selectedId}
                draggingGhost={dragGhost}
                canvasRef={canvasRef}
                onCanvasClick={handleCanvasClick}
                onItemMouseDown={handleItemMouseDown}
                
                onItemTextChange={handleItemTextChange}
                onItemSelect={(id) => setSelectedId(id)}
              />
            </Box>
          </Col>

          <Col xs={12} lg={3} className="panel-col">
            <Box className="panel card-panel">
              {selectedControls ?? (
                <Box className="empty-state">
                  <Typography variant="h6">Properties</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Select an item on the canvas to edit its styles and content.
                  </Typography>
                </Box>
              )}
            </Box>
          </Col>
        </Row>
      </Container>
    </Box>
  )
}
