import { HStack, IconButton, Tag, TagLabel, Text, Wrap, WrapItem } from "@chakra-ui/react"
import { Paperclip, X } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { INoteAttachmentDraft } from "../../../types/types"
import { formatFileSize } from "../../../utils/file-utils"

interface NoteAttachmentChipsProps {
  attachments: INoteAttachmentDraft[]
  onRemove: (uppyFileId: string) => void
}

// Staged (not yet submitted) attachments for a note being composed.
export const NoteAttachmentChips = ({ attachments, onRemove }: NoteAttachmentChipsProps) => {
  const { t } = useTranslation()

  if (attachments.length === 0) return null

  return (
    <Wrap mt={3} spacing={2}>
      {attachments.map(({ uppyFileId, file }) => (
        <WrapItem key={uppyFileId}>
          <Tag size="lg" borderRadius="md" variant="subtle" colorScheme="gray">
            <HStack spacing={2}>
              <Paperclip size={14} />
              <TagLabel>{file.metadata.filename}</TagLabel>
              <Text fontSize="xs" color="text.secondary">
                {formatFileSize(file.metadata.size)}
              </Text>
              <IconButton
                aria-label={t("note.attachments.remove", { fileName: file.metadata.filename })}
                icon={<X size={12} />}
                size="xs"
                variant="ghost"
                onClick={() => onRemove(uppyFileId)}
              />
            </HStack>
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  )
}
