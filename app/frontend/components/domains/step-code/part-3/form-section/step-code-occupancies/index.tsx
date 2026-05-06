import { RadioGroup } from "@/components/ui/radio"
import { Checkbox, CheckboxGroup, Field, Flex, List, SimpleGrid, Stack } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus, EStepCodeOccupancyKey } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "../shared/form-footer"
import { SectionHeading } from "../shared/section-heading"

export const StepCodeOccupancies = observer(function Part3StepCodeFormStepCodeOccupancies() {
  const i18nPrefix = "stepCode.part3.stepCodeOccupancies"
  const { checklist } = usePart3StepCode()

  const [isRelevant, setIsRelevant] = useState(
    !R.isEmpty(checklist.stepCodeOccupancies) ? "yes" : checklist.isComplete("stepCodeOccupancies") && "no"
  )
  const [radioError, setRadioError] = useState<string | null>(null)

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
    if (radioError) return

    if (isRelevant == "no") {
      const updated =
        R.isEmpty(checklist.stepCodeOccupancies) ||
        (await checklist.update({
          stepCode_occupancies_attributes: checklist.stepCodeOccupancies.map((oc) => ({ id: oc.id, _destroy: true })),
        }))
      if (!updated) throw new Error("Save failed")
      await checklist.bulkUpdateCompletionStatus({
        stepCodeOccupancies: { complete: true },
        stepCodePerformanceRequirements: { relevant: false },
      })
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
      if (!updated) throw new Error("Save failed")
      await checklist.bulkUpdateCompletionStatus({
        stepCodeOccupancies: { complete: true },
        stepCodePerformanceRequirements: { relevant: true },
      })
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
          components={{ ul: <List.Root as="ul" ml={0} pl={6} />, li: <List.Item mb={0} />, strong: <strong /> }}
        />
      </Flex>
      <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
        <Field.Root invalid={!!radioError}>
          <Field.Label>{t(`${i18nPrefix}.isRelevant`)}</Field.Label>
          <RadioGroup.Root onValueChange={handleIsRelevantChange} value={isRelevant}>
            <Stack gap={5} direction="row">
              <RadioGroup.Item variant="binary" value={"yes"}>
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>{t("ui.yes")}</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item variant="binary" value={"no"}>
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>{t("ui.no")}</RadioGroup.ItemText>
              </RadioGroup.Item>
            </Stack>
          </RadioGroup.Root>
          {radioError && <Field.ErrorText>{radioError}</Field.ErrorText>}
        </Field.Root>
        {isRelevant == "yes" && (
          <Field.Root>
            <Field.Label pb={1}>{t(`${i18nPrefix}.occupancies.label`)}</Field.Label>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name="stepCodeOccupancies" />
            </Field.HelperText>
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
                <CheckboxGroup defaultValue={value} onValueChange={onChange}>
                  <SimpleGrid columns={2} gap={1}>
                    {Object.values(EStepCodeOccupancyKey).map((key) => (
                      <Checkbox.Root key={key} value={key}>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Label>
                          <Trans i18nKey={`${i18nPrefix}.occupancyKeys.${key}`} components={{ strong: <strong /> }} />
                        </Checkbox.Label>
                      </Checkbox.Root>
                    ))}
                  </SimpleGrid>
                </CheckboxGroup>
              )}
            />
          </Field.Root>
        )}
        {(isRelevant == "yes" || isRelevant == "no") && (
          <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
        )}
      </Flex>
    </>
  )
})
