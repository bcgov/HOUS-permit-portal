import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  VStack,
} from "@chakra-ui/react"
import { Plus, X } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form"
import { usePart9StepCode } from "../../../../hooks/resources/use-part-9-step-code"
import { EStepCodeCompliancePath } from "../../../../types/enums"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { NumberFormControl } from "../../../shared/form/input-form-control"
import { CompliancePathSelect } from "./compliance-path-select"
import { Part9FormFooter } from "./form-section/shared/form-footer"
import { H2kFileUpload, TH2kFileFormValue } from "./h2k-file-upload"

type TDataEntryFormValue = {
  id?: string
  _destroy?: boolean
  districtEnergyEf: number | null
  districtEnergyConsumption: number | null
  otherGhgEf: number | null
  otherGhgConsumption: number | null
  h2kFile: TH2kFileFormValue | null
}

type TH2KImportForm = {
  compliancePath: EStepCodeCompliancePath | null
  dataEntriesAttributes: TDataEntryFormValue[]
}

export const H2KImport = observer(function StepCodeH2kImport() {
  const { checklist } = usePart9StepCode()

  const [isUploading, setIsUploading] = useState<Record<number, boolean>>({})
  const areAllUploaded = Object.values(isUploading).every((loading) => loading === false)

  const dataEntryAttributes: TDataEntryFormValue = {
    districtEnergyEf: null,
    districtEnergyConsumption: null,
    otherGhgEf: null,
    otherGhgConsumption: null,
    h2kFile: null,
  }

  const formMethods = useForm<TH2KImportForm>({
    mode: "onChange",
    defaultValues: {
      compliancePath: checklist?.compliancePath || null,
      dataEntriesAttributes: [dataEntryAttributes],
    },
  })

  const { control, handleSubmit, reset, setValue, formState, watch } = formMethods
  const { isValid, isSubmitting } = formState
  const watchedDataEntries = watch("dataEntriesAttributes")
  const visibleDataEntries = watchedDataEntries?.filter((entry) => !entry?._destroy) || []
  const haveAllH2kFiles = visibleDataEntries.every((entry) => !!entry?.h2kFile)
  const footerIsDisabled = !isValid || isSubmitting || !areAllUploaded || !haveAllH2kFiles
  const footerIsLoading = isSubmitting

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "dataEntriesAttributes",
  })

  useEffect(() => {
    if (!checklist) return
    if (checklist.isLoaded) return
    ;(async () => {
      await checklist.load()
    })()
  }, [checklist?.id, checklist?.isLoaded])

  useEffect(() => {
    if (!checklist?.isLoaded) return
    const dataEntriesAttributes = checklist.dataEntries.length
      ? checklist.dataEntries.map((entry) => ({
          id: entry.id,
          districtEnergyEf: entry.districtEnergyEf ?? null,
          districtEnergyConsumption: entry.districtEnergyConsumption ?? null,
          otherGhgEf: entry.otherGhgEf ?? null,
          otherGhgConsumption: entry.otherGhgConsumption ?? null,
          h2kFile: entry.h2kFile ?? null,
        }))
      : [dataEntryAttributes]
    const resetPayload = {
      compliancePath: checklist.compliancePath || null,
      dataEntriesAttributes,
    }
    reset(resetPayload)
  }, [checklist?.isLoaded])

  const handleAddData = () => {
    append(dataEntryAttributes)
  }

  const handleRemoveData = (index) => {
    const entry = watchedDataEntries?.[index]
    if (entry?.id) {
      update(index, { ...entry, _destroy: true })
    } else {
      remove(index)
    }
  }

  const onSubmit = async (values) => {
    const result = await checklist.update(values)
    if (!result) throw new Error("Save failed")

    const sectionCompleted = await checklist.completeSection("h2kImport")
    if (!sectionCompleted) throw new Error("Save failed")
  }

  const handleUploadingChange = (index: number, uploading: boolean) => {
    setIsUploading((prev) => ({ ...prev, [index]: uploading }))
  }

  if (!checklist?.isLoaded) {
    return (
      <Center>
        <SharedSpinner />
      </Center>
    )
  }

  return (
    <Flex direction="column" w="full" p={6} gap={6} borderWidth={1} borderColor="border.light" rounded="base">
      <Heading as="h4" fontSize="lg">
        {t("stepCode.import.title")}
      </Heading>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={4}>
            <Controller
              control={control}
              name="compliancePath"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => {
                return (
                  <FormControl>
                    <FormLabel>{t("stepCode.import.compliancePath.label")}</FormLabel>
                    <CompliancePathSelect onChange={onChange} value={value as EStepCodeCompliancePath} />
                  </FormControl>
                )
              }}
            />
            {fields.map((field, index) => {
              if (watchedDataEntries?.[index]?._destroy) return null

              return (
                <VStack key={`step-code-data-entry-${index}`} w="full" spacing={4}>
                  <HStack w="full" align="start">
                    <Box flex={1} minW={0} w="full">
                      <H2kFileUpload
                        existingFilename={watchedDataEntries?.[index]?.h2kFile?.metadata?.filename}
                        onUploaded={(file) =>
                          setValue(`dataEntriesAttributes.${index}.h2kFile`, file, { shouldValidate: true })
                        }
                        onRemoved={() =>
                          setValue(`dataEntriesAttributes.${index}.h2kFile`, null, { shouldValidate: true })
                        }
                        onUploadingChange={(uploading) => handleUploadingChange(index, uploading)}
                      />
                    </Box>

                    {index !== 0 && (
                      <IconButton
                        onClick={() => handleRemoveData(index)}
                        variant="ghost"
                        aria-label={`remove-step-code-data-${index}`}
                        icon={<X />}
                      />
                    )}
                  </HStack>

                  {/* Optional Fields */}
                  {/* we need the site select somehwere around here */}

                  <VStack align="start" w="full">
                    <HStack w="full">
                      <NumberFormControl
                        label={t("stepCode.import.districtEnergyEF")}
                        fieldName={`dataEntriesAttributes.${index}.districtEnergyEf`}
                      />
                      <NumberFormControl
                        label={t("stepCode.import.districtEnergyConsumption")}
                        fieldName={`dataEntriesAttributes.${index}.districtEnergyConsumption`}
                      />
                    </HStack>
                  </VStack>
                  <HStack w="full">
                    <NumberFormControl
                      label={t("stepCode.import.otherGhgEf")}
                      fieldName={`dataEntriesAttributes.${index}.otherGhgEf`}
                    />
                    <NumberFormControl
                      label={t("stepCode.import.otherGhgConsumption")}
                      fieldName={`dataEntriesAttributes.${index}.otherGhgConsumption`}
                    />
                  </HStack>
                </VStack>
              )
            })}

            <Button onClick={handleAddData} leftIcon={<Plus />} w="full">
              {t("stepCode.import.addData")}
            </Button>

            <Part9FormFooter
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              isDisabled={footerIsDisabled}
              isLoading={footerIsLoading}
            />
          </Flex>
        </form>
      </FormProvider>
    </Flex>
  )
})
