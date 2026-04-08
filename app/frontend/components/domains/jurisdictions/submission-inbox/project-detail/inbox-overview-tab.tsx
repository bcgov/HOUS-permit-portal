import {
  Box,
  Button,
  ButtonGroup,
  Circle,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { ArrowRight, Columns, Info, List, SquaresFour, Steps } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateTimeFormat } from "../../../../../constants"
import { IPermitProject } from "../../../../../models/permit-project"
import { EInboxDisplayMode } from "../../../../../types/enums"
import { FullscreenMapModal } from "../../../../shared/module-wrappers/fullscreen-map-modal"
import { ProjectMap } from "../../../../shared/module-wrappers/project-map"
import { RouterLink } from "../../../../shared/navigation/router-link"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"
import ProjectInfoRow from "../../../../shared/project/project-info-row"
import { ApplicationKanbanBoard } from "../application-kanban-board"

interface IProps {
  permitProject: IPermitProject
}

export const InboxOverviewTab = observer(({ permitProject }: IProps) => {
  const { fullAddress, pid, jurisdiction, number, recentAudits } = permitProject
  const { t } = useTranslation()
  const { isOpen: isMapFullscreen, onOpen: onOpenMapFullscreen, onClose: onCloseMapFullscreen } = useDisclosure()

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
            <Heading as="h3" size="md" mb={6}>
              {t("permitProject.overview.projectInformation")}
            </Heading>

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
        <Heading as="h3" size="md" mb={6}>
          {t("submissionInbox.projectDetail.recentActivity")}
        </Heading>

        {recentAudits.length === 0 ? (
          <Text color="text.secondary">{t("submissionInbox.projectDetail.noRecentActivity")}</Text>
        ) : (
          <>
            <Box as="ul" listStyleType="none" p={0} m={0}>
              {recentAudits.map((audit) => (
                <Box as="li" key={audit.id} borderBottom="1px solid" borderColor="border.light">
                  <Flex align="center" justify="space-between" py={3} px={4} gap={4} minH={20}>
                    <HStack spacing={1} flex={1} minW={0}>
                      <Text>{audit.description}</Text>
                      {audit.permitName && (
                        <RouterLink
                          to={
                            audit.permitApplicationId
                              ? `/permit-applications/${audit.permitApplicationId}/edit`
                              : undefined
                          }
                        >
                          {audit.permitName}
                        </RouterLink>
                      )}
                    </HStack>
                    <Text color="text.secondary" whiteSpace="nowrap">
                      {format(new Date(audit.createdAt), datefnsTableDateTimeFormat)}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </Box>

            <Flex justify="flex-end" mt={4}>
              <RouterLinkButton variant="link" to="../activity" rightIcon={<ArrowRight />}>
                {t("submissionInbox.projectDetail.allActivity")}
              </RouterLinkButton>
            </Flex>
          </>
        )}
      </Box>

      <Divider borderColor="border.light" />

      <ProjectApplicationsSection permitProject={permitProject} />

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

const ProjectApplicationsSection = observer(function ProjectApplicationsSection({
  permitProject,
}: {
  permitProject: IPermitProject
}) {
  const { t } = useTranslation()
  const [displayMode, setDisplayMode] = useState<EInboxDisplayMode>(EInboxDisplayMode.list)

  const applications = permitProject.tablePermitApplications ?? []
  const [collapsedColumns, setCollapsedColumns] = useState<string[]>([])

  const toggleColumnCollapsed = (columnKey: string) => {
    setCollapsedColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((c) => c !== columnKey) : [...prev, columnKey]
    )
  }

  return (
    <Box as="section" mt={10}>
      <HStack justify="space-between" mb={6}>
        <Heading as="h3" size="md" mb={0}>
          {/* @ts-ignore */}
          {t("submissionInbox.projectDetail.permitApplications")}
        </Heading>

        <ButtonGroup isAttached variant="outline" size="sm">
          <Button
            onClick={() => setDisplayMode(EInboxDisplayMode.list)}
            fontWeight={displayMode === EInboxDisplayMode.list ? "bold" : "normal"}
            borderColor={displayMode === EInboxDisplayMode.list ? "theme.blueActive" : "border.light"}
            leftIcon={<DisplayModeRadioDot active={displayMode === EInboxDisplayMode.list} />}
            rightIcon={<Icon as={List} />}
          >
            {t("submissionInbox.list")}
          </Button>
          <Button
            onClick={() => setDisplayMode(EInboxDisplayMode.columns)}
            fontWeight={displayMode === EInboxDisplayMode.columns ? "bold" : "normal"}
            borderColor={displayMode === EInboxDisplayMode.columns ? "theme.blueActive" : "border.light"}
            leftIcon={<DisplayModeRadioDot active={displayMode === EInboxDisplayMode.columns} />}
            rightIcon={<Icon as={Columns} />}
          >
            {t("submissionInbox.columns")}
          </Button>
        </ButtonGroup>
      </HStack>

      {displayMode === EInboxDisplayMode.columns ? (
        <Box minH="300px">
          <ApplicationKanbanBoard
            applications={applications}
            stateCounts={{}}
            collapsedColumns={collapsedColumns}
            onToggleColumn={toggleColumnCollapsed}
          />
        </Box>
      ) : (
        <Text color="text.secondary" fontSize="sm">
          {/* @ts-ignore */}
          {applications.length === 0
            ? // @ts-ignore
              t("submissionInbox.projectDetail.noApplications")
            : // @ts-ignore
              t("submissionInbox.projectDetail.applicationCount", { count: applications.length })}
        </Text>
      )}
    </Box>
  )
})

function DisplayModeRadioDot({ active }: { active: boolean }) {
  return (
    <Circle
      size="16px"
      border="4px solid"
      borderColor={active ? "theme.blueActive" : "gray.300"}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {!active && <Circle size="8px" bg="white" />}
    </Circle>
  )
}
