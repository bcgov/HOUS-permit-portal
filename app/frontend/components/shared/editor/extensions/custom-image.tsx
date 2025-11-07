import { mergeAttributes } from "@tiptap/core"
import { Image } from "@tiptap/extension-image"

/**
 * Custom Image extension that supports data-* attributes and alt text,
 * similar to the previous CustomImageBlot.
 */
export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: "Editor Embedded Image",
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    // TipTap will preserve any additional attributes including data-* attributes
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, {
        src: HTMLAttributes.src,
        alt: HTMLAttributes.alt || "Editor Embedded Image",
        ...HTMLAttributes, // Preserve all other attributes including data-*
      }),
    ]
  },
})
