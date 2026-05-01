import { BoxProps, ButtonProps } from "@chakra-ui/react"
import type { Dispatch, MouseEvent, SetStateAction } from "react"
import { useCallback, useMemo, useState } from "react"
import { sanitizeTipTapHtml } from "../../../../utils/sanitize-tiptap-content"
import { isTipTapEmpty } from "../../../../utils/utility-functions"

export type TEditorWithPreviewInitialTriggerProps =
  | { initialTriggerText: string; renderInitialTrigger?: never }
  | {
      initialTriggerText?: never
      renderInitialTrigger: (buttonProps: ButtonProps) => JSX.Element
    }
  | { initialTriggerText?: never; renderInitialTrigger?: never }

export type TUseEditorWithPreviewProps = {
  htmlValue?: string
  containerProps?: BoxProps
  onRemove?: (setEditMode: (editMode: boolean) => void) => void
  isReadOnly?: boolean
  /**
   * "default" — padded wrapper, blue hover tint, blue background while editing.
   * "flush" — no outer padding, no hover tint, no wrapper background (for custom chrome e.g. bordered editor).
   */
  containerChrome?: "default" | "flush"
} & TEditorWithPreviewInitialTriggerProps

export type TUseEditorWithPreviewResult = {
  sanitizedHtmlValue: string
  isEditorEmpty: boolean
  isEditMode: boolean
  setIsEditMode: Dispatch<SetStateAction<boolean>>
  isEditable: boolean
  mainContainerProps: BoxProps
  handleClickDone: (e: MouseEvent) => void
  handleRemoveClick: (e: MouseEvent) => void
  showInitialTriggerOnly: boolean
}

export function useEditorWithPreview({
  htmlValue = "",
  containerProps,
  onRemove,
  isReadOnly,
  initialTriggerText,
  renderInitialTrigger,
  containerChrome = "default",
}: TUseEditorWithPreviewProps): TUseEditorWithPreviewResult {
  const sanitizedHtmlValue = useMemo(() => sanitizeTipTapHtml(htmlValue), [htmlValue])
  const isEditorEmpty = isTipTapEmpty(sanitizedHtmlValue)
  const [isEditMode, setIsEditMode] = useState(false)

  const isEditable = isEditMode && !isReadOnly
  const isFlushChrome = containerChrome === "flush"

  const mainContainerProps: BoxProps = {
    pos: "relative",
    _hover: isFlushChrome
      ? isReadOnly
        ? undefined
        : {}
      : {
          bg: isReadOnly ? undefined : "theme.blueLight",
        },
    bg: isFlushChrome ? undefined : isEditable ? "theme.blueLight" : undefined,
    px: isFlushChrome ? 0 : 4,
    py: isFlushChrome ? 0 : 3,
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
  }

  const handleClickDone = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    setIsEditMode(false)
  }, [])

  const handleRemoveClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      onRemove?.(setIsEditMode)
    },
    [onRemove]
  )

  const showInitialTriggerOnly =
    !isEditMode && !isReadOnly && isEditorEmpty && (Boolean(initialTriggerText) || Boolean(renderInitialTrigger))

  return {
    sanitizedHtmlValue,
    isEditorEmpty,
    isEditMode,
    setIsEditMode,
    isEditable,
    mainContainerProps,
    handleClickDone,
    handleRemoveClick,
    showInitialTriggerOnly,
  }
}
