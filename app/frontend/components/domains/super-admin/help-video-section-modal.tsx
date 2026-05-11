import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { List as ListIcon } from "@phosphor-icons/react"
import React, { CSSProperties, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IHelpVideo } from "../../../models/help-video"
import { IHelpVideoSection } from "../../../models/help-video-section"
import { SafeTipTapDisplay } from "../../shared/editor/safe-tiptap-display"
import { SortableItem } from "../../shared/sortable-item"

interface IHelpVideoSectionModalProps {
  isOpen: boolean
  onClose: () => void
  section?: IHelpVideoSection | null
  videos: IHelpVideo[]
  onSubmit: (data: IHelpVideoSectionFormData) => Promise<boolean>
  onReorderVideos: (orderedIds: string[]) => Promise<boolean>
}

export interface IHelpVideoSectionFormData {
  title: string
  description?: string
}

export const HelpVideoSectionModal = ({
  isOpen,
  onClose,
  section,
  videos,
  onSubmit,
  onReorderVideos,
}: IHelpVideoSectionModalProps) => {
  const { t } = useTranslation()
  const translate = t as any
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<IHelpVideoSectionFormData>({
    defaultValues: {
      title: "",
      description: "",
    },
  })
  const videoIds = useMemo(() => videos.map((video) => video.id), [videos])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (!isOpen) return

    reset({
      title: section?.title ?? "",
      description: section?.description ?? "",
    })
  }, [isOpen, reset, section])

  const submit = handleSubmit(async (data) => {
    const success = await onSubmit(data)
    if (success) onClose()
  })

  const handleVideoDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = videoIds.indexOf(String(active.id))
    const newIndex = videoIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    await onReorderVideos(arrayMove(videoIds, oldIndex, newIndex))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={submit}>
        <ModalHeader>
          {section ? t("helpVideos.management.sections.editTitle") : t("helpVideos.management.sections.addTitle")}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>{t("helpVideos.management.fields.title")}</FormLabel>
              <Input {...register("title", { required: true })} />
            </FormControl>
            <FormControl>
              <FormLabel>{t("helpVideos.management.fields.description")}</FormLabel>
              <Textarea {...register("description")} />
            </FormControl>
            {section && (
              <Box>
                <Text fontWeight="bold" mb={3}>
                  {translate("helpVideos.management.sections.videosTitle")}
                </Text>
                {videos.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleVideoDragEnd}
                  >
                    <SortableContext items={videoIds} strategy={verticalListSortingStrategy}>
                      <VStack align="stretch" spacing={2}>
                        {videos.map((video) => (
                          <SortableItem<SectionVideoRowProps>
                            key={video.id}
                            sortableArguments={{ id: video.id }}
                            Component={SectionVideoRow}
                            componentProps={{ video }}
                          />
                        ))}
                      </VStack>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <Text color="text.secondary" fontSize="sm">
                    {translate("helpVideos.management.sections.noVideos")}
                  </Text>
                )}
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter gap={4} justifyContent="flex-start">
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {t("ui.save")}
          </Button>
          <Button variant="secondary" onClick={onClose} isDisabled={isSubmitting}>
            {t("ui.cancel")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

interface SectionVideoRowProps {
  video: IHelpVideo
}

function SectionVideoRow({
  sortableProps,
  dragMotionStyles,
  video,
}: {
  dragMotionStyles: CSSProperties
  sortableProps: ReturnType<typeof useSortable>
} & SectionVideoRowProps) {
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
      bg="white"
    >
      <HStack spacing={3} align="flex-start">
        <IconButton
          aria-label={translate("helpVideos.management.sections.dragVideoHandle")}
          variant="ghost"
          size="sm"
          icon={<ListIcon />}
          {...sortableProps.listeners}
          {...sortableProps.attributes}
        />
        <Box>
          <Text fontWeight="bold">{video.title}</Text>
          {video.descriptionHtml && (
            <SafeTipTapDisplay htmlContent={video.descriptionHtml} color="text.secondary" fontSize="sm" />
          )}
        </Box>
      </HStack>
    </Flex>
  )
}
