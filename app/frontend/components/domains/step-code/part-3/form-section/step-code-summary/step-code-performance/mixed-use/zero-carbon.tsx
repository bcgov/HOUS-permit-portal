import { Field, Flex, Heading, Input, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { ZeroCarbonSteps } from "../../../../../part-9/checklist/compliance-summary/zero-carbon-steps"

export const MixedUseZeroCarbonPerformance = observer(function MixedUseZeroCarbonPerformance() {
  const i18nPrefix = "stepCode.part3.stepCodeSummary.stepCode.zeroCarbon"

  return (
    <VStack flex={1} gap={4} borderWidth={1} borderColor="border.light" rounded="md" p={4}>
      <Heading variant="heading4">{t(`${i18nPrefix}.title`)}</Heading>
      <Text fontSize="md" textAlign="center">
        {t(`${i18nPrefix}.multiOccupancy`)}
      </Text>
      <Field.Root w="auto" mx="auto">
        <Field.Label mr={0} my={1} textAlign="center" fontWeight="normal">
          {t(`${i18nPrefix}.levelRequired`)}
        </Field.Label>
        <Input maxW={"124px"} value="-" disabled />
      </Field.Root>
      <Flex maxW="240px" w="full">
        <ZeroCarbonSteps offset={1} isPlaceholder />
      </Flex>
      <Field.Root w="auto" mx="auto">
        <Field.Label mr={0} my={1} textAlign="center" fontWeight="normal">
          {t(`${i18nPrefix}.achieved`)}
        </Field.Label>
        <Input maxW={"124px"} value="-" disabled />
      </Field.Root>
    </VStack>
  )
})
