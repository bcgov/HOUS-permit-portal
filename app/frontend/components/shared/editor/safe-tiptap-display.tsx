import { Box, BoxProps } from "@chakra-ui/react"
import React from "react"
import { sanitizeTipTapHtml } from "../../../utils/sanitize-tiptap-content"

export interface SafeTipTapDisplayProps extends Omit<BoxProps, "dangerouslySetInnerHTML"> {
  /**
   * The HTML content from TipTap editor to display.
   * Will be sanitized before rendering to prevent XSS attacks.
   */
  htmlContent: string | null | undefined

  /**
   * Optional test ID for testing purposes
   */
  "data-testid"?: string
}

/**
 * SafeTipTapDisplay - A secure wrapper component for displaying TipTap editor content
 *
 * This component sanitizes HTML content from TipTap editors before rendering to prevent XSS attacks.
 *
 * @security
 * Always use this component instead of directly rendering editor HTML with dangerouslySetInnerHTML.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SafeTipTapDisplay htmlContent={requirement.instructions} />
 *
 * // With styling
 * <SafeTipTapDisplay
 *   htmlContent={requirement.helperText}
 *   className="helper-text"
 *   fontSize="sm"
 *   color="gray.600"
 * />
 *
 * // With custom container props (uses Chakra Box props)
 * <SafeTipTapDisplay
 *   htmlContent={content}
 *   p={4}
 *   bg="gray.50"
 *   borderRadius="md"
 * />
 * ```
 *
 * @component
 */
export const SafeTipTapDisplay: React.FC<SafeTipTapDisplayProps> = ({
  htmlContent,
  "data-testid": dataTestId,
  ...boxProps
}) => {
  // Sanitize the content
  const sanitizedHtml = sanitizeTipTapHtml(htmlContent)

  // Don't render anything if content is empty
  if (!sanitizedHtml) {
    return null
  }

  return (
    <Box
      {...boxProps}
      data-testid={dataTestId || "safe-tiptap-display"}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      overflowY="auto"
      overflowX="hidden"
      // Add default styling that matches Quill's output
      sx={{
        // Preserve default text formatting
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
        "& ol.paren-alpha": {
          listStyle: "none",
          counterReset: "paren-alpha-counter",
          paddingLeft: "2.5em",
          "& > li": {
            counterIncrement: "paren-alpha-counter",
            position: "relative",
            "&::before": {
              content: '"(" counter(paren-alpha-counter, lower-alpha) ")"',
              position: "absolute",
              left: "-2.5em",
              width: "2em",
              textAlign: "right",
            },
          },
        },
        "& ol.paren-roman": {
          listStyle: "none",
          counterReset: "paren-roman-counter",
          paddingLeft: "2.5em",
          "& > li": {
            counterIncrement: "paren-roman-counter",
            position: "relative",
            "&::before": {
              content: '"(" counter(paren-roman-counter, lower-roman) ")"',
              position: "absolute",
              left: "-2.5em",
              width: "2em",
              textAlign: "right",
            },
          },
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
 * SafeTipTapDisplayInline - A variant for inline display without block-level spacing
 *
 * Useful when you need to display editor content inline with other content,
 * without the default block-level spacing.
 *
 * @example
 * ```tsx
 * <Text>
 *   Requirement: <SafeTipTapDisplayInline htmlContent={req.shortDescription} />
 * </Text>
 * ```
 */
export const SafeTipTapDisplayInline: React.FC<SafeTipTapDisplayProps> = ({
  htmlContent,
  "data-testid": dataTestId,
  ...boxProps
}) => {
  const sanitizedHtml = sanitizeTipTapHtml(htmlContent)

  if (!sanitizedHtml) {
    return null
  }

  return (
    <Box
      as="span"
      {...boxProps}
      data-testid={dataTestId || "safe-tiptap-display-inline"}
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
