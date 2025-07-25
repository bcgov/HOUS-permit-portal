import {
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  ListItem,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  UnorderedList,
} from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus, EStepCodeOccupancyKey } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { SectionHeading } from "../shared/section-heading"

export const StepCodeOccupancies = observer(function Part3StepCodeFormStepCodeOccupancies() {
  const i18nPrefix = "stepCode.part3.stepCodeOccupancies"
  const { checklist } = usePart3StepCode()

  const [isRelevant, setIsRelevant] = useState(
    !R.isEmpty(checklist.stepCodeOccupancies) ? "yes" : checklist.isComplete("stepCodeOccupancies") && "no"
  )
  const [radioError, setRadioError] = useState<string | null>(null)

  const navigate = useNavigate()
  const location = useLocation()

  const { handleSubmit, formState, control, reset, trigger } = useForm({
    mode: "onSubmit",
    defaultValues: { stepCodeOccupancies: checklist.stepCodeOccupancies.map((oc) => oc.key) },
  })

  const { isSubmitting, isValid, isSubmitted, errors } = formState

  useEffect(() => {
    if (isRelevant === "no" && R.isEmpty(checklist.baselineOccupancies)) {
      setRadioError(t(`${i18nPrefix}.cannotSelectNoWhenBaselineEmpty`) as string)
    }
  }, [])

  const onSubmit = async (values) => {
    if (!checklist) return
    if (radioError) {
      return
    }

    const alternatePath = checklist.alternateNavigateAfterSavePath
    checklist.setAlternateNavigateAfterSavePath(null)

    let updateSucceeded = false
    if (!isValid) return
    if (isRelevant == "no") {
      const updated =
        R.isEmpty(checklist.stepCodeOccupancies) ||
        (await checklist.update({
          stepCode_occupancies_attributes: checklist.stepCodeOccupancies.map((oc) => ({ id: oc.id, _destroy: true })),
        }))
      if (updated) {
        await checklist.bulkUpdateCompletionStatus({
          stepCodeOccupancies: { complete: true },
          stepCodePerformanceRequirements: { relevant: false },
        })
        updateSucceeded = true
      } else {
        return
      }
    } else {
      const newSelections = values.stepCodeOccupancies
        .filter((ocKey) => !checklist.stepCodeOccupancies.map((oc) => oc.key).includes(ocKey))
        .map((ocKey) => ({ key: ocKey }))
      const existingSelections = checklist.stepCodeOccupancies
        .filter((oc) => values.stepCodeOccupancies.includes(oc.key))
        .map((oc) => ({ id: oc.id }))
      const deletedSelections = checklist.stepCodeOccupancies
        .filter((oc) => !values.stepCodeOccupancies.includes(oc.key))
        .map((oc) => ({ id: oc.id, _destroy: true }))
      values.stepCodeOccupanciesAttributes = [...newSelections, ...existingSelections, ...deletedSelections]
      delete values.stepCodeOccupancies

      const updated = await checklist.update(values)
      if (updated) {
        await checklist.bulkUpdateCompletionStatus({
          stepCodeOccupancies: { complete: true },
          stepCodePerformanceRequirements: { relevant: true },
        })
        updateSucceeded = true
      } else {
        return
      }
    }

    if (updateSucceeded) {
      if (alternatePath) {
        navigate(alternatePath)
      } else {
        const nextSectionPath = isRelevant == "yes" ? "step-code-performance-requirements" : "modelled-outputs"
        navigate(location.pathname.replace("step-code-occupancies", nextSectionPath))
      }
    }
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  useEffect(() => {
    // trigger validation when the isRelevant value changes, as it is a dependency for the validation
    trigger("stepCodeOccupancies")
  }, [isRelevant, trigger])

  const handleIsRelevantChange = (newValue: string) => {
    setIsRelevant(newValue)
    if (newValue === "no" && R.isEmpty(checklist.baselineOccupancies)) {
      setRadioError(t(`${i18nPrefix}.cannotSelectNoWhenBaselineEmpty`) as string)
    } else {
      setRadioError(null)
    }
  }

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
        <Trans
          i18nKey={`${i18nPrefix}.instructions`}
          components={{ ul: <UnorderedList ml={0} pl={6} />, li: <ListItem mb={0} />, strong: <strong /> }}
        />
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)} name="part3SectionForm">
        <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
          <FormControl isInvalid={!!radioError}>
            <FormLabel>{t(`${i18nPrefix}.isRelevant`)}</FormLabel>
            <RadioGroup onChange={handleIsRelevantChange} value={isRelevant}>
              <Stack spacing={5} direction="row">
                <Radio variant="binary" value={"yes"}>
                  {t("ui.yes")}
                </Radio>
                <Radio variant="binary" value={"no"}>
                  {t("ui.no")}
                </Radio>
              </Stack>
            </RadioGroup>
            {radioError && <FormErrorMessage>{radioError}</FormErrorMessage>}
          </FormControl>
          {isRelevant == "yes" ? (
            <>
              <FormControl>
                <FormLabel pb={1}>{t(`${i18nPrefix}.occupancies.label`)}</FormLabel>
                <FormHelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="stepCodeOccupancies" />
                </FormHelperText>
                <Controller
                  name="stepCodeOccupancies"
                  rules={{
                    validate: (value) => {
                      if (isRelevant === "yes" && (!value || value.length === 0)) {
                        return t(`${i18nPrefix}.occupancies.error`)
                      }
                      return true
                    },
                  }}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CheckboxGroup defaultValue={value} onChange={onChange}>
                      <SimpleGrid columns={2} spacing={1}>
                        {Object.values(EStepCodeOccupancyKey).map((key) => (
                          <Checkbox key={key} value={key}>
                            <Trans i18nKey={`${i18nPrefix}.occupancyKeys.${key}`} components={{ strong: <strong /> }} />
                          </Checkbox>
                        ))}
                      </SimpleGrid>
                    </CheckboxGroup>
                  )}
                />
              </FormControl>
              <FormControl>
                <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
                  {t("stepCode.part3.cta")}
                </Button>
              </FormControl>
            </>
          ) : isRelevant == "no" ? (
            <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {t("stepCode.part3.cta")}
            </Button>
          ) : null}
        </Flex>
      </form>
    </>
  )
})
