import { Box, Button, Center, Container, Flex, Heading, IconButton, Text, VStack } from "@chakra-ui/react"
import { ArrowSquareOut, Download } from "@phosphor-icons/react"
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
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { PermitApplicationViewedAtTag } from "../../../shared/permit-applications/permit-application-viewed-at-tag"
import { Can } from "../../../shared/user/can"
import { SubmissionDownloadModal } from "../../permit-application/submission-download-modal"
import { GridHeaders } from "./grid-header"

export const JurisdictionSubmissionInboxScreen = observer(function JurisdictionSubmissionInbox() {
  const { t } = useTranslation()
  const { permitApplicationStore } = useMst()
  const { currentJurisdiction, error } = useJurisdiction()

  const { currentPage, totalPages, totalCount, countPerPage, handleCountPerPageChange, handlePageChange, isSearching } =
    permitApplicationStore

  useSearch(permitApplicationStore, [currentJurisdiction?.id])

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack align={"start"} spacing={5} w={"full"} h={"full"}>
        <Flex justify={"space-between"} w={"full"}>
          <Box>
            <Heading as="h1">{t("permitApplication.submissionInbox.title")}</Heading>
            <Text fontSize="sm" color="text.secondary">
              {t("permitApplication.submissionInbox.submissionsSentTo")}
            </Text>
          </Box>
          <Can action="jurisdiction:manage" data={{ jurisdiction: currentJurisdiction }}>
            <Button
              as={RouterLink}
              to={`/jurisdictions/${currentJurisdiction.slug}/configuration-management/submissions-inbox-setup`}
              variant="secondary"
            >
              {t("ui.setup")}
            </Button>
          </Can>
        </Flex>

        <SearchGrid templateColumns="170px 2fr 2fr repeat(3, 1fr)">
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
                    {pa.isViewed ? (
                      <Flex direction="column">
                        <Text>{format(pa.viewedAt, "yyyy-MM-dd")}</Text>
                        <Text>{format(pa.viewedAt, "hh:mm")}</Text>
                      </Flex>
                    ) : (
                      <PermitApplicationViewedAtTag permitApplication={pa} />
                    )}
                  </SearchGridItem>
                  <SearchGridItem>
                    {pa.isSubmitted && (
                      <Flex direction="column">
                        <Text>{format(pa.submittedAt, "yyyy-MM-dd")}</Text>
                        <Text>{format(pa.submittedAt, "hh:mm")}</Text>
                      </Flex>
                    )}
                  </SearchGridItem>
                  <SearchGridItem gap={2}>
                    <SubmissionDownloadModal
                      permitApplication={pa}
                      renderTrigger={(onOpen) => (
                        <IconButton variant="secondary" icon={<Download />} aria-label={"download"} onClick={onOpen} />
                      )}
                    />

                    <RouterLinkButton
                      variant="primary"
                      rightIcon={<ArrowSquareOut />}
                      to={`/permit-applications/${pa.id}`}
                    >
                      {t("ui.view")}
                    </RouterLinkButton>
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
      </VStack>
    </Container>
  )
})
