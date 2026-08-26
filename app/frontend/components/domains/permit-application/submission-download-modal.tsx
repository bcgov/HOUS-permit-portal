import {
  Button,
  Checkbox,
  Flex,
  HStack,
  Heading,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { Download } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { datefnsAppDateFormat } from "../../../constants"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { IDownloadableFile, IFormIOSection } from "../../../types/types"
import { formatBytes } from "../../../utils/utility-functions"
import { CalloutBanner } from "../../shared/base/callout-banner"
import { SharedSpinner } from "../../shared/base/shared-spinner"

export interface ISubmissionDownloadModalProps {
  permitApplication: IPermitApplication
  renderTrigger?: (onOpen: () => void) => React.ReactNode
  review?: boolean
}

type TDownloadListItem =
  | { kind: "doc"; key: string; doc: IDownloadableFile }
  | { kind: "missing"; key: string; pdfKey: string }

type TDownloadSection = {
  id: string
  title: string
  items: TDownloadListItem[]
}

const GENERATED_SECTION_ID = "__generated__"
const OTHER_SECTION_ID = "__other__"

function formSectionKeyFromDataKey(dataKey?: string) {
  if (!dataKey || !dataKey.includes("|")) return null
  return dataKey.split("|")[0].replace("formSubmissionDataRST", "") || null
}

function isGeneratedDocumentKey(key?: string) {
  if (!key) return false
  return key.startsWith("permit_application_pdf") || key.startsWith("step_code_checklist_pdf")
}

function groupDownloadItemsBySection({
  documents,
  missingPdfs,
  formSections,
  generatedTitle,
  otherTitle,
}: {
  documents: IDownloadableFile[]
  missingPdfs: string[]
  formSections: IFormIOSection[]
  generatedTitle: string
  otherTitle: string
}): TDownloadSection[] {
  const sectionMap = new Map<string, TDownloadSection>()

  const ensureSection = (id: string, title: string) => {
    let section = sectionMap.get(id)
    if (!section) {
      section = { id, title, items: [] }
      sectionMap.set(id, section)
    }
    return section
  }

  formSections.forEach((section) => {
    ensureSection(section.key, section.title || section.key)
  })

  documents.forEach((doc) => {
    const item: TDownloadListItem = { kind: "doc", key: doc.fileUrl, doc }
    if (isGeneratedDocumentKey(doc.dataKey)) {
      ensureSection(GENERATED_SECTION_ID, generatedTitle).items.push(item)
      return
    }
    const sectionKey = formSectionKeyFromDataKey(doc.dataKey)
    if (sectionKey && sectionMap.has(sectionKey)) {
      sectionMap.get(sectionKey)!.items.push(item)
      return
    }
    ensureSection(OTHER_SECTION_ID, otherTitle).items.push(item)
  })

  missingPdfs.forEach((pdfKey) => {
    ensureSection(GENERATED_SECTION_ID, generatedTitle).items.push({
      kind: "missing",
      key: pdfKey,
      pdfKey,
    })
  })

  const ordered: TDownloadSection[] = []
  const generated = sectionMap.get(GENERATED_SECTION_ID)
  if (generated?.items.length) ordered.push(generated)

  formSections.forEach((section) => {
    const grouped = sectionMap.get(section.key)
    if (grouped?.items.length) ordered.push(grouped)
  })

  const other = sectionMap.get(OTHER_SECTION_ID)
  if (other?.items.length) ordered.push(other)

  return ordered
}

export const SubmissionDownloadModal = observer(
  ({ permitApplication, renderTrigger, review }: ISubmissionDownloadModalProps) => {
    const { t } = useTranslation()
    const { permitApplicationStore } = useMst()
    const { allSubmissionVersionCompletedSupportingDocuments, zipfileUrl, zipfileName, stepCode } = permitApplication
    const checklist = stepCode?.currentChecklist
    const applicationJsonUrl = `/api/permit_applications/${permitApplication.id}/download_application_json`
    const applicationJsonName = `permit-application-${permitApplication.id}.json`

    const documents = allSubmissionVersionCompletedSupportingDocuments || []
    const documentKeys = useMemo(() => documents.map((doc) => doc.fileUrl), [documents])
    const missingPdfs = permitApplication.missingPdfs || []
    const hasMissingPdfs = missingPdfs.length > 0
    const allKeys = useMemo(() => [...documentKeys, ...missingPdfs], [documentKeys, missingPdfs])

    const sections = useMemo(
      () =>
        groupDownloadItemsBySection({
          documents,
          missingPdfs,
          formSections: permitApplication.formJson?.components || [],
          generatedTitle: t("permitApplication.show.downloadSectionGenerated"),
          otherTitle: t("permitApplication.show.downloadSectionOther"),
        }),
      [documents, missingPdfs, permitApplication.formJson, t]
    )

    const { isOpen, onOpen, onClose: disclosureOnClose } = useDisclosure()
    const zipGenerationTriggeredRef = useRef(false)
    const pendingDownloadRef = useRef<{
      fileUrls: string[]
      missingKeys: string[]
      allSelected: boolean
      knownFileUrls: string[]
    } | null>(null)
    const pendingSelectiveZipRequestIdRef = useRef<string | null>(null)
    const listScrollRef = useRef<HTMLDivElement>(null)
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
    const [generationFailed, setGenerationFailed] = useState(false)
    const [awaitingGeneration, setAwaitingGeneration] = useState(false)
    const [awaitingSelectiveZip, setAwaitingSelectiveZip] = useState(false)
    const [selectiveZipFailed, setSelectiveZipFailed] = useState(false)

    const resetDownloadState = () => {
      setSelectedKeys(new Set())
      setGenerationFailed(false)
      setAwaitingGeneration(false)
      setAwaitingSelectiveZip(false)
      setSelectiveZipFailed(false)
      pendingDownloadRef.current = null
      pendingSelectiveZipRequestIdRef.current = null
      permitApplication.clearSelectiveZipResult()
    }

    const onClose = () => {
      resetDownloadState()
      disclosureOnClose()
    }

    useEffect(() => {
      if (!isOpen) {
        zipGenerationTriggeredRef.current = false
        resetDownloadState()
      }
    }, [isOpen])

    // ponytail: window capture runs before the navbar's document-capture listener, so this
    // list can fill the modal without the size heuristic hiding the bar. Upgrade: data-*
    // opt-out in isPageLevelScroller.
    useEffect(() => {
      if (!isOpen) return

      const onScroll = (event: Event) => {
        if (event.target === listScrollRef.current) event.stopPropagation()
      }

      window.addEventListener("scroll", onScroll, true)
      return () => window.removeEventListener("scroll", onScroll, true)
    }, [isOpen])

    useEffect(() => {
      if (!isOpen) return

      if (!permitApplication?.isFullyLoaded) {
        permitApplicationStore.fetchPermitApplication(permitApplication?.id, review)
      }
    }, [permitApplication?.isFullyLoaded, isOpen])

    useEffect(() => {
      const fetch = async () => await checklist.load()
      checklist && !checklist.isLoaded && fetch()
    }, [checklist?.isLoaded])

    useEffect(() => {
      if (!permitApplication?.isFullyLoaded || !isOpen || generationFailed) {
        return
      }

      // Kick off generation when system PDFs are missing and/or the package zip isn't ready yet
      const needsGeneration =
        permitApplication.isSubmitted && !zipGenerationTriggeredRef.current && (hasMissingPdfs || !zipfileUrl)

      if (!needsGeneration) {
        return
      }

      zipGenerationTriggeredRef.current = true
      ;(async () => {
        const ok = await permitApplication.generateMissingPdfs()
        if (!ok) setGenerationFailed(true)
      })()
    }, [
      permitApplication?.isFullyLoaded,
      permitApplication?.isSubmitted,
      permitApplication?.missingPdfs,
      checklist?.isLoaded,
      isOpen,
      zipfileUrl,
      generationFailed,
    ])

    // Keep selections that still exist as either a ready file or a missing PDF placeholder
    useEffect(() => {
      setSelectedKeys((prev) => {
        const next = new Set([...prev].filter((key) => allKeys.includes(key)))
        return next.size === prev.size ? prev : next
      })
    }, [allKeys])

    // true = download started immediately; "pending" = waiting on selective zip socket; false = failed
    const performDownload = async (
      fileUrls: string[],
      wasAllSelected: boolean,
      missingKeys: string[] = [],
      knownFileUrls: string[] = []
    ): Promise<true | false | "pending"> => {
      const selected = wasAllSelected
        ? documents
        : documents.filter(
            (doc) => fileUrls.includes(doc.fileUrl) || (missingKeys.length > 0 && !knownFileUrls.includes(doc.fileUrl))
          )
      if (selected.length === 0) return false

      const selectedIds = selected.map((doc) => doc.id).filter(Boolean)

      if (selected.length === 1) {
        const doc = selected[0]
        const a = document.createElement("a")
        a.href = doc.fileUrl
        a.download = doc.fileName
        a.click()
        return true
      }

      if (wasAllSelected && zipfileUrl) {
        const a = document.createElement("a")
        a.href = zipfileUrl
        a.download = zipfileName || `permit-application-${permitApplication.number}.zip`
        a.click()
        return true
      }

      const requestId = await permitApplication.downloadSupportingDocumentsZip(selectedIds)
      if (!requestId) return false

      pendingSelectiveZipRequestIdRef.current = requestId
      setAwaitingSelectiveZip(true)
      return "pending"
    }

    // After missing PDFs finish, continue the download that was waiting
    useEffect(() => {
      if (!isOpen || !awaitingGeneration || hasMissingPdfs || !pendingDownloadRef.current) return

      if (generationFailed) return

      const pending = pendingDownloadRef.current
      pendingDownloadRef.current = null
      setAwaitingGeneration(false)
      ;(async () => {
        const result = await performDownload(
          pending.fileUrls,
          pending.allSelected,
          pending.missingKeys,
          pending.knownFileUrls
        )
        if (result === false) setSelectiveZipFailed(true)
      })()
    }, [awaitingGeneration, hasMissingPdfs, generationFailed, isOpen, documents, zipfileUrl])

    // Selective zip ready via websocket — auto-download when requestId matches
    useEffect(() => {
      if (!isOpen || !awaitingSelectiveZip || !pendingSelectiveZipRequestIdRef.current) return

      const result = permitApplication.selectiveZipResult
      if (!result || result.requestId !== pendingSelectiveZipRequestIdRef.current) return

      if (result.error || !result.zipfileUrl) {
        setSelectiveZipFailed(true)
        setAwaitingSelectiveZip(false)
        return
      }

      const a = document.createElement("a")
      a.href = result.zipfileUrl
      a.download = result.zipfileName || `permit-application-${permitApplication.number}.zip`
      a.click()
      pendingSelectiveZipRequestIdRef.current = null
      permitApplication.clearSelectiveZipResult()
      setAwaitingSelectiveZip(false)
    }, [isOpen, awaitingSelectiveZip, permitApplication.selectiveZipResult])

    const allSelected = allKeys.length > 0 && selectedKeys.size === allKeys.length
    const someSelected = selectedKeys.size > 0 && selectedKeys.size < allKeys.length

    const toggleAll = () => {
      setSelectedKeys(allSelected ? new Set() : new Set(allKeys))
    }

    const toggleOne = (key: string) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
    }

    const toggleSection = (keys: string[]) => {
      const allOn = keys.length > 0 && keys.every((key) => selectedKeys.has(key))
      setSelectedKeys((prev) => {
        const next = new Set(prev)
        keys.forEach((key) => (allOn ? next.delete(key) : next.add(key)))
        return next
      })
    }

    const handleDownloadSelected = async () => {
      const selectedReady = documents.filter((doc) => selectedKeys.has(doc.fileUrl))
      const selectedMissing = missingPdfs.filter((key) => selectedKeys.has(key))
      if (selectedReady.length === 0 && selectedMissing.length === 0) return

      // Preparing only when a still-missing system PDF is part of the selection
      if (selectedMissing.length > 0) {
        pendingDownloadRef.current = {
          fileUrls: selectedReady.map((doc) => doc.fileUrl),
          missingKeys: selectedMissing,
          allSelected,
          knownFileUrls: documentKeys,
        }
        setAwaitingGeneration(true)
        return
      }

      const result = await performDownload(
        selectedReady.map((doc) => doc.fileUrl),
        allSelected
      )
      if (result === false) setSelectiveZipFailed(true)
    }

    const showPreparing = awaitingSelectiveZip || (awaitingGeneration && hasMissingPdfs && !selectiveZipFailed)
    const showError = selectiveZipFailed || (awaitingGeneration && generationFailed)

    return (
      <>
        {renderTrigger ? (
          renderTrigger(onOpen)
        ) : (
          <Button variant="primary" onClick={onOpen} leftIcon={<Download />}>
            {t("permitApplication.show.downloadApplication")}
          </Button>
        )}

        <Modal onClose={onClose} isOpen={isOpen} size="lg" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent
            maxW="648px"
            maxH="calc(100vh - 7.5rem)"
            borderRadius="md"
            p={0}
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <ModalCloseButton top={2} right={2} />
            {!permitApplication?.isFullyLoaded ? (
              <Flex p={10} justify="center">
                <SharedSpinner />
              </Flex>
            ) : showError ? (
              <ErrorView onClose={onClose} />
            ) : showPreparing ? (
              <PreparingView onClose={onClose} />
            ) : (
              <>
                <VStack w="full" align="start" spacing="10px" p={10} pb={0} flexShrink={0}>
                  <Heading as="h1" fontSize="4xl" fontWeight="bold" lineHeight="normal" m={0} mb={0}>
                    {t("permitApplication.show.downloadHeading")}
                  </Heading>
                  <Text fontSize="lg" fontWeight="normal" color="text.primary" lineHeight="1.68">
                    {t("permitApplication.show.downloadApplicationNumber", { number: permitApplication.number })}
                  </Text>
                </VStack>

                <ModalBody px={10} py={6} flex={1} minH={0} overflow="hidden" display="flex" flexDirection="column">
                  <VStack
                    ref={listScrollRef}
                    align="stretch"
                    spacing="10px"
                    w="full"
                    flex={1}
                    minH={0}
                    overflowY="auto"
                  >
                    <Checkbox
                      isChecked={allSelected}
                      isIndeterminate={someSelected}
                      onChange={toggleAll}
                      isDisabled={allKeys.length === 0}
                      pl="14px"
                      spacing={2}
                    >
                      {t("permitApplication.show.selectOrDeselectAll")}
                    </Checkbox>

                    <VStack align="stretch" spacing={4} w="full" borderTopWidth="1px" borderColor="border.light" py={4}>
                      {sections.map((section) => {
                        const sectionKeys = section.items.map((item) => item.key)
                        const sectionSelectedCount = sectionKeys.filter((key) => selectedKeys.has(key)).length
                        const sectionAllSelected = sectionKeys.length > 0 && sectionSelectedCount === sectionKeys.length
                        const sectionSomeSelected =
                          sectionSelectedCount > 0 && sectionSelectedCount < sectionKeys.length

                        return (
                          <VStack key={section.id} align="stretch" spacing={1} w="full">
                            <Checkbox
                              isChecked={sectionAllSelected}
                              isIndeterminate={sectionSomeSelected}
                              onChange={() => toggleSection(sectionKeys)}
                              pl="14px"
                              spacing={2}
                            >
                              <Text
                                as="span"
                                fontSize="sm"
                                fontWeight="bold"
                                textTransform="uppercase"
                                letterSpacing="0.02em"
                              >
                                {section.title}
                              </Text>
                            </Checkbox>
                            <VStack align="stretch" spacing={1} w="full" pl="14px">
                              {section.items.map((item) =>
                                item.kind === "missing" ? (
                                  <MissingPdfSelectRow
                                    key={item.key}
                                    pdfKey={item.pdfKey}
                                    isSelected={selectedKeys.has(item.key)}
                                    onToggle={() => toggleOne(item.key)}
                                  />
                                ) : (
                                  <FileSelectRow
                                    key={item.key}
                                    doc={item.doc}
                                    isSelected={selectedKeys.has(item.key)}
                                    onToggle={() => toggleOne(item.key)}
                                  />
                                )
                              )}
                            </VStack>
                          </VStack>
                        )
                      })}
                    </VStack>
                  </VStack>
                </ModalBody>

                <VStack align="stretch" spacing={4} px={10} pb={10} pt={0} w="full" flexShrink={0}>
                  <Flex gap={4} w="full" align="stretch">
                    <Button
                      variant="primary"
                      flex={1}
                      minH="40px"
                      onClick={handleDownloadSelected}
                      isDisabled={selectedKeys.size === 0}
                    >
                      {t("permitApplication.show.downloadSelectedFiles")}
                    </Button>
                    <Button variant="secondary" minH="40px" onClick={onClose}>
                      {t("ui.cancel")}
                    </Button>
                  </Flex>

                  {review && (
                    <Link
                      href={applicationJsonUrl}
                      download={applicationJsonName}
                      color="text.link"
                      textDecoration="underline"
                      fontSize="md"
                    >
                      {t("permitApplication.show.downloadJson")}
                    </Link>
                  )}
                </VStack>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )
  }
)

function PreparingView({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <VStack align="stretch" spacing={6} p={10} w="full">
      <VStack align="center" spacing={3} w="full" py={6}>
        <Spinner size="md" color="theme.blue" thickness="3px" emptyColor="border.light" />
        <Text fontSize="md" color="text.secondary">
          {t("permitApplication.show.generating")}
        </Text>
      </VStack>
      <Flex justify="flex-end" w="full">
        <Button variant="secondary" minH="40px" onClick={onClose}>
          {t("ui.cancel")}
        </Button>
      </Flex>
    </VStack>
  )
}

function ErrorView({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <VStack align="stretch" spacing={6} p={10} w="full">
      <VStack align="start" spacing="10px" w="full">
        <Heading as="h1" fontSize="4xl" fontWeight="bold" lineHeight="normal" m={0} mb={0}>
          {t("permitApplication.show.errorPreparingHeading")}
        </Heading>
        <CalloutBanner
          type="error"
          my={0}
          title={t("permitApplication.show.errorPreparingTitle")}
          body={t("permitApplication.show.errorPreparingBody")}
        />
      </VStack>
      <Flex justify="flex-end" w="full">
        <Button variant="secondary" minH="40px" onClick={onClose}>
          {t("ui.cancel")}
        </Button>
      </Flex>
    </VStack>
  )
}

function MissingPdfSelectRow({
  pdfKey,
  isSelected,
  onToggle,
}: {
  pdfKey: string
  isSelected: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()

  const label = (() => {
    if (pdfKey.startsWith("permit_application_pdf")) {
      return t("permitApplication.show.missingPdfLabels.permitApplication")
    }
    if (pdfKey.startsWith("step_code_checklist_pdf")) {
      return t("permitApplication.show.missingPdfLabels.stepCode")
    }
    return pdfKey
  })()

  return (
    <HStack
      as="label"
      w="full"
      align="center"
      spacing={2}
      px={2}
      py="2px"
      bg={isSelected ? "semantic.infoLight" : "transparent"}
      borderWidth="1px"
      borderStyle="solid"
      borderColor="transparent"
      borderRadius="sm"
      cursor="pointer"
      _hover={{ borderColor: "border.base" }}
    >
      <Checkbox isChecked={isSelected} onChange={onToggle} spacing={2} />
      <Text flex={1} fontSize="md" lineHeight="normal" noOfLines={1} color="text.secondary">
        {t("permitApplication.show.fetchingMissingPdf", { missingPdf: label })}
      </Text>
      <Spinner size="sm" color="theme.blue" thickness="2px" emptyColor="border.light" flexShrink={0} />
    </HStack>
  )
}

function FileSelectRow({
  doc,
  isSelected,
  onToggle,
}: {
  doc: IDownloadableFile
  isSelected: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const submittedDate = doc.createdAt ? format(new Date(doc.createdAt), datefnsAppDateFormat) : null

  return (
    <HStack
      as="label"
      w="full"
      align="flex-start"
      spacing={2}
      px={2}
      py="2px"
      bg={isSelected ? "semantic.infoLight" : "transparent"}
      borderWidth="1px"
      borderStyle="solid"
      borderColor="transparent"
      borderRadius="sm"
      cursor="pointer"
      _hover={{ borderColor: "border.base" }}
    >
      <Checkbox isChecked={isSelected} onChange={onToggle} spacing={2} mt="2px" />
      <VStack flex={1} align="start" spacing={0} minW={0}>
        <Text fontSize="md" lineHeight="normal" noOfLines={1} w="full">
          {doc.fileName}
        </Text>
        <Text fontSize="xs" color="text.secondary" lineHeight="normal">
          {[
            formatBytes(doc.fileSize),
            submittedDate && t("permitApplication.show.downloadSubmitted", { date: submittedDate }),
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </VStack>
    </HStack>
  )
}
