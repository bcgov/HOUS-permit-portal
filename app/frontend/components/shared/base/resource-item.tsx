import { Box, Link, Text } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import React from "react"
import { EFileUploadAttachmentType, EResourceType } from "../../../types/enums"
import { IRequirementDocument, IResource, IResourceDocument } from "../../../types/types"
import { formatFileSize, getFileExtension } from "../../../utils/file-utils"
import { FileDownloadButton } from "./file-download-button"

export const DownloadLinkButton = ({
  document,
  modelType,
  title,
}: {
  document: IRequirementDocument | IResourceDocument
  modelType: EFileUploadAttachmentType
  title?: string
}) => {
  const fileExt = getFileExtension(document.file.metadata.filename, document.file.metadata.mimeType)
  const fileSize = formatFileSize(document.file.metadata.size)
  const displayTitle = title || document.file.metadata.filename
  const titleWithMetadata = `${displayTitle} (${fileExt}, ${fileSize})`

  return (
    <FileDownloadButton document={document} modelType={modelType} variant="link" color="semantic.info" size="sm" px={0}>
      {titleWithMetadata}
    </FileDownloadButton>
  )
}

interface IResourceItemProps {
  resource: IResource
}

export const ResourceItem = ({ resource }: IResourceItemProps) => {
  return (
    <Box w="full">
      {resource.resourceType === EResourceType.file && resource.resourceDocument ? (
        <DownloadLinkButton
          document={resource.resourceDocument}
          modelType={EFileUploadAttachmentType.ResourceDocument}
          title={resource.title}
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
