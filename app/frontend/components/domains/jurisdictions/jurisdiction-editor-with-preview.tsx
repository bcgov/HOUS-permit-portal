import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { Pencil } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import type { TEditorWithPreviewProps } from "../../shared/editor/custom-extensions/editor-with-preview"
import {
  TUseEditorWithPreviewProps,
  useEditorWithPreview,
} from "../../shared/editor/custom-extensions/use-editor-with-preview"
import { Editor } from "../../shared/editor/editor"
import { SafeTipTapDisplay } from "../../shared/editor/safe-tiptap-display"

const jurisdictionTipTapBodyTypography = {
  fontSize: "md",
  lineHeight: 1.6,
  "& p": {
    margin: 0,
  },
}

const borderedEditorSx = {
  ".tiptap-wrapper": {
    bg: "white",
    width: "100%",
  },
  ".tiptap-toolbar": {
    bg: "white",
    border: "none",
    borderBottom: "1px solid",
    borderColor: "border.light",
    borderRadius: 0,
    py: 2,
    px: 3,
  },
  ".tiptap-toolbar-button": {
    color: "text.primary",
  },
  ".tiptap-editor": {
    border: "none",
    borderRadius: 0,
    minHeight: "150px",
    px: 4,
    py: 4,
    ...jurisdictionTipTapBodyTypography,
  },
}

export type TJurisdictionEditorWithPreviewProps = TEditorWithPreviewProps & {
  editButtonPlacement?: "inline" | "top"
  editableEmptyFallback?: React.ReactNode
}

export const JurisdictionEditorWithPreview = observer(function JurisdictionEditorWithPreview(
  props: TJurisdictionEditorWithPreviewProps
) {
  const { onChange, label, editButtonPlacement = "inline", editableEmptyFallback, ...hookInput } = props
  const { t } = useTranslation()
  const doneLabel = t("ui.done")
  const editLabel = t("ui.edit")

  const {
    sanitizedHtmlValue,
    isEditorEmpty,
    isEditMode,
    isEditable,
    mainContainerProps,
    handleClickDone,
    setIsEditMode,
  } = useEditorWithPreview({
    ...(hookInput as TUseEditorWithPreviewProps),
    containerChrome: "flush",
  })

  const isTop = editButtonPlacement === "top"

  const showEditableEmptyFallback =
    editableEmptyFallback !== undefined && !props.isReadOnly && isEditorEmpty && !isEditMode

  const previewBody = showEditableEmptyFallback ? (
    <Box onClick={(e) => e.stopPropagation()} cursor="default" fontSize="md" lineHeight={1.6}>
      {editableEmptyFallback}
    </Box>
  ) : (
    <SafeTipTapDisplay htmlContent={sanitizedHtmlValue} sx={jurisdictionTipTapBodyTypography} />
  )

  const borderedEditor = (
    <Box
      flex={isTop ? undefined : 1}
      minW={0}
      w={isTop ? "full" : undefined}
      border="1px solid"
      borderColor="border.light"
      borderRadius="md"
      overflow="hidden"
      sx={borderedEditorSx}
    >
      <Editor key="edit" htmlValue={sanitizedHtmlValue} onChange={onChange} />
    </Box>
  )

  const editToolbar = !props.isReadOnly && (
    <Button
      variant="primary"
      size="xs"
      leftIcon={<Pencil size={12} />}
      onClick={(e) => {
        e.stopPropagation()
        setIsEditMode(true)
      }}
      flexShrink={0}
    >
      {editLabel}
    </Button>
  )

  const doneButton = (
    <Button variant="primary" size="xs" leftIcon={<Pencil size={12} />} onClick={handleClickDone} flexShrink={0}>
      {doneLabel}
    </Button>
  )

  const editModeLabel = isEditable && label && (
    <Text color="text.primary" mb={1}>
      {label}
    </Text>
  )

  return (
    <Box
      {...mainContainerProps}
      cursor={showEditableEmptyFallback ? "default" : mainContainerProps.cursor}
      onClick={showEditableEmptyFallback ? undefined : mainContainerProps.onClick}
    >
      {isEditMode ? (
        isTop ? (
          <Flex direction="column" gap={1} w="full">
            {editModeLabel}
            <Flex justify="flex-end" align="center" gap={3} w="full" flexWrap="wrap">
              {doneButton}
            </Flex>
            {borderedEditor}
          </Flex>
        ) : (
          <Flex direction="column" w="full">
            {editModeLabel}
            <Flex align="flex-start" gap={1} w="full">
              {borderedEditor}
              {doneButton}
            </Flex>
          </Flex>
        )
      ) : isTop ? (
        <Flex direction="column" gap={1} w="full">
          <Flex justify="flex-end" align="center" gap={2} w="full" flexWrap="wrap">
            {editToolbar}
          </Flex>
          <Box w="full">{previewBody}</Box>
        </Flex>
      ) : (
        <Flex align="flex-start" gap={1} w="full">
          <Box flex={1} minW={0}>
            {previewBody}
          </Box>
          {editToolbar}
        </Flex>
      )}
    </Box>
  )
})
