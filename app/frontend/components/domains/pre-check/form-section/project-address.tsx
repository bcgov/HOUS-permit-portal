import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { EFlashMessageStatus, EPreCheckServicePartner } from "../../../../types/enums"
import { IOption } from "../../../../types/types"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
import { SitesSelect } from "../../../shared/select/selectors/sites-select"
import { PreCheckBackLink } from "../pre-check-back-link"
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
    jurisdictionStore,
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
  const jurisdictionIdWatch = watch("jurisdictionId")

  const onSubmit = async (data: IProjectAddressFormData) => {
    if (!currentPreCheck) return
    await updatePreCheck(currentPreCheck.id, {
      fullAddress: data.site?.label || "",
      jurisdictionId: data.jurisdictionId,
    })
  }

  // Get jurisdiction from store based on form's jurisdictionId
  const selectedJurisdiction = jurisdictionIdWatch ? jurisdictionStore.getJurisdictionById(jurisdictionIdWatch) : null

  // Check if the selected jurisdiction is enrolled in the service partner
  // This is a simple computed value that MobX will track automatically
  const getIsJurisdictionEnrolled = () => {
    if (!selectedJurisdiction || !currentPreCheck?.servicePartner) return false

    const hasEnrollmentData = selectedJurisdiction.servicePartnerEnrollments?.length > 0
    if (hasEnrollmentData) {
      return selectedJurisdiction.isEnrolledInServicePartner(currentPreCheck.servicePartner as EPreCheckServicePartner)
    }

    return false
  }

  const renderEnrollmentStatus = () => {
    if (!selectedJurisdiction || !currentPreCheck?.servicePartner) return null

    const isEnrolled = getIsJurisdictionEnrolled()

    if (isEnrolled) {
      return (
        <CustomMessageBox
          status={EFlashMessageStatus.success}
          title={t("ui.participatingCommunityTitle")}
          description={t("ui.participatingCommunityDescription")}
        />
      )
    } else {
      return (
        <CustomMessageBox
          status={EFlashMessageStatus.error}
          title={t("ui.serviceNotAvailableTitle")}
          description={t("ui.serviceNotAvailableDescription")}
        />
      )
    }
  }

  return (
    <FormProvider {...methods}>
      <Box>
        <PreCheckBackLink />
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
            onChange={(option) => !currentPreCheck?.isSubmitted && setValue("site", option)}
            selectedOption={selectedSite}
            pidName="pid"
            siteName="site"
            jurisdictionIdFieldName="jurisdictionId"
            pidRequired={false}
            showManualModeToggle={true}
            showJurisdiction={true}
            initialJurisdiction={currentPreCheck?.jurisdiction || null}
            isDisabled={currentPreCheck?.isSubmitted}
          />

          {/* Show enrollment status message */}
          {renderEnrollmentStatus()}
        </VStack>

        <FormFooter<IProjectAddressFormData>
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          isDisabled={!getIsJurisdictionEnrolled()}
          disabledMessage={!getIsJurisdictionEnrolled() ? t("ui.selectParticipatingJurisdiction") : undefined}
        />
      </Box>
    </FormProvider>
  )
})
