import {
  Button,
  ButtonGroup,
  Editable,
  EditableInput,
  EditableInputProps,
  EditablePreview,
  EditablePreviewProps,
  EditableProps,
  Flex,
  IconButton,
  useEditableControls,
} from "@chakra-ui/react"
import { faPencil } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

interface IProps extends Partial<EditableProps> {
  editablePreviewProps?: Partial<EditablePreviewProps>
  editableInputProps?: Partial<EditableInputProps>
  initialHint?: string
  CustomEditableControls?: (props: ReturnType<typeof useEditableControls>) => JSX.Element
}

function EditableControls({ CustomEditableControls }: Pick<IProps, "CustomEditableControls">) {
  const editableControls = useEditableControls()
  const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = editableControls
  const { t } = useTranslation()

  if (CustomEditableControls) {
    return <CustomEditableControls {...editableControls} />
  }

  return isEditing ? (
    <ButtonGroup justifyContent="center" size="sm" spacing={2} ml={4}>
      <Button {...getSubmitButtonProps()} variant={"primary"}>
        {t("ui.onlySave")}
      </Button>
      <Button {...getCancelButtonProps()} variant={"secondary"}>
        {t("ui.cancel")}
      </Button>
    </ButtonGroup>
  ) : (
    <IconButton
      size={"sm"}
      variant={"unstyled"}
      aria-label={"Enter edit mode"}
      color={"text.link"}
      icon={<FontAwesomeIcon icon={faPencil} style={{ width: "14px", height: "14px" }} {...getEditButtonProps()} />}
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
  CustomEditableControls,
  ...editableProps
}: IProps) {
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
      fontWeight={700}
      {...editableProps}
    >
      <EditablePreview {...editablePreviewProps} />
      <EditableInput {...editableInputProps} />
      <EditableControls CustomEditableControls={CustomEditableControls} />
    </Editable>
  )
})
