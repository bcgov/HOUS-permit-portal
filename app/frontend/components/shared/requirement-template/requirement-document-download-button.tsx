import { Button, ButtonProps } from "@chakra-ui/react"
import { Download } from "@phosphor-icons/react"
import React from "react"
import { EFileUploadAttachmentType } from "../../../types/enums"
import { IRequirementDocument } from "../../../types/types"
import { downloadFileFromStorage } from "../../../utils/utility-functions"

interface RequirementDocumentDownloadButtonProps extends Omit<ButtonProps, "onClick"> {
  document: IRequirementDocument
}

export const RequirementDocumentDownloadButton: React.FC<RequirementDocumentDownloadButtonProps> = ({
  document,
  ...buttonProps
}) => {
  const handleDownload = () => {
    downloadFileFromStorage({
      model: EFileUploadAttachmentType.RequirementDocument,
      modelId: document.id,
      filename: document.file?.metadata?.filename,
    })
  }

  return (
    <Button
      size="sm"
      variant="link"
      leftIcon={<Download size={16} />}
      onClick={handleDownload}
      textDecoration={document._destroy ? "line-through" : "none"}
      {...buttonProps}
    >
      {document.file?.metadata?.filename}
    </Button>
  )
}
