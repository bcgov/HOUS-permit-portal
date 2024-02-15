import { Button, HStack, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useMst } from "../../../setup/root"
import { NumberFormControl } from "../../shared/form/input-form-control"

export const NewStepCodeForm = observer(function NewStepCodeForm() {
  const {
    stepCodeStore: { createStepCode },
  } = useMst()

  const dataEntryAttributes = {
    districtEnergyEF: null,
    districtEnergyConsumption: null,
    otherGHGEF: null,
    otherGHGConsumption: null,
  }

  const formMethods = useForm({ mode: "onChange", defaultValues: { dataEntriesAttributes: [dataEntryAttributes] } })
  const { control, handleSubmit } = formMethods
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "dataEntriesAttributes", // unique name for your Field Array
  })

  const onSubmit = async (values) => {
    await createStepCode(values)
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <VStack>
            {/* TODO: H2K file input */}
            {/* Optional Fields */}
            <HStack w="full">
              <NumberFormControl
                key={field.id}
                label={t("stepCode.new.districtEnergyEF")}
                fieldName={"districtEnergyEF"}
              />
              <NumberFormControl
                inputProps={{ key: field.id }}
                label={t("stepCode.new.districtEnergyConsumption")}
                fieldName={`dataEntriesAttributes.${index}.districtEnergyConsumption`}
              />
            </HStack>
            <HStack w="full">
              <NumberFormControl
                inputProps={{ key: field.id }}
                label={t("stepCode.new.otherGHGEF")}
                fieldName={`dataEntries.${index}.otherGHGEF`}
              />
              <NumberFormControl
                inputProps={{ key: field.id }}
                label={t("stepCode.new.otherGHGConsumption")}
                fieldName={`dataEntries.${index}.otherGHGConsumption`}
              />
            </HStack>
            <Button variant="primary" w="full" type="submit">
              {t("stepCode.new.create")}
            </Button>
          </VStack>
        ))}

        {/* TODO: Add another data entry (e.g. another H2K file) */}
      </form>
    </FormProvider>
  )
})
