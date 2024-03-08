import { Box, Center, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { ManageJurisdictionMenu } from "../../shared/jurisdiction/manage-jurisdiction-menu"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { GridHeaders } from "./grid-header"

export const JurisdictionIndexScreen = observer(function JurisdictionIndex() {
  const { jurisdictionStore } = useMst()
  const {
    tableJurisdictions,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = jurisdictionStore
  const { t } = useTranslation()

  useSearch(jurisdictionStore)

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading as="h3" fontSize={"4xl"} color={"text.primary"}>
              {t("jurisdiction.index.title")}
            </Heading>
            <Text color={"text.secondary"} mt={1}>
              {t("jurisdiction.index.description")}
            </Text>
          </Box>
          <RouterLinkButton variant={"primary"} to={"/jurisdictions/new"}>
            {t("jurisdiction.index.createButton")}
          </RouterLinkButton>
        </Flex>

        <SearchGrid templateColumns="3fr repeat(4, 1fr) 1fr">
          <GridHeaders />

          {isSearching ? (
            <Center p={50}>
              <SharedSpinner />
            </Center>
          ) : (
            tableJurisdictions.map((j) => {
              return (
                <Box key={j.id} className={"jurisdiction-index-grid-row"} role={"row"} display={"contents"}>
                  <SearchGridItem fontWeight={700}>{j.reverseQualifiedName}</SearchGridItem>
                  <SearchGridItem>{j.reviewManagersSize}</SearchGridItem>
                  <SearchGridItem>{j.reviewersSize}</SearchGridItem>
                  <SearchGridItem>{j.permitApplicationsSize}</SearchGridItem>
                  <SearchGridItem>{j.templatesUsedSize}</SearchGridItem>
                  <SearchGridItem>
                    <Flex justify="center" w="full" gap={3}>
                      <RouterLink to={`${j.id}/users/invite`}>{t("user.invite")}</RouterLink>
                      <ManageJurisdictionMenu jurisdiction={j} searchModel={jurisdictionStore} />
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
