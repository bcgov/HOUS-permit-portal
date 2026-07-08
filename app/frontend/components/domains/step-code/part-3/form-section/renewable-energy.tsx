import {
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react"
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

interface IRenewableEnergyForm {
  generatedElectricity: string | null
}

type RelevanceSelection = "yes" | "no" | undefined

function hasGeneratedElectricity(value: string | null | undefined) {
  return value !== null && value !== undefined && value !== ""
}

export const RenewableEnergy = observer(function Part3StepCodeFormRenewableEnergy() {
  const i18nPrefix = "stepCode.part3.renewableEnergy"
  const { checklist } = usePart3StepCode()
  const renewableEnergyComplete = checklist.isComplete("renewableEnergy")

  const [isRelevant, setIsRelevant] = useState<RelevanceSelection>(
    hasGeneratedElectricity(checklist.generatedElectricity) ? "yes" : renewableEnergyComplete ? "no" : undefined
  )

  const { handleSubmit, formState, resetField, reset, register, watch } = useForm<IRenewableEnergyForm>({
    mode: "onSubmit",
    defaultValues: {
      generatedElectricity: checklist.generatedElectricity,
    },
  })
  const watchGeneratedElectricity = watch("generatedElectricity")
  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const onSubmit = async (values: IRenewableEnergyForm) => {
    if (!checklist) return
    if (!isValid) return

    if (isRelevant == "no") {
      const updated =
        !hasGeneratedElectricity(checklist.generatedElectricity) ||
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
    reset({ generatedElectricity: checklist.generatedElectricity })
    setIsRelevant(
      hasGeneratedElectricity(checklist.generatedElectricity) ? "yes" : renewableEnergyComplete ? "no" : undefined
    )
  }, [checklist.generatedElectricity, renewableEnergyComplete, reset])

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isSubmitted, isValid, reset])

  useEffect(() => {
    if (isRelevant == "no") {
      resetField("generatedElectricity")
    }
  }, [isRelevant, resetField])

  const percentOfUse = useMemo(() => {
    const generatedElectricity = Number(watchGeneratedElectricity)
    if (!Number.isFinite(generatedElectricity) || checklist.totalElectricityUse == 0) return 0

    return generatedElectricity / checklist.totalElectricityUse
  }, [checklist.totalElectricityUse, watchGeneratedElectricity])

  const adjustedElectricityEF = useMemo(() => {
    const electricityEmissionsFactor = Number(checklist.electricity?.emissionsFactor)
    if (!Number.isFinite(electricityEmissionsFactor)) return null

    return Math.max(electricityEmissionsFactor - 0.157 * percentOfUse, 0)
  }, [checklist.electricity?.emissionsFactor, percentOfUse])

  const formattedPercentOfUse = useMemo(() => {
    return (percentOfUse * 100).toLocaleString("en-CA", { maximumFractionDigits: 0 })
  }, [percentOfUse])

  const formattedAdjustedElectricityEF = useMemo(() => {
    if (adjustedElectricityEF === null) return "-"

    return adjustedElectricityEF.toLocaleString("en-CA", { maximumFractionDigits: 3 })
  }, [adjustedElectricityEF])

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
          <RadioGroup onChange={(value) => setIsRelevant(value as RelevanceSelection)} value={isRelevant}>
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
              <FormLabel>{t(`${i18nPrefix}.generatedElectricity.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="generatedElectricity" />
              </FormHelperText>
              <InputGroup maxW={"200px"}>
                <Input
                  type="number"
                  step="any"
                  {...register("generatedElectricity", { required: t(`${i18nPrefix}.generatedElectricity.error`) })}
                />
                <InputRightElement>{t(`${i18nPrefix}.generatedElectricity.units`)}</InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl>
              <FormLabel>{t(`${i18nPrefix}.percentOfUse.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.percentOfUse.hint`)}
              </FormHelperText>
              <InputGroup maxW={"200px"}>
                <Input value={formattedPercentOfUse} isDisabled />
                <InputRightElement>{t(`${i18nPrefix}.percentOfUse.units`)}</InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl>
              <FormLabel>
                <Trans i18nKey={`${i18nPrefix}.adjustedEF.label`} components={{ sub: <sub /> }} />
              </FormLabel>
              <FormHelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.adjustedEF.hint`)}
              </FormHelperText>
              <Input maxW={"200px"} value={formattedAdjustedElectricityEF} isDisabled />
            </FormControl>
          </>
        ) : null}
        {!!isRelevant && <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />}
      </Flex>
    </>
  )
})
