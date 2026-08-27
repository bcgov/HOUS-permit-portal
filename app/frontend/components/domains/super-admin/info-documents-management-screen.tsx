import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  IconButton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CaretLeft, List as ListIcon, Plus } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { CSSProperties, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateFormat } from "../../../constants"
import { IInfoDocument } from "../../../models/info-document"
import { useMst } from "../../../setup/root"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { SortableItem } from "../../shared/sortable-item"
import { InfoDocumentIntroModal } from "./info-document-intro-modal"
import { IInfoDocumentFormData, InfoDocumentModal } from "./info-document-modal"

export const InfoDocumentsManagementScreen = observer(function InfoDocumentsManagementScreen() {
  const { t } = useTranslation()
  const translate = t as any
  const navigate = useNavigate()
  const { infoDocumentStore, siteConfigurationStore } = useMst()
  const { infoDocumentsIntroText, updateSiteConfiguration } = siteConfigurationStore
  const {
    infoDocuments,
    isLoadingInfoDocuments,
    fetchInfoDocuments,
    fetchInfoDocument,
    createInfoDocument,
    updateInfoDocument,
    deleteInfoDocument,
    publishInfoDocument,
    unpublishInfoDocument,
    reorderInfoDocuments,
  } = infoDocumentStore
  const [editingDocument, setEditingDocument] = useState<IInfoDocument | null>(null)
  const documentModal = useDisclosure()
  const introModal = useDisclosure()
  const displayedIntroText = infoDocumentsIntroText?.trim() || translate("infoDocuments.management.introDefault")
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchInfoDocuments()
  }, [])

  const documentIds = useMemo(() => infoDocuments.map((document) => document.id), [infoDocuments])

  const handleOpenModal = async (document?: IInfoDocument) => {
    if (document) {
      setEditingDocument((await fetchInfoDocument(document.id)) ?? document)
    } else {
      setEditingDocument(null)
    }
    documentModal.onOpen()
  }

  const handleSubmit = async (formData: IInfoDocumentFormData) => {
    const payload = documentPayload(formData)
    const saved = editingDocument
      ? await updateInfoDocument(editingDocument.id, payload)
      : await createInfoDocument(payload)

    if (!saved) return false

    if (formData.isPublished && !saved.publishedAt) {
      return await publishInfoDocument(saved.id)
    }

    if (!formData.isPublished && saved.publishedAt) {
      return await unpublishInfoDocument(saved.id)
    }

    return true
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = documentIds.indexOf(String(active.id))
    const newIndex = documentIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    await reorderInfoDocuments(arrayMove(documentIds, oldIndex, newIndex))
  }

  const handleIntroSubmit = async (introText: string) => {
    return await updateSiteConfiguration({ infoDocumentsIntroText: introText || null })
  }

  return (
    <Container maxW="container.lg" py={8} as="main">
      <VStack align="stretch" spacing={6}>
        <Button
          onClick={() => navigate(-1)}
          variant="link"
          alignSelf="flex-start"
          leftIcon={<CaretLeft size={20} />}
          textDecoration="none"
        >
          {t("ui.back")}
        </Button>
        <Heading as="h1" fontSize="3xl">
          {translate("infoDocuments.management.title")}
        </Heading>

        <Box border="1px solid" borderColor="border.light" borderRadius="lg" p={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h2" size="md">
              {translate("infoDocuments.management.introTitle")}
            </Heading>
            <Button variant="secondary" onClick={introModal.onOpen}>
              {translate("ui.edit")}
            </Button>
          </Flex>
          <Text whiteSpace="pre-wrap">{displayedIntroText}</Text>
        </Box>

        {isLoadingInfoDocuments ? (
          <SharedSpinner />
        ) : (
          <Box border="1px solid" borderColor="border.light" borderRadius="lg" p={6}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading as="h2" size="md">
                {translate("infoDocuments.management.documentsTitle")}
              </Heading>
              <Button variant="primary" leftIcon={<Plus />} onClick={() => handleOpenModal()}>
                {translate("infoDocuments.management.add")}
              </Button>
            </Flex>

            {infoDocuments.length === 0 ? (
              <Box bg="greys.grey10" border="1px solid" borderColor="border.light" borderRadius="md" py={12} px={8}>
                <VStack spacing={2}>
                  <Text fontWeight="bold" fontSize="lg">
                    {translate("infoDocuments.management.emptyTitle")}
                  </Text>
                  <Text color="text.secondary" textAlign="center" maxW="520px">
                    {translate("infoDocuments.management.emptyBody")}
                  </Text>
                </VStack>
              </Box>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={documentIds} strategy={verticalListSortingStrategy}>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th w="48px" />
                        <Th fontWeight="bold" textTransform="none">
                          {translate("infoDocuments.management.table.title")}
                        </Th>
                        <Th fontWeight="bold" textTransform="none">
                          {translate("infoDocuments.management.table.topic")}
                        </Th>
                        <Th fontWeight="bold" textTransform="none">
                          {translate("infoDocuments.management.table.status")}
                        </Th>
                        <Th fontWeight="bold" textTransform="none">
                          {translate("infoDocuments.management.table.updated")}
                        </Th>
                        <Th fontWeight="bold" textTransform="none">
                          {translate("infoDocuments.management.table.actions")}
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {infoDocuments.map((document) => (
                        <SortableItem<DocumentRowProps>
                          key={document.id}
                          sortableArguments={{ id: document.id }}
                          Component={DocumentRow}
                          componentProps={{
                            document,
                            onEdit: () => handleOpenModal(document),
                            onDelete: () => deleteInfoDocument(document.id),
                          }}
                        />
                      ))}
                    </Tbody>
                  </Table>
                </SortableContext>
              </DndContext>
            )}
          </Box>
        )}
      </VStack>

      <InfoDocumentModal
        isOpen={documentModal.isOpen}
        onClose={documentModal.onClose}
        document={editingDocument}
        onSubmit={handleSubmit}
      />
      <InfoDocumentIntroModal
        isOpen={introModal.isOpen}
        onClose={introModal.onClose}
        introText={displayedIntroText}
        onSubmit={handleIntroSubmit}
      />
    </Container>
  )
})

