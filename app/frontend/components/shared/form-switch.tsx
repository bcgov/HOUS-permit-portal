import { FormControl, FormControlProps, FormLabel, Switch } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { ChangeEventHandler } from "react"
import { useTranslation } from "react-i18next"

interface IProps extends Partial<FormControlProps> {
  isDisabled?: boolean
  isChecked: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  switchIdForAccessibility: string
  checkedText: string
  uncheckedText: string
}

export const FormSwitch = observer(
  ({
    isChecked,
    isDisabled = false,
    onChange,
    switchIdForAccessibility,
    checkedText,
    uncheckedText,
    ...rest
  }: IProps) => {
    const { t } = useTranslation()

    return (
      <FormControl display="flex" alignItems="center" w="fit-content" gap={2} isDisabled={isDisabled} {...rest}>
        {/*  @ts-ignore*/}
        <Switch id={switchIdForAccessibility} isChecked={isChecked} onChange={onChange} />
        <FormLabel htmlFor={switchIdForAccessibility} _hover={{ cursor: isDisabled ? "not-allowed" : undefined }}>
          {isChecked ? checkedText : uncheckedText}
        </FormLabel>
      </FormControl>
    )
  }
)
