import { Container, Flex, FormControl, FormLabel, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { useFlashQueryParam } from "../../../hooks/use-flash-query-param"
import { useSearch } from "../../../hooks/use-search"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EPermitProjectSortFields } from "../../../types/enums"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { PermitProjectCard } from "../../shared/permit-projects/permit-project-card"
import { SortSelect } from "../../shared/select/selectors/sort-select"
// import { PermitProjectFiltersMenu } from "./permit-project-filters-menu"; // If filters are needed

interface IPermitProjectIndexScreenProps {}

// Placeholder for PermitProjectCard - REMOVE THIS as it's now imported
// const PermitProjectCard = ({ permitProject }: { permitProject: IPermitProject }) => { ... };

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
    // Add any specific filters or status groups if developed for projects
  } = permitProjectStore

  // useSearch hook will be updated later if needed for project-specific params
  useSearch(permitProjectStore, [])
  useFlashQueryParam()

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white" pb="24">
      {/* Potentially add tabs for project statuses if applicable */}
      <BlueTitleBar title={t("permitProject.indexTitle", "Permit Projects")} />
      <Container maxW="container.lg" pb={4}>
        <Flex as="section" direction="column" p={6} gap={6} flex={1}>
          {/* Add "New Project" button if needed
          <RouterLinkButton
            to="/permit-projects/new" // Adjust route as needed
            variant="primary"
            alignSelf={{ base: "center", md: "flex-start" }}
          >
            {t("permitProject.startNew", "Start New Project")}
          </RouterLinkButton>
          */}
          <Flex
            gap={6}
            align={{ base: "flex-start", md: "flex-end" }}
            justify="space-between"
            direction={{ base: "column", md: "row" }}
          >
            <Heading as="h2">{t("permitProject.listTitle")}</Heading>
            <Flex align="flex-end" gap={4} direction={{ base: "column", md: "row" }}>
              {/* Add filters menu if developed
              {permitProjectStore.hasResetableFilters && ( // Assuming hasResetableFilters is added to store
                <Button variant="link" mb={2} onClick={permitProjectStore.resetFilters}> // Assuming resetFilters is added
                  {t("ui.resetFilters")}
                </Button>
              )}
              <PermitProjectFiltersMenu /> 
              */}
              <FormControl w="fit-content">
                <FormLabel>{t("ui.search")}</FormLabel>
                <ModelSearchInput searchModel={permitProjectStore} />
              </FormControl>
              <SortSelect
                searchModel={permitProjectStore}
                i18nPrefix="permitProject" // Ensure translations exist for permitProject.columns.description etc.
                sortFields={Object.values(EPermitProjectSortFields)}
              />
            </Flex>
          </Flex>

          {isSearching ? (
            <Flex py="50" w="full">
              <SharedSpinner h={50} w={50} />
            </Flex>
          ) : R.isEmpty(tablePermitProjects) ? (
            <CustomMessageBox
              status={EFlashMessageStatus.info}
              title={t("permitProject.noneFound")}
              description={t("permitProject.noneFoundExplanation")}
            />
          ) : (
            tablePermitProjects.map((project) => (
              <PermitProjectCard key={project.id} permitProject={project as IPermitProject} />
            ))
          )}
        </Flex>
        <Flex px={6} justify="space-between">
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
      </Container>
    </Flex>
  )
})

// Need to add Box and Text from chakra-ui for the placeholder card
