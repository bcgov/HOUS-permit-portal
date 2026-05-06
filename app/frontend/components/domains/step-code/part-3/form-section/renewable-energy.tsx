import { InputGroup } from "@/components/ui/input-group"
import { RadioGroup } from "@/components/ui/radio"
import { Field, Flex, Input, InputElement, Stack } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

export const RenewableEnergy = observer(function Part3StepCodeFormRenewableEnergy() {
  const i18nPrefix = "stepCode.part3.renewableEnergy"
  const { checklist } = usePart3StepCode()

  const [isRelevant, setIsRelevant] = useState(
    !!checklist.generatedElectricity ? "yes" : checklist.isComplete("renewableEnergy") && "no"
  )

  const { handleSubmit, formState, resetField, reset, register, watch } = useForm({
    mode: "onSubmit",
    defaultValues: {
      generatedElectricity: checklist.generatedElectricity,
    },
  })
  const watchGeneratedElectricity = watch("generatedElectricity")
  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const onSubmit = async (values) => {
    if (!checklist) return
    if (!isValid) return

    if (isRelevant == "no") {
      const updated =
        !checklist.generatedElectricity ||
        (await checklist.update({
          generatedElectricity: null,
        }))
      if (!updated) throw new Error("Save failed")
    } else {
      const updated = await checklist.update(values)
      if (!updated) throw new Error("Save failed")
    }

    await checklist.completeSection("renewableEnergy")
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  useEffect(() => {
    if (isRelevant == "no") {
      resetField("generatedElectricity")
    }
  }, [isRelevant])

  const percentOfUse = useMemo(() => {
    if (checklist.totalElectricityUse == 0) return null
    return parseFloat(watchGeneratedElectricity) / checklist.totalElectricityUse
  }, [watchGeneratedElectricity])

  const adjustedElectricityEF = useMemo(() => {
    if (!percentOfUse) return null
    return parseFloat(checklist.electricity.emissionsFactor) - 0.157 * percentOfUse
  }, [watchGeneratedElectricity])

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
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
        {isRelevant == "yes" ? (
          <>
            <Field.Root>
              <Field.Label>{t(`${i18nPrefix}.generatedElectricity.label`)}</Field.Label>
              <Field.HelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="generatedElectricity" />
              </Field.HelperText>
              <InputGroup maxW={"200px"}>
                <Input
                  type="number"
                  step="any"
                  {...register("generatedElectricity", { required: t(`${i18nPrefix}.generatedElectricity.error`) })}
                />
                <InputElement placement="end">{t(`${i18nPrefix}.generatedElectricity.units`)}</InputElement>
              </InputGroup>
            </Field.Root>
            <Field.Root>
              <Field.Label>{t(`${i18nPrefix}.percentOfUse.label`)}</Field.Label>
              <Field.HelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.percentOfUse.hint`)}
              </Field.HelperText>
              <InputGroup maxW={"200px"}>
                <Input value={percentOfUse || "-"} disabled />
                <InputElement placement="end">{t(`${i18nPrefix}.percentOfUse.units`)}</InputElement>
              </InputGroup>
            </Field.Root>
            <Field.Root>
              <Field.Label>
                <Trans i18nKey={`${i18nPrefix}.adjustedEF.label`} components={{ sub: <sub /> }} />
              </Field.Label>
              <Field.HelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.adjustedEF.hint`)}
              </Field.HelperText>
              <Input maxW={"200px"} value={adjustedElectricityEF || "-"} disabled />
            </Field.Root>
          </>
        ) : null}
        {!!isRelevant && <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />}
      </Flex>
    </>
  )
})
