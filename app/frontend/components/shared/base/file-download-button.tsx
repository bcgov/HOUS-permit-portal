import { Button, ButtonProps } from "@chakra-ui/react"
import { Download } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EFileUploadAttachmentType } from "../../../types/enums"
import { IBaseFileAttachment } from "../../../types/types"
import { downloadFileFromStorage } from "../../../utils/utility-functions"

interface FileDownloadButtonProps extends Omit<ButtonProps, "onClick"> {
  document: IBaseFileAttachment
  modelType: EFileUploadAttachmentType
  simpleLabel?: boolean
}

export const FileDownloadButton: React.FC<FileDownloadButtonProps> = ({
  document,
  modelType,
  simpleLabel,
  ...buttonProps
}) => {
  const handleDownload = () => {
    downloadFileFromStorage({
      model: modelType,
      modelId: document.id,
      filename: document.file?.metadata?.filename,
    })
  }
  const { t } = useTranslation()

  return (
    <Button
      size="sm"
      variant="plain"
      onClick={handleDownload}
      // Keep destroy visual cue if applicable
      textDecoration={document._destroy ? "line-through" : "underline"}
      {...buttonProps}
    >
      <Download size={16} />
      {buttonProps.children ? buttonProps.children : simpleLabel ? t("ui.download") : document.file?.metadata?.filename}
    </Button>
  )
}
