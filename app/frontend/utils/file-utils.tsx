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

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes - The file size in bytes
 * @returns Formatted string like "1.5MB" or "256.0KB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes == null) return ""
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

/**
 * Extracts the file extension from a filename or mime type
 * @param filename - The filename to extract extension from
 * @param mimeType - Optional mime type to determine extension
 * @returns Uppercase file extension like "PDF", "DOCX", etc.
 */
export const getFileExtension = (filename: string, mimeType?: string): string => {
  if (!filename) return "FILE"
  if (mimeType === "application/pdf") return "PDF"
  const ext = filename.split(".").pop()?.toUpperCase()
  return ext || "FILE"
}
