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
import { EBaselineOccupancyKey, EFlashMessageStatus } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "../shared/form-footer"
import { SectionHeading } from "../shared/section-heading"

export const BaselineOccupancies = observer(function Part3StepCodeFormBaselineOccupancies() {
  const i18nPrefix = "stepCode.part3.baselineOccupancies"
  const { checklist } = usePart3StepCode()

  const [isRelevant, setIsRelevant] = useState(
    !R.isEmpty(checklist.baselineOccupancies) ? "yes" : checklist.isComplete("baselineOccupancies") && "no"
  )

  const { handleSubmit, formState, control, reset, trigger } = useForm({
    mode: "onSubmit",
    defaultValues: { baselineOccupancies: checklist.baselineOccupancies.map((oc) => oc.key) },
  })

  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const onSubmit = async (values) => {
    if (!checklist) return

    if (isRelevant == "no") {
      const updated =
        R.isEmpty(checklist.baselineOccupancies) ||
        (await checklist.update({
          baseline_occupancies_attributes: checklist.baselineOccupancies.map((oc) => ({ id: oc.id, _destroy: true })),
        }))
      if (!updated) throw new Error("Save failed")
      await checklist.bulkUpdateCompletionStatus({
        baselineOccupancies: { complete: true },
        baselineDetails: { relevant: false },
      })
    } else {
      const newSelections = values.baselineOccupancies
        .filter((ocKey) => !checklist.baselineOccupancies.map((oc) => oc.key).includes(ocKey))
        .map((ocKey) => ({ key: ocKey }))
      const existingSelections = checklist.baselineOccupancies
        .filter((oc) => values.baselineOccupancies.includes(oc.key))
        .map((oc) => ({ id: oc.id }))
      const deletedSelections = checklist.baselineOccupancies
        .filter((oc) => !values.baselineOccupancies.includes(oc.key))
        .map((oc) => ({ id: oc.id, _destroy: true }))
      values.baselineOccupanciesAttributes = [...newSelections, ...existingSelections, ...deletedSelections]
      delete values.baselineOccupancies

      const updated = await checklist.update(values)
      if (!updated) throw new Error("Save failed")
      await checklist.bulkUpdateCompletionStatus({
        baselineOccupancies: { complete: true },
        baselineDetails: { relevant: true },
        baselinePerformance: { relevant: true },
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
    trigger("baselineOccupancies")
  }, [isRelevant, trigger])

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
        <Field.Root>
          <Field.Label>{t(`${i18nPrefix}.isRelevant`)}</Field.Label>
          <RadioGroup.Root onValueChange={setIsRelevant} value={isRelevant}>
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
        </Field.Root>
        {isRelevant == "yes" && (
          <Field.Root>
            <Field.Label pb={1}>{t(`${i18nPrefix}.occupancies.label`)}</Field.Label>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name="baselineOccupancies" />
            </Field.HelperText>
            <Controller
              name="baselineOccupancies"
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
                    {Object.values(EBaselineOccupancyKey).map((key) => (
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
