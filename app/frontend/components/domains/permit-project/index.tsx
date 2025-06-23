import { Box, Container, Flex, FormControl, GridItem, Heading, Text, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateFormat } from "../../../constants"
import { useSearch } from "../../../hooks/use-search"
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
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { GridHeaders } from "./grid-header"

interface IPermitProjectIndexScreenProps {}

export const PermitProjectIndexScreen = observer(({}: IPermitProjectIndexScreenProps) => {
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

  useSearch(permitProjectStore, [])
  const navHeight = document.getElementById("mainNav")?.offsetHeight

  return (
    <Flex as="main" direction="row" w="full" flexGrow={1}>
      <Box
        as="aside"
        w="280px"
        bg="greys.grey04"
        p={6}
        pb={navHeight}
        borderRight="1px"
        borderColor="border.light"
        position="sticky"
        top={0}
        h="100vh"
        alignSelf="flex-start"
      >
        <Text>Sidebar nav TBD</Text>
      </Box>
      <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
        <Container maxW="container.xl" py={8} h={"full"}>
          <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading as="h1">{t("permitProject.index.title", "Projects")}</Heading>
              <RouterLinkButton to="/permit-projects/new" variant="primary">
                {t("permitProject.startNew", "Start New Project")}
              </RouterLinkButton>
            </Flex>

            <VStack align="stretch" spacing={4}>
              <Heading as="h2" size="lg">
                {t("permitProject.index.pinnedProjects", "Pinned projects")}
              </Heading>
              <Box bg="greys.grey04" p={10} borderRadius="md" borderWidth="1px" borderColor="border.light">
                <Text textAlign="center" color="greys.grey70">
                  {t("permitProject.index.pinnedProjectsTbd", "Pinned projects TBD")}
                </Text>
              </Box>
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Heading as="h2" size="lg">
                {t("permitProject.index.allProjects", "All projects")}
              </Heading>

              <Flex direction="column" gap={4}>
                <FormControl w="full">
                  <ModelSearchInput
                    searchModel={permitProjectStore}
                    inputProps={{ placeholder: t("ui.search"), width: "full" }}
                    inputGroupProps={{ width: "full" }}
                  />
                </FormControl>
                <ActiveArchivedFilter searchModel={permitProjectStore} />
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
                      <SearchGridItem>{project.title}</SearchGridItem>
                      <SearchGridItem>{project.fullAddress}</SearchGridItem>
                      <SearchGridItem>submitter</SearchGridItem>
                      <SearchGridItem>
                        {project.updatedAt && format(project.updatedAt, datefnsTableDateFormat)}
                      </SearchGridItem>
                      <SearchGridItem>
                        {project.forcastedCompletionDate &&
                          format(project.forcastedCompletionDate, datefnsTableDateFormat)}
                      </SearchGridItem>
                      <SearchGridItem>
                        {/* @ts-ignore */}
                        <Text fontWeight="bold">{t(`permitProject.phase.${project.phase}`)}</Text>
                      </SearchGridItem>
                      <SearchGridItem>Actions</SearchGridItem>
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
          </VStack>
        </Container>
      </Flex>
    </Flex>
  )
})
