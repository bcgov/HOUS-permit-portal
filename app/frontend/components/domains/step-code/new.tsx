import { Button, HStack, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useMst } from "../../../setup/root"
import { requestPresignedUrl, uploadFileInChunks } from "../../../utils/uploads"
import { FileFormControl, NumberFormControl } from "../../shared/form/input-form-control"

export const NewStepCodeForm = observer(function NewStepCodeForm() {
  const {
    stepCodeStore: { createStepCode },
  } = useMst()
  //isuploading can be done on more than one file
  const [isUploading, setIsUploading] = useState<Record<number, boolean>>({})

  const dataEntryAttributes = {
    districtEnergyEf: null,
    districtEnergyConsumption: null,
    otherGhgEf: null,
    otherGhgConsumption: null,
    h2kFile: null,
    h2kLocal: null,
  }

  const formMethods = useForm({ mode: "onChange", defaultValues: { dataEntriesAttributes: [dataEntryAttributes] } })
  const { control, handleSubmit, setValue, setError, clearErrors } = formMethods
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "dataEntriesAttributes", // unique name for your Field Array
  })

  const onSubmit = async (values) => {
    console.log("submitting", values)
    await createStepCode(values)
  }

  const onUploadFile = async (event, index) => {
    const file = event.target.files[0]
    try {
      setIsUploading({ ...isUploading, [index]: true })
      const presignResponse = await requestPresignedUrl(file, file.name)
      const presignedData = await presignResponse.json()
      //upload to object store put endpoint
      const { url } = await uploadFileInChunks(presignedData.url, presignedData.headers, file)
      console.log("***", file, url)
      setValue(`dataEntriesAttributes.${index}.h2kFile`, {
        id: presignedData?.key.replace(/^cache\//, ""),
        storage: "cache",
        metadata: {
          filename: file.name,
          size: file.size,
          mime_type: file.type,
          content_disposition: presignedData?.headers?.["Content-Disposition"],
        },
      })
      clearErrors(`dataEntriesAttributes.${index}.h2kLocal`)
    } catch (e) {
      //throw error
      setError(`dataEntriesAttributes.${index}.h2kLocal`, { type: "manual", message: "Failed to upload file." })
    } finally {
      setIsUploading({ ...isUploading, [index]: true })
    }
  }

  const areAllUploaded = Object.values(isUploading).every((loading) => loading === false)

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <VStack key={index}>
            {/* TODO: H2K file input */}
            <FileFormControl
              inputProps={{ key: field.id }}
              label={t("stepCode.new.h2kFile")}
              fieldName={`dataEntriesAttributes.${index}.h2kLocal`}
              onChange={(e) => {
                onUploadFile(e, index)
              }}
            />
            {/* Optional Fields */}
            <HStack w="full">
              <NumberFormControl
                key={field.id}
                label={t("stepCode.new.districtEnergyEf")}
                fieldName={`dataEntriesAttributes.${index}.districtEnergyEf`}
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
                label={t("stepCode.new.otherGhgEf")}
                fieldName={`dataEntriesAttributes.${index}.otherGhgEf`}
              />
              <NumberFormControl
                inputProps={{ key: field.id }}
                label={t("stepCode.new.otherGhgConsumption")}
                fieldName={`dataEntriesAttributes.${index}.otherGhgConsumption`}
              />
            </HStack>
            <Button variant="primary" w="full" type="submit" disabled={!areAllUploaded}>
              {t("stepCode.new.create")}
            </Button>
          </VStack>
        ))}

        {/* TODO: Add another data entry (e.g. another H2K file) */}
      </form>
    </FormProvider>
  )
})
