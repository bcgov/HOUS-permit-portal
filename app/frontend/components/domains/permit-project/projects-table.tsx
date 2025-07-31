import { Flex, FormControl, GridItem, Heading, HStack, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EPermitProjectSortFields } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ActiveArchivedFilter } from "../../shared/filters/active-archived-filter"
import { SearchGrid } from "../../shared/grid/search-grid"
import { GridHeaders } from "./grid-header"
import { PhaseFilter } from "./phase-filter"
import { ProjectGridRow } from "./project-grid-row"
import { RequirementTemplateFilter } from "./requirement-template-filter"

export const ProjectsTable = observer(() => {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()
  const {
    tablePermitProjects,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = permitProjectStore

  return (
    <VStack align="stretch" spacing={4} w="full">
      <Heading as="h2" size="lg">
        {t("permitProject.index.allProjects", "All projects")}
      </Heading>

      <Flex direction="column" gap={4} w="full">
        <FormControl w="full">
          <ModelSearchInput
            searchModel={permitProjectStore}
            inputProps={{ placeholder: t("ui.search"), width: "full" }}
            inputGroupProps={{ width: "full" }}
          />
        </FormControl>
        <Flex justifyContent={"space-between"} w="full">
          <HStack>
            <ActiveArchivedFilter searchModel={permitProjectStore} />
            <RequirementTemplateFilter searchModel={permitProjectStore} />
            <PhaseFilter searchModel={permitProjectStore} />
          </HStack>
        </Flex>
      </Flex>

      <SearchGrid templateColumns="2fr 1.5fr 1.5fr 2fr 1.5fr 2fr 0.5fr" gridRowClassName="project-grid-row">
        <GridHeaders columns={Object.values(EPermitProjectSortFields)} includeActionColumn />

        {isSearching ? (
          <Flex gridColumn="span 7" justify="center" align="center" minH="200px">
            <SharedSpinner />
          </Flex>
        ) : R.isEmpty(tablePermitProjects) ? (
          <GridItem gridColumn="span 7">
            <CustomMessageBox
              m={4}
              status={EFlashMessageStatus.info}
              description={t("permitProject.noneFoundExplanation")}
            />
          </GridItem>
        ) : (
          tablePermitProjects.map((project: IPermitProject) => <ProjectGridRow key={project.id} project={project} />)
        )}
      </SearchGrid>
      <Flex w={"full"} justifyContent={"space-between"}>
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
    </VStack>
  )
})
