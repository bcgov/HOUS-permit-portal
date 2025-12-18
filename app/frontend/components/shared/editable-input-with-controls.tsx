import {
  Button,
  ButtonGroup,
  ButtonProps,
  Editable,
  EditableInput,
  EditablePreview,
  EditablePreviewProps,
  EditableProps,
  Flex,
  IconButton,
  IconButtonProps,
  Input,
  InputProps,
  useEditableControls,
} from "@chakra-ui/react"
import { Check, Pencil, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { MouseEventHandler, useState } from "react"
import { useTranslation } from "react-i18next"

interface IControlsProps {
  CustomEditableControls?: (props: ReturnType<typeof useEditableControls>) => JSX.Element
  CustomEditModeControls?: (props: ReturnType<typeof useEditableControls>) => JSX.Element
  CustomPreviewModeControls?: (props: ReturnType<typeof useEditableControls>) => JSX.Element
  saveButtonProps?: Partial<ButtonProps> & { textContent?: string }
  cancelButtonProps?: Partial<ButtonProps> & { textContent?: string }
  iconButtonProps?: Partial<IconButtonProps>
  compact?: boolean
}

interface ICustomEditablePreviewProps extends Partial<EditablePreviewProps> {
  renderCustomPreview?: (
    props: {
      isEditing: boolean
      onClick: MouseEventHandler
      initialHint?: string
    } & Partial<EditablePreviewProps>
  ) => JSX.Element
  initialHint?: string
}

export interface IEditableInputWithControlsProps extends EditableProps {
  editablePreviewProps?: Omit<ICustomEditablePreviewProps, "initialHint">
  editableInputProps?: Partial<InputProps>
  initialHint?: string
  controlsProps?: IControlsProps
  compact?: boolean
}

function EditableControls({
  CustomEditableControls,
  CustomPreviewModeControls,
  CustomEditModeControls,
  saveButtonProps = {},
  cancelButtonProps = {},
  iconButtonProps,
  compact,
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
    if (compact) {
      return (
        <Flex w={"100%"} mt={1} gap={2} alignItems={"center"} justifyContent={"flex-start"}>
          <IconButton
            aria-label={"Save"}
            size={"xs"}
            variant={"ghost"}
            icon={<Check size={14} />}
            {...getSubmitButtonProps()}
          />
          <IconButton
            aria-label={"Cancel"}
            size={"xs"}
            variant={"ghost"}
            icon={<X size={14} />}
            {...getCancelButtonProps()}
          />
        </Flex>
      )
    }
    return CustomEditModeControls ? (
      <CustomEditModeControls {...editableControls} />
    ) : (
      <ButtonGroup justifyContent="center" size="sm" spacing={2} ml={4}>
        <Button {...getSubmitButtonProps()} variant={"primary"} {...saveButtonProps}>
          {saveTextContent}
        </Button>
        <Button {...getCancelButtonProps()} variant={"primaryInverse"} {...cancelButtonProps} mr={2}>
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
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      aria-label={"Enter edit mode"}
      color={"text.link"}
      icon={<Pencil size={14} />}
      {...getEditButtonProps()}
      {...iconButtonProps}
    />
  )
}

const CustomEditablePreview = observer(function CustomEditablePreview({
  renderCustomPreview,
  initialHint,
  ...rest
}: ICustomEditablePreviewProps) {
  const editableControls = useEditableControls()
  const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = editableControls

  return renderCustomPreview ? (
    renderCustomPreview({ ...rest, initialHint, isEditing, onClick: getEditButtonProps()?.onClick })
  ) : (
    <EditablePreview {...rest} />
  )
})

export const EditableInputWithControls = observer(function EditableInputWithControls({
  initialHint,
  placeholder,
  editablePreviewProps,
  editableInputProps,
  onEdit,
  onCancel,
  onBlur,
  controlsProps,
  compact,
  borderEndEndRadius,
  ...editableProps
}: IEditableInputWithControlsProps) {
  const [isInEditMode, setIsInEditMode] = useState(false)

  return (
    <Editable
      as={Flex}
      alignItems={compact ? "stretch" : "center"}
      flexWrap={compact ? "wrap" : undefined}
      placeholder={isInEditMode ? placeholder : (initialHint ?? placeholder)}
      color={R.isEmpty(editableProps.value) ? "text.link" : undefined}
      onEdit={() => {
        setIsInEditMode(true)
        onEdit?.()
      }}
      onCancel={(previousValue) => {
        setIsInEditMode(false)
        onCancel?.(previousValue)
      }}
      onBlur={(value) => {
        setIsInEditMode(false)
        onBlur?.(value)
      }}
      onSubmit={(value) => {
        setIsInEditMode(false)
        // @ts-ignore
        editableInputProps.onSubmit?.(value)
      }}
      {...editableProps}
    >
      <CustomEditablePreview initialHint={initialHint} {...editablePreviewProps} />
      <Input as={EditableInput} {...editableInputProps} />
      <EditableControls {...controlsProps} compact={compact} />
    </Editable>
  )
})
