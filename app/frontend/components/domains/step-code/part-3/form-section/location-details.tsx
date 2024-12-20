import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EClimateZone } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { SectionHeading } from "./shared/section-heading"

export const LocationDetails = observer(function Part3StepCodeFormLocationDetails() {
  const i18nPrefix = "stepCode.part3.locationDetails"
  const { checklist } = usePart3StepCode()

  const navigate = useNavigate()
  const location = useLocation()

  const { handleSubmit, formState, register, control, reset } = useForm({
    defaultValues: {
      buildingHeight: checklist.buildingHeight,
      heatingDegreeDays: checklist.heatingDegreeDays,
      climateZone: checklist.climateZone,
    },
  })
  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const onSubmit = async (values) => {
    const updated = await checklist.update(values)
    if (updated) {
      await checklist.completeSection("locationDetails")
    }

    navigate(location.pathname.replace("location-details", "baseline-occupancies"))
  }

  useEffect(() => {
    if (isSubmitted) {
      // reset form state to prevent message box from showing again until form is resubmitted
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && <CustomMessageBox title={t("stepCode.part3.errorTitle")} status="error" />}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
        <Text fontSize="md">{t(`${i18nPrefix}.instructions`)}</Text>
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)}>
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
            <FormHelperText mb={1} mt={0}>
              {t(`${i18nPrefix}.hdd.hint`)}
            </FormHelperText>
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
            <FormErrorMessage mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name="climateZone" />
            </FormErrorMessage>
            <Controller
              name="climateZone"
              control={control}
              rules={{ required: t(`${i18nPrefix}.climateZone.error`) }}
              render={({ field: { onChange, value } }) => (
                <RadioGroup defaultValue={value} onChange={onChange}>
                  <Stack spacing={1}>
                    {Object.values(EClimateZone).map((zone) => (
                      <Radio key={zone} value={zone}>
                        {t(`${i18nPrefix}.climateZones.${zone}`)}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
            />
          </FormControl>
          <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
            {t("stepCode.part3.cta")}
          </Button>
        </Flex>
      </form>
    </>
  )
})
