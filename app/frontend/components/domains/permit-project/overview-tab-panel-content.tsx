import { Box, Button, ButtonGroup, Flex, Grid, Heading, HStack, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { CaretRight, Info, Pencil, SquaresFour, Steps } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import {
  EFlashMessageStatus,
  EPermitProjectRollupStatus,
  EProjectPermitApplicationSortFields,
} from "../../../types/enums"
import { IOption } from "../../../types/types"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { SearchGrid } from "../../shared/grid/search-grid"
import { FullscreenMapModal } from "../../shared/module-wrappers/fullscreen-map-modal"
import { ProjectMap } from "../../shared/module-wrappers/project-map"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { AddPermitsButton } from "../../shared/permit-projects/add-permits-button"
import ProjectInfoRow from "../../shared/project/project-info-row"
import { SitesSelect } from "../../shared/select/selectors/sites-select"
import { PermitApplicationGridHeaders } from "./permit-application-grid-headers"
import { PermitApplicationGridRow } from "./permit-application-grid-row"

interface IProps {
  permitProject: IPermitProject
}

interface IProjectInfoForm {
  site: IOption | null
  pid: string | null
  jurisdictionId: string | null
}

export const OverviewTabPanelContent = observer(({ permitProject }: IProps) => {
  const { fullAddress, pid, jurisdiction, number } = permitProject
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isOpen: isMapFullscreen, onOpen: onOpenMapFullscreen, onClose: onCloseMapFullscreen } = useDisclosure()

  const formMethods = useForm<IProjectInfoForm>({
    defaultValues: {
      // Don't pre-populate site - we don't have the site ID (UUID), only the address text
      // Setting the address as the value would cause the geocoder to fail
      site: null,
      pid: pid || null,
      jurisdictionId: jurisdiction?.id || null,
    },
  })

  const { handleSubmit, watch, setValue, reset } = formMethods
  const siteWatch = watch("site")

  const handleEditClick = () => {
    // Reset form to current values when entering edit mode
    // Site is null - user will search if they want to change address
    reset({
      site: null,
      pid: pid || null,
      jurisdictionId: jurisdiction?.id || null,
    })
    setIsEditing(true)
  }

  const handleCancelClick = () => {
    setIsEditing(false)
    reset()
  }

  const onSubmit = async (data: IProjectInfoForm) => {
    setIsSubmitting(true)
    try {
      const updateParams: { fullAddress?: string; pid?: string; jurisdictionId?: string } = {}

      // Get address from site option, or keep the current address if not changed
      if (data.site?.label) {
        updateParams.fullAddress = data.site.label
      } else if (fullAddress) {
        // Keep current address if user didn't search for a new one
        updateParams.fullAddress = fullAddress
      }

      if (data.pid) {
        updateParams.pid = data.pid
      }

      if (data.jurisdictionId) {
        updateParams.jurisdictionId = data.jurisdictionId
      }

      await permitProjectStore.updatePermitProject(permitProject.id, updateParams)
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section" mb={10}>
        <HStack align="center" spacing={4} mb={6}>
          <SquaresFour size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.overview.title")}
          </Heading>
        </HStack>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={10}>
          <Box>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading as="h3" size="md" mb={0}>
                {t("permitProject.overview.projectInformation")}
              </Heading>
              {!isEditing && (
                <Button variant="link" leftIcon={<Pencil size={16} />} onClick={handleEditClick} color="text.link">
                  {t("permitProject.overview.editProjectInfo")}
                </Button>
              )}
            </Flex>

            {isEditing ? (
              <FormProvider {...formMethods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack spacing={4} align="stretch">
                    {fullAddress && (
                      <Text fontSize="sm" color="text.secondary">
                        {t("permitProject.overview.currentAddress", { address: fullAddress })}
                      </Text>
                    )}
                    <SitesSelect
                      onChange={(option) => setValue("site", option)}
                      selectedOption={siteWatch}
                      pidName="pid"
                      siteName="site"
                      jurisdictionIdFieldName="jurisdictionId"
                      showManualModeToggle={true}
                      showJurisdiction={true}
                      initialJurisdiction={jurisdiction}
                    />

                    <ButtonGroup spacing={3} mt={4}>
                      <Button type="submit" variant="primary" isLoading={isSubmitting}>
                        {t("permitProject.overview.saveProjectInfo")}
                      </Button>
                      <Button variant="secondary" onClick={handleCancelClick} isDisabled={isSubmitting}>
                        {t("permitProject.overview.cancelEditProjectInfo")}
                      </Button>
                    </ButtonGroup>
                  </VStack>
                </form>
              </FormProvider>
            ) : (
              <>
                <ProjectInfoRow
                  label={t("permitProject.overview.address")}
                  value={fullAddress || t("permitProject.overview.notAvailable")}
                  isBold
                  isCopyable
                />
                <ProjectInfoRow
                  label={t("permitProject.overview.jurisdictionName")}
                  value={jurisdiction?.disambiguatedName || t("permitProject.overview.notAvailable")}
                  isCopyable
                />
                <ProjectInfoRow label={t("permitProject.overview.number")} value={number} isCopyable />
                <ProjectInfoRow
                  label={t("permitProject.overview.pid")}
                  value={pid || t("permitProject.overview.notAvailable")}
                  subLabel={t("permitProject.overview.parcelIdentifier")}
                  isCopyable
                />
              </>
            )}

            {!isEditing && (
              <VStack align="flex-start" spacing={4} mt={8}>
                <RouterLinkButton
                  variant="link"
                  to={`/jurisdictions/${jurisdiction?.id}`}
                  leftIcon={<Info size={24} />}
                >
                  {t("permitProject.overview.checkPermitNeeds")}
                </RouterLinkButton>
                <RouterLinkButton
                  variant="link"
                  to={`/jurisdictions/${jurisdiction?.id}/step-code-requirements`}
                  leftIcon={<Steps size={24} />}
                >
                  {t("permitProject.overview.lookupStepCode")}
                </RouterLinkButton>
              </VStack>
            )}
          </Box>
          <Box>
            <Box height={{ base: "200px", lg: "250px" }} borderRadius="md" overflow="hidden">
              <ProjectMap
                coordinates={permitProject.mapPosition}
                pid={pid}
                parcelGeometry={permitProject.parcelGeometry}
                onOpenFullscreen={onOpenMapFullscreen}
              />
            </Box>
          </Box>
        </Grid>
      </Box>

      <Box as="section">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h3" size="md">
            {t("permitProject.overview.recentPermits")}
          </Heading>
          <AddPermitsButton permitProject={permitProject} />
        </Flex>
        {permitProject.rollupStatus === EPermitProjectRollupStatus.empty ? (
          <CustomMessageBox status={EFlashMessageStatus.info} description={t("permitProject.index.empty")} mt={2} />
        ) : (
          <>
            <SearchGrid
              templateColumns="2fr 1.5fr 1.5fr 1.5fr 1.5fr 0.5fr"
              gridRowClassName="permit-application-grid-row"
            >
              <PermitApplicationGridHeaders
                columns={Object.values(EProjectPermitApplicationSortFields)}
                includeActionColumn
              />
              {permitProject.recentPermitApplications
                .filter((pa) => !pa.isDiscarded)
                .map((permitApplication) => (
                  <PermitApplicationGridRow
                    key={permitApplication.id}
                    permitApplication={permitApplication}
                    searchModel={{
                      search: () => permitProjectStore.fetchPermitProject(permitProject.id),
                    }}
                  />
                ))}
            </SearchGrid>
            <Flex justify="flex-end" mt={4}>
              <RouterLinkButton
                variant="tertiary"
                rightIcon={<CaretRight />}
                to={`/projects/${permitProject.id}/permits`}
              >
                {t("permitProject.overview.allPermits")}
              </RouterLinkButton>
            </Flex>
          </>
        )}
      </Box>

      <FullscreenMapModal
        isOpen={isMapFullscreen}
        onClose={onCloseMapFullscreen}
        coordinates={permitProject.mapPosition}
        pid={pid}
        parcelGeometry={permitProject.parcelGeometry}
        address={fullAddress}
      />
    </Flex>
  )
})
