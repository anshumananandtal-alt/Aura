import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Button from '@mui/material/Button'
import type { AuraCanvasItem } from '../types'

interface PropertiesPanelProps {
  selectedItem: AuraCanvasItem
  onChange: (item: AuraCanvasItem) => void
  onImageUpload: (itemId: string, file: File) => void
  copyHtml: () => void
  copyStatus: string
  onRemove: (itemId: string) => void
}

const alignments = ['left', 'center', 'right', 'justify'] as const
const variants = ['contained', 'outlined', 'text'] as const

export const PropertiesPanel = ({
  selectedItem,
  onChange,
  onImageUpload,
  copyHtml,
  copyStatus,
  onRemove,
}: PropertiesPanelProps) => {
  const item = selectedItem
  const showTextStyleControls = item.type !== 'image'

  const update = (field: keyof AuraCanvasItem['props'], value: string | number) => {
    const patch = { [field]: value }
    onChange({ ...item, props: { ...item.props, ...patch } })
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Properties
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
        Edit the selected component in real time.
      </Typography>

      <Stack spacing={2}>
        {(item.type === 'text' || item.type === 'textarea' || item.type === 'button') && (
          <TextField
            label="Content"
            value={item.props.text}
            multiline={item.type === 'textarea'}
            minRows={item.type === 'textarea' ? 4 : 1}
            onChange={(event) => update('text', event.target.value)}
            fullWidth
          />
        )}

        {item.type === 'image' && (
          <>
            <TextField
              label="Image URL"
              value={item.props.src}
              onChange={(event) => update('src', event.target.value)}
              fullWidth
            />
            <TextField
              label="Alt text"
              value={item.props.alt}
              onChange={(event) => update('alt', event.target.value)}
              fullWidth
            />
            <Button
              variant="outlined"
              component="label"
              sx={{ textTransform: 'none' }}
            >
              Upload Image
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) onImageUpload(item.id, file)
                }}
              />
            </Button>
          </>
        )}

        {item.type === 'button' && (
          <FormControl fullWidth>
            <InputLabel>Variant</InputLabel>
            <Select
              value={item.props.variant}
              label="Variant"
              onChange={(event) => update('variant', event.target.value as string)}
            >
              {variants.map((variant) => (
                <MenuItem key={variant} value={variant}>
                  {variant}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {showTextStyleControls && (
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <TextField
              label="Text color"
              type="color"
              value={item.props.color}
              onChange={(event) => update('color', event.target.value)}
              sx={{ width: '100%' }}
            />
            <TextField
              label="Background"
              type="color"
              value={item.props.bgColor}
              onChange={(event) => update('bgColor', event.target.value)}
              sx={{ width: '100%' }}
            />
          </Stack>
        )}

        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <TextField
            label="Width"
            type="number"
            value={item.width}
            onChange={(event) => onChange({ ...item, width: Number(event.target.value) })}
            inputProps={{ min: 40 }}
            sx={{ width: '100%' }}
          />
          <TextField
            label="Height"
            type="number"
            value={item.height}
            onChange={(event) => onChange({ ...item, height: Number(event.target.value) })}
            inputProps={{ min: 40 }}
            sx={{ width: '100%' }}
          />
        </Stack>

        {showTextStyleControls && (
          <Box>
            <Typography gutterBottom>Font size</Typography>
            <Slider
              min={12}
              max={36}
              step={1}
              value={item.props.fontSize}
              onChange={(_, value) => update('fontSize', value as number)}
              valueLabelDisplay="auto"
            />
          </Box>
        )}

        <Box>
          <Typography gutterBottom>Border radius</Typography>
          <Slider
            min={0}
            max={40}
            step={1}
            value={item.props.borderRadius}
            onChange={(_, value) => update('borderRadius', value as number)}
            valueLabelDisplay="auto"
          />
        </Box>

        {showTextStyleControls && (
          <FormControl fullWidth>
            <InputLabel>Text alignment</InputLabel>
            <Select
              value={item.props.textAlign}
              label="Text alignment"
              onChange={(event) => update('textAlign', event.target.value as string)}
            >
              {alignments.map((align) => (
                <MenuItem key={align} value={align}>
                  {align}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Divider />

        <Button
          variant="contained"
          onClick={copyHtml}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            borderRadius: '8px',
            textTransform: 'none',
            '&:hover': {
              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          Copy HTML
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={() => onRemove(item.id)}
          sx={{ textTransform: 'none' }}
        >
          Remove
        </Button>

        {copyStatus ? (
          <Typography color="success.main" variant="body2">
            {copyStatus}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  )
}
