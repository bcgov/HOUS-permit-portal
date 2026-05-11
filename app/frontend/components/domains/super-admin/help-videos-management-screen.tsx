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
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { datefnsTableDateFormat } from "../../../constants"
import { IHelpVideo } from "../../../models/help-video"
import { IHelpVideoSection } from "../../../models/help-video-section"
import { useMst } from "../../../setup/root"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { SortableItem } from "../../shared/sortable-item"
import { HelpVideoModal, IHelpVideoFormData } from "./help-video-modal"
import { HelpVideoSectionModal, IHelpVideoSectionFormData } from "./help-video-section-modal"

export const HelpVideosManagementScreen = observer(function HelpVideosManagementScreen() {
  const { t } = useTranslation()
  const translate = t as any
  const navigate = useNavigate()
  const { helpVideoStore } = useMst()
  const {
    helpVideoSections,
    helpVideos,
    isLoadingHelpVideoSections,
    fetchHelpVideoSections,
    fetchHelpVideo,
    createHelpVideo,
    updateHelpVideo,
    deleteHelpVideo,
    publishHelpVideo,
    unpublishHelpVideo,
    createHelpVideoSection,
    updateHelpVideoSection,
    deleteHelpVideoSection,
    reorderHelpVideoSections,
    reorderHelpVideosInSection,
    getVideoCountForSection,
    getSectionTitle,
  } = helpVideoStore
  const [editingVideo, setEditingVideo] = useState<IHelpVideo | null>(null)
  const [editingSection, setEditingSection] = useState<IHelpVideoSection | null>(null)
  const videoModal = useDisclosure()
  const sectionModal = useDisclosure()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchHelpVideoSections()
  }, [])

  const sectionIds = useMemo(() => helpVideoSections.map((section) => section.id), [helpVideoSections])
  const editingSectionVideos = useMemo(() => {
    if (!editingSection) return []

    return helpVideos.filter((video) => video.helpVideoSectionId === editingSection.id)
  }, [editingSection, helpVideos])

  const handleOpenVideoModal = async (video?: IHelpVideo) => {
    if (video) {
      setEditingVideo((await fetchHelpVideo(video.id)) ?? video)
    } else {
      setEditingVideo(null)
    }
    videoModal.onOpen()
  }

  const handleOpenSectionModal = (section?: IHelpVideoSection) => {
    setEditingSection(section ?? null)
    sectionModal.onOpen()
  }

  const handleVideoSubmit = async (formData: IHelpVideoFormData) => {
    const payload = videoPayload(formData)
    const savedVideo = editingVideo ? await updateHelpVideo(editingVideo.id, payload) : await createHelpVideo(payload)

    if (!savedVideo) return false

    if (formData.isPublished && !savedVideo.publishedAt) {
      return await publishHelpVideo(savedVideo.id)
    }

    if (!formData.isPublished && savedVideo.publishedAt) {
      return await unpublishHelpVideo(savedVideo.id)
    }

    return true
  }

  const handleSectionSubmit = async (formData: IHelpVideoSectionFormData) => {
    return editingSection
      ? await updateHelpVideoSection(editingSection.id, formData)
      : await createHelpVideoSection(formData)
  }

  const handleSectionVideoReorder = async (orderedIds: string[]) => {
    if (!editingSection) return false

    return await reorderHelpVideosInSection(editingSection.id, orderedIds)
  }

  const handleSectionDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sectionIds.indexOf(String(active.id))
    const newIndex = sectionIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const orderedIds = arrayMove(sectionIds, oldIndex, newIndex)
    const scrollYBeforeReorder = window.scrollY
    await reorderHelpVideoSections(orderedIds)

    if (window.scrollY !== scrollYBeforeReorder) {
      window.scrollTo({ top: scrollYBeforeReorder })
    }
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
        <Box>
          <Heading as="h1" fontSize="3xl">
            {translate("helpVideos.management.title")}
          </Heading>
          <Text color="text.secondary" mt={3}>
            {translate("helpVideos.management.description")}
          </Text>
        </Box>

        {isLoadingHelpVideoSections ? (
          <SharedSpinner />
        ) : (
          <>
            <Box border="1px solid" borderColor="border.light" borderRadius="md" p={5}>
              <Flex justify="space-between" align="center" mb={5}>
                <Heading as="h2" size="md">
                  {translate("helpVideos.management.videos.title")}
                </Heading>
                <Button
                  variant="primary"
                  leftIcon={<Plus />}
                  onClick={() => handleOpenVideoModal()}
                  isDisabled={helpVideoSections.length === 0}
                >
                  {translate("helpVideos.management.videos.add")}
                </Button>
              </Flex>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th fontWeight="bold" textTransform="none">
                      {translate("helpVideos.management.table.title")}
                    </Th>
                    <Th fontWeight="bold" textTransform="none">
                      {translate("helpVideos.management.table.section")}
                    </Th>
                    <Th fontWeight="bold" textTransform="none">
                      {translate("helpVideos.management.table.status")}
                    </Th>
                    <Th fontWeight="bold" textTransform="none">
                      {translate("helpVideos.management.table.updated")}
                    </Th>
                    <Th fontWeight="bold" textTransform="none">
                      {translate("helpVideos.management.table.actions")}
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {helpVideos.map((video) => (
                    <Tr key={video.id}>
                      <Td maxW="320px" fontWeight="bold">
                        <RouterLink to={`/videos/${video.slug ?? video.id}`}>{video.title}</RouterLink>
                      </Td>
                      <Td>{getSectionTitle(video.helpVideoSectionId)}</Td>
                      <Td>
                        <Badge colorScheme={video.publishedAt ? "green" : "gray"}>
                          {video.publishedAt
                            ? translate("helpVideos.management.status.published")
                            : translate("helpVideos.management.status.draft")}
                        </Badge>
                      </Td>
                      <Td>{formatDate(video.updatedAt)}</Td>
                      <Td>
                        <HStack spacing={3}>
                          <Button variant="link" size="sm" onClick={() => handleOpenVideoModal(video)}>
                            {translate("ui.edit")}
                          </Button>
                          <ConfirmationModal
                            title={translate("helpVideos.management.videos.deleteTitle")}
                            body={translate("helpVideos.management.videos.deleteBody")}
                            triggerText={translate("ui.delete")}
                            triggerButtonProps={{ color: "semantic.error", size: "sm" }}
                            confirmButtonProps={{ variant: "primary" }}
                            onConfirm={async (closeModal) => {
                              await deleteHelpVideo(video.id)
                              closeModal()
                            }}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            <Box border="1px solid" borderColor="border.light" borderRadius="md" p={5}>
              <Flex justify="space-between" align="center" mb={5}>
                <Heading as="h2" size="md">
                  {translate("helpVideos.management.sections.title")}
                </Heading>
                <Button variant="secondary" leftIcon={<Plus />} onClick={() => handleOpenSectionModal()}>
                  {translate("helpVideos.management.sections.add")}
                </Button>
              </Flex>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleSectionDragEnd}
              >
                <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                  <VStack align="stretch" spacing={3}>
                    {helpVideoSections.map((section) => (
                      <SortableItem<SectionRowProps>
                        key={section.id}
                        sortableArguments={{ id: section.id }}
                        Component={SectionRow}
                        componentProps={{
                          section,
                          videoCount: getVideoCountForSection(section.id),
                          onEdit: () => handleOpenSectionModal(section),
                          onDelete: async () => deleteHelpVideoSection(section.id),
                        }}
                      />
                    ))}
                  </VStack>
                </SortableContext>
              </DndContext>
            </Box>
          </>
        )}
      </VStack>
      <HelpVideoModal
        isOpen={videoModal.isOpen}
        onClose={videoModal.onClose}
        video={editingVideo}
        sections={helpVideoSections}
        onSubmit={handleVideoSubmit}
      />
      <HelpVideoSectionModal
        isOpen={sectionModal.isOpen}
        onClose={sectionModal.onClose}
        section={editingSection}
        videos={editingSectionVideos}
        onSubmit={handleSectionSubmit}
        onReorderVideos={handleSectionVideoReorder}
      />
    </Container>
  )
})

