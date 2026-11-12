import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react"
import { DotsThreeVertical, Info, Plus, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMatch } from "react-router-dom"
import { useSearch } from "../../../hooks/use-search"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { CheckboxFilter } from "../../shared/filters/checkbox-filter"
import { GridHeader } from "../../shared/grid/grid-header"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ProjectAccessTag } from "../../shared/permit-projects/project-access-tag"

const PEOPLE_GRID_TEMPLATE_COLUMNS = "2fr 1.5fr 1fr 1fr 60px"
const ACCESS_LEVELS = ["standard", "expanded", "full"] as const

interface IProps {
  permitProject: IPermitProject
}

export const PeopleTabPanelContent = observer(({ permitProject }: IProps) => {
  const isNew = Boolean(useMatch("/projects/:permitProjectId/people/new"))
  if (isNew) return <PeopleNewStub />

  return <PeopleList permitProject={permitProject} />
})

const PeopleNewStub = () => {
  const { t } = useTranslation()

  return (
    <Box p={10}>
      <Heading as="h2" size="lg">
        {t("permitProject.people.addPerson")}
      </Heading>
    </Box>
  )
}

const PeopleList = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()
  const { projectPeopleStore, userStore } = useMst()
  const currentUser = userStore.currentUser
  const {
    tablePeople,
    isSearching,
    accessFilter,
    setAccessFilter,
    roleFilter,
    setRoleFilter,
    roleTags,
    search,
    resetFilters,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
  } = projectPeopleStore

  useSearch(projectPeopleStore, [permitProject.id])

  const accessOptions = ACCESS_LEVELS.map((access) => ({
    value: access,
    label: t(`permitProject.people.access.${access}`),
  }))
  const roleOptions = roleTags.map((tag) => ({ value: tag, label: tag }))

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <VStack align="stretch" spacing={4} w="full">
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={4}>
            <Users size={32} />
            <Heading as="h2" size="lg" mb={0}>
              {t("permitProject.details.people")}
            </Heading>
          </Flex>
          <RouterLinkButton
            variant="primary"
            leftIcon={<Icon as={Plus} />}
            to={`/projects/${permitProject.id}/people/new`}
          >
            {t("permitProject.people.addPerson")}
          </RouterLinkButton>
        </Flex>

        <Flex direction="column" gap={4} w="full">
          <FormControl w="full">
            <ModelSearchInput
              searchModel={projectPeopleStore}
              inputProps={{ placeholder: t("permitProject.people.searchPlaceholder"), width: "full" }}
              inputGroupProps={{ width: "full" }}
            />
          </FormControl>
          <Flex justifyContent="space-between" w="full">
            <HStack>
              <CheckboxFilter
                value={accessFilter.slice()}
                onChange={(value) => {
                  setAccessFilter(value)
                  search()
                }}
                onReset={() => {
                  setAccessFilter([])
                  search()
                }}
                options={accessOptions}
                title={t("permitProject.people.accessFilter")}
              />
              <CheckboxFilter
                value={roleFilter.slice()}
                onChange={(value) => {
                  setRoleFilter(value)
                  search()
                }}
                onReset={() => {
                  setRoleFilter([])
                  search()
                }}
                options={roleOptions}
                title={t("permitProject.people.roleFilter")}
              />
            </HStack>
            <Button variant="link" size="sm" flexShrink={0} ml="auto" onClick={resetFilters}>
              {t("submissionInbox.clearAllFilters")}
            </Button>
          </Flex>
        </Flex>

        <SearchGrid
          templateColumns={PEOPLE_GRID_TEMPLATE_COLUMNS}
          gridRowClassName="project-people-grid-row"
          isEmpty={!isSearching && tablePeople.length === 0}
          emptyTitle={t("permitProject.people.emptyTitle")}
          emptyDescription={t("permitProject.people.emptyDescription")}
          emptyIcon={<Users size={18} />}
        >
          <Box display="contents" role="row">
            {(["name", "role", "access", "status"] as const).map((column) => (
              <GridHeader key={column}>
                <Text px={4}>{t(`permitProject.people.columns.${column}`)}</Text>
              </GridHeader>
            ))}
            <GridHeader role="columnheader" />
          </Box>
          {isSearching ? (
            <Flex gridColumn="1 / -1" justify="center" align="center" minH="200px">
              <SharedSpinner />
            </Flex>
          ) : (
            tablePeople.map((person) => (
              <SearchGridRow key={person.id}>
                <SearchGridItem>
                  <Flex align="center" gap={2.5}>
                    <Avatar
                      name={person.name}
                      size="sm"
                      bg="semantic.warningLight"
                      color="text.primary"
                      fontSize="sm"
                    />
                    <Flex direction="column" align="flex-start">
                      <Text>
                        {person.name}
                        {person.userId === currentUser?.id ? ` ${t("permitProject.people.you")}` : ""}
                      </Text>
                      {person.contactDesignation === "primary" && (
                        <Text fontSize="xs" color="text.secondary">
                          {t("permitProject.people.primaryContact")}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </SearchGridItem>
                <SearchGridItem>{person.roleTags.join(", ")}</SearchGridItem>
                <SearchGridItem>{person.access && <ProjectAccessTag access={person.access} />}</SearchGridItem>
                <SearchGridItem>{t("permitProject.people.statusActive")}</SearchGridItem>
                <SearchGridItem justifyContent="flex-end" px={2}>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label={t("ui.options")}
                      icon={<DotsThreeVertical size={20} />}
                      variant="ghost"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <MenuList boxShadow="elevations.elevation04" borderColor="border.base" minW="220px">
                      <MenuItem icon={<Info size={16} />} fontSize="sm">
                        {t("permitProject.people.details")}
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </SearchGridItem>
              </SearchGridRow>
            ))
          )}
        </SearchGrid>
        <Flex w="full" justifyContent="space-between">
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
            showLessItems
          />
        </Flex>
      </VStack>
    </Flex>
  )
})
