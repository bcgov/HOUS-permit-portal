// src/hooks/useUppyS3.ts
import AwsS3 from "@uppy/aws-s3"
import Uppy, { UppyFile } from "@uppy/core"
import { useState } from "react"

interface UseUppyS3Props {
  onUploadSuccess?: (file: UppyFile<{}, {}>, response: any) => void
  maxNumberOfFiles?: number
  autoProceed?: boolean
}

interface UppyError {
  name: string
  message: string
  details?: string
  source?: XMLHttpRequest
}

const useUppyS3 = ({ onUploadSuccess, maxNumberOfFiles = 1, autoProceed = false }: UseUppyS3Props = {}) => {
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: { maxNumberOfFiles },
      autoProceed,
      allowMultipleUploadBatches: true,
      debug: process.env.NODE_ENV === "development",
    })
      .use(
        AwsS3,
        //@ts-ignore
        {
          async getUploadParameters(file) {
            try {
              const params = new URLSearchParams({
                filename: file.name,
                type: file.type,
                size: file.size.toString(),
              })

              const response = await fetch(`/api/s3/params?${params.toString()}`, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              })

              if (!response.ok) {
                throw new Error(`Failed to get presigned URL: ${response.statusText}`)
              }

              const data = await response.json()
              console.log("Presigned URL response:", data)

              if (!data.signed_url) {
                throw new Error("No signed URL received from server")
              }

              return {
                method: data.method || "PUT",
                url: data.signed_url,
                fields: data.fields || {},
                headers: {
                  ...data.headers,
                  "Content-Type": file.type,
                },
              }
            } catch (error) {
              console.error("Error getting upload parameters:", error)
              throw error
            }
          },
        }
      )
      .on("upload-success", (file: UppyFile<{}, {}>, response) => {
        console.log("Upload successful for file:", file.name)
        console.log("Server response:", response)

        if (onUploadSuccess) {
          onUploadSuccess(file, response)
        }
      })
      .on("upload-error", (file: UppyFile<{}, {}>, error: UppyError) => {
        console.error("Upload error for file:", file.name)
        console.error("Error details:", error)
        if (error.source && error.source instanceof XMLHttpRequest) {
          console.error("XHR Status:", error.source.status)
          console.error("XHR Status Text:", error.source.statusText)
          console.error("XHR Response:", error.source.response)
        }
      })
  )
  return uppy
}

export default useUppyS3
