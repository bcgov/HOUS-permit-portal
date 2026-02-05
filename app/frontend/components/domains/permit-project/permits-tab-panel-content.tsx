import { Box, Flex, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import {
  EFlashMessageStatus,
  EPermitProjectRollupStatus,
  EProjectPermitApplicationSortFields,
} from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { ToggleArchivedButton } from "../../shared/buttons/toggle-archived-button"
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
  const { permitApplicationStore, userStore } = useMst()
  const { currentPage, totalPages, totalCount, countPerPage, handleCountPerPageChange, handlePageChange } =
    permitApplicationStore

  useSearch(permitApplicationStore, [permitProject.id])

  const { t } = useTranslation()

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h3" size="md">
            {t("permitProject.permits.title")}
          </Heading>
          <AddPermitsButton permitProject={permitProject} />
        </Flex>
        {permitProject.rollupStatus === EPermitProjectRollupStatus.empty ? (
          <CustomMessageBox status={EFlashMessageStatus.info} description={t("permitProject.index.empty")} mt={2} />
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
              templateColumns="2fr 1.5fr 1.5fr 1.5fr 1.5fr 0.5fr"
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
