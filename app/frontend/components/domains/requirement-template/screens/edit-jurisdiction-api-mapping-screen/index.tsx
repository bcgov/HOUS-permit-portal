import { Box } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useJurisdictionIntegrationRequirementsMapping } from "../../../../../hooks/resources/use-jurisdiction-integration-requirements-mapping"
import { useTemplateVersion } from "../../../../../hooks/resources/use-template-version"
import { IJurisdictionTemplateVersionCustomization } from "../../../../../models/jurisdiction-template-version-customization"
import { useMst } from "../../../../../setup/root"
import { ITemplateCustomization } from "../../../../../types/types"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { Header } from "./header"

const scrollToIdPrefix = "jurisdiction-edit-template-version-scroll-to-id-"
export const formScrollToId = (id: string) => `${scrollToIdPrefix}${id}`

export interface IJurisdictionTemplateVersionCustomizationForm {
  jurisdictionId?: string
  customizations: ITemplateCustomization
}

function formFormDefaults(
  jurisdictionTemplateVersionCustomization: IJurisdictionTemplateVersionCustomization | undefined
): IJurisdictionTemplateVersionCustomizationForm {
  if (!jurisdictionTemplateVersionCustomization) {
    return {
      customizations: {
        requirementBlockChanges: {},
      },
    }
  }

  return {
    customizations: { requirementBlockChanges: {}, ...jurisdictionTemplateVersionCustomization.customizations },
  }
}

export const EditJurisdictionApiMappingScreen = observer(function EditJurisdictionApiMappingScreen() {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore
  const { templateVersion, error: templateVersionError } = useTemplateVersion({
    customErrorMessage: t("errors.fetchBuildingPermit"),
  })
  const { jurisdictionIntegrationRequirementsMapping, error: integrationRequirementsMapError } =
    useJurisdictionIntegrationRequirementsMapping({
      templateVersion: templateVersion,
      jurisdictionId: currentUser?.jurisdiction?.id,
    })

  const error =
    (!currentUser?.jurisdiction && new Error(t("errors.fetchJurisdiction"))) ||
    templateVersionError ||
    integrationRequirementsMapError

  if (error) {
    return <ErrorScreen error={error} />
  }
  if (!templateVersion?.isFullyLoaded) return <LoadingScreen />

  return (
    <Box as="main" id="jurisdiction-edit-permit-template">
      <Header templateVersion={templateVersion} />
    </Box>
  )
})
