import { Box, Button, Center, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { Download } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { useSearch } from "../../../../hooks/use-search"
import { IPermitApplication } from "../../../../models/permit-application"
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { RouterLink } from "../../../shared/navigation/router-link"
import { PermitApplicationTemplateStatusTag } from "../../../shared/permit-applications/permit-application-status-tag"
import { GridHeaders } from "./grid-header"

export const JurisdictionSubmissionInboxScreen = observer(function JurisdictionSubmissionInbox() {
  const { t } = useTranslation()
  const { permitApplicationStore } = useMst()
  const { currentJurisdiction, error } = useJurisdiction()

  const { currentPage, totalPages, totalCount, countPerPage, handleCountPerPageChange, handlePageChange, isSearching } =
    permitApplicationStore

  useSearch(permitApplicationStore, [currentJurisdiction?.id])

  if (error) return <ErrorScreen />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Flex direction="column">
            <Heading as="h1" fontSize={"4xl"} color={"text.primary"}>
              {t("permitApplication.submissionInbox.title")}
            </Heading>
            <Flex>
              <Text mr={2}>
                {t("permitApplication.submissionInbox.submissionsSentTo", {
                  email: currentJurisdiction?.submissionEmail || t("ui.notAvailable"),
                })}
              </Text>
              <RouterLink to={`/jurisdictions/${currentJurisdiction.id}/configuration`}>{t("ui.change")}</RouterLink>
            </Flex>
          </Flex>
        </Flex>

        <SearchGrid templateColumns="165px 2fr 2fr repeat(3, 1fr)">
          <GridHeaders />

          {isSearching ? (
            <Center p={50}>
              <SharedSpinner />
            </Center>
          ) : (
            currentJurisdiction.tablePermitApplications.map((pa: IPermitApplication) => {
              return (
                <Box
                  key={pa.id}
                  className={"jurisdiction-permit-application-index-grid-row"}
                  role={"row"}
                  display={"contents"}
                >
                  <SearchGridItem>{pa.number}</SearchGridItem>
                  <SearchGridItem>
                    <Flex direction="column">
                      <Text fontWeight={700}>{pa.permitType.name}</Text>
                      <Text>{pa.activity.name}</Text>
                    </Flex>
                  </SearchGridItem>
                  <SearchGridItem>
                    <Flex direction="column">
                      <Text fontWeight={700}>{pa.submitter.name}</Text>
                      <Text>{pa.submitter.email}</Text>
                    </Flex>
                  </SearchGridItem>
                  <SearchGridItem>
                    {pa.submittedAt && (
                      <Flex direction="column">
                        <Text>{format(pa.submittedAt, "yyyy-MM-dd")}</Text>
                        <Text>{format(pa.submittedAt, "hh:mm")}</Text>
                      </Flex>
                    )}
                  </SearchGridItem>
                  <SearchGridItem>
                    <PermitApplicationTemplateStatusTag status={pa.status} />
                  </SearchGridItem>
                  <SearchGridItem>
                    <Button variant="primary" leftIcon={<Download />}>
                      {t("ui.download")}
                    </Button>
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
