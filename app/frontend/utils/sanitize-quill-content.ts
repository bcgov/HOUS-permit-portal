import DOMPurify from "dompurify"

/**
 * Sanitizes HTML content from Quill editor to prevent XSS attacks.
 *
 * This function addresses CVE-2021-3163 (GHSA-4943-9vgg-gr5r), an XSS vulnerability
 * in Quill ≤ 1.3.7 where malicious JavaScript can be injected through crafted HTML
 * attributes like `onloadstart`, `onerror`, etc.
 *
 * @param htmlContent - The raw HTML string from Quill editor
 * @returns Sanitized HTML safe for rendering
 *
 * @example
 * ```tsx
 * const safeHtml = sanitizeQuillHtml(userProvidedContent)
 * <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
 * ```
 *
 * @security
 * This is a TEMPORARY mitigation until migration to TipTap (planned Q1-Q2 2026).
 * The vulnerability exists in the underlying Quill library which is no longer
 * actively maintained for version 1.x.
 *
 * Allowed elements: p, br, strong, em, u, ol, ul, li, a, h1-h6, blockquote
 * Allowed attributes: href (on <a>), target (on <a>), rel (on <a>), class
 * Blocked: All event handlers, javascript: protocol, data: URIs
 */
export function sanitizeQuillHtml(htmlContent: string | null | undefined): string {
  // Handle null/undefined cases
  if (!htmlContent) {
    return ""
  }

  // Configure DOMPurify with safe defaults for Quill content
  const config = {
    // Only allow HTML tags that Quill uses
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
      // Headers (in case your Quill config allows them)
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
      "class", // For Quill styling classes
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

      // Block javascript: and data: protocols explicitly
      if (href && (href.toLowerCase().startsWith("javascript:") || href.toLowerCase().startsWith("data:"))) {
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
 * Checks if Quill HTML content is effectively empty (only whitespace/empty tags).
 * This is useful for validation and conditional rendering.
 *
 * @param htmlContent - The HTML string to check
 * @returns true if content is empty or only whitespace
 *
 * @example
 * ```tsx
 * if (!isQuillContentEmpty(content)) {
 *   return <SafeQuillDisplay htmlContent={content} />
 * }
 * ```
 */
export function isQuillContentEmpty(htmlContent: string | null | undefined): boolean {
  if (!htmlContent) {
    return true
  }

  // Remove HTML tags and check if any actual content remains
  const textContent = htmlContent.replace(/<[^>]*>/g, "").trim()
  return textContent.length === 0
}
