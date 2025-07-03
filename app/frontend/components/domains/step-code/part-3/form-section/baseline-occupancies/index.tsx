import {
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  ListItem,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  UnorderedList,
} from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EBaselineOccupancyKey, EFlashMessageStatus } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { SectionHeading } from "../shared/section-heading"

export const BaselineOccupancies = observer(function Part3StepCodeFormBaselineOccupancies() {
  const i18nPrefix = "stepCode.part3.baselineOccupancies"
  const { checklist } = usePart3StepCode()

  const [isRelevant, setIsRelevant] = useState(
    !R.isEmpty(checklist.baselineOccupancies) ? "yes" : checklist.isComplete("baselineOccupancies") && "no"
  )

  const navigate = useNavigate()
  const location = useLocation()

  const { handleSubmit, formState, control, reset, trigger } = useForm({
    mode: "onSubmit",
    defaultValues: { baselineOccupancies: checklist.baselineOccupancies.map((oc) => oc.key) },
  })

  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const onSubmit = async (values) => {
    if (!checklist) return

    const alternatePath = checklist.alternateNavigateAfterSavePath
    checklist.setAlternateNavigateAfterSavePath(null)

    let updateSucceeded = false
    if (!isValid) return

    if (isRelevant == "no") {
      const updated =
        R.isEmpty(checklist.baselineOccupancies) ||
        (await checklist.update({
          baseline_occupancies_attributes: checklist.baselineOccupancies.map((oc) => ({ id: oc.id, _destroy: true })),
        }))
      if (updated) {
        await checklist.bulkUpdateCompletionStatus({
          baselineOccupancies: { complete: true },
          baselineDetails: { relevant: false },
        })
        updateSucceeded = true
      } else {
        return
      }
    } else {
      const newSelections = values.baselineOccupancies
        .filter((ocKey) => !checklist.baselineOccupancies.map((oc) => oc.key).includes(ocKey))
        .map((ocKey) => ({ key: ocKey }))
      const existingSelections = checklist.baselineOccupancies
        .filter((oc) => values.baselineOccupancies.includes(oc.key))
        .map((oc) => ({ id: oc.id }))
      const deletedSelections = checklist.baselineOccupancies
        .filter((oc) => !values.baselineOccupancies.includes(oc.key))
        .map((oc) => ({ id: oc.id, _destroy: true }))
      values.baselineOccupanciesAttributes = [...newSelections, ...existingSelections, ...deletedSelections]
      delete values.baselineOccupancies

      const updated = await checklist.update(values)
      if (updated) {
        await checklist.bulkUpdateCompletionStatus({
          baselineOccupancies: { complete: true },
          baselineDetails: { relevant: true },
          baselinePerformance: { relevant: true },
        })
        updateSucceeded = true
      } else {
        return
      }
    }

    if (updateSucceeded) {
      if (alternatePath) {
        navigate(alternatePath)
      } else {
        const nextSectionPath = isRelevant == "yes" ? "baseline-details" : "district-energy"
        navigate(location.pathname.replace("baseline-occupancies", nextSectionPath))
      }
    }
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  useEffect(() => {
    // trigger validation when the isRelevant value changes, as it is a dependency for the validation
    trigger("baselineOccupancies")
  }, [isRelevant, trigger])

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
        <Trans
          i18nKey={`${i18nPrefix}.instructions`}
          components={{ ul: <UnorderedList ml={0} pl={6} />, li: <ListItem mb={0} />, strong: <strong /> }}
        />
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
                <FormLabel pb={1}>{t(`${i18nPrefix}.occupancies.label`)}</FormLabel>
                <FormHelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="baselineOccupancies" />
                </FormHelperText>
                <Controller
                  name="baselineOccupancies"
                  rules={{
                    validate: (value) => {
                      if (isRelevant === "yes" && (!value || value.length === 0)) {
                        return t(`${i18nPrefix}.occupancies.error`)
                      }
                      return true
                    },
                  }}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CheckboxGroup defaultValue={value} onChange={onChange}>
                      <SimpleGrid columns={2} spacing={1}>
                        {Object.values(EBaselineOccupancyKey).map((key) => (
                          <Checkbox key={key} value={key}>
                            <Trans i18nKey={`${i18nPrefix}.occupancyKeys.${key}`} components={{ strong: <strong /> }} />
                          </Checkbox>
                        ))}
                      </SimpleGrid>
                    </CheckboxGroup>
                  )}
                />
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