interface SectionRowProps {
  section: IHelpVideoSection
  videoCount: number
  onEdit: () => void
  onDelete: () => Promise<boolean>
}

function SectionRow({
  sortableProps,
  dragMotionStyles,
  section,
  videoCount,
  onEdit,
  onDelete,
}: {
  dragMotionStyles: CSSProperties
  sortableProps: ReturnType<typeof useSortable>
} & SectionRowProps) {
  const { t } = useTranslation()
  const translate = t as any

  return (
    <Flex
      ref={sortableProps.setNodeRef}
      style={dragMotionStyles}
      border="1px solid"
      borderColor="border.light"
      borderRadius="md"
      p={3}
      align="center"
      justify="space-between"
      bg="white"
    >
      <HStack spacing={3}>
        <IconButton
          aria-label={translate("helpVideos.management.sections.dragHandle")}
          variant="ghost"
          size="sm"
          icon={<ListIcon />}
          {...sortableProps.listeners}
          {...sortableProps.attributes}
        />
        <Text fontWeight="bold">{section.title}</Text>
        <Text color="text.secondary" fontSize="sm">
          {translate("helpVideos.management.sections.videoCount", { count: videoCount })}
        </Text>
      </HStack>
      <HStack spacing={3}>
        <Button variant="link" size="sm" onClick={onEdit}>
          {translate("ui.edit")}
        </Button>
        <ConfirmationModal
          title={translate("helpVideos.management.sections.deleteTitle")}
          body={translate("helpVideos.management.sections.deleteBody")}
          triggerText={translate("ui.remove")}
          triggerButtonProps={{ color: "semantic.error", size: "sm" }}
          confirmButtonProps={{ variant: "primary" }}
          onConfirm={async (closeModal) => {
            await onDelete()
            closeModal()
          }}
        />
      </HStack>
    </Flex>
  )
}

const formatDate = (date?: Date | null) => {
  return date ? format(new Date(date), datefnsTableDateFormat) : ""
}

const videoPayload = (formData: IHelpVideoFormData) => {
  const payload: Record<string, any> = {
    title: formData.title,
    descriptionHtml: formData.descriptionHtml,
    helpVideoSectionId: formData.helpVideoSectionId,
    publish: formData.isPublished,
  }

  if (formData.videoDocumentAttributes) payload.videoDocumentAttributes = formData.videoDocumentAttributes
  if (formData.captionDocumentAttributes) payload.captionDocumentAttributes = formData.captionDocumentAttributes
  if (formData.transcriptDocumentAttributes) {
    payload.transcriptDocumentAttributes = formData.transcriptDocumentAttributes
  }

  return payload
}
