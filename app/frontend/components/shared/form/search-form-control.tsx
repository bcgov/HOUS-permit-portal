import { InputGroup } from "@/components/ui/input-group"
import { Field, FormControlProps, Input, InputElement } from "@chakra-ui/react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface ISearchFormControlProps extends FormControlProps {
  fieldName: string
}

export const SearchFormControl = ({ label, fieldName, ...rest }: ISearchFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()

  return (
    <Field.Root invalid={!!formState?.errors[fieldName]} flex={1} {...rest}>
      <InputGroup>
        <InputElement pointerEvents="none" color="greys.grey02">
          <MagnifyingGlass size={16} />
        </InputElement>
        <Input
          {...register(fieldName)}
          title={t("ui.search")}
          bg="greys.white"
          placeholder={t("ui.search")}
          type={"text"}
        />
        {formState?.errors[fieldName] && (
          <Field.ErrorText>{formState?.errors[fieldName].message as string}</Field.ErrorText>
        )}
      </InputGroup>
    </Field.Root>
  )
}
