import { Box, Button, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { Pencil } from "@phosphor-icons/react"
import { format } from "date-fns"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link as ReactRouterLink } from "react-router-dom"
import { useSearch } from "../../../../hooks/use-search"
import { IReleaseNote } from "../../../../models/release-note-model"
import { useMst } from "../../../../setup/root"
import { EReleaseNoteStatus } from "../../../../types/enums"
import { Paginator } from "../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { ReleaseNotesGridCell } from "./release-notes-grid-cell"
import { ReleaseNotesGridHeaders } from "./release-notes-grid-header"

const TABLE_TEMPLATE = ["6fr", "14fr", "10fr", "20fr", "5fr"].join(" ")

const ReleaseNoteStatusBadge = observer(function ReleaseNoteStatusBadge({ status }: { status: EReleaseNoteStatus }) {
  const isPublished = status === EReleaseNoteStatus.published
  const statusLabel = isPublished ? t("releaseNote.status.published") : t("releaseNote.status.draft")
  return (
    <Text
      as="span"
      display="inline-block"
      textTransform="uppercase"
      fontSize="xs"
      fontWeight="bold"
      letterSpacing="0.06em"
      p={1}
      borderRadius="sm"
      bg={isPublished ? "theme.blue" : "border.light"}
      color={isPublished ? "greys.white" : "text.primary"}
    >
      {statusLabel}
    </Text>
  )
})

export const ReleaseNotesScreen = observer(function ReleaseNotesScreen() {
  const { t } = useTranslation()
  const { releaseNoteStore } = useMst()
  const {
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
    tableReleaseNotes,
    resetCurrentReleaseNote,
  } = releaseNoteStore

  useSearch(releaseNoteStore, [])

  useEffect(() => {
    resetCurrentReleaseNote()
  }, [resetCurrentReleaseNote])

  return (
    <Container maxW="container.lg" px={8} pt={6} pb={20} flexGrow={1}>
      <VStack alignItems="flex-start" spacing={8} w="full" h="full">
        <Heading as="h1" color="text.primary" mb={0}>
          {t("releaseNote.title")}
        </Heading>

        <VStack align="stretch" spacing={4} w="full">
          <Box borderWidth="1px" borderColor="border.light" borderRadius="sm">
            <Flex
              bg="greys.grey10"
              borderBottom="1px solid"
              borderColor="#EBEEEF"
              px={6}
              py={4}
              justify="flex-end"
              h="72px"
              align="center"
            >
              <RouterLinkButton to="/release-notes/new" variant="primary" size="sm" fontSize="sm">
                {t("releaseNote.createNew")}
              </RouterLinkButton>
            </Flex>

            <SearchGrid templateColumns={TABLE_TEMPLATE} borderRadius={0} w="full">
              <ReleaseNotesGridHeaders />

              {isSearching ? (
                <Flex py={16} gridColumn="1 / -1" justify="center">
                  <SharedSpinner />
                </Flex>
              ) : tableReleaseNotes.length === 0 ? (
                <Flex py={16} gridColumn="1 / -1" justify="center">
                  <Text color="text.secondary">{t("releaseNote.emptyState")}</Text>
                </Flex>
              ) : (
                tableReleaseNotes.map((note: IReleaseNote) => (
                  <Box key={note.id} display="contents" role="row">
                    <ReleaseNotesGridCell>{note.version}</ReleaseNotesGridCell>
                    <ReleaseNotesGridCell color="text.secondary">
                      {format(note.releaseDate, "MMMM d, yyyy")}
                    </ReleaseNotesGridCell>
                    <ReleaseNotesGridCell py={0}>
                      <ReleaseNoteStatusBadge status={note.status as EReleaseNoteStatus} />
                    </ReleaseNotesGridCell>
                    <ReleaseNotesGridCell color="text.secondary">
                      {format(note.updatedAt, "MMMM d, yyyy 'at' h:mm a")}
                    </ReleaseNotesGridCell>
                    <ReleaseNotesGridCell py={0} justifyContent="flex-end">
                      <Button
                        as={ReactRouterLink}
                        to={`/release-notes/${note.id}/edit`}
                        variant="secondary"
                        size="sm"
                        h="32px"
                        minW="32px"
                        px={3}
                        aria-label={t("ui.edit")}
                      >
                        <Pencil size={14} />
                      </Button>
                    </ReleaseNotesGridCell>
                  </Box>
                ))
              )}
            </SearchGrid>
          </Box>

          <Flex w="full" justify="space-between" align="center" flexWrap="wrap" gap={4} maxW="1170px" px={{ md: 8 }}>
            <PerPageSelect
              handleCountPerPageChange={handleCountPerPageChange}
              countPerPage={countPerPage}
              totalCount={totalCount ?? 0}
            />
            <Paginator
              current={currentPage}
              total={totalCount ?? 0}
              totalPages={totalPages ?? 1}
              pageSize={countPerPage}
              handlePageChange={handlePageChange}
              showLessItems
            />
          </Flex>
        </VStack>
      </VStack>
    </Container>
  )
})
