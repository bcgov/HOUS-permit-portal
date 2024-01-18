import { Box, BoxProps, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { SharedSpinner } from "../shared-spinner"

interface ILocalityRadioGroupProps extends BoxProps {}

export const LocalityRadioGroup = observer(({ ...rest }: ILocalityRadioGroupProps) => {
  const { control } = useFormContext()

  const { t } = useTranslation()

  const {
    jurisdictionStore: { fetchLocalityTypeOptions, localityTypeOptions },
  } = useMst()

  useEffect(() => {
    fetchLocalityTypeOptions()
  }, [])
  return localityTypeOptions?.length > 0 ? (
    <Box w="full" {...rest}>
      <Text mb={1}>{t("jurisdiction.fields.localityType")}</Text>
      <Controller
        name="localityType"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => {
          return (
            <RadioGroup
              onChange={onChange}
              value={value}
              bg="greys.grey03"
              p={4}
              border="1px solid"
              borderColor="greys.grey02"
              borderRadius="sm"
            >
              <Stack direction="column">
                {localityTypeOptions.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          )
        }}
      />
    </Box>
  ) : (
    <SharedSpinner />
  )
})
