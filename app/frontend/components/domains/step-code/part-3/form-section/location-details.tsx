import { Radio, RadioGroup } from "@/components/ui/radio"
import { Field, Flex, Input, Stack, Text } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EClimateZone, EFlashMessageStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

export const LocationDetails = observer(function Part3StepCodeFormLocationDetails() {
  const i18nPrefix = "stepCode.part3.locationDetails"
  const { checklist, currentStepCode } = usePart3StepCode()

  const { handleSubmit, formState, register, control, reset } = useForm({
    defaultValues: {
      buildingHeight: checklist.buildingHeight && parseFloat(checklist.buildingHeight),
      heatingDegreeDays: checklist.heatingDegreeDays ?? currentStepCode?.jurisdiction?.heatingDegreeDays ?? null,
      climateZone: checklist.climateZone,
    },
  })
  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const onSubmit = async (values) => {
    if (!checklist) return

    const updated = await checklist.update(values)
    if (!updated) throw new Error("Save failed")

    await checklist.completeSection("locationDetails")
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
        <Text fontSize="md">{t(`${i18nPrefix}.instructions`)}</Text>
      </Flex>
      <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
        <Field.Root>
          <Field.Label>{t(`${i18nPrefix}.aboveGradeStories.label`)}</Field.Label>
          <Field.HelperText mb={1} mt={0}>
            {t(`${i18nPrefix}.aboveGradeStories.hint`)}
          </Field.HelperText>
          <Field.HelperText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name="buildingHeight" />
          </Field.HelperText>
          <Input
            maxW={"200px"}
            type="number"
            step={0.1}
            textAlign="left"
            {...register("buildingHeight", { required: t(`${i18nPrefix}.aboveGradeStories.error`) })}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>{t(`${i18nPrefix}.hdd.label`)}</Field.Label>
          <Field.HelperText mb={1} mt={0}>
            {t(`${i18nPrefix}.hdd.hint`)}
          </Field.HelperText>
          <Field.HelperText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name="heatingDegreeDays" />
          </Field.HelperText>
          <Input
            maxW={"200px"}
            type="number"
            textAlign="left"
            {...register("heatingDegreeDays", { required: t(`${i18nPrefix}.hdd.error`) })}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label pb={1}>{t(`${i18nPrefix}.climateZone.label`)}</Field.Label>
          <Field.ErrorText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name="climateZone" />
          </Field.ErrorText>
          <Controller
            name="climateZone"
            control={control}
            rules={{ required: t(`${i18nPrefix}.climateZone.error`) }}
            render={({ field: { onChange, value } }) => (
              <RadioGroup.Root defaultValue={value} onValueChange={onChange}>
                <Stack gap={1}>
                  {Object.values(EClimateZone).map((zone) => (
                    <Radio key={zone} value={zone}>
                      {t(`${i18nPrefix}.climateZones.${zone}`)}
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup.Root>
            )}
          />
        </Field.Root>
        <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
      </Flex>
    </>
  )
})
