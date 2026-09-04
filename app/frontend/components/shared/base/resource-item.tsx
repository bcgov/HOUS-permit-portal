import { Box, Link, Text } from "@chakra-ui/react"
import { ArrowSquareOut, WarningCircle } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EFileUploadAttachmentType, EResourceType } from "../../../types/enums"
import { IBaseFileAttachment, IResource } from "../../../types/types"
import { formatFileSize, getFileExtension } from "../../../utils/file-utils"
import { FileDownloadButton } from "./file-download-button"

export const DownloadLinkButton = ({
  document,
  modelType,
  title,
  simpleTitle,
}: {
  document: IBaseFileAttachment
  modelType: EFileUploadAttachmentType
  title?: string
  simpleTitle?: boolean
}) => {
  const { t } = useTranslation()

  // Handle missing file data (e.g., failed upload, virus detected)
  if (!document?.file?.metadata) {
    return (
      <Text color="greys.grey01" fontSize="sm" display="inline-flex" alignItems="center" gap={1}>
        <WarningCircle size={16} />
        {t("ui.fileUnavailable")}
      </Text>
    )
  }

  const displayTitle = title || document.file.metadata.filename
  const titleWithMetadata = simpleTitle
    ? displayTitle
    : `${displayTitle} (${getFileExtension(document.file.metadata.filename, document.file.metadata.mimeType)}, ${formatFileSize(document.file.metadata.size)})`

  return (
    <FileDownloadButton document={document} modelType={modelType} variant="link" color="semantic.info" size="sm" px={0}>
      {titleWithMetadata}
    </FileDownloadButton>
  )
}

interface IResourceItemProps {
  resource: IResource
  simpleTitle?: boolean
}

export const ResourceItem = ({ resource, simpleTitle }: IResourceItemProps) => {
  return (
    <Box w="full">
      {resource.resourceType === EResourceType.file && resource.resourceDocument ? (
        <DownloadLinkButton
          document={resource.resourceDocument}
          modelType={EFileUploadAttachmentType.ResourceDocument}
          title={resource.title}
          simpleTitle={simpleTitle}
        />
      ) : resource.resourceType === EResourceType.link && resource.linkUrl ? (
        <Link
          href={resource.linkUrl}
          isExternal
          color="semantic.info"
          fontSize="md"
          display="inline-flex"
          alignItems="center"
          gap={1}
        >
          <ArrowSquareOut size={16} />
          {resource.title}
        </Link>
      ) : null}
      {resource.description && (
        <Text fontSize="xs" color="text.secondary" mt={1}>
          {resource.description}
        </Text>
      )}
    </Box>
  )
}
