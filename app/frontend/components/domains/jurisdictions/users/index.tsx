import { Box, Center, Container, Flex, Heading, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { useSearch } from "../../../../hooks/use-search"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { RouterLink } from "../../../shared/navigation/router-link"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { Can } from "../../../shared/user/can"
import { RoleTag } from "../../../shared/user/role-tag"
import { GridHeaders } from "./grid-header"

export const JurisdictionUserIndexScreen = observer(function JurisdictionUserIndex() {
  const { t } = useTranslation()

  const { currentJurisdiction, error } = useJurisdiction()

  useSearch(currentJurisdiction)

  if (error) return <ErrorScreen />
  if (!currentJurisdiction) return <LoadingScreen />

  const { currentPage, totalPages, totalCount, countPerPage, handleCountPerPageChange, handlePageChange, isSearching } =
    currentJurisdiction

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
            currentJurisdiction.tableUsers.map((u) => {
              return (
                <Box key={u.id} className={"jurisdiction-user-index-grid-row"} role={"row"} display={"contents"}>
                  <SearchGridItem fontWeight={700}>{<RoleTag role={u.role} />}</SearchGridItem>
                  <SearchGridItem>{u.email}</SearchGridItem>
                  <SearchGridItem>{u.name}</SearchGridItem>
                  <SearchGridItem>{format(u.createdAt, "MMM d, yyyy")}</SearchGridItem>
                  <SearchGridItem>todo</SearchGridItem>
                  <SearchGridItem>
                    <Flex justify="space-between" w="full">
                      <Can action="user:manage" data={{ user: u }}>
                        <RouterLink to={"#"}>{t("ui.manage")}</RouterLink>
                      </Can>
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
      </VStack>
    </Container>
  )
})
