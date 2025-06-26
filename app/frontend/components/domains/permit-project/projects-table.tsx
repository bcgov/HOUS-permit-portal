import {
  Box,
  Flex,
  FormControl,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react"
import { DotsThreeVertical } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateFormat } from "../../../constants"
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
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { RouterLink } from "../../shared/navigation/router-link"
import { GridHeaders } from "./grid-header"
import { PhaseFilter } from "./phase-filter"
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
          </HStack>
          <PhaseFilter searchModel={permitProjectStore} />
        </Flex>
      </Flex>

      <SearchGrid templateColumns="2fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr 0.5fr" gridRowClassName="project-grid-row">
        <GridHeaders columns={Object.values(EPermitProjectSortFields)} includeActionColumn />

        {isSearching ? (
          <Flex gridColumn="span 7" justify="center" align="center" minH="200px">
            <SharedSpinner />
          </Flex>
        ) : R.isEmpty(tablePermitProjects) ? (
          <GridItem gridColumn="span 7">
            <CustomMessageBox
              status={EFlashMessageStatus.info}
              title={t("permitProject.noneFound")}
              description={t("permitProject.noneFoundExplanation")}
            />
          </GridItem>
        ) : (
          tablePermitProjects.map((project: IPermitProject) => (
            <Box key={project.id} display="contents" role="row" className="project-grid-row">
              <SearchGridItem>
                <RouterLink to={`/permit-projects/${project.id}`}>{project.title}</RouterLink>
              </SearchGridItem>
              <SearchGridItem>{project.fullAddress}</SearchGridItem>
              <SearchGridItem>submitter</SearchGridItem>
              <SearchGridItem>{project.updatedAt && format(project.updatedAt, datefnsTableDateFormat)}</SearchGridItem>
              <SearchGridItem>
                {project.forcastedCompletionDate && format(project.forcastedCompletionDate, datefnsTableDateFormat)}
              </SearchGridItem>
              <SearchGridItem>
                {/* @ts-ignore */}
                <Text fontWeight="bold">{t(`permitProject.phase.${project.phase}`)}</Text>
              </SearchGridItem>
              <SearchGridItem>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label={t("ui.options")}
                    icon={<DotsThreeVertical size={24} />}
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem onClick={() => project.togglePin()}>
                      {project.isPinned
                        ? t("permitProject.unpinProject", "Unpin project")
                        : t("permitProject.pinProject", "Pin project")}
                    </MenuItem>
                  </MenuList>
                </Menu>
              </SearchGridItem>
            </Box>
          ))
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
