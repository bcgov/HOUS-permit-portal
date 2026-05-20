import { Box, Button, ButtonProps, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Editor } from "../editor"
import { SafeTipTapDisplay } from "../safe-tiptap-display"
import { TUseEditorWithPreviewProps, useEditorWithPreview } from "./use-editor-with-preview"

const previewParagraphSx = {
  "& p": {
    marginBottom: "0.5em",
  },
}

type TEditorWithPreviewPresentationProps = {
  label?: string
  onChange?: (htmlValue: string) => void
  editText?: string
  editTextButtonProps?: ButtonProps
}

export type TEditorWithPreviewProps = Omit<TUseEditorWithPreviewProps, "htmlValue"> & {
  htmlValue: string
} & TEditorWithPreviewPresentationProps

export type {
  TEditorWithPreviewInitialTriggerProps,
  TUseEditorWithPreviewProps,
  TUseEditorWithPreviewResult,
} from "./use-editor-with-preview"

export const EditorWithPreview = observer(function EditorWithPreview(props: TEditorWithPreviewProps) {
  const { label, onChange, editText, editTextButtonProps, ...hookInput } = props
  const { t } = useTranslation()
  const removeLabel = t("ui.remove")
  const doneLabel = t("ui.done")

  const {
    sanitizedHtmlValue,
    isEditMode,
    setIsEditMode,
    isEditable,
    mainContainerProps,
    handleClickDone,
    handleRemoveClick,
    showInitialTriggerOnly,
  } = useEditorWithPreview(hookInput as TUseEditorWithPreviewProps)

  if (showInitialTriggerOnly) {
    return (
      <Box {...mainContainerProps}>
        {props.initialTriggerText ? (
          <Button variant={"link"} textDecoration={"underline"}>
            {props.initialTriggerText}
          </Button>
        ) : (
          "renderInitialTrigger" in props && props.renderInitialTrigger({ onClick: () => setIsEditMode(true) })
        )}
      </Box>
    )
  }

  return (
    <Box {...mainContainerProps}>
      {isEditable && (
        <Text color={"text.primary"} mb={1}>
          {label}
        </Text>
      )}
      {props.onRemove && !props.isReadOnly && isEditMode && (
        <Button
          onClick={handleRemoveClick}
          variant={"link"}
          textDecoration={"underline"}
          fontSize={"sm"}
          pos={"absolute"}
          top={"5px"}
          right={"10px"}
        >
          {removeLabel}
        </Button>
      )}
      {isEditMode ? (
        <>
          {/* Sanitize htmlValue before passing to Editor to prevent XSS (CVE-2021-3163) */}
          <Editor key={"edit"} htmlValue={sanitizedHtmlValue} onChange={onChange} />
          <Button variant="primary" mt={4} onClick={handleClickDone}>
            {doneLabel}
          </Button>
        </>
      ) : (
        <>
          {editText && (
            <Button variant={"link"} textDecoration={"underline"} {...editTextButtonProps}>
              {editText}
            </Button>
          )}
          {/* SafeTipTapDisplay also sanitizes internally, but sanitizing here adds defense-in-depth */}
          <SafeTipTapDisplay htmlContent={sanitizedHtmlValue} fontSize="sm" sx={previewParagraphSx} />
        </>
      )}
    </Box>
  )
})
