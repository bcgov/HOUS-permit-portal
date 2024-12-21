import { Flex, FormControl, FormLabel, Heading, Input, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { ZeroCarbonSteps } from "../../../../../part-9/checklist/compliance-summary/zero-carbon-steps"

export const MixedUseZeroCarbonPerformance = observer(function MixedUseZeroCarbonPerformance() {
  const i18nPrefix = "stepCode.part3.stepCodeSummary.stepCode.zeroCarbon"

  return (
    <VStack flex={1} spacing={4} borderWidth={1} borderColor="border.light" rounded="md" p={4}>
      <Heading variant="heading4">{t(`${i18nPrefix}.title`)}</Heading>
      <Text fontSize="md" textAlign="center">
        {t(`${i18nPrefix}.multiOccupancy`)}
      </Text>
      <FormControl w="auto" mx="auto">
        <FormLabel mr={0} my={1} textAlign="center" fontWeight="normal">
          {t(`${i18nPrefix}.levelRequired`)}
        </FormLabel>
        <Input maxW={"124px"} value="-" isDisabled />
      </FormControl>
      <Flex maxW="240px" w="full">
        <ZeroCarbonSteps offset={1} isPlaceholder />
      </Flex>
      <FormControl w="auto" mx="auto">
        <FormLabel mr={0} my={1} textAlign="center" fontWeight="normal">
          {t(`${i18nPrefix}.achieved`)}
        </FormLabel>
        <Input maxW={"124px"} value="-" isDisabled />
      </FormControl>
    </VStack>
  )
})
