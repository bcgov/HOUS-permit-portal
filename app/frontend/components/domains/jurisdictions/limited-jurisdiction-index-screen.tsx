import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
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
import { RouterLink } from "../../shared/navigation/router-link"
import { LimitedGridHeaders } from "./limited-grid-header"

export const LimitedJurisdictionIndexScreen = observer(function JurisdictionIndex() {
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
    <Container maxW="container.lg" p={8} as={"main"} flexGrow={1}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading as="h1">{t("jurisdiction.index.title")}</Heading>
            <Text color={"text.secondary"}>{t("jurisdiction.index.description")}</Text>
          </Box>
        </Flex>

        <SearchGrid templateColumns="3fr 3fr">
          <LimitedGridHeaders />

          {isSearching ? (
            <Flex py={50} gridColumn={"span 2"}>
              <SharedSpinner />
            </Flex>
          ) : (
            tableJurisdictions.map((j) => {
              return (
                <Box key={j.id} className={"jurisdiction-index-grid-row"} role={"row"} display={"contents"}>
                  <SearchGridItem fontWeight={700}>
                    <RouterLink to={`/jurisdictions/${j.id}`}>{j.reverseQualifiedName}</RouterLink>
                  </SearchGridItem>
                  <SearchGridItem>{j.regionalDistrictName}</SearchGridItem>
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
      </VStack>
    </Container>
  )
})
