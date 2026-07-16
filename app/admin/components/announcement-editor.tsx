"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";

interface AnnouncementEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarBtn({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition cursor-pointer ${
        active
          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm"
          : "text-gray-500 hover:bg-white/60 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export function AnnouncementEditor({ value, onChange, placeholder }: AnnouncementEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: placeholder ?? "Write your announcement here…" }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-amber-600 underline" },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none font-techstack text-gray-800",
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/60 overflow-hidden shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-white/50 bg-white/40 sticky top-0 z-10">
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-gray-200/80 mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-gray-200/80 mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-gray-200/80 mx-1" />

        <ToolbarBtn onClick={setLink} active={editor.isActive("link")} title="Add / remove link">
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
