import { Box, Flex, Heading, HStack } from "@chakra-ui/react"
import { ClipboardText } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EProjectPermitApplicationSortFields } from "../../../types/enums"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { ToggleArchivedButton } from "../../shared/buttons/toggle-archived-button"
import { EmptyResultsBox } from "../../shared/grid/empty-results-box"
import { SearchGrid } from "../../shared/grid/search-grid"
import { AddPermitsButton } from "../../shared/permit-projects/add-permits-button"
import { PermitApplicationGridHeaders } from "./permit-application-grid-headers"
import { PermitApplicationGridRow } from "./permit-application-grid-row"
import { RequirementTemplateFilter } from "./requirement-template-filter"
import { StatusFilter } from "./status-filter"
import { SubmissionDelegateeFilter } from "./submission-delegatee-filter"

interface IProps {
  permitProject: IPermitProject
}

export const PermitsTabPanelContent = observer(({ permitProject }: IProps) => {
  const { permitApplicationStore } = useMst()
  const { currentPage, totalPages, totalCount, countPerPage, handleCountPerPageChange, handlePageChange } =
    permitApplicationStore
  const canViewApplications = permitProject.canViewApplications

  // COLLAB TODO(phase 4): skipping search without Full read is correct until per-application
  // viewing exists. Then always search — you should not need project-wide Full
  // read to see any results; policy_scope returns the apps the user can see.
  useSearch(permitApplicationStore, canViewApplications ? [permitProject.id] : [null])

  const { t } = useTranslation()

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section">
        <Flex justify="space-between" align="center" mb={6}>
          <HStack align="center" spacing={4}>
            <ClipboardText size={32} />
            <Heading as="h2" size="lg" mb={0}>
              {t("permitProject.permits.title")}
            </Heading>
          </HStack>
          <AddPermitsButton permitProject={permitProject} />
        </Flex>
        {/* COLLAB TODO(phase 4): this "no Full read → no results at all" branch goes away when
            per-application viewing lands; render the grid from search results even
            if the user lacks project-wide Full read. */}
        {!canViewApplications ? (
          <EmptyResultsBox
            description={t("permitProject.permits.noAccess")}
            icon={<ClipboardText size={18} />}
            mt={2}
          />
        ) : permitProject.totalPermitsCount === 0 ? (
          <EmptyResultsBox description={t("permitProject.index.empty")} icon={<ClipboardText size={18} />} mt={2} />
        ) : (
          <>
            <Flex gap={2} mb={2}>
              <RequirementTemplateFilter searchModel={permitApplicationStore} />
              <StatusFilter searchModel={permitApplicationStore} />
              {permitProject.isOwner && (
                <SubmissionDelegateeFilter searchModel={permitApplicationStore} permitProject={permitProject} />
              )}
            </Flex>
            <SearchGrid
              templateColumns="2.25fr 1.75fr 1fr 1.4fr 1.1fr 1fr 0.5fr"
              gridRowClassName="permit-application-grid-row"
            >
              <PermitApplicationGridHeaders
                columns={Object.values(EProjectPermitApplicationSortFields)}
                includeActionColumn
              />
              {permitProject.tablePermitApplications
                ?.filter((pa) => pa.isDiscarded === permitApplicationStore.showArchived)
                .map((permitApplication) => (
                  <PermitApplicationGridRow
                    key={permitApplication.id}
                    permitApplication={permitApplication}
                    searchModel={permitApplicationStore}
                  />
                ))}
            </SearchGrid>
            <Flex w={"full"} justifyContent={"space-between"} mt={6}>
              <PerPageSelect
                handleCountPerPageChange={handleCountPerPageChange}
                countPerPage={countPerPage}
                totalCount={totalCount}
              />
              <Paginator
                current={currentPage}
                total={totalCount}
                totalPages={totalPages}
                pageSize={countPerPage}
                handlePageChange={handlePageChange}
                showLessItems={true}
              />
            </Flex>
            <Flex mt={4}>
              <ToggleArchivedButton searchModel={permitApplicationStore} />
            </Flex>
          </>
        )}
      </Box>
    </Flex>
  )
})
