import React, { useEffect, useRef, useState } from 'react'
import { Check, Crop, RotateCcw, X } from 'lucide-react'

const FRAME_SCALE = .82

export default function ImageCropper({
  file,
  onCancel,
  onConfirm,
  aspectRatio = 1,
  outputWidth = 400,
  outputHeight = 400,
  title = 'Chọn vùng ảnh',
}) {
  const imageRef = useRef(null)
  const stageRef = useRef(null)
  const dragRef = useRef(null)
  const [source, setSource] = useState('')
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setSource(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onCancel()
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onCancel])

  const metrics = (nextZoom = zoom) => {
    const image = imageRef.current
    const stage = stageRef.current
    if (!image?.naturalWidth || !stage) return null
    const rect = stage.getBoundingClientRect()
    let cropWidth = rect.width * FRAME_SCALE
    let cropHeight = cropWidth / aspectRatio
    if (cropHeight > rect.height * FRAME_SCALE) {
      cropHeight = rect.height * FRAME_SCALE
      cropWidth = cropHeight * aspectRatio
    }
    const baseScale = Math.min(cropWidth / image.naturalWidth, cropHeight / image.naturalHeight)
    const scale = baseScale * nextZoom
    return {
      cropWidth,
      cropHeight,
      scale,
      width: image.naturalWidth * scale,
      height: image.naturalHeight * scale,
    }
  }

  const clampOffset = (next, nextZoom = zoom) => {
    const value = metrics(nextZoom)
    if (!value) return next
    const maxX = Math.max(0, (value.width - value.cropWidth) / 2)
    const maxY = Math.max(0, (value.height - value.cropHeight) / 2)
    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    }
  }

  const reset = () => { setZoom(1); setOffset({ x: 0, y: 0 }) }
  const changeZoom = (value) => {
    const nextZoom = Number(value)
    setZoom(nextZoom)
    setOffset((current) => clampOffset(current, nextZoom))
  }
  const startDrag = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { x: event.clientX, y: event.clientY, offset }
  }
  const moveDrag = (event) => {
    if (!dragRef.current) return
    setOffset(clampOffset({ x: dragRef.current.offset.x + event.clientX - dragRef.current.x, y: dragRef.current.offset.y + event.clientY - dragRef.current.y }))
  }
  const finishDrag = () => { dragRef.current = null }
  const wheelZoom = (event) => {
    event.preventDefault()
    changeZoom(Math.max(1, Math.min(3, zoom - event.deltaY * .001)))
  }

  const crop = async () => {
    const image = imageRef.current
    const value = metrics()
    if (!value) return
    const outputScale = outputWidth / value.cropWidth
    const drawWidth = value.width * outputScale
    const drawHeight = value.height * outputScale
    const drawX = (outputWidth - drawWidth) / 2 + offset.x * outputScale
    const drawY = (outputHeight - drawHeight) / 2 + offset.y * (outputHeight / value.cropHeight)
    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight
    canvas.getContext('2d').drawImage(image, drawX, drawY, drawWidth, drawHeight)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', .86))
    if (blob) onConfirm(new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-cropped.webp`, { type: 'image/webp' }))
  }

  if (!file) return null
  return (
    <div className="cropper-overlay" role="dialog" aria-modal="true" aria-labelledby="cropper-title">
      <div className="cropper-modal">
        <header className="cropper-header">
          <div><span><Crop size={18} /> Chỉnh ảnh</span><h2 id="cropper-title">{title}</h2></div>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label="Đóng trình cắt ảnh"><X /></button>
        </header>
        <div ref={stageRef} className="cropper-stage" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} onWheel={wheelZoom}>
          {source && <img ref={imageRef} src={source} alt="Ảnh đang chỉnh" draggable="false" onLoad={reset} style={{ transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }} />}
          <div className="cropper-shade" aria-hidden="true"><div className="cropper-frame" style={{ aspectRatio, width: `${FRAME_SCALE * 100}%` }}><div className="cropper-grid" /></div></div>
        </div>
        <div className="cropper-controls">
          <label htmlFor="service-image-zoom">Thu phóng</label>
          <input id="service-image-zoom" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => changeZoom(event.target.value)} />
          <output>{Math.round(zoom * 100)}%</output>
        </div>
        <p className="cropper-help">Mặc định hiển thị trọn ảnh gốc. Tăng thu phóng rồi kéo ảnh nếu bạn muốn chọn vùng hiển thị khác.</p>
        <footer className="cropper-actions">
          <button type="button" className="secondary-btn" onClick={reset}><RotateCcw size={16} /> Đặt lại</button>
          <button type="button" className="secondary-btn" onClick={onCancel}>Hủy</button>
          <button type="button" className="primary-btn" onClick={crop}><Check size={17} /> Lưu ảnh {outputWidth} × {outputHeight}</button>
        </footer>
      </div>
    </div>
  )
}
