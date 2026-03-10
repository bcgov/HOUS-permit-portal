import {
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "../shared/form-footer"
import { SectionHeading } from "../shared/section-heading"

export const FuelTypes = observer(function Part3StepCodeFormFuelTypes() {
  const i18nPrefix = "stepCode.part3.fuelTypes"
  const { checklist } = usePart3StepCode()

  const [isRelevant, setIsRelevant] = useState(
    !R.isEmpty(checklist?.uncommonFuelTypes) ? "yes" : checklist.isComplete("fuelTypes") && "no"
  )

  const { handleSubmit, formState, resetField, reset, control } = useForm({
    mode: "onSubmit",
    defaultValues: { fuelTypes: checklist?.uncommonFuelTypes.map((ft) => ft.key) || [] },
  })

  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const onSubmit = async (values) => {
    if (!checklist) return

    if (isRelevant == "no") {
      const updated =
        R.isEmpty(checklist.uncommonFuelTypes) ||
        (await checklist.update({
          fuelTypesAttributes: checklist.uncommonFuelTypes.map((ft) => ({ id: ft.id, _destroy: true })),
        }))
      if (!updated) throw new Error("Save failed")
      await checklist.bulkUpdateCompletionStatus({
        fuelTypes: { complete: true },
        additionalFuelTypes: { relevant: false },
      })
    } else {
      const newSelections = values.fuelTypes
        .filter((ocKey) => !checklist.uncommonFuelTypes.map((oc) => oc.key).includes(ocKey))
        .map((ocKey) => ({ key: ocKey }))
      const existingSelections = checklist.uncommonFuelTypes
        .filter((oc) => values.fuelTypes.includes(oc.key))
        .map((oc) => ({ id: oc.id }))
      const deletedSelections = checklist.uncommonFuelTypes
        .filter((oc) => !values.fuelTypes.includes(oc.key))
        .map((oc) => ({ id: oc.id, _destroy: true }))
      values.fuelTypesAttributes = [...newSelections, ...existingSelections, ...deletedSelections]
      delete values.fuelTypes

      const updated = await checklist.update(values)
      if (!updated) throw new Error("Save failed")
      await checklist.bulkUpdateCompletionStatus({
        fuelTypes: { complete: true },
        additionalFuelTypes: { relevant: !R.isEmpty(checklist.otherFuelTypes) },
      })
    }
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  useEffect(() => {
    if (isRelevant == "no") {
      resetField("fuelTypes")
    }
  }, [isRelevant])

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
        <Text fontSize="md">
          <Trans i18nKey={`${i18nPrefix}.instructions`} components={{ br: <br /> }} />
        </Text>
      </Flex>
      <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
        <FormControl>
          <FormLabel>{t(`${i18nPrefix}.isRelevant`)}</FormLabel>
          <RadioGroup onChange={setIsRelevant} value={isRelevant}>
            <Stack spacing={5} direction="row">
              <Radio variant="binary" value={"yes"}>
                {t("ui.yes")}
              </Radio>
              <Radio variant="binary" value={"no"}>
                {t("ui.no")}
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        {isRelevant == "yes" && (
          <FormControl>
            <FormLabel pb={1}>{t(`${i18nPrefix}.fuelTypes.label`)}</FormLabel>
            <FormHelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name="fuelTypes" />
            </FormHelperText>
            <Controller
              name="fuelTypes"
              rules={{ required: t(`${i18nPrefix}.fuelTypes.error`) }}
              control={control}
              render={({ field: { onChange, value } }) => (
                <CheckboxGroup defaultValue={value} onChange={onChange}>
                  <Flex direction="column">
                    {Object.values(checklist?.uncommonFuelTypeKeys || []).map((key) => (
                      <Checkbox key={key} value={key}>
                        <Trans i18nKey={`${i18nPrefix}.fuelTypeKeys.${key}`} components={{ strong: <strong /> }} />
                      </Checkbox>
                    ))}
                  </Flex>
                </CheckboxGroup>
              )}
            />
          </FormControl>
        )}
        {(isRelevant == "yes" || isRelevant == "no") && (
          <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
        )}
      </Flex>
    </>
  )
})
