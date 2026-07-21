"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Trash2 } from "lucide-react";

function ImageFigureNodeView({ node, editor, updateAttributes, deleteNode }: NodeViewProps) {
  const { src, alt, caption } = node.attrs as { src: string; alt: string; caption: string };

  return (
    <NodeViewWrapper contentEditable={false} className="relative group my-6 not-prose">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ""}
        className="w-full rounded-2xl shadow-[0_6px_24px_rgba(20,20,20,0.12)] object-cover"
      />
      {editor.isEditable ? (
        <>
          <input
            value={caption ?? ""}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Add caption (optional)…"
            className="w-full mt-2 text-sm text-center text-gray-400 bg-transparent border-none outline-none px-4 placeholder:text-gray-300 focus:text-gray-600 font-techstack"
          />
          <button
            type="button"
            onClick={deleteNode}
            className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        caption && (
          <figcaption className="text-sm text-center text-gray-500 italic mt-2 px-4 font-techstack">
            {caption}
          </figcaption>
        )
      )}
    </NodeViewWrapper>
  );
}

export const ImageFigureExtension = Node.create({
  name: "imageFigure",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-type="image-figure"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption, ...rest } = HTMLAttributes as {
      src: string;
      alt: string;
      caption: string;
      [key: string]: unknown;
    };
    return [
      "figure",
      mergeAttributes(rest, { "data-type": "image-figure" }),
      ["img", { src, alt: alt || "" }],
      ...(caption ? [["figcaption", {}, caption]] : []),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageFigureNodeView);
  },
});
