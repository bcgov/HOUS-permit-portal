import { Box, BoxProps, Button, ButtonProps, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { sanitizeQuillHtml } from "../../../../utils/sanitize-quill-content"
import { isQuillEmpty } from "../../../../utils/utility-functions"
import { Editor } from "../editor"
import { SafeQuillDisplay } from "../safe-quill-display"

export type TEditorWithPreviewProps = {
  label?: string
  htmlValue: string
  onChange?: (htmlValue: string) => void
  containerProps?: BoxProps
  editText?: string
  editTextButtonProps?: ButtonProps
  onRemove?: (setEditMode: (editMode: boolean) => void) => void
  isReadOnly?: boolean
} & (
  | { initialTriggerText: string; renderInitialTrigger?: never }
  | {
      initialTriggerText?: never
      renderInitialTrigger: (buttonProps: ButtonProps) => JSX.Element
    }
  | { initialTriggerText?: never; renderInitialTrigger?: never }
)

export const EditorWithPreview = observer(function EditorWithPreview({
  label,
  htmlValue = "",
  onChange,
  containerProps,
  renderInitialTrigger,
  initialTriggerText,
  editText,
  editTextButtonProps,
  onRemove,
  isReadOnly,
}: TEditorWithPreviewProps) {
  // Sanitize htmlValue before using it to prevent XSS attacks (CVE-2021-3163)
  // This protects against malicious content in edit mode (ReactQuill) and preview mode (SafeQuillDisplay)
  const sanitizedHtmlValue = useMemo(() => sanitizeQuillHtml(htmlValue), [htmlValue])
  const isEditorEmpty = isQuillEmpty(sanitizedHtmlValue)
  const [isEditMode, setIsEditMode] = useState(false)
  const { t } = useTranslation()

  const isEditable = isEditMode && !isReadOnly
  const mainContainerProps: BoxProps = {
    pos: "relative",
    _hover: {
      bg: isReadOnly ? undefined : "theme.blueLight",
    },
    bg: isEditable ? "theme.blueLight" : undefined,
    px: 4,
    py: 3,
    borderRadius: "sm",
    sx: {
      ".tiptap-wrapper": {
        bg: isEditable ? "white" : undefined,
      },
      ".tiptap-editor": {
        px: isEditable ? undefined : 0,
      },
      ".tiptap-editor-readonly": {
        fontSize: isEditable ? undefined : "sm",
      },
    },
    w: "full",
    minH: "1rem",
    cursor: !isEditMode && !isReadOnly ? "pointer" : undefined,
    fontSize: "sm",
    onClick: () => !isReadOnly && setIsEditMode(true),
    ...containerProps,
    ...containerProps,
  }

  const handleClickDone = (e) => {
    e.stopPropagation()
    setIsEditMode(false)
  }

  if (!isEditMode && !isReadOnly && isEditorEmpty && (initialTriggerText || renderInitialTrigger)) {
    return (
      <Box {...mainContainerProps}>
        {initialTriggerText ? (
          <Button variant={"link"} textDecoration={"underline"}>
            {initialTriggerText}
          </Button>
        ) : (
          renderInitialTrigger({ onClick: () => setIsEditMode(true) })
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
      {onRemove && !isReadOnly && isEditMode && (
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(setIsEditMode)
          }}
          variant={"link"}
          textDecoration={"underline"}
          fontSize={"sm"}
          pos={"absolute"}
          top={"5px"}
          right={"10px"}
        >
          {t("ui.remove")}
        </Button>
      )}
      {isEditMode ? (
        <>
          {/* Sanitize htmlValue before passing to Editor to prevent XSS (CVE-2021-3163) */}
          <Editor key={"edit"} htmlValue={sanitizedHtmlValue} onChange={onChange} />
          <Button variant="primary" mt={4} onClick={handleClickDone}>
            {t("ui.done")}
          </Button>
        </>
      ) : (
        <>
          {editText && (
            <Button variant={"link"} textDecoration={"underline"} {...editTextButtonProps}>
              {editText}
            </Button>
          )}
          {/* SafeQuillDisplay also sanitizes internally, but sanitizing here adds defense-in-depth */}
          <SafeQuillDisplay
            htmlContent={sanitizedHtmlValue}
            fontSize="sm"
            sx={{
              "& p": {
                marginBottom: "0.5em",
              },
            }}
          />
        </>
      )}
    </Box>
  )
})
