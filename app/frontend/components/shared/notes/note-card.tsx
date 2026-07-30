import { Box, HStack, Text, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { INote } from "../../../models/note"
import { EFileUploadAttachmentType } from "../../../types/enums"
import { DownloadLinkButton } from "../base/resource-item"
import { SafeTipTapDisplay } from "../editor/safe-tiptap-display"

interface NoteCardProps {
  note: INote
  footer?: ReactNode
}

// Single rendering of a note wherever it is displayed, so attachments show up
// consistently for reviewers and submitters alike.
export const NoteCard = observer(({ note, footer }: NoteCardProps) => {
  const { t } = useTranslation()
  const createdAt = note.createdAt ? format(note.createdAt, datefnsTableDateTimeFormat) : null
  const attachments = note.noteAttachmentDocuments ?? []

  return (
    <Box border="1px" borderColor="border.light" borderRadius="md" p={4}>
      <VStack align="stretch" spacing={2}>
        <HStack spacing={4} align="baseline">
          <Text fontWeight="bold">{note.authorName}</Text>
          {createdAt && (
            <Text color="text.secondary" fontSize="sm">
              {createdAt}
            </Text>
          )}
        </HStack>
        <SafeTipTapDisplay htmlContent={note.body} fontSize="md" />
        {attachments.length > 0 && (
          <VStack align="start" spacing={0} pt={1}>
            <Text fontSize="sm" fontWeight="bold">
              {t("note.attachments.label")}
            </Text>
            {attachments.map((attachment) => (
              <DownloadLinkButton
                key={attachment.id}
                document={attachment}
                modelType={EFileUploadAttachmentType.NoteAttachmentDocument}
              />
            ))}
          </VStack>
        )}
        {footer}
      </VStack>
    </Box>
  )
})
