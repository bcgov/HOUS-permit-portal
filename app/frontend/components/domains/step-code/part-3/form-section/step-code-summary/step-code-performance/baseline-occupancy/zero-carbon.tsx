import { Field, Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"

export const BaselineZeroCarbonPerformance = observer(function BaselineZeroCarbonPerformance() {
  const i18nPrefix = "stepCode.part3.stepCodeSummary.stepCode.zeroCarbon"

  return (
    <VStack flex={1} gap={4} borderWidth={1} borderColor="border.light" rounded="md" p={4}>
      <Heading variant="heading4">{t(`${i18nPrefix}.title`)}</Heading>
      <Field.Root w="auto" mx="auto">
        <Field.Label mr={0} my={1} textAlign="center" fontWeight="normal">
          {t(`${i18nPrefix}.levelRequired`)}
        </Field.Label>
        <Text fontWeight="bold" fontSize="lg">
          {t(`${i18nPrefix}.notRequired`)}
        </Text>
      </Field.Root>
      <Field.Root w="auto" mx="auto">
        <Field.Label mr={0} my={1} textAlign="center" fontWeight="normal">
          {t(`${i18nPrefix}.achieved`)}
        </Field.Label>
        <Text fontWeight="bold" fontSize="lg">
          {t(`${i18nPrefix}.notRequired`)}
        </Text>
      </Field.Root>
    </VStack>
  )
})
