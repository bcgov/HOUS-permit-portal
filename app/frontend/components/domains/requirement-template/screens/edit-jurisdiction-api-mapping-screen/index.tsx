import { Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useIntegrationMapping } from "../../../../../hooks/resources/use-integration-mapping"
import { useTemplateVersion } from "../../../../../hooks/resources/use-template-version"
import { IJurisdictionTemplateVersionCustomization } from "../../../../../models/jurisdiction-template-version-customization"
import { useMst } from "../../../../../setup/root"
import { ITemplateCustomization } from "../../../../../types/types"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { RedirectScreen } from "../../../../shared/base/redirect-screen"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { SearchGrid } from "../../../../shared/grid/search-grid"
import { FloatingButtons } from "./floating-buttons"
import { GridAccordion } from "./grid-accordion"
import { GridHeaders } from "./grid-headers"
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

export const TABLE_MAX_WIDTH_PX = 1320

export const EditJurisdictionApiMappingScreen = observer(function EditJurisdictionApiMappingScreen() {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore
  const { templateVersion, error: templateVersionError } = useTemplateVersion({
    customErrorMessage: t("errors.fetchBuildingPermit"),
  })
  const { integrationMapping, error: integrationMapError } = useIntegrationMapping({
    templateVersion: templateVersion,
    jurisdictionId: currentUser?.jurisdiction?.id,
  })

  const error =
    (!currentUser?.jurisdiction && new Error(t("errors.fetchJurisdiction"))) ||
    templateVersionError ||
    integrationMapError

  if (error) {
    return <ErrorScreen error={error} />
  }
  if (!templateVersion?.isFullyLoaded) {
    return <LoadingScreen />
  }

  if (currentUser.jurisdiction && !currentUser.jurisdiction?.externalApiEnabled) {
    return <RedirectScreen path={`/jurisdictions/${currentUser.jurisdiction.slug}/api-settings`} />
  }

  return (
    <Flex
      flexDir={"column"}
      alignItems={"center"}
      pb={8}
      as="main"
      id="jurisdiction-edit-permit-template"
      pos={"relative"}
      px={{ base: 0, md: "3.75rem" }}
    >
      <Header templateVersion={templateVersion} />

      <SearchGrid w={"full"} templateColumns="minmax(300px, 510px) minmax(100px, 300px) minmax(100px, auto)">
        {integrationMapping && <GridHeaders integrationMapping={integrationMapping} />}

        {!integrationMapping ? (
          <Flex py={50} gridColumn={"1/-1"}>
            <SharedSpinner />
          </Flex>
        ) : (
          <>
            {integrationMapping.tableRequirementsMapping.map((requirementBlockMapping) => {
              return (
                <GridAccordion
                  key={requirementBlockMapping.id}
                  requirementBlockMapping={requirementBlockMapping}
                  templateVersion={templateVersion}
                  onSaveLocalMapping={integrationMapping.updateRequirementsMapping}
                />
              )
            })}
            <FloatingButtons
              isCollapsedAll={integrationMapping?.isAllAccordionCollapsed}
              setIsCollapsedAll={integrationMapping?.setIsAllAccordionCollapsed}
            />
          </>
        )}
      </SearchGrid>
    </Flex>
  )
})
