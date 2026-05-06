import { InputGroup } from "@/components/ui/input-group"
import { Field, Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { JurisdictionSelect } from "./jurisdiction-select"

interface IManualModeInputsProps {
  disabled?: boolean
}

export const ManualModeInputs = observer(({ disabled }: IManualModeInputsProps) => {
  const { control, setValue } = useFormContext()
  const { jurisdictionStore } = useMst()
  const { addJurisdiction, getJurisdictionById } = jurisdictionStore
  const { t } = useTranslation()

  return (
    <Flex direction="column" bg="greys.grey03" px={6} py={2} gap={4} w="full">
      <Flex gap={4}>
        <Controller
          name="jurisdictionId"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <Field.Root w="full" zIndex={1}>
                <Field.Label>{t("permitProject.new.jurisdictionTitle")}</Field.Label>
                <InputGroup w="full">
                  <JurisdictionSelect
                    onChange={(selectValue) => {
                      if (selectValue) addJurisdiction(selectValue)
                      onChange(selectValue?.id)
                    }}
                    onFetch={() => setValue("jurisdictionId", null)}
                    selectedOption={value ? { label: getJurisdictionById(value)?.reverseQualifiedName, value } : null}
                    menuPortalTarget={document.body}
                    disabled={disabled}
                  />
                </InputGroup>
              </Field.Root>
            )
          }}
        />
      </Flex>
    </Flex>
  )
})
