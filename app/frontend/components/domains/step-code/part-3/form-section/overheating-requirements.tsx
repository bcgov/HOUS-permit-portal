import { Button, Flex, FormControl, FormHelperText, FormLabel, Input, Radio, RadioGroup, Stack } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { SectionHeading } from "./shared/section-heading"

export const OverheatingRequirements = observer(function Part3StepCodeFormOverheatingRequirements() {
  const i18nPrefix = "stepCode.part3.overheatingRequirements"
  const { checklist } = usePart3StepCode()

  const [isRelevant, setIsRelevant] = useState(
    !!checklist.overheatingHours ? "yes" : checklist.isComplete("overheatingRequirements") && "no"
  )

  const navigate = useNavigate()
  const location = useLocation()

  const { handleSubmit, formState, resetField, reset, register, watch } = useForm({
    mode: "onSubmit",
    defaultValues: {
      overheatingHours: parseFloat(checklist.overheatingHours),
    },
  })
  const watchOverheatingHours = watch("overheatingHours")
  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const onSubmit = async (values) => {
    if (!isValid) return

    if (isRelevant == "no") {
      // update the checklist to remove generatedElectricity if present
      const updated =
        !checklist.overheatingHours ||
        (await checklist.update({
          overheatingHours: null,
        }))
      if (!updated) return
    } else {
      const updated = await checklist.update(values)
      if (!updated) return
    }

    await checklist.completeSection("overheatingRequirements")

    navigate(location.pathname.replace("overheating-requirements", "residential-adjustments"))
  }

  useEffect(() => {
    if (isSubmitted) {
      // reset form state to prevent message box from showing again until form is resubmitted
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
        {!isValid && isSubmitted && <CustomMessageBox title={t("stepCode.part3.errorTitle")} status="error" />}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)}>
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
          {isRelevant == "yes" ? (
            <>
              <FormControl>
                <FormLabel>{t(`${i18nPrefix}.limit.label`)}</FormLabel>
                <FormHelperText mb={1} mt={0}>
                  {t(`${i18nPrefix}.limit.hint`)}
                </FormHelperText>
                <Input maxW="200px" value={checklist.overheatingHoursLimit} isDisabled />
              </FormControl>
              <FormControl>
                <FormLabel>{t(`${i18nPrefix}.worstCase.label`)}</FormLabel>
                <FormHelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="overheatingHours" />
                </FormHelperText>
                <Input
                  maxW={"200px"}
                  type="number"
                  {...register("overheatingHours", { required: t(`${i18nPrefix}.worstCase.error`) })}
                />
              </FormControl>
              {parseFloat(watchOverheatingHours) > checklist.overheatingHoursLimit ? (
                <CustomMessageBox title={t(`${i18nPrefix}.compliance.fail`)} status="error" />
              ) : (
                watchOverheatingHours && (
                  <CustomMessageBox title={t(`${i18nPrefix}.compliance.pass`)} status="success" />
                )
              )}
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
