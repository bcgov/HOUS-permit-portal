import DOMPurify from "dompurify"

/**
 * Sanitizes HTML content from TipTap editor to prevent XSS attacks.
 *
 * This function sanitizes HTML content to prevent XSS attacks through malicious HTML
 * attributes like `onloadstart`, `onerror`, etc.
 *
 * @param htmlContent - The raw HTML string from TipTap editor
 * @returns Sanitized HTML safe for rendering
 *
 * @example
 * ```tsx
 * const safeHtml = sanitizeTipTapHtml(userProvidedContent)
 * <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
 * ```
 *
 * @security
 * Always sanitize HTML content before rendering to prevent XSS attacks.
 *
 * Allowed elements: p, br, strong, em, u, ol, ul, li, a, h1-h6, blockquote
 * Allowed attributes: href (on <a>), target (on <a>), rel (on <a>), class
 * Blocked: All event handlers, dangerous protocols (javascript:, data:, vbscript:, file:, about:)
 */
export function sanitizeTipTapHtml(htmlContent: string | null | undefined): string {
  // Handle null/undefined cases
  if (!htmlContent) {
    return ""
  }

  // Configure DOMPurify with safe defaults for TipTap content
  const config = {
    // Only allow HTML tags that TipTap uses
    ALLOWED_TAGS: [
      // Text formatting
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s", // strikethrough
      "span",
      // Lists
      "ol",
      "ul",
      "li",
      // Links
      "a",
      // Headers (in case your TipTap config allows them)
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      // Block elements
      "blockquote",
      "pre",
      "code",
    ],

    // Only allow safe attributes
    ALLOWED_ATTR: [
      "href", // For links
      "target", // For links (will be validated)
      "rel", // For links (noopener noreferrer)
      "class", // For TipTap styling classes
    ],

    // Additional security options
    ALLOW_DATA_ATTR: false, // Block data-* attributes
    ALLOW_UNKNOWN_PROTOCOLS: false, // Block unknown protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i, // Only allow safe protocols
  }

  // Add hook for additional link validation
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    // Ensure links open in new tab with secure attributes
    if (node.tagName === "A") {
      const href = node.getAttribute("href")

      // Block dangerous protocols explicitly (defense-in-depth)
      // DOMPurify should catch these, but we add explicit checks as backup
      const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:", "about:"]
      if (href && dangerousProtocols.some((protocol) => href.toLowerCase().startsWith(protocol))) {
        node.removeAttribute("href")
      }

      // Force secure link behavior
      if (href && !href.startsWith("#")) {
        node.setAttribute("target", "_blank")
        node.setAttribute("rel", "noopener noreferrer")
      }
    }
  })

  const sanitized = DOMPurify.sanitize(htmlContent, config)

  // Remove the hook after use to avoid accumulation
  DOMPurify.removeHook("afterSanitizeAttributes")

  return sanitized
}

/**
 * Checks if editor HTML content is effectively empty (only whitespace/empty tags).
 * This is useful for validation and conditional rendering.
 *
 * @param htmlContent - The HTML string to check
 * @returns true if content is empty or only whitespace
 *
 * @example
 * ```tsx
 * if (!isTipTapContentEmpty(content)) {
 *   return <SafeTipTapDisplay htmlContent={content} />
 * }
 * ```
 */
export function isTipTapContentEmpty(htmlContent: string | null | undefined): boolean {
  if (!htmlContent) {
    return true
  }

  // Safely extract text content using DOMPurify to handle incomplete tags
  // This prevents XSS by ensuring all HTML (including incomplete tags like <script) is removed
  // Use DOMPurify with no allowed tags to strip all HTML and get plain text
  const textOnly = DOMPurify.sanitize(htmlContent, { ALLOWED_TAGS: [] })
  const textContent = textOnly.trim()
  return textContent.length === 0
}
