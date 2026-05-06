import { Switch } from "@/components/ui/switch"
import { Field, FormControlProps } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { ChangeEventHandler } from "react"
import { useTranslation } from "react-i18next"

interface IProps extends Partial<FormControlProps> {
  isDisabled?: boolean
  disabled?: boolean
  isChecked?: boolean
  checked?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  switchIdForAccessibility: string
  checkedText: string
  uncheckedText: string
}

export const FormSwitch = observer(
  ({
    isChecked,
    isDisabled = false,
    disabled,
    checked,
    onChange,
    switchIdForAccessibility,
    checkedText,
    uncheckedText,
    ...rest
  }: IProps) => {
    const { t } = useTranslation()
    const switchDisabled = disabled ?? isDisabled
    const switchChecked = checked ?? isChecked ?? false

    return (
      <Field.Root display="flex" alignItems="center" w="fit-content" gap={2} disabled={switchDisabled} {...rest}>
        {/*  @ts-ignore*/}
        <Switch id={switchIdForAccessibility} checked={switchChecked} onValueChange={onChange} />
        <Field.Label htmlFor={switchIdForAccessibility} _hover={{ cursor: switchDisabled ? "not-allowed" : undefined }}>
          {switchChecked ? checkedText : uncheckedText}
        </Field.Label>
      </Field.Root>
    )
  }
)
