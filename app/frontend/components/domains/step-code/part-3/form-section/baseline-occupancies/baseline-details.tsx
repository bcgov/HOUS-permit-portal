import { Accordion, Box, Flex, Heading, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "../shared/form-footer"
import { OccupancyPanel } from "./occupancy-panel"

export const BaselineDetails = observer(function Part3StepCodeFormBaselineDetails() {
  const i18nPrefix = "stepCode.part3.baselineDetails"
  const { checklist } = usePart3StepCode()

  const formMethods = useForm({
    defaultValues: {
      baselineOccupanciesAttributes: checklist.baselineOccupancies.map((oc) => ({
        id: oc.id,
        modelledFloorArea: oc.modelledFloorArea,
        performanceRequirement: oc.performanceRequirement,
        percentBetterRequirement: oc.percentBetterRequirement,
        requirementSource: oc.requirementSource,
      })),
    },
  })
  const { handleSubmit, formState, reset } = formMethods

  const { isSubmitting, isValid, isSubmitted } = formState

  const onSubmit = async (values) => {
    if (!checklist) return
    const updated = await checklist.update(values)
    if (!updated) throw new Error("Save failed")
    await checklist.completeSection("baselineDetails")
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  return (
    <>
      <Flex direction="column" gap={2}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <Flex direction="column" gap={2} pb={4}>
          <Heading as="h2" fontSize="2xl" variant="yellowline" pt={4} m={0}>
            {t(`${i18nPrefix}.heading`)}
          </Heading>
          <Text fontSize="md">{t(`${i18nPrefix}.instructions`)}</Text>
        </Flex>
      </Flex>
      <FormProvider {...formMethods}>
        <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
          <Accordion.Root defaultValue={[...Array(checklist.baselineOccupancies.length).keys()]} multiple>
            {checklist.baselineOccupancies.map((oc, idx) => (
              <Accordion.Item border="none" key={oc.id} value="item-0">
                <Accordion.ItemTrigger bg="greys.grey04" rounded="lg">
                  <Box as="span" flex="1" textAlign="left">
                    {t(`stepCode.part3.baselineOccupancyKeys.${oc.key}`)}
                  </Box>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent pb={4}>
                  <Accordion.ItemBody>
                    <OccupancyPanel occupancy={oc} idx={idx} />
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
          <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
        </Flex>
      </FormProvider>
    </>
  )
})
