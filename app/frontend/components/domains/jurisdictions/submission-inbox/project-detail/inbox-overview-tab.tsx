import { Box, Divider, Flex, Grid, Heading, HStack, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { CaretRight, Info, SquaresFour, Steps } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../../../lib/create-search-model"
import { IPermitProject } from "../../../../../models/permit-project"
import { useMst } from "../../../../../setup/root"
import { EProjectPermitApplicationSortFields } from "../../../../../types/enums"
import { SearchGrid } from "../../../../shared/grid/search-grid"
import { FullscreenMapModal } from "../../../../shared/module-wrappers/fullscreen-map-modal"
import { ProjectMap } from "../../../../shared/module-wrappers/project-map"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"
import { ProjectStateTag } from "../../../../shared/permit-projects/project-state-tag"
import ProjectInfoRow from "../../../../shared/project/project-info-row"
import { PermitApplicationGridHeaders } from "../../../permit-project/permit-application-grid-headers"
import { PermitApplicationGridRow } from "../../../permit-project/permit-application-grid-row"
import { ChangeProjectStateMenu } from "../change-project-state-menu"

interface IProps {
  permitProject: IPermitProject
}

export const InboxOverviewTab = observer(({ permitProject }: IProps) => {
  const {
    fullAddress,
    pid,
    jurisdiction,
    number,
    state,
    firstApplicationReceivedAt,
    formattedFirstApplicationReceivedAt,
  } = permitProject
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()
  const { isOpen: isMapFullscreen, onOpen: onOpenMapFullscreen, onClose: onCloseMapFullscreen } = useDisclosure()

  return (
    <Flex direction="column" flex={1} minH={0} minW={0} overflowY="auto" bg="greys.white" p={10}>
      <Box as="section" mb={10}>
        <HStack align="center" spacing={4} mb={6}>
          <SquaresFour size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.overview.title")}
          </Heading>
        </HStack>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={10}>
          <Box>
            <Heading as="h3" size="md" mb={6}>
              {t("permitProject.overview.projectInformation")}
            </Heading>

            <ProjectInfoRow
              label={t("permitProject.overview.projectState")}
              value={
                <HStack spacing={3}>
                  <ProjectStateTag state={state} />
                  <ChangeProjectStateMenu project={permitProject} />
                </HStack>
              }
            />
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
            <ProjectInfoRow
              label={t("permitProject.overview.firstApplicationReceived")}
              value={formattedFirstApplicationReceivedAt}
              isCopyable={!!firstApplicationReceivedAt}
            />

            <VStack align="flex-start" spacing={4} mt={8}>
              <RouterLinkButton variant="link" to={`/jurisdictions/${jurisdiction?.id}`} leftIcon={<Info size={24} />}>
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

      <Divider borderColor="border.light" />

      <Box as="section" mt={10}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h3" size="md" mb={0}>
            {t("submissionInbox.projectDetail.recentPermitApplications")}
          </Heading>
        </Flex>
        {!(permitProject.recentPermitApplications ?? []).filter((pa) => !pa.isDiscarded).length ? (
          <Text color="text.secondary">{t("submissionInbox.projectDetail.noRecentPermitApplications")}</Text>
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
              {(permitProject.recentPermitApplications ?? [])
                .filter((pa) => !pa.isDiscarded)
                .map((permitApplication) => (
                  <PermitApplicationGridRow
                    key={permitApplication.id}
                    permitApplication={permitApplication}
                    fromInbox
                    searchModel={
                      {
                        search: () => permitProjectStore.fetchPermitProject(permitProject.id),
                      } as ISearch
                    }
                  />
                ))}
            </SearchGrid>
            <Flex justify="flex-end" mt={4}>
              <RouterLinkButton variant="tertiary" fontWeight="bold" rightIcon={<CaretRight />} to="permits">
                {t("submissionInbox.projectDetail.viewAllPermits")}
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
