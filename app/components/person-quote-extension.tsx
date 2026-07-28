"use client";

import { useState } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface QuoteAttrs {
  quote: string;
  authorName: string;
  authorRole: string;
  authorPhoto: string;
}

export function PersonQuoteCard({ quote, authorName, authorRole, authorPhoto }: QuoteAttrs) {
  return (
    <div className="my-6 not-prose">
      {/* Top row: avatar + card on the same line */}
      <div className="flex items-center gap-0">
        <div className="shrink-0 w-16 z-10 -mr-4 flex justify-center">
          {authorPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorPhoto}
              alt={authorName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-[0_6px_20px_rgba(20,20,20,0.18)]"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#141414] flex items-center justify-center text-white font-grotesk text-base border-2 border-white shadow-[0_6px_20px_rgba(20,20,20,0.18)]">
              {authorName?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)] border-l-4 border-[#FFC600] pl-7 pr-5 py-4 transition-all duration-200 ease-out hover:scale-[1.015] hover:shadow-[0_8px_24px_rgba(20,20,20,0.13),0_2px_6px_rgba(20,20,20,0.07)]">
          <p className="text-gray-600 font-techstack text-sm italic leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>

      {/* Footnote below */}
      <div className="mt-2 pl-4 flex flex-col gap-0.5">
        <span className="text-xs font-grotesk text-[#141414]">{authorName}</span>
        <span className="text-[11px] font-techstack text-[#141414]">{authorRole}</span>
      </div>
    </div>
  );
}

function PersonQuoteNodeView({ node, editor, updateAttributes, deleteNode }: NodeViewProps) {
  const attrs = node.attrs as QuoteAttrs;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<QuoteAttrs>(attrs);

  const save = () => {
    updateAttributes(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(attrs);
    setEditing(false);
  };

  const stop = (e: React.KeyboardEvent) => e.stopPropagation();

  return (
    <NodeViewWrapper contentEditable={false} className="relative group my-4">
      {editing ? (
        <div className="bg-white border-2 border-[#FFC600] rounded-2xl p-4 space-y-2.5 not-prose">
          <textarea
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-techstack resize-none focus:outline-none focus:border-[#141414]"
            rows={3}
            placeholder="Quote text…"
            value={draft.quote}
            onChange={(e) => setDraft((d) => ({ ...d, quote: e.target.value }))}
            onKeyDown={stop}
          />
          <input
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-techstack focus:outline-none focus:border-[#141414]"
            placeholder="Author name"
            value={draft.authorName}
            onChange={(e) => setDraft((d) => ({ ...d, authorName: e.target.value }))}
            onKeyDown={stop}
          />
          <input
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-techstack focus:outline-none focus:border-[#141414]"
            placeholder="Role in company"
            value={draft.authorRole}
            onChange={(e) => setDraft((d) => ({ ...d, authorRole: e.target.value }))}
            onKeyDown={stop}
          />
          <input
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-techstack focus:outline-none focus:border-[#141414]"
            placeholder="Photo URL (optional)"
            value={draft.authorPhoto}
            onChange={(e) => setDraft((d) => ({ ...d, authorPhoto: e.target.value }))}
            onKeyDown={stop}
          />
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={save}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] text-white text-sm rounded-lg font-grotesk cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
            <button
              type="button"
              onClick={cancel}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-sm rounded-lg font-grotesk text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <PersonQuoteCard
            quote={attrs.quote}
            authorName={attrs.authorName}
            authorRole={attrs.authorRole}
            authorPhoto={attrs.authorPhoto}
          />
          {editor.isEditable && (
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => {
                  setDraft(attrs);
                  setEditing(true);
                }}
                className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-[#141414] cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={deleteNode}
                className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </NodeViewWrapper>
  );
}

export const PersonQuoteExtension = Node.create({
  name: "personQuote",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      quote: { default: "" },
      authorName: { default: "" },
      authorRole: { default: "" },
      authorPhoto: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="person-quote"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "person-quote" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PersonQuoteNodeView);
  },
});
