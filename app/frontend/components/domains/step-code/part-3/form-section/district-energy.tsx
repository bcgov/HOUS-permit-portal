import { Flex, FormControl, FormHelperText, FormLabel, Input, Radio, RadioGroup, Stack } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus, EFuelType } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

export const DistrictEnergy = observer(function Part3StepCodeFormDistrictEnergy() {
  const i18nPrefix = "stepCode.part3.districtEnergy"
  const { checklist } = usePart3StepCode()

  const [isRelevant, setIsRelevant] = useState(
    !!checklist.districtEnergyFuelType ? "yes" : checklist.isComplete("districtEnergy") && "no"
  )

  const { handleSubmit, formState, resetField, reset, register } = useForm({
    mode: "onSubmit",
    defaultValues: {
      fuelTypesAttributes: [
        checklist.districtEnergyFuelType || {
          key: EFuelType.districtEnergy,
          description: "",
          emissionsFactor: "",
          source: "",
        },
      ],
    },
  })

  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const onSubmit = async (values) => {
    if (!isValid) return

    if (isRelevant == "no") {
      const updated =
        !checklist.districtEnergyFuelType ||
        (await checklist.update({
          fuelTypesAttributes: { id: checklist.districtEnergyFuelType.id, _destroy: true },
        }))
      if (!updated) throw new Error("Save failed")
    } else {
      const updated = await checklist.update(values)
      if (!updated) throw new Error("Save failed")
    }

    const completed = await checklist.completeSection("districtEnergy")
    if (!completed) throw new Error("Save failed")
  }

  useEffect(() => {
    if (isSubmitted) {
      // reset form state to prevent message box from showing again until form is resubmitted
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  useEffect(() => {
    if (isRelevant == "no") {
      resetField("fuelTypesAttributes")
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
          <>
            <Input type="hidden" {...register("fuelTypesAttributes.0.key")} />
            <FormControl>
              <FormLabel>{t(`${i18nPrefix}.description.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="fuelTypesAttributes.0.description" />
              </FormHelperText>
              <Input
                maxW={"224px"}
                {...register("fuelTypesAttributes.0.description", { required: t(`${i18nPrefix}.description.error`) })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>
                <Trans i18nKey={`${i18nPrefix}.emissionsFactor.label`} components={{ sub: <sub /> }} />
              </FormLabel>
              <FormHelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.emissionsFactor.hint`)}
              </FormHelperText>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="fuelTypesAttributes.0.emissionsFactor" />
              </FormHelperText>
              <Input
                maxW={"224px"}
                type="number"
                step="any"
                {...register("fuelTypesAttributes.0.emissionsFactor", {
                  required: t(`${i18nPrefix}.emissionsFactor.error`),
                })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t(`${i18nPrefix}.source.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.source.hint`)}
              </FormHelperText>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="fuelTypesAttributes.0.source" />
              </FormHelperText>
              <Input
                maxW={"224px"}
                {...register("fuelTypesAttributes.0.source", {
                  required: t(`${i18nPrefix}.source.error`),
                })}
              />
            </FormControl>
          </>
        )}
        {!!isRelevant && <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />}
      </Flex>
    </>
  )
})
