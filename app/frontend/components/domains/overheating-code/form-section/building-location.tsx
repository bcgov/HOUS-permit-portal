import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"
import { SitesSelect } from "../../../shared/select/selectors/sites-select"
import { FormFooter } from "./form-footer"

interface IBuildingLocationFormData {
  site: IOption | null
  pid: string | null
  jurisdictionId: string | null
  buildingModel: string
  siteName: string
  lot: string
  postalCode: string
}

export const BuildingLocation = observer(function BuildingLocation() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const methods = useForm<IBuildingLocationFormData>({
    mode: "onChange",
    defaultValues: {
      site: currentOverheatingCode?.fullAddress ? { label: currentOverheatingCode.fullAddress, value: null } : null,
      pid: currentOverheatingCode?.pid || null,
      jurisdictionId: currentOverheatingCode?.jurisdiction?.id || null,
      buildingModel: currentOverheatingCode?.buildingModel || "",
      siteName: currentOverheatingCode?.siteName || "",
      lot: currentOverheatingCode?.lot || "",
      postalCode: currentOverheatingCode?.postalCode || "",
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = methods

  const selectedSite = watch("site")

  const onSubmit = async (data: IBuildingLocationFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      fullAddress: data.site?.label || "",
      pid: data.pid,
      jurisdictionId: data.jurisdictionId,
      buildingModel: data.buildingModel,
      siteName: data.siteName,
      lot: data.lot,
      postalCode: data.postalCode,
    })
  }

  return (
    <FormProvider {...methods}>
      <Box>
        <Heading as="h2" size="lg" mb={2}>
          {t("overheatingCode.sections.buildingLocation.title", "Building Location")}
        </Heading>
        <Text mb={6} color="text.secondary">
          {t(
            "overheatingCode.sections.buildingLocation.description",
            "Enter the address and location details for the building project."
          )}
        </Text>

        <VStack spacing={6} align="stretch">
          <SitesSelect
            onChange={(option) => setValue("site", option)}
            selectedOption={selectedSite}
            pidName="pid"
            siteName="site"
            jurisdictionIdFieldName="jurisdictionId"
            pidRequired={false}
            showManualModeToggle={true}
            showJurisdiction={true}
            initialJurisdiction={currentOverheatingCode?.jurisdiction || null}
          />

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>{t("overheatingCode.sections.buildingLocation.modelLabel", "Model")}</FormLabel>
              <Input
                {...register("buildingModel")}
                placeholder={t("overheatingCode.sections.buildingLocation.modelPlaceholder", "e.g. Model A")}
              />
            </FormControl>

            <FormControl>
              <FormLabel>{t("overheatingCode.sections.buildingLocation.siteLabel", "Site")}</FormLabel>
              <Input
                {...register("siteName")}
                placeholder={t("overheatingCode.sections.buildingLocation.sitePlaceholder", "e.g. Site 1")}
              />
            </FormControl>

            <FormControl>
              <FormLabel>{t("overheatingCode.sections.buildingLocation.lotLabel", "Lot")}</FormLabel>
              <Input
                {...register("lot")}
                placeholder={t("overheatingCode.sections.buildingLocation.lotPlaceholder", "e.g. Lot 12")}
              />
            </FormControl>

            <FormControl isInvalid={!!errors.postalCode}>
              <FormLabel>{t("overheatingCode.sections.buildingLocation.postalCodeLabel", "Postal Code")}</FormLabel>
              <Input
                {...register("postalCode", {
                  validate: (value) => {
                    if (!value) return true
                    return (
                      /^V\d[A-Z]\s?\d[A-Z]\d$/i.test(value) ||
                      t(
                        "overheatingCode.sections.buildingLocation.postalCodeInvalid",
                        "Must be a valid BC postal code (e.g. V7L 1C3)"
                      )
                    )
                  },
                })}
                placeholder={t("overheatingCode.sections.buildingLocation.postalCodePlaceholder", "e.g. V7L 1C3")}
              />
              <FormErrorMessage>{errors.postalCode?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
        </VStack>

        <FormFooter<IBuildingLocationFormData>
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          isLoading={isSubmitting}
        />
      </Box>
    </FormProvider>
  )
})
