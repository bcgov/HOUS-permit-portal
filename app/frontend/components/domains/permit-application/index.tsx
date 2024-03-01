import { Container, Flex, FormControl, FormLabel, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"

import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { EPermitApplicationSubmitterSortFields } from "../../../types/enums"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SearchInput } from "../../shared/base/search-input"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PermitApplicationCard } from "../../shared/permit-applications/permit-application-card"
import { SortSelect } from "../../shared/select/selectors/sort-select"

interface IPermitApplicationIndexScreenProps {}

export const PermitApplicationIndexScreen = observer(({}: IPermitApplicationIndexScreenProps) => {
  const { t } = useTranslation()

  const { permitApplicationStore } = useMst()
  const {
    tablePermitApplications,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = permitApplicationStore

  useSearch(permitApplicationStore, [])

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white" flex={1}>
      <BlueTitleBar title={t("permitApplication.indexTitle")} imageSrc={"/images/jurisdiction-bus.svg"} />
      <Container maxW="container.lg" pb={4}>
        <Flex as="section" direction="column" p={6} gap={6} flex={1}>
          <RouterLinkButton
            to="/permit-applications/new"
            variant="primary"
            alignSelf={{ base: "center", md: "flex-start" }}
          >
            {t("permitApplication.start")}
          </RouterLinkButton>
          <Flex
            gap={6}
            align={{ base: "flex-start", md: "flex-end" }}
            justify="space-between"
            direction={{ base: "column", md: "row" }}
          >
            <Heading as="h3" fontSize="2xl">
              {t("permitApplication.drafts")}
            </Heading>
            <Flex align="flex-end" gap={4}>
              <FormControl w="fit-content">
                <FormLabel>{t("ui.search")}</FormLabel>
                <SearchInput searchModel={permitApplicationStore} />
              </FormControl>
              <SortSelect
                searchModel={permitApplicationStore}
                i18nPrefix="permitApplication"
                sortFields={Object.values(EPermitApplicationSubmitterSortFields)}
              />
            </Flex>
          </Flex>

          {isSearching ? (
            <Flex w="full" flex={1}>
              <SharedSpinner h={50} w={50} />
            </Flex>
          ) : (
            tablePermitApplications.map((pa) => (
              <PermitApplicationCard key={pa.id} permitApplication={pa as IPermitApplication} />
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
          />
        </Flex>
      </Container>
    </Flex>
  )
})
