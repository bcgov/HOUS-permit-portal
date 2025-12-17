import { Button, Flex, FormControl, FormLabel, HStack, Heading, IconButton, VStack } from "@chakra-ui/react"
import { Plus, X } from "@phosphor-icons/react"
import { t } from "i18next"
import React, { useState } from "react"
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { uploadFile } from "../../../../utils/uploads"
import { FileFormControl, NumberFormControl } from "../../../shared/form/input-form-control"
import { SitesSelect } from "../../../shared/select/selectors/sites-select"
import { CompliancePathSelect } from "./compliance-path-select"

export const H2KImport = function StepCodeH2kImport() {
  const { stepCodeStore, permitApplicationStore } = useMst()

  const { createPart9StepCode, getStepCode } = stepCodeStore
  const { currentPermitApplication } = permitApplicationStore

  const { permitApplicationId } = useParams()
  const navigate = useNavigate()

  const [isUploading, setIsUploading] = useState<Record<number, boolean>>({})
  const areAllUploaded = Object.values(isUploading).every((loading) => loading === false)

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
      permitApplicationId,
      site: null,
      fullAddress: null,
      pid: null,
      jurisdictionId: null,
      preConstructionChecklistAttributes: { compliancePath: null, dataEntriesAttributes: [dataEntryAttributes] },
    },
  })

  const { control, handleSubmit, setValue, setError, clearErrors, formState, watch } = formMethods
  const watchJurisdictionId = watch("jurisdictionId")
  const { isValid, isSubmitting } = formState
  const { fields, append, remove } = useFieldArray({
    control,
    name: "preConstructionChecklistAttributes.dataEntriesAttributes",
  })

  const handleAddData = () => {
    append(dataEntryAttributes)
  }

  const handleRemoveData = (index) => {
    remove(index)
  }

  const onSubmit = async (values) => {
    const result = await createPart9StepCode(values)
    if (result?.ok && result.data?.id) {
      const created = getStepCode(result.data.id) as any
      const targetPath = created?.targetPath
      if (created) {
        navigate(targetPath)
      }
    }
  }

  const onUploadFile = async (event, index) => {
    const file = event.target.files[0]
    try {
      setIsUploading({ ...isUploading, [index]: true })
      const presignedData = await uploadFile(file, file.name)

      setValue(
        `preConstructionChecklistAttributes.dataEntriesAttributes.${index}.h2kFile`,
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

      clearErrors(`preConstructionChecklistAttributes.dataEntriesAttributes.${index}.h2kLocal`)
    } catch (e) {
      setError(`preConstructionChecklistAttributes.dataEntriesAttributes.${index}.h2kLocal`, {
        type: "manual",
        message: "Failed to upload file.",
      })
    } finally {
      setIsUploading({ ...isUploading, [index]: false })
    }
  }
  return (
    <Flex direction="column" w="full" p={6} gap={6} borderWidth={1} borderColor="border.light" rounded="base">
      <Heading as="h4" fontSize="lg">
        {t("stepCode.import.title")}
      </Heading>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={4}>
            {!permitApplicationId && (
              <Controller
                control={control}
                name="site"
                render={({ field: { onChange, value } }) => (
                  <SitesSelect
                    onChange={(opt) => {
                      onChange(opt)
                      setValue("fullAddress", opt?.label || "")
                    }}
                    selectedOption={value}
                    menuPortalTarget={document.body}
                  />
                )}
              />
            )}
            <Controller
              control={control}
              name="preConstructionChecklistAttributes.compliancePath"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => {
                return (
                  <FormControl>
                    <FormLabel>{t("stepCode.import.compliancePath.label")}</FormLabel>
                    <CompliancePathSelect onChange={onChange} value={value} />
                  </FormControl>
                )
              }}
            />
            {fields.map((field, index) => (
              <VStack key={`step-code-data-entry-${index}`} w="full" spacing={4}>
                <HStack w="full" align="start">
                  <FileFormControl
                    inputProps={{ borderWidth: 0, p: 0 }}
                    label={t("stepCode.import.selectFile")}
                    fieldName={`preConstructionChecklistAttributes.dataEntriesAttributes.${index}.h2kLocal`}
                    required
                    onChange={(e) => {
                      onUploadFile(e, index)
                    }}
                  />

                  {index != 0 && (
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
                      fieldName={`preConstructionChecklistAttributes.dataEntriesAttributes.${index}.districtEnergyEf`}
                    />
                    <NumberFormControl
                      label={t("stepCode.import.districtEnergyConsumption")}
                      fieldName={`preConstructionChecklistAttributes.dataEntriesAttributes.${index}.districtEnergyConsumption`}
                    />
                  </HStack>
                </VStack>
                <HStack w="full">
                  <NumberFormControl
                    label={t("stepCode.import.otherGhgEf")}
                    fieldName={`preConstructionChecklistAttributes.dataEntriesAttributes.${index}.otherGhgEf`}
                  />
                  <NumberFormControl
                    label={t("stepCode.import.otherGhgConsumption")}
                    fieldName={`preConstructionChecklistAttributes.dataEntriesAttributes.${index}.otherGhgConsumption`}
                  />
                </HStack>
              </VStack>
            ))}

            <Button onClick={handleAddData} leftIcon={<Plus />} w="full">
              {t("stepCode.import.addData")}
            </Button>

            <Button
              variant="primary"
              w="full"
              type="submit"
              isDisabled={
                !isValid || isSubmitting || !areAllUploaded || !(currentPermitApplication || watchJurisdictionId)
              }
              isLoading={isSubmitting}
            >
              {t("stepCode.import.create")}
            </Button>
          </Flex>
        </form>
      </FormProvider>
    </Flex>
  )
}
