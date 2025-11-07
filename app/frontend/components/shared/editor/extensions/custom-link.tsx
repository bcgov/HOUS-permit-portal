import { mergeAttributes } from "@tiptap/core"
import { Link } from "@tiptap/extension-link"

/**
 * Custom Link extension that automatically adds target="_blank" and rel="noopener noreferrer"
 * to all links, and supports data-* attributes similar to the previous CustomLinkBlot.
 */
export const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      href: {
        default: null,
      },
      target: {
        default: "_blank",
      },
      rel: {
        default: "noopener noreferrer",
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
      0,
    ]
  },
})