type DocumentRowProps = {
  document: IInfoDocument
  onEdit: () => void
  onDelete: () => Promise<boolean>
}

function DocumentRow({
  sortableProps,
  dragMotionStyles,
  document,
  onEdit,
  onDelete,
}: {
  dragMotionStyles: CSSProperties
  sortableProps: ReturnType<typeof useSortable>
} & DocumentRowProps) {
  const { t } = useTranslation()
  const translate = t as any

  return (
    <Tr ref={sortableProps.setNodeRef} style={dragMotionStyles}>
      <Td>
        <IconButton
          aria-label={translate("infoDocuments.management.dragHandle")}
          variant="ghost"
          size="sm"
          icon={<ListIcon />}
          {...sortableProps.listeners}
          {...sortableProps.attributes}
        />
      </Td>
      <Td maxW="360px">
        <Text fontWeight="bold">{document.title}</Text>
        {document.description && (
          <Text color="text.secondary" fontSize="sm" noOfLines={2}>
            {document.description}
          </Text>
        )}
      </Td>
      <Td>{document.topics.join(", ")}</Td>
      <Td>
        <Badge colorScheme={document.publishedAt ? "green" : "gray"}>
          {document.publishedAt
            ? translate("infoDocuments.management.status.published")
            : translate("infoDocuments.management.status.draft")}
        </Badge>
      </Td>
      <Td>{formatDate(document.updatedAt)}</Td>
      <Td>
        <HStack spacing={3}>
          <Button variant="link" size="sm" onClick={onEdit}>
            {translate("ui.edit")}
          </Button>
          <ConfirmationModal
            title={translate("infoDocuments.management.deleteTitle")}
            body={translate("infoDocuments.management.deleteBody")}
            triggerText={translate("ui.delete")}
            triggerButtonProps={{ color: "semantic.error", size: "sm" }}
            confirmButtonProps={{ variant: "primary" }}
            onConfirm={async (closeModal) => {
              await onDelete()
              closeModal()
            }}
          />
        </HStack>
      </Td>
    </Tr>
  )
}

function documentPayload(formData: IInfoDocumentFormData) {
  const payload: Record<string, any> = {
    title: formData.title,
    description: formData.description ?? "",
    topicList: formData.topics,
    publish: formData.isPublished,
  }

  if (formData.file) {
    payload.file = formData.file
  }

  return payload
}

function formatDate(date?: Date | null) {
  return date ? format(new Date(date), datefnsTableDateFormat) : ""
}
