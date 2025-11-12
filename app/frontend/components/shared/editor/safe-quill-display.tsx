import { Box, BoxProps } from "@chakra-ui/react"
import React from "react"
import { sanitizeQuillHtml } from "../../../utils/sanitize-quill-content"

export interface SafeQuillDisplayProps extends Omit<BoxProps, "dangerouslySetInnerHTML"> {
  /**
   * The HTML content from Quill editor to display.
   * Will be sanitized before rendering to prevent XSS attacks.
   */
  htmlContent: string | null | undefined

  /**
   * Optional test ID for testing purposes
   */
  "data-testid"?: string
}

/**
 * SafeQuillDisplay - A secure wrapper component for displaying Quill editor content
 *
 * This component sanitizes HTML content from Quill editors before rendering to mitigate
 * the XSS vulnerability (CVE-2021-3163 / GHSA-4943-9vgg-gr5r) in Quill ≤ 1.3.7.
 *
 * @security
 * This is a TEMPORARY mitigation until migration to TipTap (planned Q1-Q2 2026).
 * Always use this component instead of directly rendering Quill HTML with dangerouslySetInnerHTML.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SafeQuillDisplay htmlContent={requirement.instructions} />
 *
 * // With styling
 * <SafeQuillDisplay
 *   htmlContent={requirement.helperText}
 *   className="helper-text"
 *   fontSize="sm"
 *   color="gray.600"
 * />
 *
 * // With custom container props (uses Chakra Box props)
 * <SafeQuillDisplay
 *   htmlContent={content}
 *   p={4}
 *   bg="gray.50"
 *   borderRadius="md"
 * />
 * ```
 *
 * @component
 */
export const SafeQuillDisplay: React.FC<SafeQuillDisplayProps> = ({
  htmlContent,
  "data-testid": dataTestId,
  ...boxProps
}) => {
  // Sanitize the content
  const sanitizedHtml = sanitizeQuillHtml(htmlContent)

  // Don't render anything if content is empty
  if (!sanitizedHtml) {
    return null
  }

  return (
    <Box
      {...boxProps}
      data-testid={dataTestId || "safe-quill-display"}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      overflowY="auto"
      overflowX="hidden"
      // Add default styling that matches Quill's output
      sx={{
        // Preserve Quill's default text formatting
        "& p": {
          marginBottom: "1em",
          "&:last-child": {
            marginBottom: 0,
          },
        },
        "& strong": {
          fontWeight: "bold",
        },
        "& em": {
          fontStyle: "italic",
        },
        "& u": {
          textDecoration: "underline",
        },
        "& s": {
          textDecoration: "line-through",
        },
        // List styling
        "& ol, & ul": {
          paddingLeft: "1.5em",
          marginBottom: "1em",
        },
        "& li": {
          marginBottom: "0.5em",
        },
        // Link styling
        "& a": {
          color: "blue.600",
          textDecoration: "underline",
          "&:hover": {
            color: "blue.800",
          },
        },
        // Blockquote styling
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "gray.300",
          paddingLeft: "1em",
          marginLeft: 0,
          fontStyle: "italic",
          color: "gray.700",
        },
        // Code styling
        "& code": {
          backgroundColor: "gray.100",
          padding: "0.2em 0.4em",
          borderRadius: "3px",
          fontSize: "0.9em",
          fontFamily: "monospace",
        },
        "& pre": {
          backgroundColor: "gray.100",
          padding: "1em",
          borderRadius: "4px",
          overflow: "auto",
          "& code": {
            backgroundColor: "transparent",
            padding: 0,
          },
        },
        // Override any box props styling
        ...boxProps.sx,
      }}
    />
  )
}

/**
 * SafeQuillDisplayInline - A variant for inline display without block-level spacing
 *
 * Useful when you need to display Quill content inline with other content,
 * without the default block-level spacing.
 *
 * @example
 * ```tsx
 * <Text>
 *   Requirement: <SafeQuillDisplayInline htmlContent={req.shortDescription} />
 * </Text>
 * ```
 */
export const SafeQuillDisplayInline: React.FC<SafeQuillDisplayProps> = ({
  htmlContent,
  "data-testid": dataTestId,
  ...boxProps
}) => {
  const sanitizedHtml = sanitizeQuillHtml(htmlContent)

  if (!sanitizedHtml) {
    return null
  }

  return (
    <Box
      as="span"
      {...boxProps}
      data-testid={dataTestId || "safe-quill-display-inline"}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      sx={{
        display: "inline",
        overflowY: "auto",
        overflowX: "hidden",
        "& p": {
          display: "inline",
          margin: 0,
        },
        "& strong": {
          fontWeight: "bold",
        },
        "& em": {
          fontStyle: "italic",
        },
        "& u": {
          textDecoration: "underline",
        },
        "& a": {
          color: "blue.600",
          textDecoration: "underline",
        },
        ...boxProps.sx,
      }}
    />
  )
}
