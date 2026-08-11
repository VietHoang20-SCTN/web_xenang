import React, { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { TableKit } from '@tiptap/extension-table'
import TextAlign from '@tiptap/extension-text-align'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Columns2,
  Heading2,
  Heading3,
  ImageUp,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Plus,
  Redo2,
  Rows3,
  Strikethrough,
  Table,
  Trash2,
  Underline,
  Undo2,
  Unlink,
} from 'lucide-react'

const alignments = [
  ['left', AlignLeft, 'Căn trái'],
  ['center', AlignCenter, 'Căn giữa'],
  ['right', AlignRight, 'Căn phải'],
  ['justify', AlignJustify, 'Căn đều'],
]

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element) => element.getAttribute('width') || '100%',
        renderHTML: ({ width }) => ({ width }),
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: ({ align }) => ({ 'data-align': align }),
      },
    }
  },
})

function ToolbarButton({ active = false, disabled = false, label, onClick, children }) {
  return (
    <button
      type="button"
      className={active ? 'active' : ''}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Bắt đầu nhập nội dung...',
  onUploadImage,
}) {
  const fileInputRef = useRef(null)
  const uploadingImageRef = useRef(false)
  const [pendingImage, setPendingImage] = useState(null)
  const [imageWidth, setImageWidth] = useState(100)
  const [uploadingImage, setUploadingImage] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, linkOnPaste: true },
      }),
      ResizableImage,
      Placeholder.configure({ placeholder }),
      TableKit.configure({ table: { resizable: false, renderWrapper: true } }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  })

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return null
      return {
        bold: currentEditor.isActive('bold'),
        italic: currentEditor.isActive('italic'),
        underline: currentEditor.isActive('underline'),
        strike: currentEditor.isActive('strike'),
        heading2: currentEditor.isActive('heading', { level: 2 }),
        heading3: currentEditor.isActive('heading', { level: 3 }),
        paragraph: currentEditor.isActive('paragraph'),
        bulletList: currentEditor.isActive('bulletList'),
        orderedList: currentEditor.isActive('orderedList'),
        link: currentEditor.isActive('link'),
        image: currentEditor.isActive('image'),
        imageAlign: currentEditor.isActive('image') ? currentEditor.getAttributes('image').align || 'center' : null,
        table: currentEditor.isActive('table'),
        align: currentEditor.isActive('image')
          ? currentEditor.getAttributes('image').align || 'center'
          : alignments.find(([alignment]) => currentEditor.isActive({ textAlign: alignment }))?.[0] || 'left',
      }
    },
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== (value || '')) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [editor, value])

  const setLink = () => {
    const current = editor?.getAttributes('link').href || ''
    const entered = window.prompt('Nhập URL liên kết:', current)
    if (entered === null) return
    const trimmed = entered.trim()
    if (!trimmed) {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    const href = /^(https?:\/\/|mailto:|\/|#)/i.test(trimmed) ? trimmed : `https://${trimmed}`
    editor?.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }

  const chooseInlineImage = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !onUploadImage) return
    setImageWidth(100)
    setPendingImage({ file, preview: URL.createObjectURL(file), mode: 'insert' })
  }

  const editSelectedImage = () => {
    if (!editor || !state.image) return
    const attributes = editor.getAttributes('image')
    setImageWidth(Math.max(25, Math.min(100, parseInt(attributes.width, 10) || 100)))
    setPendingImage({ preview: attributes.src, mode: 'edit' })
  }

  const closeImageDialog = () => {
    if (pendingImage?.mode === 'insert' && pendingImage.preview) URL.revokeObjectURL(pendingImage.preview)
    setPendingImage(null)
  }

  const insertInlineImage = async () => {
    if (!pendingImage || uploadingImageRef.current) return
    if (pendingImage.mode === 'edit') {
      editor
        .chain()
        .focus()
        .updateAttributes('image', { width: `${imageWidth}%` })
        .run()
      closeImageDialog()
      return
    }
    uploadingImageRef.current = true
    setUploadingImage(true)
    try {
      const url = await onUploadImage(pendingImage.file)
      if (url)
        editor
          ?.chain()
          .focus()
          .setImage({ src: url, width: `${imageWidth}%`, align: 'center' })
          .run()
      closeImageDialog()
    } finally {
      uploadingImageRef.current = false
      setUploadingImage(false)
    }
  }

  const setAlignment = (alignment) => {
    if (state.image) {
      editor
        .chain()
        .focus()
        .updateAttributes('image', {
          align: alignment,
          ...(alignment === 'justify' ? { width: '100%' } : {}),
        })
        .run()
      return
    }
    editor.chain().focus().setTextAlign(alignment).run()
  }

  const setHeading = (level) => {
    if (!editor) return
    const { from } = editor.state.selection
    editor.commands.setTextSelection({ from, to: from })
    if (editor.isActive('heading', { level })) {
      editor.commands.setParagraph()
    } else {
      editor.commands.setHeading({ level })
    }
    editor.commands.focus()
  }

  const activeTools = state
    ? [
        state.heading2 && 'Tiêu đề H2',
        state.heading3 && 'Tiêu đề H3',
        state.paragraph && 'Đoạn văn',
        state.bold && 'In đậm',
        state.italic && 'In nghiêng',
        state.underline && 'Gạch chân',
        state.strike && 'Gạch ngang',
        state.bulletList && 'Danh sách dấu đầu dòng',
        state.orderedList && 'Danh sách đánh số',
        state.link && 'Liên kết',
        state.table && 'Bảng',
        alignments.find(([key]) => key === state.align)?.[2],
      ].filter(Boolean)
    : []

  if (!editor || !state) return null

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar" role="toolbar" aria-label="Công cụ định dạng nội dung">
        <div className="rich-text-toolbar-group">
          <ToolbarButton
            label="Hoàn tác"
            disabled={!editor.can().chain().focus().undo().run()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 />
          </ToolbarButton>
          <ToolbarButton
            label="Làm lại"
            disabled={!editor.can().chain().focus().redo().run()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 />
          </ToolbarButton>
        </div>
        <div className="rich-text-toolbar-group">
          <ToolbarButton
            label="Đoạn văn"
            active={state.paragraph}
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            <Pilcrow />
          </ToolbarButton>
          <ToolbarButton label="Tiêu đề H2" active={state.heading2} onClick={() => setHeading(2)}>
            <Heading2 />
          </ToolbarButton>
          <ToolbarButton label="Tiêu đề H3" active={state.heading3} onClick={() => setHeading(3)}>
            <Heading3 />
          </ToolbarButton>
        </div>
        <div className="rich-text-toolbar-group">
          <ToolbarButton label="In đậm" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold />
          </ToolbarButton>
          <ToolbarButton
            label="In nghiêng"
            active={state.italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic />
          </ToolbarButton>
          <ToolbarButton
            label="Gạch chân"
            active={state.underline}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline />
          </ToolbarButton>
          <ToolbarButton
            label="Gạch ngang"
            active={state.strike}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough />
          </ToolbarButton>
        </div>
        <div className="rich-text-toolbar-group">
          <ToolbarButton
            label="Danh sách dấu đầu dòng"
            active={state.bulletList}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List />
          </ToolbarButton>
          <ToolbarButton
            label="Danh sách đánh số"
            active={state.orderedList}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered />
          </ToolbarButton>
        </div>
        <div className="rich-text-toolbar-group">
          {alignments.map(([alignment, Icon, label]) => (
            <ToolbarButton
              key={alignment}
              label={state.image ? `${label} ảnh` : label}
              active={state.align === alignment}
              onClick={() => setAlignment(alignment)}
            >
              <Icon />
            </ToolbarButton>
          ))}
        </div>
        <div className="rich-text-toolbar-group">
          <ToolbarButton label="Thêm hoặc sửa liên kết" active={state.link} onClick={setLink}>
            <Link />
          </ToolbarButton>
          <ToolbarButton
            label="Xóa liên kết"
            disabled={!state.link}
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Unlink />
          </ToolbarButton>
          {onUploadImage && (
            <ToolbarButton label="Chèn ảnh" onClick={() => fileInputRef.current?.click()}>
              <ImageUp />
            </ToolbarButton>
          )}
          <ToolbarButton
            label="Chèn bảng 3 x 3"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <Table />
          </ToolbarButton>
        </div>
      </div>
      <div className="rich-text-active-status" role="status" aria-live="polite">
        <strong>Đang sử dụng:</strong>
        <span>{activeTools.join(' · ') || 'Chưa chọn định dạng'}</span>
        <small>Bôi đen văn bản hoặc đặt con trỏ để xem định dạng hiện tại.</small>
      </div>

      {state.image && (
        <div className="rich-text-image-toolbar" role="toolbar" aria-label="Công cụ chỉnh sửa ảnh">
          <span>Ảnh đang được chọn · Có thể sửa kích thước, căn chỉnh hoặc xóa</span>
          <ToolbarButton label="Sửa ảnh" onClick={editSelectedImage}>
            <ImageUp />
          </ToolbarButton>
          <ToolbarButton label="Xóa ảnh" onClick={() => editor.chain().focus().deleteSelection().run()}>
            <Trash2 />
          </ToolbarButton>
          <small>Hoặc nhấn Delete / Backspace</small>
        </div>
      )}

      {state.table && (
        <div className="rich-text-table-toolbar" role="toolbar" aria-label="Công cụ chỉnh sửa bảng">
          <ToolbarButton label="Thêm cột bên trái" onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <Plus />
            <Columns2 />
          </ToolbarButton>
          <ToolbarButton label="Thêm cột bên phải" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <Columns2 />
            <Plus />
          </ToolbarButton>
          <ToolbarButton label="Xóa cột" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <Minus />
            <Columns2 />
          </ToolbarButton>
          <ToolbarButton label="Thêm hàng phía trên" onClick={() => editor.chain().focus().addRowBefore().run()}>
            <Plus />
            <Rows3 />
          </ToolbarButton>
          <ToolbarButton label="Thêm hàng phía dưới" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <Rows3 />
            <Plus />
          </ToolbarButton>
          <ToolbarButton label="Xóa hàng" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Minus />
            <Rows3 />
          </ToolbarButton>
          <ToolbarButton
            label="Bật hoặc tắt hàng tiêu đề"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          >
            <Heading3 />
            <Rows3 />
          </ToolbarButton>
          <ToolbarButton label="Xóa bảng" onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash2 />
          </ToolbarButton>
        </div>
      )}

      <EditorContent editor={editor} className="rich-text-content" />
      {onUploadImage && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={chooseInlineImage}
        />
      )}

      {pendingImage && (
        <div className="image-insert-backdrop" role="presentation" onMouseDown={(event) => event.stopPropagation()}>
          <div className="image-insert-dialog" role="dialog" aria-modal="true" aria-labelledby="image-insert-title">
            <div className="image-insert-header">
              <div>
                <strong id="image-insert-title">
                  {pendingImage.mode === 'edit' ? 'Sửa ảnh đã chèn' : 'Chỉnh kích thước ảnh'}
                </strong>
                <small>
                  {pendingImage.mode === 'edit'
                    ? 'Điều chỉnh kích thước hiển thị, không cần tải lại ảnh'
                    : 'Xem trước trước khi tải lên và chèn vào bài viết'}
                </small>
              </div>
              <button type="button" onClick={closeImageDialog} aria-label="Đóng" disabled={uploadingImage}>
                ×
              </button>
            </div>
            <div className="image-insert-canvas">
              <img src={pendingImage.preview} alt="Xem trước ảnh sắp chèn" style={{ width: `${imageWidth}%` }} />
            </div>
            <div className="image-insert-controls">
              <label htmlFor="image-width-range">
                Độ rộng hiển thị: <strong>{imageWidth}%</strong>
              </label>
              <input
                id="image-width-range"
                type="range"
                min="25"
                max="100"
                step="5"
                value={imageWidth}
                disabled={uploadingImage}
                onChange={(event) => setImageWidth(Number(event.target.value))}
              />
              <div className="image-size-presets">
                {[25, 50, 75, 100].map((size) => (
                  <button
                    key={size}
                    type="button"
                    disabled={uploadingImage}
                    className={imageWidth === size ? 'active' : ''}
                    onClick={() => setImageWidth(size)}
                  >
                    {size}%
                  </button>
                ))}
              </div>
            </div>
            <div className="image-insert-actions">
              <button type="button" className="secondary-btn" onClick={closeImageDialog} disabled={uploadingImage}>
                Hủy
              </button>
              <button
                type="button"
                className="primary-btn image-upload-submit"
                onClick={insertInlineImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <span className="image-upload-spinner" aria-hidden="true" /> Đang tải ảnh...
                  </>
                ) : pendingImage.mode === 'edit' ? (
                  <>Lưu thay đổi</>
                ) : (
                  <>
                    <ImageUp size={17} /> Tải lên và chèn ảnh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
