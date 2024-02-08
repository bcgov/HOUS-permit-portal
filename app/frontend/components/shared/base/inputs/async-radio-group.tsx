import { Flex, FlexProps, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IOption } from "../../../../types/types"
import { SharedSpinner } from "../shared-spinner"

interface IAsyncRadioGroupProps<T> extends FlexProps {
  label: string
  valueField?: string
  fetchOptions: () => Promise<IOption<T>[]>
  fieldName: string
}

export const AsyncRadioGroup = observer(
  <T,>({ label, fetchOptions, fieldName, valueField, ...rest }: IAsyncRadioGroupProps<T>) => {
    const { control } = useFormContext()
    const [options, setOptions] = useState<IOption<T>[]>([])

    const [error, setError] = useState<Error | undefined>(undefined)

    const { t } = useTranslation()

    useEffect(() => {
      ;(async () => {
        try {
          const opts = await fetchOptions()
          setOptions(opts)
        } catch (e) {
          setError(e instanceof Error ? e : new Error(t("errors.fetchOptions")))
        }
      })()
    }, [])

    return options?.length > 0 ? (
      <Flex direction="column" w="full" {...rest}>
        <Text mb={1}>{label}</Text>
        {error ? (
          <Text>{error.message}</Text>
        ) : (
          <Controller
            name={fieldName}
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => {
              return (
                <RadioGroup
                  onChange={onChange}
                  value={value}
                  bg="greys.grey03"
                  flex={1}
                  p={4}
                  border="1px solid"
                  borderColor="greys.grey02"
                  borderRadius="sm"
                >
                  <Stack direction="column">
                    {options.map((option) => {
                      const optionValue = valueField ? option.value[valueField] : option.value
                      return (
                        <Radio key={optionValue} value={optionValue} bg="white">
                          {option.label}
                        </Radio>
                      )
                    })}
                  </Stack>
                </RadioGroup>
              )
            }}
          />
        )}
      </Flex>
    ) : (
      <SharedSpinner />
    )
  }
)
