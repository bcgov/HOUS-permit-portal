import {
  Button,
  ButtonGroup,
  ButtonProps,
  Editable,
  EditableInput,
  EditablePreviewProps,
  EditableProps,
  Flex,
  IconButton,
  IconButtonProps,
  Input,
  InputProps,
  useEditableContext,
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
  [key: string]: unknown
}

export interface IEditableInputWithControlsProps extends EditableProps {
  editablePreviewProps?: Omit<ICustomEditablePreviewProps, "initialHint">
  editableInputProps?: Partial<InputProps>
  initialHint?: string
  controlsProps?: IControlsProps
  compact?: boolean
  [key: string]: unknown
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
  const editableControls = useEditableContext()
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
          <IconButton aria-label={"Save"} size={"xs"} variant={"ghost"} {...getSubmitButtonProps()}>
            <Check size={14} />
          </IconButton>
          <IconButton aria-label={"Cancel"} size={"xs"} variant={"ghost"} {...getCancelButtonProps()}>
            <X size={14} />
          </IconButton>
        </Flex>
      )
    }
    return CustomEditModeControls ? (
      <CustomEditModeControls {...editableControls} />
    ) : (
      <ButtonGroup justifyContent="center" size="sm" gap={2} ml={4}>
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
      variant={"plain"}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      aria-label={"Enter edit mode"}
      color={"text.link"}
      {...getEditButtonProps()}
      {...iconButtonProps}
    >
      <Pencil size={14} />
    </IconButton>
  )
}

const CustomEditablePreview = observer(function CustomEditablePreview({
  renderCustomPreview,
  initialHint,
  ...rest
}: ICustomEditablePreviewProps) {
  const editableControls = useEditableContext()
  const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = editableControls

  return renderCustomPreview ? (
    renderCustomPreview({ ...rest, initialHint, isEditing, onClick: getEditButtonProps()?.onClick })
  ) : (
    <Editable.Preview {...rest} />
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
    <Editable.Root
      alignItems={compact ? "stretch" : "center"}
      flexWrap={compact ? "wrap" : undefined}
      placeholder={isInEditMode ? placeholder : (initialHint ?? placeholder)}
      color={R.isEmpty(editableProps.value) ? "text.link" : undefined}
      {...editableProps}
      asChild
    >
      <Flex
        onEdit={() => {
          setIsInEditMode(true)
          onEdit?.()
        }}
        onValueRevert={(previousValue) => {
          setIsInEditMode(false)
          onCancel?.(previousValue)
        }}
        onBlur={(value) => {
          setIsInEditMode(false)
          onBlur?.(value)
        }}
        onValueCommit={(value) => {
          setIsInEditMode(false)
          // @ts-ignore
          editableInputProps.onSubmit?.(value)
        }}
      >
        <CustomEditablePreview initialHint={initialHint} {...editablePreviewProps} />
        <Input {...editableInputProps} asChild>
          <EditableInput />
        </Input>
        <EditableControls {...controlsProps} compact={compact} />
      </Flex>
    </Editable.Root>
  )
})
