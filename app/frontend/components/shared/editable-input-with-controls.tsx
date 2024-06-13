import {
  Button,
  ButtonGroup,
  ButtonProps,
  Editable,
  EditableInput,
  EditableInputProps,
  EditablePreview,
  EditablePreviewProps,
  EditableProps,
  Flex,
  IconButton,
  IconButtonProps,
  useEditableControls,
} from "@chakra-ui/react"
import { Pencil } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

interface IControlsProps {
  CustomEditableControls?: (props: ReturnType<typeof useEditableControls>) => JSX.Element
  CustomEditModeControls?: (props: ReturnType<typeof useEditableControls>) => JSX.Element
  CustomPreviewModeControls?: (props: ReturnType<typeof useEditableControls>) => JSX.Element
  saveButtonProps?: Partial<ButtonProps> & { textContent?: string }
  cancelButtonProps?: Partial<ButtonProps> & { textContent?: string }
  iconButtonProps?: Partial<IconButtonProps>
}

export interface IEditableInputWithControlsProps extends EditableProps {
  editablePreviewProps?: Partial<EditablePreviewProps>
  editableInputProps?: Partial<EditableInputProps>
  initialHint?: string
  getStateBasedEditableProps?: (isEditing: boolean) => Partial<EditableProps>
  controlsProps?: IControlsProps
  renderCustomPreview?: (props: {
    isEditing: boolean
    setIsInEditMode: (boolean) => void
    initialHint?: string
  }) => JSX.Element
}

function EditableControls({
  CustomEditableControls,
  CustomPreviewModeControls,
  CustomEditModeControls,
  saveButtonProps = {},
  cancelButtonProps = {},
  iconButtonProps,
}: IControlsProps) {
  const editableControls = useEditableControls()
  const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = editableControls
  const { t } = useTranslation()
  const { textContent: saveTextContent = t("ui.done"), ...restSaveButtonProps } = saveButtonProps
  const { textContent: cancelTextContent = t("ui.cancel"), ...restCancelButtonProps } = cancelButtonProps

  if (CustomEditableControls) {
    return <CustomEditableControls {...editableControls} />
  }

  if (isEditing) {
    return CustomEditModeControls ? (
      <CustomEditModeControls {...editableControls} />
    ) : (
      <ButtonGroup justifyContent="center" size="sm" spacing={2} ml={4}>
        <Button {...getSubmitButtonProps()} variant={"primary"} {...saveButtonProps}>
          {saveTextContent}
        </Button>
        <Button {...getCancelButtonProps()} variant={"secondary"} {...cancelButtonProps}>
          {cancelTextContent}
        </Button>
      </ButtonGroup>
    )
  }

  return CustomPreviewModeControls ? (
    <CustomPreviewModeControls {...editableControls} />
  ) : (
    <IconButton
      ml={1}
      size={"sm"}
      variant={"unstyled"}
      aria-label={"Enter edit mode"}
      color={"text.link"}
      icon={<Pencil size={14} />}
      {...getEditButtonProps()}
      {...iconButtonProps}
    />
  )
}

export const EditableInputWithControls = observer(function EditableInputWithControls({
  initialHint,
  placeholder,
  editablePreviewProps,
  editableInputProps,
  onEdit,
  onCancel,
  onBlur,
  controlsProps,
  getStateBasedEditableProps,
  borderEndEndRadius,
  renderCustomPreview,
  ...editableProps
}: IEditableInputWithControlsProps) {
  const [isInEditMode, setIsInEditMode] = useState(false)

  return (
    <Editable
      as={Flex}
      alignItems={"baseline"}
      placeholder={isInEditMode ? placeholder : initialHint ?? placeholder}
      onEdit={() => {
        setIsInEditMode(true)
        onEdit?.()
      }}
      onCancel={(previousValue) => {
        setIsInEditMode(false)
        onCancel?.(previousValue)
      }}
      onBlur={(e) => {
        setIsInEditMode(false)
        onBlur?.(e)
      }}
      {...editableProps}
      {...getStateBasedEditableProps?.(isInEditMode)}
    >
      {!isInEditMode && renderCustomPreview?.({ isEditing: isInEditMode, setIsInEditMode, initialHint })}
      <EditablePreview display={renderCustomPreview ? "none" : undefined} {...editablePreviewProps} />
      <EditableInput {...editableInputProps} />
      <EditableControls {...controlsProps} />
    </Editable>
  )
})
