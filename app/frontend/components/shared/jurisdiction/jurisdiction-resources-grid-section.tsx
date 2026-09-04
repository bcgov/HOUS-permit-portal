import { Box, Button, Checkbox, Flex, Heading, VStack } from "@chakra-ui/react"
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
import { ArrowSquareOut, DotsSixVertical } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { CSSProperties, useEffect, useState } from "react"
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
  const storeResources = jurisdiction.resources ?? []
  const storeSignature = storeResources
    .map((resource) => `${resource.id}:${resource.aboutPosition ?? 0}:${resource.showOnAbout !== false}`)
    .join("|")
  const [orderedResources, setOrderedResources] = useState(() => sortByAboutPosition(storeResources))
  const visibleResources = orderedResources.filter((resource) => resource.showOnAbout !== false)
  const displayResources = isManaging ? orderedResources : visibleResources

  useEffect(() => {
    setOrderedResources(sortByAboutPosition(jurisdiction.resources ?? []))
  }, [storeSignature])

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

    const next = arrayMove(orderedResources, oldIndex, newIndex).map((resource, index) => ({
      ...resource,
      aboutPosition: index,
    }))
    setOrderedResources(next)
    persistAboutList(next)
  }

  const handleShowOnAboutChange = (resource: IResource, showOnAbout: boolean) => {
    const next = orderedResources.map((item) => (item.id === resource.id ? { ...item, showOnAbout } : item))
    setOrderedResources(next)
    persistAboutList(next)
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
              <VStack align="stretch" spacing={0}>
                {displayResources.map((resource) => (
                  <SortableItem<IAboutResourceRowProps>
                    key={resource.id}
                    sortableArguments={{ id: resource.id, animateLayoutChanges: () => false }}
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
      align="center"
      gap={4}
      py={4}
      px={2}
      bg="white"
      borderBottom="1px solid"
      borderColor="border.light"
      opacity={showOnAbout ? 1 : 0.5}
    >
      <Checkbox
        isChecked={showOnAbout}
        onChange={(event) => onShowOnAboutChange(resource, event.target.checked)}
        aria-label={t("jurisdiction.resources.showOnAbout")}
      />
      <Box flex={1} minW={0}>
        <ResourceItem resource={resource} simpleTitle />
      </Box>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        fontWeight="normal"
        color="text.secondary"
        rightIcon={<DotsSixVertical size={20} />}
        cursor="grab"
        flexShrink={0}
        aria-label={t("jurisdiction.resources.dragHandle")}
        {...sortableProps.listeners}
        {...sortableProps.attributes}
      >
        {t("ui.reorder")}
      </Button>
    </Flex>
  )
}
