import Uppy, { UppyFile } from "@uppy/core"
import XHRUpload from "@uppy/xhr-upload"
import { useEffect, useRef, useState } from "react"
import { getCsrfToken } from "../utils/utility-functions"

interface UseUppyTransientProps {
  onUploadSuccess?: (file: UppyFile<{}, {}>, response: any) => void
  onUploadError?: (file: UppyFile<{}, {}>, error: UppyError, response: any) => void
  onFileAdded?: (file: UppyFile<{}, {}>) => void
  onFileRemoved?: (file: UppyFile<{}, {}>) => void
  onUploadStart?: () => void
  maxNumberOfFiles?: number
  autoProceed?: boolean
  allowedFileTypes?: string[]
  endpoint: string
}

interface UppyError {
  name: string
  message: string
  details?: string
  source?: XMLHttpRequest
}

const useUppyTransient = ({
  onUploadSuccess,
  onUploadError,
  onFileAdded,
  onFileRemoved,
  onUploadStart,
  maxNumberOfFiles = 1,
  autoProceed = false,
  allowedFileTypes,
  endpoint,
}: UseUppyTransientProps) => {
  const callbacks = useRef({
    onUploadSuccess,
    onUploadError,
    onFileAdded,
    onFileRemoved,
    onUploadStart,
  })

  useEffect(() => {
    callbacks.current = {
      onUploadSuccess,
      onUploadError,
      onFileAdded,
      onFileRemoved,
      onUploadStart,
    }
  })

  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        ...(allowedFileTypes && { allowedFileTypes }),
      },
      autoProceed,
      allowMultipleUploadBatches: true,
      debug: process.env.NODE_ENV === "development",
    })
      .use(XHRUpload, {
        endpoint,
        fieldName: "file",
        formData: true,
        headers: () => ({
          "X-CSRF-Token": getCsrfToken(),
          Accept: "application/json",
        }),
        getResponseData: (xhr: XMLHttpRequest) => {
          return JSON.parse(xhr.responseText)
        },
      })
      .on("file-added", (file) => {
        callbacks.current.onFileAdded?.(file)
      })
      .on("file-removed", (file) => {
        callbacks.current.onFileRemoved?.(file)
      })
      .on("upload", () => {
        callbacks.current.onUploadStart?.()
      })
      // @ts-ignore - upload-retry event exists in Uppy but might not be in types
      .on("upload-retry", () => {
        callbacks.current.onUploadStart?.()
      })
      .on("upload-success", (file: UppyFile<{}, {}>, response) => {
        console.log("[UppyEvent] upload-success:", file?.name, "Uppy response:", response)
        callbacks.current.onUploadSuccess?.(file, response)
      })
      .on("upload-error", (file: UppyFile<{}, {}>, error: UppyError, response: any) => {
        console.error("[UppyEvent] upload-error:", file?.name, error, "Uppy response:", response)
        callbacks.current.onUploadError?.(file, error, response)
      })
  )
  return uppy
}

export default useUppyTransient
