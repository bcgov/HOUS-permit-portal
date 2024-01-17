import { Box, Container, Flex, Grid, GridItem, GridItemProps, Heading, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { RouterLink } from "../../../shared/navigation/router-link"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { Can } from "../../../shared/user/can"
import { RoleTag } from "../../../shared/user/role-tag"
import { GridHeaders } from "./grid-header"

const sharedGridItemsStyles: Partial<GridItemProps> = {
  p: 4,
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  role: "cell",
  color: "text.primary",
}
export const JurisdictionUserIndexScreen = observer(function JurisdictionUserIndex() {
  const { t } = useTranslation()

  const { currentJurisdiction, error } = useJurisdiction()

  useEffect(() => {
    if (!currentJurisdiction) return
    currentJurisdiction.fetchUsers()
  }, [currentJurisdiction])

  if (error) return <ErrorScreen />
  if (!currentJurisdiction) return <LoadingScreen />

  const { currentPage, totalPages, totalCount, countPerPage, handleCountPerPageChange, handlePageChange } =
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

        <Grid
          mt={3}
          role={"table"}
          templateColumns="160px 2fr 2fr repeat(3, 1fr)"
          w="full"
          maxW={"full"}
          overflow={"auto"}
          sx={{
            borderCollapse: "separate",
            ".jurisdiction-user-index-grid-row:not(:last-of-type) > div": {
              borderBottom: "1px solid",
              borderColor: "border.light",
            },
          }}
          border={"1px solid"}
          borderColor={"border.light"}
          borderRadius={"sm"}
        >
          <GridHeaders />
          {currentJurisdiction.tableUsers.map((u) => {
            return (
              <Box key={u.id} className={"jurisdiction-user-index-grid-row"} role={"row"} display={"contents"}>
                <GridItem {...sharedGridItemsStyles} fontWeight={700}>
                  {<RoleTag role={u.role} />}
                </GridItem>
                <GridItem {...sharedGridItemsStyles}>{u.email}</GridItem>
                <GridItem {...sharedGridItemsStyles}>{u.name}</GridItem>
                <GridItem {...sharedGridItemsStyles}>{format(u.createdAt, "MMM d, yyyy")}</GridItem>
                <GridItem {...sharedGridItemsStyles}>todo</GridItem>
                <GridItem {...sharedGridItemsStyles}>
                  <Flex justify="space-between" w="full">
                    <Can action="user:manage" data={{ user: u }}>
                      <RouterLink to={"#"}>{t("ui.manage")}</RouterLink>
                    </Can>
                  </Flex>
                </GridItem>
              </Box>
            )
          })}
        </Grid>
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
