import { Button, Flex, FormControl, FormLabel, HStack } from "@chakra-ui/react"
import { Pencil } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useJurisdiction } from "../../../../../../../hooks/resources/use-jurisdiction"
import { ErrorScreen } from "../../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../../shared/base/loading-screen"
import { EditableBlockContainer, EditableBlockHeading } from "../../shared/editable-block"
import { i18nPrefix } from "../i18n-prefix"
import { EnergyStepSelect } from "./energy-step-select"
import { ZeroCarbonStepSelect } from "./zero-carbon-step-select"

export const EnergyStepEditableBlock = observer(function EnergyStepEditableBlock() {
  const { currentJurisdiction, error } = useJurisdiction()

  return error ? (
    <ErrorScreen error={error} />
  ) : (
    <Suspense fallback={<LoadingScreen />}>
      {currentJurisdiction && <Form jurisdiction={currentJurisdiction} />}
    </Suspense>
  )
})

const Form = function JursidictionEnergyStepRequirementsForm({ jurisdiction }) {
  const { energyStepRequired, zeroCarbonStepRequired, update } = jurisdiction

  const { handleSubmit, control, formState } = useForm({
    defaultValues: { energyStepRequired, zeroCarbonStepRequired },
  })

  const { isSubmitting } = formState
  const [isEditing, setIsEditing] = useState(false)

  const onSubmit = async (values) => {
    const result = await update(values)
    result && setIsEditing(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
      <EditableBlockContainer>
        <EditableBlockHeading>{t(`${i18nPrefix}.part9Building`)}</EditableBlockHeading>
        <Flex gap={6}>
          <FormControl w="max-content">
            <FormLabel>{t(`${i18nPrefix}.stepRequired.energy.title`)}</FormLabel>
            <Controller
              control={control}
              name="energyStepRequired"
              render={({ field: { onChange, value } }) => {
                return <EnergyStepSelect onChange={onChange} value={value} inputProps={{ isDisabled: !isEditing }} />
              }}
            />
          </FormControl>
          <FormControl w="max-content">
            <FormLabel>{t(`${i18nPrefix}.stepRequired.zeroCarbon.title`)}</FormLabel>
            <Controller
              control={control}
              name="zeroCarbonStepRequired"
              render={({ field: { onChange, value } }) => {
                return (
                  <ZeroCarbonStepSelect onChange={onChange} value={value} inputProps={{ isDisabled: !isEditing }} />
                )
              }}
            />
          </FormControl>
        </Flex>
        {isEditing ? (
          <HStack alignSelf="end">
            <Button variant="primary" type="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {t("ui.save")}
            </Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)} isDisabled={isSubmitting}>
              {t("ui.cancel")}
            </Button>
          </HStack>
        ) : (
          <Button alignSelf="end" variant="primary" leftIcon={<Pencil />} onClick={() => setIsEditing(true)}>
            {t("ui.edit")}
          </Button>
        )}
      </EditableBlockContainer>
    </form>
  )
}
