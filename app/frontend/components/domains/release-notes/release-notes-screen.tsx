import { Box, Button, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { Envelope } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useSearch } from "../../../hooks/use-search"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ReleaseNoteEntry } from "./release-note-entry"
import { ReleaseNoteTypeFilter } from "./release-note-type-filter"
import { ReleaseNoteYearNav } from "./release-note-year-nav"

export const ReleaseNotesScreen = observer(function ReleaseNotesScreen() {
  const location = useLocation()
  const { releaseNoteStore } = useMst()
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightedHashRef = useRef<string | null>(null)
  const [availableHeight, setAvailableHeight] = useState<number | null>(null)
  const [initializedHash, setInitializedHash] = useState<string | null>(null)
  const [highlightedReleaseNoteId, setHighlightedReleaseNoteId] = useState<string | null>(null)
  const {
    viewingReleaseNotes,
    selectedYear,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
    initializeViewingPage,
    selectViewingYear,
    selectReleaseTypeFilter,
    selectedReleaseType,
    viewingYearInitialized,
    availableYears,
    getReleaseNoteAnchorId,
    parseReleaseNoteIdFromHash,
  } = releaseNoteStore

  useEffect(() => {
    let cancelled = false
    const hash = location.hash
    setInitializedHash(null)

    Promise.resolve(initializeViewingPage(hash)).then(() => {
      if (!cancelled) setInitializedHash(hash)
    })

    return () => {
      cancelled = true
    }
  }, [initializeViewingPage, location.hash])

  // selectedReleaseType ?? "all": useSearch skips any null dep, so "all types" needs a sentinel
  useSearch(releaseNoteStore, [viewingYearInitialized ? selectedYear : null, selectedReleaseType ?? "all"])

  useLayoutEffect(() => {
    const updateAvailableHeight = () => {
      if (!containerRef.current) return

      const { top } = containerRef.current.getBoundingClientRect()
      setAvailableHeight(Math.max(0, Math.floor(window.innerHeight - top)))
    }

    updateAvailableHeight()
    window.addEventListener("resize", updateAvailableHeight)

    return () => window.removeEventListener("resize", updateAvailableHeight)
  }, [])

  useEffect(() => {
    const releaseNoteId = parseReleaseNoteIdFromHash(location.hash)
    const targetAnchorId = releaseNoteId ? getReleaseNoteAnchorId(releaseNoteId) : null
    const targetElement = targetAnchorId ? document.getElementById(targetAnchorId) : null

    if (location.hash && initializedHash !== location.hash) {
      return
    }

    if (!location.hash) {
      highlightedHashRef.current = null
      setHighlightedReleaseNoteId(null)
      return
    }

    if (isSearching || highlightedHashRef.current === location.hash) {
      return
    }

    if (!releaseNoteId) {
      setHighlightedReleaseNoteId(null)
      return
    }

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" })
      highlightedHashRef.current = location.hash
      setHighlightedReleaseNoteId(releaseNoteId)

      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedReleaseNoteId(null)
        highlightTimeoutRef.current = null
      }, 3000)
    }

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = null
      }
    }
  }, [
    location.hash,
    initializedHash,
    isSearching,
    viewingReleaseNotes.length,
    selectedYear,
    currentPage,
    viewingYearInitialized,
    getReleaseNoteAnchorId,
    parseReleaseNoteIdFromHash,
  ])

  const reportIssueMailto = `mailto:${t("site.contactEmail")}`

  const releaseNotesContent =
    viewingReleaseNotes.length === 0 ? (
      <Text color="text.secondary" fontSize="lg">
        {t("releaseNote.viewing.emptyState", { year: selectedYear })}
      </Text>
    ) : (
      <VStack align="stretch" spacing="87px">
        {viewingReleaseNotes.map((note) => (
          <ReleaseNoteEntry key={note.id} releaseNote={note} isHighlighted={note.id === highlightedReleaseNoteId} />
        ))}
      </VStack>
    )

  return (
    <Container
      ref={containerRef}
      maxW="container.lg"
      py={6}
      px={{ base: 4, md: 8 }}
      as="main"
      display="flex"
      flexDirection="column"
      h={availableHeight === null ? "auto" : `${availableHeight}px`}
      overflow="hidden"
    >
      <VStack align="stretch" spacing={8} flex={1} minH={0} overflow="hidden">
        <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap" flexShrink={0}>
          <Heading as="h1" fontSize="3xl" m={0}>
            {t("releaseNote.viewing.title")}
          </Heading>
          <Button as="a" href={reportIssueMailto} variant="secondary" size="sm" leftIcon={<Envelope size={14} />}>
            {t("releaseNote.viewing.reportIssue")}
          </Button>
        </Flex>

        <Flex align="stretch" gap={5} w="full" flex={1} minH={0} overflow="hidden">
          <ReleaseNoteYearNav years={availableYears} selectedYear={selectedYear} onSelectYear={selectViewingYear} />

          <Flex direction="column" flex={1} minW={0} minH={0} overflow="hidden">
            <Flex
              align="center"
              justify="space-between"
              gap={4}
              flexWrap="wrap"
              bg="greys.grey03"
              px={4}
              py={3}
              mb={6}
              flexShrink={0}
            >
              <ReleaseNoteTypeFilter value={selectedReleaseType} onChange={selectReleaseTypeFilter} />
            </Flex>

            <Box flex={1} minH={0} overflowY="auto" pr={1}>
              {isSearching ? <SharedSpinner /> : releaseNotesContent}
            </Box>

            <Flex w="full" justify="space-between" align="center" flexWrap="wrap" gap={4} flexShrink={0} pt={4} pb={1}>
              <PerPageSelect
                handleCountPerPageChange={handleCountPerPageChange}
                countPerPage={countPerPage}
                totalCount={totalCount ?? 0}
              />
              <Paginator
                current={currentPage}
                total={totalCount ?? 0}
                totalPages={totalPages ?? 0}
                pageSize={countPerPage}
                handlePageChange={handlePageChange}
                showLessItems
              />
            </Flex>
          </Flex>
        </Flex>
      </VStack>
    </Container>
  )
})
