"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  MessageSquareQuote,
  X,
  Check,
  Upload,
  Loader2,
} from "lucide-react";
import { PersonQuoteExtension } from "@/app/components/person-quote-extension";

interface ArticleEditorProps {
  content: object;
  onChange: (content: object) => void;
}

const emptyQuote = { quote: "", authorName: "", authorRole: "", authorPhoto: "" };

function ToolbarButton({
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
        active ? "bg-[#141414] text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

export function ArticleEditor({ content, onChange }: ArticleEditorProps) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteFields, setQuoteFields] = useState(emptyQuote);
  const [photoUploading, setPhotoUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: "Start writing your article…" }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[#141414] underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      PersonQuoteExtension,
    ],
    content: Object.keys(content).length ? content : undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[400px] px-5 py-4 focus:outline-none font-techstack",
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const url = window.prompt("URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else editor.chain().focus().unsetLink().run();
  };

  const insertQuote = () => {
    editor.chain().focus().insertContent({ type: "personQuote", attrs: quoteFields }).run();
    setQuoteFields(emptyQuote);
    setQuoteOpen(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const { url } = await res.json();
      setQuoteFields((f) => ({ ...f, authorPhoto: url }));
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)] overflow-hidden">
      {/* Toolbar — always visible */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-white sticky top-0 z-10">
        {/* History */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="H1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="H2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="H3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Inline formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Media */}
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Add link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Add image (URL)">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => setQuoteOpen((v) => !v)}
          active={quoteOpen}
          title="Insert person quote"
        >
          <MessageSquareQuote className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Person quote form */}
      {quoteOpen && (
        <div className="border-b border-gray-100 bg-[#FAFAF9] px-4 py-3 space-y-2">
          <p className="text-xs font-grotesk text-gray-500 uppercase tracking-wide">Insert quote</p>
          <textarea
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-techstack resize-none focus:outline-none focus:border-[#141414] bg-white"
            rows={2}
            placeholder="Quote text…"
            value={quoteFields.quote}
            onChange={(e) => setQuoteFields((f) => ({ ...f, quote: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 font-techstack focus:outline-none focus:border-[#141414] bg-white"
              placeholder="Author name"
              value={quoteFields.authorName}
              onChange={(e) => setQuoteFields((f) => ({ ...f, authorName: e.target.value }))}
            />
            <input
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 font-techstack focus:outline-none focus:border-[#141414] bg-white"
              placeholder="Role in company"
              value={quoteFields.authorRole}
              onChange={(e) => setQuoteFields((f) => ({ ...f, authorRole: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-techstack text-gray-600 hover:border-[#141414] transition">
              {photoUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {photoUploading ? "Uploading…" : "Upload photo (optional)"}
            </div>
            {quoteFields.authorPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={quoteFields.authorPhoto} alt="" className="w-8 h-8 rounded-full object-cover" />
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} />
          </label>
          <div className="flex gap-2 pt-0.5">
            <button
              type="button"
              onClick={insertQuote}
              disabled={!quoteFields.quote || !quoteFields.authorName}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] text-white text-sm rounded-lg font-grotesk disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" /> Insert
            </button>
            <button
              type="button"
              onClick={() => { setQuoteOpen(false); setQuoteFields(emptyQuote); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-sm rounded-lg font-grotesk text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Editor area — fixed height, scrolls internally */}
      <div className="overflow-y-auto max-h-[480px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
