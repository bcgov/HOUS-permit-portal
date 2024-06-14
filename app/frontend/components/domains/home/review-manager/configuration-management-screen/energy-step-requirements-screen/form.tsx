import { VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { useMst } from "../../../../../../setup/root"

import { IPermitTypeRequiredStep } from "../../../../../../types/types"
import { EnergyStepEditableBlock } from "./energy-step-editable-block"

interface IFormProps {
  jurisdiction: IJurisdiction
}

interface IFormValues {
  permitTypeRequiredStepsAttributes: IPermitTypeRequiredStep[]
}

export const Form = observer(function EnergyStepSetupForm({ jurisdiction }: IFormProps) {
  const {
    permitClassificationStore: { permitTypes },
  } = useMst()

  const getDefaultValues = () => ({
    permitTypeRequiredStepsAttributes: [...(jurisdiction.permitTypeRequiredSteps as IPermitTypeRequiredStep[])],
  })

  const fieldArrayName = "permitTypeRequiredStepsAttributes"
  const formMethods = useForm<IFormValues>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })
  const { handleSubmit, reset, control } = formMethods
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: fieldArrayName,
  })

  const getIndex = (field) => R.findIndex((f) => f.id == field.id, fields)

  const onSubmit = async (values) => {
    return await jurisdiction.update(values)
  }

  const handleReset = () => {
    reset(getDefaultValues())
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <VStack spacing={5}>
          {permitTypes.map((permitType) => {
            const permitTypeFields = R.filter((f) => f.permitTypeId == permitType.id, fields)
            return (
              <EnergyStepEditableBlock
                key={permitType.id}
                heading={permitType.name}
                permitTypeId={permitType.id}
                fields={permitTypeFields}
                fieldArrayName={fieldArrayName}
                getIndex={getIndex}
                append={append}
                remove={remove}
                update={update}
                reset={handleReset}
              />
            )
          })}
        </VStack>
      </form>
    </FormProvider>
  )
})
