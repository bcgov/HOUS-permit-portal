import { UppyFile } from "@uppy/core"
import { useCallback, useState } from "react"
import useUppyS3 from "../../../hooks/use-uppy-s3"
import { INoteAttachmentDraft } from "../../../types/types"

const DEFAULT_MAX_FILES = 10

// Uppy strips the query string from presigned PUT urls, so the last path
// segment is the S3 cache key Shrine expects as the file id.
const extractUploadedFileKey = (file: UppyFile<{}, {}>, response: any): string => {
  const source = response?.uploadURL || response?.location || response?.key || ""
  const key = source.split("?")[0].split("/").pop()

  return key || file.name || file.id
}

interface UseNoteAttachmentsProps {
  maxNumberOfFiles?: number
}

/**
 * Owns the S3 cache uploads backing a note being composed. Attachments stay in
 * the S3 cache until the note is submitted, so removing one before submit is
 * purely local.
 */
export const useNoteAttachments = ({ maxNumberOfFiles = DEFAULT_MAX_FILES }: UseNoteAttachmentsProps = {}) => {
  const [attachments, setAttachments] = useState<INoteAttachmentDraft[]>([])

  const { uppy, isUploading } = useUppyS3({
    maxNumberOfFiles,
    autoProceed: true,
    onUploadSuccess: (file, response) => {
      setAttachments((previous) => [
        ...previous,
        {
          uppyFileId: file.id,
          file: {
            id: extractUploadedFileKey(file, response),
            storage: "cache",
            metadata: {
              size: file.size || 0,
              filename: file.name,
              mimeType: file.type || "application/octet-stream",
            },
          },
        },
      ])
    },
  })

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return

      uppy.addFiles(files.map((file) => ({ name: file.name, type: file.type, data: file })))
    },
    [uppy]
  )

  const removeAttachment = useCallback(
    (uppyFileId: string) => {
      if (uppy.getFile(uppyFileId)) uppy.removeFile(uppyFileId)
      setAttachments((previous) => previous.filter((attachment) => attachment.uppyFileId !== uppyFileId))
    },
    [uppy]
  )

  const clearAttachments = useCallback(() => {
    uppy.cancelAll()
    uppy.getFiles().forEach((file) => uppy.removeFile(file.id))
    setAttachments([])
  }, [uppy])

  return { attachments, isUploading, addFiles, removeAttachment, clearAttachments }
}
