import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"
import { SitesSelect } from "../../../shared/select/selectors/sites-select"
import { FormFooter } from "./form-footer"

interface IProjectAddressFormData {
  site: IOption | null
  pid: string | null
  jurisdictionId: string | null
}

export const ProjectAddress = observer(function ProjectAddress() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const {
    preCheckStore: { updatePreCheck },
  } = useMst()

  const methods = useForm<IProjectAddressFormData>({
    defaultValues: {
      site: currentPreCheck?.fullAddress ? { label: currentPreCheck.fullAddress, value: null } : null,
      pid: null,
      jurisdictionId: currentPreCheck?.jurisdiction?.id || null,
    },
  })

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods
  const selectedSite = watch("site")

  const onSubmit = async (data: IProjectAddressFormData) => {
    if (!currentPreCheck) return
    await updatePreCheck(currentPreCheck.id, {
      fullAddress: data.site?.label || "",
      jurisdictionId: data.jurisdictionId,
    })
  }

  return (
    <FormProvider {...methods}>
      <Box>
        <Heading as="h2" size="lg" mb={4}>
          {t("preCheck.sections.projectAddress.title", "Project Address")}
        </Heading>
        <Text mb={6}>
          {t(
            "preCheck.sections.projectAddress.description",
            "Enter an address to confirm the service is available for your building project"
          )}
        </Text>

        <VStack spacing={4} align="stretch">
          <SitesSelect
            onChange={(option) => setValue("site", option)}
            selectedOption={selectedSite}
            pidName="pid"
            siteName="site"
            jurisdictionIdFieldName="jurisdictionId"
            pidRequired={false}
            showManualModeToggle={true}
            showJurisdiction={true}
            initialJurisdiction={currentPreCheck?.jurisdiction || null}
          />
        </VStack>

        <FormFooter onContinue={handleSubmit(onSubmit)} isLoading={isSubmitting} />
      </Box>
    </FormProvider>
  )
})
