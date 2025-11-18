import { FileDoc, FileImage, FilePdf, FileText, FileXls } from "@phosphor-icons/react"
import React from "react"

export interface FileTypeInfo {
  icon: React.ReactElement
  label: string
}

/**
 * Determines the file type information based on the MIME type
 * Returns an appropriate icon and label for display
 */
export const getFileTypeInfo = (mimeType?: string): FileTypeInfo => {
  if (!mimeType) {
    return { icon: <FileText />, label: "FILE" }
  }

  // PDF files
  if (mimeType === "application/pdf") {
    return { icon: <FilePdf />, label: "PDF" }
  }

  // Image files
  if (mimeType.startsWith("image/")) {
    return { icon: <FileImage />, label: "IMAGE" }
  }

  // Word documents
  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return { icon: <FileDoc />, label: "WORD" }
  }

  // Excel files
  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return { icon: <FileXls />, label: "EXCEL" }
  }

  // Default for any other file type
  return { icon: <FileText />, label: "FILE" }
}
