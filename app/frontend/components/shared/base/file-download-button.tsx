import { Button, ButtonProps } from "@chakra-ui/react"
import { Download } from "@phosphor-icons/react"
import React from "react"
import { EFileUploadAttachmentType } from "../../../types/enums"
import { IBaseFileAttachment } from "../../../types/types"
import { downloadFileFromStorage } from "../../../utils/utility-functions"

interface FileDownloadButtonProps extends Omit<ButtonProps, "onClick"> {
  document: IBaseFileAttachment
  modelType: EFileUploadAttachmentType
}

export const FileDownloadButton: React.FC<FileDownloadButtonProps> = ({ document, modelType, ...buttonProps }) => {
  const handleDownload = () => {
    downloadFileFromStorage({
      model: modelType,
      modelId: document.id,
      filename: document.file?.metadata?.filename ?? "download.pdf",
    })
  }

  return (
    <Button
      size="sm"
      variant="link"
      leftIcon={<Download size={16} />}
      onClick={handleDownload}
      textDecoration={document._destroy ? "line-through" : "none"} // Keep destroy visual cue if applicable
      {...buttonProps}
    >
      {document.file.metadata.filename}
    </Button>
  )
}
