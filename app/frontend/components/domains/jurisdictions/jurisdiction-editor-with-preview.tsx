import { Box, Button, Flex } from "@chakra-ui/react"
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

const previewParagraphSx = {
  "& p": {
    marginBottom: "0.5em",
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
  },
}

export const JurisdictionEditorWithPreview = observer(function JurisdictionEditorWithPreview(
  props: TEditorWithPreviewProps
) {
  const { onChange, ...hookInput } = props
  const { t } = useTranslation()
  const doneLabel = t("ui.done")
  const editLabel = t("ui.edit")

  const { sanitizedHtmlValue, isEditMode, mainContainerProps, handleClickDone, setIsEditMode } = useEditorWithPreview({
    ...(hookInput as TUseEditorWithPreviewProps),
    containerChrome: "flush",
  })

  return (
    <Box {...mainContainerProps}>
      {isEditMode ? (
        <Flex align="flex-start" gap={1} w="full">
          <Box
            flex={1}
            minW={0}
            border="1px solid"
            borderColor="border.light"
            borderRadius="md"
            overflow="hidden"
            sx={borderedEditorSx}
          >
            <Editor key="edit" htmlValue={sanitizedHtmlValue} onChange={onChange} />
          </Box>
          <Button variant="primary" size="xs" leftIcon={<Pencil size={12} />} onClick={handleClickDone} flexShrink={0}>
            {doneLabel}
          </Button>
        </Flex>
      ) : (
        <Flex align="flex-start" gap={1} w="full">
          <Box flex={1} minW={0}>
            <SafeTipTapDisplay htmlContent={sanitizedHtmlValue} fontSize="sm" sx={previewParagraphSx} />
          </Box>
          {props.isReadOnly ? null : (
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
          )}
        </Flex>
      )}
    </Box>
  )
})
