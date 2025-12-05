import Uppy, { UppyFile } from "@uppy/core"
import XHRUpload from "@uppy/xhr-upload"
import { useState } from "react"
import { getCsrfToken } from "../utils/utility-functions"

// Usage example:
// const uppy = useUppyTransient({
//     endpoint: '/api/digital_seal_validator',
//     onUploadSuccess: (file, response) => {
//       // response.body contains your { status: "success", signatures: ... }
//       console.log("Validation result:", response.body)
//     },
//     allowedFileTypes: ['.pdf', '.png', '.jpg'], // Optional restrictions
//   })

interface UseUppyTransientProps {
  onUploadSuccess?: (file: UppyFile<{}, {}>, response: any) => void
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
  maxNumberOfFiles = 1,
  autoProceed = false,
  allowedFileTypes,
  endpoint,
}: UseUppyTransientProps) => {
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
      .on("upload-success", (file: UppyFile<{}, {}>, response) => {
        console.log("[UppyEvent] upload-success:", file?.name, "Uppy response:", response)
        if (onUploadSuccess) {
          onUploadSuccess(file, response)
        }
      })
      .on("upload-error", (file: UppyFile<{}, {}>, error: UppyError, response: any) => {
        console.error("[UppyEvent] upload-error:", file?.name, error, "Uppy response:", response)
      })
  )
  return uppy
}

export default useUppyTransient
