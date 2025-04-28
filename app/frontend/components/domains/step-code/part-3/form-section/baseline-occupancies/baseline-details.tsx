import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { OccupancyPanel } from "./occupancy-panel"

export const BaselineDetails = observer(function Part3StepCodeFormBaselineDetails() {
  const i18nPrefix = "stepCode.part3.baselineDetails"
  const { checklist } = usePart3StepCode()

  const navigate = useNavigate()
  const location = useLocation()

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

    const alternatePath = checklist.alternateNavigateAfterSavePath
    checklist.setAlternateNavigateAfterSavePath(null)

    let updateSucceeded = false
    if (!isValid) return
    const updated = await checklist.update(values)
    if (updated) {
      await checklist.completeSection("baselineDetails")
      updateSucceeded = true
    } else {
      return
    }

    if (updateSucceeded) {
      if (alternatePath) {
        navigate(alternatePath)
      } else {
        navigate(location.pathname.replace("baseline-details", "district-energy"))
      }
    }
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
        <form onSubmit={handleSubmit(onSubmit)} name="part3SectionForm">
          <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
            <Accordion defaultIndex={[...Array(checklist.baselineOccupancies.length).keys()]} allowMultiple>
              {checklist.baselineOccupancies.map((oc, idx) => (
                <AccordionItem border="none" key={oc.id}>
                  <AccordionButton bg="greys.grey04" rounded="lg">
                    <Box as="span" flex="1" textAlign="left">
                      {t(`stepCode.part3.baselineOccupancyKeys.${oc.key}`)}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <OccupancyPanel occupancy={oc} idx={idx} />
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
            <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {t("stepCode.part3.cta")}
            </Button>
          </Flex>
        </form>
      </FormProvider>
    </>
  )
})
