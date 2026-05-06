import { RadioGroup } from "@/components/ui/radio"
import { Field, Flex, Input, Stack } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

export const OverheatingRequirements = observer(function Part3StepCodeFormOverheatingRequirements() {
  const i18nPrefix = "stepCode.part3.overheatingRequirements"
  const { checklist } = usePart3StepCode()

  const [isRelevant, setIsRelevant] = useState(
    !!checklist.overheatingHours ? "yes" : checklist.isComplete("overheatingRequirements") && "no"
  )

  const { handleSubmit, formState, resetField, reset, register, watch } = useForm({
    mode: "onSubmit",
    defaultValues: {
      overheatingHours: parseFloat(checklist.overheatingHours),
    },
  })
  const watchOverheatingHours = watch("overheatingHours")
  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const onSubmit = async (values) => {
    if (!checklist) return
    if (!isValid) return

    if (isRelevant == "no") {
      const updated =
        !checklist.overheatingHours ||
        (await checklist.update({
          overheatingHours: null,
        }))
      if (!updated) throw new Error("Save failed")
    } else {
      const updated = await checklist.update(values)
      if (!updated) throw new Error("Save failed")
    }

    await checklist.completeSection("overheatingRequirements")
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  useEffect(() => {
    if (isRelevant == "no") {
      resetField("overheatingHours")
    }
  }, [isRelevant])

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
              <Field.Label>{t(`${i18nPrefix}.limit.label`)}</Field.Label>
              <Field.HelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.limit.hint`)}
              </Field.HelperText>
              <Input maxW="200px" value={checklist.overheatingHoursLimit} disabled />
            </Field.Root>
            <Field.Root>
              <Field.Label>{t(`${i18nPrefix}.worstCase.label`)}</Field.Label>
              <Field.HelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="overheatingHours" />
              </Field.HelperText>
              <Input
                maxW={"200px"}
                type="number"
                {...register("overheatingHours", { required: t(`${i18nPrefix}.worstCase.error`) })}
              />
            </Field.Root>
            {watchOverheatingHours > checklist.overheatingHoursLimit ? (
              <CustomMessageBox title={t(`${i18nPrefix}.compliance.fail`)} status={EFlashMessageStatus.error} />
            ) : watchOverheatingHours ? (
              <CustomMessageBox title={t(`${i18nPrefix}.compliance.pass`)} status={EFlashMessageStatus.success} />
            ) : null}
          </>
        ) : null}
        {!!isRelevant && <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />}
      </Flex>
    </>
  )
})
