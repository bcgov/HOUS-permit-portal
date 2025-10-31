import { Text as PDFText, TextProps } from "@react-pdf/renderer"
import React from "react"

/**
 * A wrapper around @react-pdf/renderer Text that automatically
 * replaces null, undefined, or empty string values with an em dash (—).
 */
export const Text: React.FC<TextProps & { children?: React.ReactNode }> = ({ children, ...props }) => {
  const isEmpty =
    children == null ||
    children === "null" ||
    children === "undefined" ||
    (typeof children === "string" && children.trim() === "")

  return <PDFText {...props}>{isEmpty ? "-" : children}</PDFText>
}
