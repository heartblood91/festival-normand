"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageUploadDialog } from "@/components/admin/image-upload-dialog"
import { useState } from "react"

type TiptapEditorProps = {
  content: string
  onChange: (content: string) => void
}

const ToolbarButton = ({
  icon: Icon,
  action,
  active,
  label,
}: {
  icon: typeof Bold
  action: () => void
  active: boolean
  label: string
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon-xs"
    onClick={action}
    data-active={active}
    className="size-8 rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500/50 data-[active=true]:bg-amber-500/20 data-[active=true]:text-amber-400"
    aria-label={label}
    aria-pressed={active}
  >
    <Icon className="h-4 w-4" />
  </Button>
)

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt("URL du lien :")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const onImageInsert = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run()
  }

  const addYoutube = () => {
    const url = window.prompt("URL de la vidéo YouTube :")
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run()
  }

  const inTable = editor.isActive("table")

  return (
    <>
      <div
        className="flex flex-wrap gap-0.5 border-b border-white/10 p-2"
        role="toolbar"
        aria-label="Barre d'outils de l'éditeur"
      >
        <div className="flex gap-0.5">
          <ToolbarButton
            icon={Bold}
            action={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            label="Gras"
          />
          <ToolbarButton
            icon={Italic}
            action={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            label="Italique"
          />
          <ToolbarButton
            icon={UnderlineIcon}
            action={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            label="Souligné"
          />
          <ToolbarButton
            icon={Strikethrough}
            action={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            label="Barré"
          />
        </div>

        <div className="mx-1 h-6 w-px bg-white/10" aria-hidden="true" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={Heading2}
            action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            label="Titre 2"
          />
          <ToolbarButton
            icon={Heading3}
            action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            label="Titre 3"
          />
        </div>

        <div className="mx-1 h-6 w-px bg-white/10" aria-hidden="true" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={List}
            action={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            label="Liste à puces"
          />
          <ToolbarButton
            icon={ListOrdered}
            action={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            label="Liste numérotée"
          />
          <ToolbarButton
            icon={Quote}
            action={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            label="Citation"
          />
          <ToolbarButton
            icon={Minus}
            action={() => editor.chain().focus().setHorizontalRule().run()}
            active={false}
            label="Séparateur"
          />
        </div>

        <div className="mx-1 h-6 w-px bg-white/10" aria-hidden="true" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={AlignLeft}
            action={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            label="Aligner à gauche"
          />
          <ToolbarButton
            icon={AlignCenter}
            action={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            label="Aligner au centre"
          />
          <ToolbarButton
            icon={AlignRight}
            action={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            label="Aligner à droite"
          />
          <ToolbarButton
            icon={AlignJustify}
            action={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            label="Justifier"
          />
        </div>

        <div className="mx-1 h-6 w-px bg-white/10" aria-hidden="true" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={TableIcon}
            action={insertTable}
            active={false}
            label="Insérer un tableau"
          />
          {inTable && (
            <ToolbarButton
              icon={Trash2}
              action={deleteTable}
              active={false}
              label="Supprimer le tableau"
            />
          )}
        </div>

        <div className="mx-1 h-6 w-px bg-white/10" aria-hidden="true" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={LinkIcon}
            action={addLink}
            active={editor.isActive("link")}
            label="Lien"
          />
          <ImageUploadDialog onInsert={onImageInsert} />
          <ToolbarButton icon={YoutubeIcon} action={addYoutube} active={false} label="YouTube" />
        </div>

        <div className="mx-1 h-6 w-px bg-white/10" aria-hidden="true" />

        <div className="flex gap-0.5">
          <ToolbarButton
            icon={Undo}
            action={() => editor.chain().focus().undo().run()}
            active={false}
            label="Annuler"
          />
          <ToolbarButton
            icon={Redo}
            action={() => editor.chain().focus().redo().run()}
            active={false}
            label="Rétablir"
          />
        </div>
      </div>
    </>
  )
}

export const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-amber-400 underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full rounded-lg" },
      }),
      Youtube.configure({
        HTMLAttributes: { class: "w-full aspect-video rounded-lg" },
        nocookie: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none p-4 min-h-[200px] focus:outline-none",
      },
    },
  })

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <style>{`
        .ProseMirror table {
          border-collapse: collapse;
        }
        .ProseMirror td,
        .ProseMirror th {
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px;
        }
      `}</style>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
