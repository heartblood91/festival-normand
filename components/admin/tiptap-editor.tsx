"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import Underline from "@tiptap/extension-underline"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"

type TiptapEditorProps = {
  content: string
  onChange: (content: string) => void
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt("URL du lien :")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt("URL de l'image :")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addYoutube = () => {
    const url = window.prompt("URL de la vidéo YouTube :")
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), label: "Gras" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), label: "Italique" },
    { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), label: "Souligné" },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike"), label: "Barré" },
    { type: "separator" as const },
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), label: "Titre 1" },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), label: "Titre 2" },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), label: "Titre 3" },
    { type: "separator" as const },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), label: "Liste à puces" },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), label: "Liste numérotée" },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), label: "Citation" },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false, label: "Séparateur" },
    { type: "separator" as const },
    { icon: LinkIcon, action: addLink, active: editor.isActive("link"), label: "Lien" },
    { icon: ImageIcon, action: addImage, active: false, label: "Image" },
    { icon: YoutubeIcon, action: addYoutube, active: false, label: "YouTube" },
    { type: "separator" as const },
    { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false, label: "Annuler" },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false, label: "Rétablir" },
  ]

  return (
    <div className="flex flex-wrap gap-0.5 border-b border-white/10 p-2" role="toolbar" aria-label="Barre d'outils de l'éditeur">
      {buttons.map((btn, i) => {
        if ("type" in btn && btn.type === "separator") {
          return <div key={i} className="mx-1 w-px self-stretch bg-white/10" />
        }
        const { icon: Icon, action, active, label } = btn as { icon: typeof Bold; action: () => void; active: boolean; label: string }
        return (
          <Button
            key={i}
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={action}
            className={`h-8 w-8 ${active ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white"}`}
            aria-label={label}
            aria-pressed={active}
          >
            <Icon className="h-4 w-4" />
          </Button>
        )
      })}
    </div>
  )
}

export const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
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
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
