import { Box, BoxProps, Button, ButtonProps, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { isQuillEmpty } from "../../../../utils/utility-functions"
import { Editor } from "../editor"

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
  const isEditorEmpty = isQuillEmpty(htmlValue)
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
      ".quill": {
        bg: isEditable ? "white" : undefined,
      },
      ".quill .ql-editor": {
        px: isEditable ? undefined : 0,
      },
      ".quill .ql-container": {
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
          <Editor key={"edit"} htmlValue={htmlValue} onChange={onChange} />
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
          <Editor key={"read-only"} htmlValue={htmlValue} readonly />
        </>
      )}
    </Box>
  )
})
