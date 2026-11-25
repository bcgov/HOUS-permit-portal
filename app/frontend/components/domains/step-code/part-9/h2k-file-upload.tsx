import { Box, FormControl, FormLabel, Text } from "@chakra-ui/react"
import { UppyFile } from "@uppy/core"
import { t } from "i18next"
import React, { useEffect, useRef } from "react"
import useUppyS3 from "../../../../hooks/use-uppy-s3"
import { UppyDashboard } from "../../../shared/uppy-dashboard"

export type TH2kFileFormValue = {
  id: string
  storage?: string | null
  metadata?: {
    filename?: string | null
    size?: number | null
    mimeType?: string | null
    mime_type?: string | null
  } | null
}

interface IH2kFileUploadProps {
  existingFilename?: string | null
  onUploaded: (file: TH2kFileFormValue) => void
  onRemoved: () => void
  onUploadingChange: (uploading: boolean) => void
}

export function H2kFileUpload({ existingFilename, onUploaded, onRemoved, onUploadingChange }: IH2kFileUploadProps) {
  const handleUploadSuccess = (file: UppyFile<{}, {}>, response: any) => {
    const uploadUrl = response.uploadURL || response.location || ""
    const key = uploadUrl.split("/").pop()?.split("?")[0]
    onUploaded({
      id: key || file.name,
      storage: "cache",
      metadata: {
        filename: file.name,
        size: file.size,
        mimeType: file.type || "application/xml",
      },
    })
  }

  const { uppy, isUploading } = useUppyS3({
    onUploadSuccess: handleUploadSuccess,
    onFileRemoved: () => onRemoved(),
    maxNumberOfFiles: 1,
    autoProceed: true,
    allowedFileTypes: [".h2k"],
  })

  const onUploadingChangeRef = useRef(onUploadingChange)
  onUploadingChangeRef.current = onUploadingChange

  useEffect(() => {
    onUploadingChangeRef.current(isUploading)
    return () => onUploadingChangeRef.current(false)
  }, [isUploading])

  return (
    <FormControl>
      <FormLabel>{t("stepCode.import.selectFile")}</FormLabel>
      {existingFilename && (
        <Text fontSize="sm" color="text.secondary" mb={2}>
          {existingFilename}
        </Text>
      )}
      <Box position="relative" w="100%">
        <UppyDashboard uppy={uppy} width="100%" height={220} />
      </Box>
    </FormControl>
  )
}
