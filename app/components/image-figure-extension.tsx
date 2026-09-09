"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Trash2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

type FloatValue = "none" | "left" | "right";

const FLOAT_STYLE: Record<FloatValue, React.CSSProperties> = {
  none: { display: "block", width: "100%", margin: "1.5rem 0" },
  left: { float: "left", width: "42%", margin: "0.25rem 1.5rem 1rem 0", clear: "left" },
  right: { float: "right", width: "42%", margin: "0.25rem 0 1rem 1.5rem", clear: "right" },
};

function ImageFigureNodeView({ node, editor, updateAttributes, deleteNode }: NodeViewProps) {
  const { src, alt, caption, float: floatVal = "none" } = node.attrs as {
    src: string;
    alt: string;
    caption: string;
    float: FloatValue;
  };

  return (
    <NodeViewWrapper
      contentEditable={false}
      className="not-prose relative group"
      style={FLOAT_STYLE[floatVal]}
    >
      {/* Position toolbar — edit mode only, appears on hover */}
      {editor.isEditable && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
          <button
            type="button"
            onClick={() => updateAttributes({ float: "left" })}
            title="Float left"
            className={`p-1 rounded transition cursor-pointer ${floatVal === "left" ? "bg-[#141414] text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <AlignLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ float: "none" })}
            title="Full width"
            className={`p-1 rounded transition cursor-pointer ${floatVal === "none" ? "bg-[#141414] text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <AlignCenter className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ float: "right" })}
            title="Float right"
            className={`p-1 rounded transition cursor-pointer ${floatVal === "right" ? "bg-[#141414] text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <AlignRight className="w-3 h-3" />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-0.5" />
          <button
            type="button"
            onClick={deleteNode}
            title="Delete"
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ""}
        className="w-full rounded-xl shadow-[0_4px_20px_rgba(20,20,20,0.13)] object-cover"
      />

      {/* Caption */}
      {editor.isEditable ? (
        <input
          value={caption ?? ""}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Add caption…"
          className="w-full mt-1.5 text-xs text-center text-gray-400 bg-transparent border-none outline-none placeholder:text-gray-300 focus:text-gray-600 font-techstack italic"
        />
      ) : (
        caption && (
          <figcaption className="text-xs text-center text-gray-400 italic mt-1.5 font-techstack">
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
      float: { default: "none" },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-type="image-figure"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption, float: floatVal, ...rest } = HTMLAttributes as {
      src: string;
      alt: string;
      caption: string;
      float: FloatValue;
      [key: string]: unknown;
    };
    return [
      "figure",
      mergeAttributes(rest, { "data-type": "image-figure", "data-float": floatVal ?? "none" }),
      ["img", { src, alt: alt || "" }],
      ...(caption ? [["figcaption", {}, caption]] : []),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageFigureNodeView);
  },
});
