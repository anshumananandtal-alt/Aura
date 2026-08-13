import type { MouseEvent, ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { TextFields, Notes, Image, SmartButton } from '@mui/icons-material'
import type { AuraComponentType } from '../types'

const palette: Array<{ type: AuraComponentType; label: string; icon: ReactNode }> = [
  { type: 'text', label: 'Text', icon: <TextFields /> },
  { type: 'textarea', label: 'Textarea', icon: <Notes /> },
  { type: 'image', label: 'Image', icon: <Image /> },
  { type: 'button', label: 'Button', icon: <SmartButton /> },
]

interface PalettePanelProps {
  onDragStart: (type: AuraComponentType, event: MouseEvent<HTMLButtonElement>) => void
}

export const PalettePanel = ({ onDragStart }: PalettePanelProps) => {
  return (
    <Box
      p={2}
      borderRight="2px solid #e0e0e0"
      sx={{
        background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
        minHeight: '100%',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
        🎨 Palette
      </Typography>
      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 2 }}>
        Drag items to the canvas.
      </Typography>
      <Stack spacing={1}>
        {palette.map((item) => (
          <Button
            key={item.type}
            onMouseDown={(event) => onDragStart(item.type, event)}
            variant="contained"
            sx={{
              textTransform: 'capitalize',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'grab',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
              },
              '&:active': {
                cursor: 'grabbing',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
    </Box>
  )
}
