import { Button, Flex, VStack } from "@chakra-ui/react"
import { Pencil } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { NumberFormControl } from "../../../../../shared/form/input-form-control"
import { EditableBlockContainer } from "../shared/editable-block"

interface IPart3HeatingDegreeDaysFormProps {
  jurisdiction: IJurisdiction
}

interface IHeatingDegreeDaysFormData {
  heatingDegreeDays: number | null
}

export const Part3HeatingDegreeDaysForm = observer(function Part3HeatingDegreeDaysForm({
  jurisdiction,
}: IPart3HeatingDegreeDaysFormProps) {
  const getDefaultValues = () => ({
    heatingDegreeDays: jurisdiction.heatingDegreeDays ?? null,
  })

  const formMethods = useForm<IHeatingDegreeDaysFormData>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })

  const { handleSubmit, reset, formState } = formMethods
  const { isSubmitting, isValid } = formState

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    reset(getDefaultValues())
  }, [jurisdiction.id, jurisdiction.heatingDegreeDays, reset])

  const onSubmit = async (formData: IHeatingDegreeDaysFormData) => {
    await jurisdiction.update({
      heatingDegreeDays: formData.heatingDegreeDays,
    })
    reset(getDefaultValues())
    setIsEditing(false)
  }

  const handleClickCancel = () => {
    reset(getDefaultValues())
    setIsEditing(false)
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <EditableBlockContainer>
          <Flex flex={1} direction="column" gap={4}>
            <NumberFormControl
              label={t("home.configurationManagement.stepCodeRequirements.heatingDegreeDays.label")}
              fieldName="heatingDegreeDays"
              inputProps={{ step: 1, isDisabled: !isEditing }}
              showOptional={false}
            />
          </Flex>
          {isEditing ? (
            <VStack alignSelf="start">
              <Button
                variant="primary"
                w="full"
                type="submit"
                isLoading={isSubmitting}
                isDisabled={isSubmitting || !isValid}
              >
                {t("ui.onlySave")}
              </Button>
              <Button variant="secondary" w="full" onClick={handleClickCancel} isDisabled={isSubmitting}>
                {t("ui.cancel")}
              </Button>
            </VStack>
          ) : (
            <Button alignSelf="start" variant="primary" leftIcon={<Pencil />} onClick={() => setIsEditing(true)}>
              {t("ui.edit")}
            </Button>
          )}
        </EditableBlockContainer>
      </form>
    </FormProvider>
  )
})
