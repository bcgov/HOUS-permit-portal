import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
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
    siteConfigurationStore,
  } = useMst()
  const { codeComplianceEnabled } = siteConfigurationStore
  const { permitApplicationId } = useParams()
  const methods = useForm<IProjectAddressFormData>({
    defaultValues: {
      site: currentPreCheck?.fullAddress ? { label: currentPreCheck.fullAddress, value: null } : null,
      pid: currentPreCheck?.pid,
      jurisdictionId: currentPreCheck?.jurisdiction?.id,
    },
  })

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = methods

  const selectedSite = watch("site")
  const jurisdictionIdWatch = watch("jurisdictionId")

  const onSubmit = async (data: IProjectAddressFormData) => {
    if (!currentPreCheck) return
    await updatePreCheck(currentPreCheck.id, {
      fullAddress: data.site?.label || "",
      jurisdictionId: data.jurisdictionId,
      pid: data.pid,
    })
  }

  // Get jurisdiction from store based on form's jurisdictionId
  const selectedJurisdiction = jurisdictionIdWatch ? jurisdictionStore.getJurisdictionById(jurisdictionIdWatch) : null

  // Check if the selected jurisdiction is enrolled in the service partner
  // This is a simple computed value that MobX will track automatically
  const getIsJurisdictionEnrolled = () => {
    if (!codeComplianceEnabled) return false
    if (!selectedJurisdiction || !currentPreCheck?.servicePartner) return false

    // Check global enablement first - if the service partner is globally enabled for all jurisdictions, return true
    if (siteConfigurationStore.isServicePartnerGloballyEnabled(currentPreCheck.servicePartner)) {
      return true
    }

    // Otherwise, check specific jurisdiction enrollment
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
            pidRequired={true}
            showManualModeToggle={true}
            showJurisdiction={true}
            initialJurisdiction={currentPreCheck?.jurisdiction || null}
            isDisabled={currentPreCheck?.isSubmitted || !!permitApplicationId}
          />

          {/* Show form validation errors */}
          {errors.site && (
            <Text color="semantic.error" fontSize="sm" mt={1}>
              {errors.site.message as string}
            </Text>
          )}
          {errors.pid && (
            <Text color="semantic.error" fontSize="sm" mt={1}>
              {errors.pid.message as string}
            </Text>
          )}
          {errors.jurisdictionId && (
            <Text color="semantic.error" fontSize="sm" mt={1}>
              {errors.jurisdictionId.message as string}
            </Text>
          )}

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
