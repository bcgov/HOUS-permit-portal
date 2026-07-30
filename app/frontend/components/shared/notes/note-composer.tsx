import { Box, Button, HStack, Text } from "@chakra-ui/react"
import { Paperclip } from "@phosphor-icons/react"
import React, { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { INoteAttachmentDraft } from "../../../types/types"
import { Editor } from "../editor/editor"
import { NoteAttachmentChips } from "./note-attachment-chips"

interface NoteComposerProps {
  body: string
  onChange: (body: string) => void
  placeholder?: string
  attachments: INoteAttachmentDraft[]
  isUploading?: boolean
  onAddFiles: (files: File[]) => void
  onRemoveAttachment: (uppyFileId: string) => void
}

/**
 * Rich text note editor with file attachments. Deliberately knows nothing about
 * what the note is attached to, so it can be reused for any noteable.
 */
export const NoteComposer = ({
  body,
  onChange,
  placeholder,
  attachments,
  isUploading = false,
  onAddFiles,
  onRemoveAttachment,
}: NoteComposerProps) => {
  const { t } = useTranslation()
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasFiles = (event: React.DragEvent) => Array.from(event.dataTransfer?.types || []).includes("Files")

  // Capture phase so a file drag never reaches TipTap's Dropcursor / ProseMirror.
  const handleDragOver = (event: React.DragEvent) => {
    if (!hasFiles(event)) return

    event.preventDefault()
    event.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return

    setIsDraggingOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    if (!hasFiles(event)) return

    event.preventDefault()
    event.stopPropagation()
    setIsDraggingOver(false)
    onAddFiles(Array.from(event.dataTransfer.files))
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAddFiles(Array.from(event.target.files || []))
    event.target.value = ""
  }

  return (
    <Box
      onDragOverCapture={handleDragOver}
      onDragLeaveCapture={handleDragLeave}
      onDropCapture={handleDrop}
      position="relative"
      borderRadius="md"
      outline={isDraggingOver ? "2px dashed" : undefined}
      outlineColor={isDraggingOver ? "semantic.info" : undefined}
      outlineOffset={isDraggingOver ? "2px" : undefined}
    >
      <Editor
        htmlValue={body}
        onChange={onChange}
        placeholder={placeholder}
        shouldContainRichTextToolbarItem={(item) => item !== "image"}
      />

      <NoteAttachmentChips attachments={attachments} onRemove={onRemoveAttachment} />

      <HStack spacing={2} mt={2} align="center">
        <Text fontSize="sm" color="text.secondary">
          {isDraggingOver ? t("note.attachments.dropActive") : t("note.attachments.dropHint")}
        </Text>
        {!isDraggingOver && (
          <Button
            variant="link"
            size="sm"
            leftIcon={<Paperclip size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t("note.attachments.attachFiles")}
          </Button>
        )}
        {isUploading && (
          <Text fontSize="sm" color="text.secondary">
            {t("note.attachments.uploading")}
          </Text>
        )}
      </HStack>

      <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileInputChange} />
    </Box>
  )
}
