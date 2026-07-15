import { Flex, FormControl, FormHelperText, FormLabel, Input, Link, Text } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { climateZoneFromHdd } from "../../../../../utils/climate-zone"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

export const LocationDetails = observer(function Part3StepCodeFormLocationDetails() {
  const i18nPrefix = "stepCode.part3.locationDetails"
  const { checklist, currentStepCode } = usePart3StepCode()

  const { handleSubmit, formState, register, control, reset } = useForm({
    defaultValues: {
      buildingHeight: checklist.buildingHeight && parseFloat(checklist.buildingHeight),
      heatingDegreeDays: checklist.heatingDegreeDays ?? null,
    },
  })
  const { isSubmitting, isValid, isSubmitted, errors } = formState
  const heatingDegreeDays = useWatch({ control, name: "heatingDegreeDays" })
  const derivedClimateZone = climateZoneFromHdd(
    heatingDegreeDays === "" || heatingDegreeDays === null || heatingDegreeDays === undefined
      ? null
      : Number(heatingDegreeDays)
  )

  const onSubmit = async (values) => {
    if (!checklist) return

    const climateZone = climateZoneFromHdd(
      values.heatingDegreeDays === "" || values.heatingDegreeDays === null ? null : Number(values.heatingDegreeDays)
    )

    const updated = await checklist.update({
      ...values,
      climateZone,
    })
    if (!updated) throw new Error("Save failed")

    await checklist.completeSection("locationDetails")
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  const jurisdictionSlugOrId = currentStepCode?.jurisdiction?.slug || currentStepCode?.jurisdiction?.id
  const hddReferenceHref = jurisdictionSlugOrId
    ? `/jurisdictions/${jurisdictionSlugOrId}/step-code-requirements#heating-degree-days`
    : null

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
        <FormControl>
          <FormLabel>{t(`${i18nPrefix}.aboveGradeStories.label`)}</FormLabel>
          <FormHelperText mb={1} mt={0}>
            {t(`${i18nPrefix}.aboveGradeStories.hint`)}
          </FormHelperText>
          <FormHelperText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name="buildingHeight" />
          </FormHelperText>
          <Input
            maxW={"200px"}
            type="number"
            step={0.1}
            textAlign="left"
            {...register("buildingHeight", { required: t(`${i18nPrefix}.aboveGradeStories.error`) })}
          />
        </FormControl>
        <FormControl>
          <FormLabel>{t(`${i18nPrefix}.hdd.label`)}</FormLabel>
          {hddReferenceHref && (
            <FormHelperText mb={2} mt={0}>
              <Trans
                i18nKey={`${i18nPrefix}.hdd.jurisdictionReference`}
                components={{
                  a: (
                    <Link
                      href={hddReferenceHref}
                      color="text.link"
                      isExternal
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
            </FormHelperText>
          )}
          <FormHelperText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name="heatingDegreeDays" />
          </FormHelperText>
          <Input
            maxW={"200px"}
            type="number"
            textAlign="left"
            {...register("heatingDegreeDays", { required: t(`${i18nPrefix}.hdd.error`) })}
          />
        </FormControl>
        <FormControl>
          <FormLabel pb={1}>{t(`${i18nPrefix}.climateZone.label`)}</FormLabel>
          <FormHelperText mb={1} mt={0}>
            {t(`${i18nPrefix}.climateZone.hint`)}
          </FormHelperText>
          <Text fontSize="md" fontWeight="medium">
            {derivedClimateZone
              ? t(`${i18nPrefix}.climateZones.${derivedClimateZone}`)
              : t(`${i18nPrefix}.climateZone.pending`)}
          </Text>
        </FormControl>
        <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
      </Flex>
    </>
  )
})
