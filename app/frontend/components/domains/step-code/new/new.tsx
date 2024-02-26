import { Button, Center, Container, HStack, Heading, IconButton, VStack } from "@chakra-ui/react"
import { Plus, X } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect, useState } from "react"
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { requestPresignedUrl, uploadFileInChunks } from "../../../../utils/uploads"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { FileFormControl, NumberFormControl, TextFormControl } from "../../../shared/form/input-form-control"
import { CompliancePathSelect } from "./compliance-path-select"
import { PermitApplicationSelect } from "./permit-application-select"

export const NewStepCodeForm = observer(function NewStepCodeForm() {
  const {
    stepCodeStore: { createStepCode, isLoaded, fetchStepCodes },
  } = useMst()

  const [isUploading, setIsUploading] = useState<Record<number, boolean>>({})
  const navigate = useNavigate()

  const dataEntryAttributes = {
    districtEnergyEf: null,
    districtEnergyConsumption: null,
    otherGhgEf: null,
    otherGhgConsumption: null,
    h2kFile: null,
    h2kLocal: null,
  }

  const formMethods = useForm({
    mode: "onChange",
    defaultValues: {
      permitApplicationId: null,
      preConstructionChecklistAttributes: { compliancePath: null },
      dataEntriesAttributes: [dataEntryAttributes],
    },
  })
  const { control, handleSubmit, setValue, setError, clearErrors, formState } = formMethods
  const { isValid, isSubmitting } = formState
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dataEntriesAttributes",
  })

  const handleAddData = () => {
    append(dataEntryAttributes)
  }

  const handleRemoveData = (index) => {
    remove(index)
  }

  const onSubmit = async (values) => {
    const stepCode = await createStepCode(values)
    navigate(`/step-codes/${stepCode.id}/checklists/${stepCode.preConstructionChecklist.id}`)
  }

  const onUploadFile = async (event, index) => {
    const file = event.target.files[0]
    try {
      setIsUploading({ ...isUploading, [index]: true })
      const presignResponse = await requestPresignedUrl(file, file.name)
      const presignedData = await presignResponse.json()

      //upload to object store put endpoint
      await uploadFileInChunks(presignedData.url, presignedData.headers, file)
      setValue(
        `dataEntriesAttributes.${index}.h2kFile`,
        {
          id: presignedData?.key.replace(/^cache\//, ""),
          storage: "cache",
          metadata: {
            filename: file.name,
            size: file.size,
            mime_type: file.type,
            content_disposition: presignedData?.headers?.["Content-Disposition"],
          },
        },
        { shouldValidate: true }
      )

      clearErrors(`dataEntriesAttributes.${index}.h2kLocal`)
    } catch (e) {
      setError(`dataEntriesAttributes.${index}.h2kLocal`, { type: "manual", message: "Failed to upload file." })
    } finally {
      setIsUploading({ ...isUploading, [index]: false })
    }
  }

  const areAllUploaded = Object.values(isUploading).every((loading) => loading === false)

  useEffect(() => {
    const fetch = async () => await fetchStepCodes()
    !isLoaded && fetch()
  }, [isLoaded])

  return (
    <Suspense
      fallback={
        <Center p={50}>
          <SharedSpinner />
        </Center>
      }
    >
      {isLoaded && (
        <Container my={10}>
          <Heading mb={8}>{t("stepCode.new.heading")}</Heading>
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextFormControl label={t("stepCode.new.name")} fieldName={"name"} required />
              <VStack spacing={4}>
                {fields.map((field, index) => (
                  <VStack
                    key={`step-code-data-entry-${index}`}
                    pos="relative"
                    p={5}
                    w="full"
                    borderWidth={1}
                    borderColor="border.base"
                    rounded="base"
                  >
                    {index != 0 && (
                      <IconButton
                        onClick={() => handleRemoveData(index)}
                        variant="ghost"
                        aria-label={`remove-step-code-data-${index}`}
                        icon={<X />}
                        pos="absolute"
                        top={0}
                        right={0}
                      />
                    )}

                    <FileFormControl
                      inputProps={{ key: field.id, borderWidth: 0, p: 0 }}
                      label={t("stepCode.new.h2kFile")}
                      fieldName={`dataEntriesAttributes.${index}.h2kLocal`}
                      required
                      onChange={(e) => {
                        onUploadFile(e, index)
                      }}
                    />

                    <Controller
                      control={control}
                      name="permitApplicationId"
                      rules={{ required: true }}
                      render={({ field: { onChange, value } }) => (
                        <PermitApplicationSelect onChange={onChange} value={value} />
                      )}
                    />

                    <Controller
                      control={control}
                      name="preConstructionChecklistAttributes.compliancePath"
                      rules={{ required: true }}
                      render={({ field: { onChange, value } }) => (
                        <CompliancePathSelect onChange={onChange} value={value} />
                      )}
                    />

                    {/* Optional Fields */}

                    <VStack align="start" w="full">
                      <HStack w="full">
                        <NumberFormControl
                          key={field.id}
                          label={t("stepCode.new.districtEnergyEF")}
                          fieldName={`dataEntriesAttributes.${index}.districtEnergyEf`}
                        />
                        <NumberFormControl
                          inputProps={{ key: field.id }}
                          label={t("stepCode.new.districtEnergyConsumption")}
                          fieldName={`dataEntriesAttributes.${index}.districtEnergyConsumption`}
                        />
                      </HStack>
                    </VStack>
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
                  </VStack>
                ))}

                <Button onClick={handleAddData} leftIcon={<Plus />} w="full">
                  {t("stepCode.new.addData")}
                </Button>

                <Button
                  variant="primary"
                  w="full"
                  type="submit"
                  isDisabled={!isValid || isSubmitting || !areAllUploaded}
                  isLoading={isSubmitting}
                >
                  {t("stepCode.new.create")}
                </Button>
              </VStack>
            </form>
          </FormProvider>
        </Container>
      )}
    </Suspense>
  )
})
