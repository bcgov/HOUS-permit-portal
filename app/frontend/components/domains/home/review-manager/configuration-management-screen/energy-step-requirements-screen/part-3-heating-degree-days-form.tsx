import { Button, HStack, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { NumberFormControl } from "../../../../../shared/form/input-form-control"

interface IPart3HeatingDegreeDaysFormProps {
  jurisdiction: IJurisdiction
}

interface IHeatingDegreeDaysFormData {
  heatingDegreeDays: number | null
}

export const Part3HeatingDegreeDaysForm = observer(function Part3HeatingDegreeDaysForm({
  jurisdiction,
}: IPart3HeatingDegreeDaysFormProps) {
  const formMethods = useForm<IHeatingDegreeDaysFormData>({
    mode: "onChange",
    defaultValues: {
      heatingDegreeDays: jurisdiction.heatingDegreeDays ?? null,
    },
  })

  const { handleSubmit, reset, formState } = formMethods
  const { isSubmitting } = formState

  useEffect(() => {
    reset({
      heatingDegreeDays: jurisdiction.heatingDegreeDays ?? null,
    })
  }, [jurisdiction.heatingDegreeDays, reset])

  const onSubmit = async (formData: IHeatingDegreeDaysFormData) => {
    await jurisdiction.update({
      heatingDegreeDays: formData.heatingDegreeDays,
    })
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={6} align="start" w="full">
          <NumberFormControl
            label={t("home.configurationManagement.stepCodeRequirements.heatingDegreeDays.label")}
            fieldName="heatingDegreeDays"
            inputProps={{ step: 1 }}
            showOptional={false}
          />

          <HStack>
            <Button variant="primary" type="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {t("ui.save")}
            </Button>
          </HStack>
        </VStack>
      </form>
    </FormProvider>
  )
})
