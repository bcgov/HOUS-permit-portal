// src/hooks/useUppyS3.ts
import AwsS3 from "@uppy/aws-s3"
import Uppy, { UppyFile } from "@uppy/core"
import { useState } from "react"
import {
  FILE_UPLOAD_CHUNK_SIZE_IN_BYTES,
  FILE_UPLOAD_MAX_SIZE,
} from "../components/shared/chefs/additional-formio/constant"
import { getCsrfToken } from "../utils/utility-functions"

// Calculate max file size in bytes
const MAX_FILE_SIZE_BYTES = FILE_UPLOAD_MAX_SIZE * 1024 * 1024

interface UseUppyS3Props {
  onUploadSuccess?: (file: UppyFile<{}, {}>, response: any) => void
  maxNumberOfFiles?: number
  autoProceed?: boolean
  maxFileSizeMB?: number
  allowedFileTypes?: string[]
}

interface UppyError {
  name: string
  message: string
  details?: string
  source?: XMLHttpRequest
}

const useUppyS3 = ({
  onUploadSuccess,
  maxNumberOfFiles = 1,
  autoProceed = false,
  maxFileSizeMB,
  allowedFileTypes,
}: UseUppyS3Props = {}) => {
  const maxFileSize = maxFileSizeMB ? maxFileSizeMB * 1024 * 1024 : MAX_FILE_SIZE_BYTES
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        ...(allowedFileTypes && { allowedFileTypes }),
      },
      autoProceed,
      allowMultipleUploadBatches: true,
      debug: process.env.NODE_ENV === "development",
    })
      .use(AwsS3, {
        // For single-part uploads (non-multipart)
        async getUploadParameters(file) {
          console.log("[UppyAwsS3] getUploadParameters for single part called for:", file.name)
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
              throw new Error(`Failed to get presigned URL: ${response.statusText} (${response.status})`)
            }
            const data = await response.json()
            if (!data.signed_url) {
              throw new Error("No signed_url received from /api/s3/params")
            }
            return {
              method: data.method || "PUT",
              url: data.signed_url, // This is the S3 presigned URL
              fields: data.fields || {}, // For POST uploads, typically empty for PUT
              headers: { ...data.headers, "Content-Type": file.type },
            }
          } catch (error) {
            console.error("[UppyAwsS3] Error in getUploadParameters:", error)
            throw error
          }
        },

        // Determine if multipart should be used
        shouldUseMultipart(file) {
          // Use multipart for files larger than our defined chunk size, or Uppy's default (e.g. 100MB if not set by chunk constants)
          // Let's explicitly use our constant
          const useMultipart = file.size > FILE_UPLOAD_CHUNK_SIZE_IN_BYTES
          console.log(
            `[UppyAwsS3] shouldUseMultipart for ${file.name}: ${useMultipart} (size: ${file.size}, chunk: ${FILE_UPLOAD_CHUNK_SIZE_IN_BYTES})`
          )
          return useMultipart
        },

        // --- Multipart-specific methods ---
        async createMultipartUpload(file) {
          console.log("[UppyAwsS3] createMultipartUpload called for:", file.name)
          const csrfToken = getCsrfToken()
          try {
            const response = await fetch("/api/s3/params/multipart", {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(csrfToken && { "X-CSRF-Token": csrfToken }),
              },
              body: JSON.stringify({ filename: file.name, type: file.type, size: file.size }),
            })
            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(
                `Failed to create multipart upload: ${response.statusText} (${response.status}) - ${errorText}`
              )
            }
            const data = await response.json()
            console.log("[UppyAwsS3] createMultipartUpload response:", data)
            return { uploadId: data.uploadId, key: data.key } // Must return uploadId and key
          } catch (error) {
            console.error("[UppyAwsS3] Error in createMultipartUpload:", error)
            throw error
          }
        },

        async signPart(file, partData) {
          console.log("[UppyAwsS3] signPart called for:", file.name, "Part:", partData.partNumber)
          const { uploadId, key, partNumber } = partData
          // Our backend expects a batch request for part signing.
          // Uppy's signPart is for one part at a time. We'll request just that one part.
          try {
            const response = await fetch(
              `/api/s3/params/multipart/${uploadId}/batch?key=${encodeURIComponent(key)}&partNumbers=${partNumber}`,
              {
                method: "GET",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
              }
            )
            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(`Failed to sign part: ${response.statusText} (${response.status}) - ${errorText}`)
            }
            const data = await response.json()
            console.log("[UppyAwsS3] signPart response (for batch with one part):", data)
            // The backend returns { presignedUrls: { '1': url1, '2': url2 } }
            // We need to return the URL for the specific partNumber
            const presignedUrl = data.presignedUrls?.[partNumber.toString()]
            if (!presignedUrl) {
              throw new Error(`No presigned URL found for part ${partNumber} in batch response`)
            }
            return { url: presignedUrl } // Must return object with url key
          } catch (error) {
            console.error("[UppyAwsS3] Error in signPart:", error)
            throw error
          }
        },

        async completeMultipartUpload(file, { uploadId, key, parts }) {
          console.log("[UppyAwsS3] completeMultipartUpload called for:", file.name)
          const csrfToken = getCsrfToken()
          try {
            const response = await fetch(`/api/s3/params/multipart/${uploadId}/complete`, {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(csrfToken && { "X-CSRF-Token": csrfToken }),
              },
              body: JSON.stringify({ key, parts }), // `parts` should be [{ PartNumber, ETag }, ...]
            })
            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(
                `Failed to complete multipart upload: ${response.statusText} (${response.status}) - ${errorText}`
              )
            }
            const data = await response.json()
            console.log("[UppyAwsS3] completeMultipartUpload response:", data)
            return { location: data.location } // `location` is optional per Uppy docs, but good to have
          } catch (error) {
            console.error("[UppyAwsS3] Error in completeMultipartUpload:", error)
            throw error
          }
        },

        async abortMultipartUpload(file, { uploadId, key }) {
          console.log("[UppyAwsS3] abortMultipartUpload called for:", file.name)
          const csrfToken = getCsrfToken()
          try {
            const response = await fetch(`/api/s3/params/multipart/${uploadId}`, {
              method: "DELETE",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(csrfToken && { "X-CSRF-Token": csrfToken }),
              },
              body: JSON.stringify({ key }),
            })
            if (!response.ok && response.status !== 204) {
              // 204 No Content is also a success for DELETE
              const errorText = await response.text()
              throw new Error(
                `Failed to abort multipart upload: ${response.statusText} (${response.status}) - ${errorText}`
              )
            }
            console.log("[UppyAwsS3] abortMultipartUpload successful for:", key)
            // This function does not need to return anything specific.
          } catch (error) {
            console.error("[UppyAwsS3] Error in abortMultipartUpload:", error)
            throw error // Uppy will catch this and mark the upload as failed/cancelled
          }
        },

        async listParts(file, { uploadId, key }) {
          console.log(
            "[UppyAwsS3] listParts called for:",
            file.name,
            "(uploadId:",
            uploadId,
            "key:",
            key,
            ") - returning empty for now (no resume support)."
          )
          // To implement resumability, this function would fetch a list of already uploaded parts from your backend.
          // Your backend would need a new endpoint like: GET /api/s3/params/multipart/${uploadId}/parts?key=${key}
          // It should return an array of S3 Part objects: [{ PartNumber, Size, ETag }, ...]
          return [] // Return empty array indicating no parts have been uploaded yet or resume is not supported.
        },
      })
      .on("upload-success", (file: UppyFile<{}, {}>, response) => {
        // `response.uploadURL` is from AwsS3 single part.
        // For multipart, `response` will be the result of `completeMultipartUpload` (e.g. { location: ... })
        // or for single-part it's the XHR response from S3 (status, body if any).
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

export default useUppyS3
