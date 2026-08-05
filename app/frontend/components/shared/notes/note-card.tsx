import { Box, HStack, Text, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { ReactNode } from "react"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { INote } from "../../../models/note"
import { SafeTipTapDisplay } from "../editor/safe-tiptap-display"
import { NoteAttachmentList } from "./note-attachment-list"

interface NoteCardProps {
  note: INote
  footer?: ReactNode
}

// Single rendering of a note wherever it is displayed, so attachments show up
// consistently for reviewers and submitters alike.
export const NoteCard = observer(({ note, footer }: NoteCardProps) => {
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
        <NoteAttachmentList attachments={attachments} />
        {footer}
      </VStack>
    </Box>
  )
})
