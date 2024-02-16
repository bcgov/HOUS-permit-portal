import { Box, Center, Container, Flex, Heading, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { useSearch } from "../../../../hooks/use-search"
import { IUser } from "../../../../models/user"
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { ToggleArchivedButton } from "../../../shared/buttons/show-archived-button"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { ManageUserMenu } from "../../../shared/user/mange-user-menu"
import { RoleTag } from "../../../shared/user/role-tag"
import { GridHeaders } from "./grid-header"

export const JurisdictionUserIndexScreen = observer(function JurisdictionUserIndex() {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentJurisdiction, error } = useJurisdiction()

  const {
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
    showArchived,
  } = userStore

  useSearch(userStore, [currentJurisdiction?.id, showArchived])

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading as="h1" fontSize={"4xl"} color={"text.primary"}>
              {currentJurisdiction?.qualifiedName}
            </Heading>
          </Box>
          <RouterLinkButton alignSelf="flex-end" to={"invite"}>
            {t("user.index.inviteButton")}
          </RouterLinkButton>
        </Flex>

        <SearchGrid templateColumns="160px 2fr 2fr repeat(3, 1fr)">
          <GridHeaders />

          {isSearching ? (
            <Center p={50}>
              <SharedSpinner />
            </Center>
          ) : (
            currentJurisdiction.tableUsers.map((u: IUser) => {
              return (
                <Box key={u.id} className={"jurisdiction-user-index-grid-row"} role={"row"} display={"contents"}>
                  <SearchGridItem fontWeight={700}>{<RoleTag role={u.role} />}</SearchGridItem>
                  <SearchGridItem>{u.email}</SearchGridItem>
                  <SearchGridItem>{u.name}</SearchGridItem>
                  <SearchGridItem>{format(u.createdAt, "yyyy-MM-dd")}</SearchGridItem>
                  <SearchGridItem>
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
          />
        </Flex>

        <ToggleArchivedButton searchModel={userStore} mt={3} />
      </VStack>
    </Container>
  )
})
