import { Box, Button, Checkbox, Flex, Heading, IconButton, VStack } from "@chakra-ui/react"
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
import { ArrowSquareOut, List as ListIcon } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { CSSProperties } from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { EFlashMessageStatus } from "../../../types/enums"
import { IResource } from "../../../types/types"
import { CustomMessageBox } from "../base/custom-message-box"
import { ResourceItem } from "../base/resource-item"
import { SortableItem } from "../sortable-item"

interface IJurisdictionResourcesGridSectionProps {
  jurisdiction: IJurisdiction
  configureResourcesPath?: string
}

const sortByAboutPosition = (resources: IResource[]) =>
  [...resources].sort((a, b) => (a.aboutPosition ?? 0) - (b.aboutPosition ?? 0))

export const JurisdictionResourcesGridSection = observer(function JurisdictionResourcesGridSection({
  jurisdiction,
  configureResourcesPath,
}: IJurisdictionResourcesGridSectionProps) {
  const { t } = useTranslation()
  const isManaging = !!configureResourcesPath
  const orderedResources = sortByAboutPosition(jurisdiction.resources ?? [])
  const visibleResources = orderedResources.filter((resource) => resource.showOnAbout !== false)
  const displayResources = isManaging ? orderedResources : visibleResources

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const persistAboutList = (resources: IResource[]) => {
    jurisdiction.update({
      resourcesAttributes: resources.map((resource, index) => ({
        id: resource.id,
        showOnAbout: resource.showOnAbout !== false,
        aboutPosition: index,
      })),
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedResources.findIndex((resource) => resource.id === String(active.id))
    const newIndex = orderedResources.findIndex((resource) => resource.id === String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    persistAboutList(arrayMove(orderedResources, oldIndex, newIndex))
  }

  const handleShowOnAboutChange = (resource: IResource, showOnAbout: boolean) => {
    persistAboutList(orderedResources.map((item) => (item.id === resource.id ? { ...item, showOnAbout } : item)))
  }

  if (!isManaging && visibleResources.length === 0) {
    return null
  }

  return (
    <Flex as="section" direction="column" gap={4}>
      <Heading as="h2" variant="yellowline" my={0}>
        {t("jurisdiction.resources.sectionTitle")}
      </Heading>
      <Box
        display="flex"
        flexDirection="column"
        border={isManaging ? "1px dashed" : undefined}
        borderColor={isManaging ? "border.light" : undefined}
        p={isManaging ? 1 : undefined}
        gap={1}
      >
        {configureResourcesPath && (
          <Flex justify="flex-end">
            <Button
              as={RouterLink}
              to={configureResourcesPath}
              target="_blank"
              rel="noopener noreferrer"
              rightIcon={<ArrowSquareOut size={14} />}
              size="xs"
              variant="primary"
            >
              {t("ui.edit")}
            </Button>
          </Flex>
        )}
        {displayResources.length === 0 ? (
          <CustomMessageBox
            status={EFlashMessageStatus.info}
            description={t("jurisdiction.resources.emptyForStaff")}
            px={6}
            py={4}
          />
        ) : isManaging ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayResources.map((resource) => resource.id)}
              strategy={verticalListSortingStrategy}
            >
              <VStack align="stretch" spacing={3}>
                {displayResources.map((resource) => (
                  <SortableItem<IAboutResourceRowProps>
                    key={resource.id}
                    sortableArguments={{ id: resource.id }}
                    Component={AboutResourceRow}
                    componentProps={{
                      resource,
                      onShowOnAboutChange: handleShowOnAboutChange,
                    }}
                  />
                ))}
              </VStack>
            </SortableContext>
          </DndContext>
        ) : (
          <VStack align="stretch" spacing={4}>
            {displayResources.map((resource) => (
              <ResourceItem key={resource.id} resource={resource} simpleTitle />
            ))}
          </VStack>
        )}
      </Box>
    </Flex>
  )
})

interface IAboutResourceRowProps {
  resource: IResource
  onShowOnAboutChange: (resource: IResource, showOnAbout: boolean) => void
}

function AboutResourceRow({
  sortableProps,
  dragMotionStyles,
  resource,
  onShowOnAboutChange,
}: {
  dragMotionStyles: CSSProperties
  sortableProps: ReturnType<typeof useSortable>
} & IAboutResourceRowProps) {
  const { t } = useTranslation()
  const showOnAbout = resource.showOnAbout !== false

  return (
    <Flex
      ref={sortableProps.setNodeRef}
      style={dragMotionStyles}
      align="flex-start"
      gap={3}
      opacity={showOnAbout ? 1 : 0.5}
    >
      <IconButton
        type="button"
        aria-label={t("jurisdiction.resources.dragHandle")}
        variant="ghost"
        size="sm"
        icon={<ListIcon />}
        {...sortableProps.listeners}
        {...sortableProps.attributes}
      />
      <Checkbox
        mt={1}
        isChecked={showOnAbout}
        onChange={(event) => onShowOnAboutChange(resource, event.target.checked)}
        aria-label={t("jurisdiction.resources.showOnAbout")}
      />
      <Box flex={1} minW={0}>
        <ResourceItem resource={resource} simpleTitle />
      </Box>
    </Flex>
  )
}
