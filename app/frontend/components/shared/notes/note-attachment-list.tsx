import { Box, HStack, Text, VStack } from "@chakra-ui/react"
import { Download, Paperclip, WarningCircle } from "@phosphor-icons/react"
import React, { cloneElement } from "react"
import { useTranslation } from "react-i18next"
import { EFileUploadAttachmentType } from "../../../types/enums"
import { INoteAttachmentDocument } from "../../../types/types"
import { formatFileSize, getFileExtension, getFileTypeInfo } from "../../../utils/file-utils"
import { downloadFileFromStorage } from "../../../utils/utility-functions"

interface NoteAttachmentListProps {
  attachments: INoteAttachmentDocument[]
}

export const NoteAttachmentList = ({ attachments }: NoteAttachmentListProps) => {
  const { t } = useTranslation()

  if (attachments.length === 0) return null

  return (
    <VStack align="stretch" spacing={2} pt={3} mt={1} borderTop="1px solid" borderColor="greys.grey02">
      <HStack spacing={1.5} color="text.secondary">
        <Paperclip size={11} />
        <Text fontSize="xs">{t("note.attachments.count", { count: attachments.length })}</Text>
      </HStack>
      <VStack align="stretch" spacing={1.5}>
        {attachments.map((attachment) => (
          <NoteAttachmentItem key={attachment.id} attachment={attachment} />
        ))}
      </VStack>
    </VStack>
  )
}

const NoteAttachmentItem = ({ attachment }: { attachment: INoteAttachmentDocument }) => {
  const { t } = useTranslation()
  const metadata = attachment.file?.metadata

  if (!metadata) {
    return (
      <Text color="greys.grey01" fontSize="sm" display="inline-flex" alignItems="center" gap={1}>
        <WarningCircle size={16} />
        {t("note.attachments.unavailable")}
      </Text>
    )
  }

  const filename = metadata.filename
  const fileExt = getFileExtension(filename, metadata.mimeType)
  const fileSize = formatFileSize(metadata.size)
  const { icon } = getFileTypeInfo(metadata.mimeType)

  const handleDownload = () => {
    downloadFileFromStorage({
      model: EFileUploadAttachmentType.NoteAttachmentDocument,
      modelId: attachment.id,
      filename,
    })
  }

  return (
    <Box
      as="button"
      type="button"
      onClick={handleDownload}
      aria-label={t("note.attachments.download", { fileName: filename })}
      w="full"
      bg="white"
      border="1px solid"
      borderColor="border.light"
      borderRadius="sm"
      px={3}
      py="9px"
      textAlign="left"
      _hover={{ bg: "greys.grey04" }}
    >
      <HStack spacing="10px" align="center" minW={0}>
        <Box flexShrink={0} color="text.secondary" lineHeight={0}>
          {cloneElement(icon, { size: 15 })}
        </Box>
        <Text
          flex={1}
          minW={0}
          fontSize="sm"
          color="text.link"
          textDecoration="underline"
          noOfLines={1}
          title={filename}
        >
          {filename}
        </Text>
        <Text
          as="span"
          flexShrink={0}
          fontSize="10px"
          lineHeight="14px"
          textTransform="uppercase"
          color="text.secondary"
          bg="greys.grey02"
          borderRadius="sm"
          px={1.5}
          py="2px"
        >
          {fileExt}
        </Text>
        <Text flexShrink={0} fontSize="xs" color="greys.grey01" whiteSpace="nowrap">
          {fileSize}
        </Text>
        <Box flexShrink={0} color="text.link" lineHeight={0}>
          <Download size={13} aria-hidden />
        </Box>
      </HStack>
    </Box>
  )
}
