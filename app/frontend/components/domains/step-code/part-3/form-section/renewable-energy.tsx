import {
  Button,
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
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { SectionHeading } from "./shared/section-heading"

export const RenewableEnergy = observer(function Part3StepCodeFormRenewableEnergy() {
  const i18nPrefix = "stepCode.part3.renewableEnergy"
  const { checklist } = usePart3StepCode()

  const [isRelevant, setIsRelevant] = useState(
    !!checklist.generatedElectricity ? "yes" : checklist.isComplete("renewableEnergy") && "no"
  )

  const navigate = useNavigate()
  const location = useLocation()

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

    const alternatePath = checklist.alternateNavigateAfterSavePath
    checklist.setAlternateNavigateAfterSavePath(null)

    let updateSucceeded = false
    if (!isValid) return
    if (isRelevant == "no") {
      const updated =
        !checklist.generatedElectricity ||
        (await checklist.update({
          generatedElectricity: null,
        }))
      if (!updated) return
      updateSucceeded = true
    } else {
      const updated = await checklist.update(values)
      if (!updated) return
      updateSucceeded = true
    }

    if (updateSucceeded) {
      await checklist.completeSection("renewableEnergy")

      if (alternatePath) {
        navigate(alternatePath)
      } else {
        navigate(location.pathname.replace("renewable-energy", "overheating-requirements"))
      }
    }
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
        {!isValid && isSubmitted && <CustomMessageBox title={t("stepCode.part3.errorTitle")} status="error" />}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)} name="part3SectionForm">
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
                  <Input value={percentOfUse || "-"} isDisabled />
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
                <Input maxW={"200px"} value={adjustedElectricityEF || "-"} isDisabled />
              </FormControl>
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
