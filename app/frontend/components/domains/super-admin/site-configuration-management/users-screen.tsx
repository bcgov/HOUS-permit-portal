import { Box, Container, Flex, Heading, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../../hooks/use-search"
import { IUser } from "../../../../models/user"
import { useMst } from "../../../../setup/root"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { ToggleArchivedButton } from "../../../shared/buttons/show-archived-button"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { ManageUserMenu } from "../../../shared/user/manage-user-menu"
import { RoleTag } from "../../../shared/user/role-tag"
import { GridHeaders } from "../../jurisdictions/users/grid-header"

export const AdminUserIndexScreen = observer(() => {
  const i18nPrefix = "siteConfiguration.adminUserIndex"
  const { t } = useTranslation()
  const { userStore, jurisdictionStore } = useMst()
  const { resetCurrentJurisdiction } = jurisdictionStore
  const {
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
    showArchived,
    tableUsers,
  } = userStore

  useEffect(() => {
    // The userStore shares search functionality with the jurisdiction specific screens
    // the absense of currentJurisdiction indicates to that method that this is the admin search.
    resetCurrentJurisdiction()
  }, [])

  useSearch(userStore, [showArchived])

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading as="h1">{t(`${i18nPrefix}.title`)}</Heading>
          </Box>
          <RouterLinkButton alignSelf="flex-end" to={"invite"}>
            {t("user.index.inviteButton")}
          </RouterLinkButton>
        </Flex>

        <SearchGrid templateColumns="160px 2fr 2fr repeat(3, 1fr)">
          <GridHeaders />
          {isSearching ? (
            <Flex py="50" gridColumn={"span 6"}>
              <SharedSpinner />
            </Flex>
          ) : (
            tableUsers.map((u: IUser) => {
              return (
                <Box key={u.id} className={"jurisdiction-user-index-grid-row"} role={"row"} display={"contents"}>
                  <SearchGridItem fontWeight={700}>{<RoleTag role={u.role} />}</SearchGridItem>
                  <SearchGridItem fontSize="sm">{u.email}</SearchGridItem>
                  <SearchGridItem fontSize="sm" maxWidth="300px" sx={{ wordBreak: "break-word" }}>
                    {u.name}
                  </SearchGridItem>
                  <SearchGridItem fontSize="sm">{format(u.createdAt, "yyyy-MM-dd")}</SearchGridItem>
                  <SearchGridItem fontSize="sm">
                    {u.lastSignInAt ? format(u.lastSignInAt, "yyyy-MM-dd") : t("ui.never")}
                  </SearchGridItem>
                  <SearchGridItem>
                    <Flex justify="space-between" w="full">
                      <ManageUserMenu user={u} searchModel={userStore} />
                    </Flex>
                  </SearchGridItem>
                </Box>
              )
            })
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

        <ToggleArchivedButton searchModel={userStore} mt={3} />
      </VStack>
    </Container>
  )
})
