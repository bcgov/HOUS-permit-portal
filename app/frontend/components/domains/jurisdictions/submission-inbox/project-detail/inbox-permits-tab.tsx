import { Box, Button, ButtonGroup, Circle, Flex, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { ClipboardText, Columns, ListDashes, MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useJurisdiction } from "../../../../../hooks/resources/use-jurisdiction"
import { useSearch } from "../../../../../hooks/use-search"
import { IPermitProject } from "../../../../../models/permit-project"
import { useMst } from "../../../../../setup/root"
import { EInboxDisplayMode, EPermitApplicationStatus } from "../../../../../types/enums"
import { IOption } from "../../../../../types/types"
import { ApplicationInboxTable } from "../application-inbox-table"
import { ApplicationKanbanBoard } from "../application-kanban-board"
import {
  AssignedFilter,
  DaysInQueueFilter,
  RequirementTemplateInboxFilter,
  StatusFilter,
  UnreadFilter,
} from "../filters"

interface IProps {
  permitProject: IPermitProject
}

export const InboxPermitsTab = observer(function InboxPermitsTab({ permitProject }: IProps) {
  const { t } = useTranslation()
  const { jurisdictionId } = useParams<{ jurisdictionId: string }>()
  const { currentJurisdiction } = useJurisdiction()
  const { collaboratorStore, sandboxStore, submissionInboxStore } = useMst()
  const { currentSandboxId } = sandboxStore
  const [collapsedColumns, setCollapsedColumns] = useState<string[]>([])

  const applications = permitProject.inboxTablePermitApplications

  useSearch(permitProject, [permitProject.id, jurisdictionId, JSON.stringify(currentSandboxId)])

  const loadCollaboratorOptions = useCallback(async (): Promise<IOption[]> => {
    if (!currentJurisdiction?.id) return []
    return collaboratorStore.fetchCollaboratorOptionsForJurisdiction(currentJurisdiction.id)
  }, [currentJurisdiction?.id, collaboratorStore])

  return (
    <Flex direction="column" flex={1} minH={0} minW={0} bg="greys.white" p={4} overflow="hidden">
      <Box as="section" mb={6} flexShrink={0}>
        <HStack align="center" gap={4} mb={4}>
          <ClipboardText size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("submissionInbox.projectDetail.permits")}
          </Heading>
        </HStack>

        <VStack align="stretch" gap={4}>
          <Flex
            w="full"
            align="center"
            gap={2}
            border="1px solid"
            borderColor="border.light"
            borderRadius="md"
            bg="white"
            px={3}
          >
            <MagnifyingGlass size={18} weight="bold" color="var(--chakra-colors-gray-500)" aria-hidden />
            <Box
              flex={1}
              minW={0}
              py={2}
              border="none"
              outline="none"
              fontSize="sm"
              _placeholder={{ color: "text.secondary" }}
              asChild
            >
              <input
                placeholder={t("submissionInbox.searchPlaceholder")}
                value={permitProject.query ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  permitProject.setQuery(e.target.value)
                  permitProject.search()
                }}
              />
            </Box>
          </Flex>

          <Flex w="full" flexWrap="wrap" alignItems="center" columnGap={3} rowGap={3}>
            <ButtonGroup attached variant="outline" size="sm" flexShrink={0}>
              <Button
                borderRightWidth={2}
                onClick={() => {
                  permitProject.setInboxDisplayMode(EInboxDisplayMode.list)
                  permitProject.search()
                }}
                fontWeight={permitProject.displayMode === EInboxDisplayMode.list ? "bold" : "normal"}
                borderColor={permitProject.displayMode === EInboxDisplayMode.list ? "theme.blueActive" : "border.light"}
                bg={permitProject.displayMode === EInboxDisplayMode.list ? "background.blueLight" : undefined}
              >
                <RadioDot active={permitProject.displayMode === EInboxDisplayMode.list} />
                {t("submissionInbox.list")}
                <Icon asChild>
                  <ListDashes />
                </Icon>
              </Button>
              <Button
                onClick={() => {
                  permitProject.setStatusFilter([] as EPermitApplicationStatus[])
                  permitProject.setInboxDisplayMode(EInboxDisplayMode.columns)
                  permitProject.search()
                }}
                fontWeight={permitProject.displayMode === EInboxDisplayMode.columns ? "bold" : "normal"}
                borderColor={
                  permitProject.displayMode === EInboxDisplayMode.columns ? "theme.blueActive" : "border.light"
                }
                bg={permitProject.displayMode === EInboxDisplayMode.columns ? "background.blueLight" : undefined}
              >
                <RadioDot active={permitProject.displayMode === EInboxDisplayMode.columns} />
                {t("submissionInbox.columns")}
                <Columns />
              </Button>
            </ButtonGroup>

            <Flex flex="1" minW={0} flexWrap="wrap" gap={2} justifyContent="flex-start" alignItems="center">
              <UnreadFilter
                value={permitProject.unreadFilter}
                onChange={(val) => permitProject.setUnreadFilter(val)}
                onApply={() => permitProject.search()}
                badgeCount={permitProject.unreadCount}
              />
              <RequirementTemplateInboxFilter
                value={[...permitProject.requirementTemplateIdFilter]}
                onChange={(val) => permitProject.setRequirementTemplateIdFilter(val)}
                onApply={() => permitProject.search()}
                onClear={() => {
                  permitProject.setRequirementTemplateIdFilter([])
                  permitProject.search()
                }}
              />
              {permitProject.displayMode === EInboxDisplayMode.list && (
                <StatusFilter
                  value={[...permitProject.statusFilter]}
                  onChange={(val) => permitProject.setStatusFilter(val as EPermitApplicationStatus[])}
                  onApply={() => permitProject.search()}
                  onClear={() => {
                    permitProject.setStatusFilter([] as EPermitApplicationStatus[])
                    permitProject.search()
                  }}
                />
              )}
              <DaysInQueueFilter
                value={permitProject.daysInQueueFilter}
                onChange={(val) => permitProject.setDaysInQueueFilter(val)}
                onApply={() => permitProject.search()}
                onClear={() => {
                  permitProject.setDaysInQueueFilter(null)
                  permitProject.search()
                }}
              />
              <AssignedFilter
                value={[...permitProject.assignedFilter]}
                onChange={(val) => permitProject.setAssignedFilter(val)}
                onApply={() => permitProject.search()}
                onClear={() => {
                  permitProject.setAssignedFilter([])
                  permitProject.search()
                }}
                loadOptions={loadCollaboratorOptions}
              />
            </Flex>

            <Button
              variant="plain"
              size="sm"
              flexShrink={0}
              ml={{ base: 0, lg: "auto" }}
              onClick={() => permitProject.resetFilters()}
            >
              {t("submissionInbox.clearAllFilters")}
            </Button>
          </Flex>

          {permitProject.displayMode === EInboxDisplayMode.list &&
            permitProject.totalCount != null &&
            !permitProject.isSearching && (
              <Text fontSize="sm" color="text.secondary">
                {
                  // @ts-ignore
                  t("submissionInbox.projectDetail.showingResultSummary", {
                    count: permitProject.totalCount,
                    label: String(t("submissionInbox.applications")).toLowerCase(),
                  })
                }
              </Text>
            )}
        </VStack>
      </Box>
      {permitProject.displayMode === EInboxDisplayMode.list ? (
        <Flex flex={1} minH={0} minW={0} direction="column" overflow="hidden">
          <ApplicationInboxTable searchStore={permitProject} applications={applications} />
        </Flex>
      ) : (
        <Flex direction="column" flex={1} minH={0} minW={0} overflowX="auto" overflowY="hidden">
          <ApplicationKanbanBoard
            applications={applications}
            stateCounts={permitProject.stateCounts}
            columnTotals={permitProject.columnTotals}
            unreadCounts={permitProject.unreadColumnCounts}
            collapsedColumns={collapsedColumns}
            onToggleColumn={(key) =>
              setCollapsedColumns((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]))
            }
            onShowMore={(columnState) => {
              permitProject.setInboxDisplayMode(EInboxDisplayMode.list)
              permitProject.setStatusFilter([columnState as EPermitApplicationStatus])
              permitProject.search({ reset: true })
            }}
            onReorder={(event) => submissionInboxStore.permitApplicationSearch.reorderApplications(event.orderedIds)}
          />
        </Flex>
      )}
    </Flex>
  )
})

function RadioDot({ active }: { active: boolean }) {
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
