import { FormControl, FormControlProps, FormErrorMessage, Input, InputGroup, InputLeftElement } from "@chakra-ui/react"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
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
    <FormControl isInvalid={!!formState?.errors[fieldName]} flex={1} {...rest}>
      <InputGroup>
        <InputLeftElement pointerEvents="none" color="greys.grey02">
          <FontAwesomeIcon style={{ height: 16, width: 16 }} icon={faSearch} />
        </InputLeftElement>
        <Input
          {...register(fieldName, {
            validate: {
              satisfiesNameLength: (str) => (str.length >= 2 && str.length < 128) || t("ui.invalidInput"),
            },
          })}
          placeholder={t("ui.search")}
          type={"text"}
        />
        {formState?.errors[fieldName] && (
          <FormErrorMessage>{formState?.errors[fieldName].message as string}</FormErrorMessage>
        )}
      </InputGroup>
    </FormControl>
  )
}
