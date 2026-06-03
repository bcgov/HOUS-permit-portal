import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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
import { CSS } from "@dnd-kit/utilities"
import { CaretLeft, List as ListIcon, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { CSSProperties, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { ITemplateCategory } from "../../../../models/template-category"
import { useMst } from "../../../../setup/root"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

export const TemplateCategoriesScreen = observer(function TemplateCategoriesScreen() {
  const { t } = useTranslation()
  const translate = t as any
  const navigate = useNavigate()
  const { templateCategoryStore } = useMst()
  const {
    templateCategories,
    uncategorizedRequirementTemplates,
    isLoading,
    fetchTemplateCategories,
    createTemplateCategory,
    updateTemplateCategory,
    deleteTemplateCategory,
    reorderTemplateCategories,
    reorderTemplatesInCategory,
  } = templateCategoryStore
  const modal = useDisclosure()
  const [editingCategory, setEditingCategory] = useState<ITemplateCategory | null>(null)
  const [label, setLabel] = useState("")
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [orderedCategoryIds, setOrderedCategoryIds] = useState<string[]>([])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const storeCategoryIdKey = templateCategories.map((category) => category.id).join("|")

  useEffect(() => {
    fetchTemplateCategories()
  }, [])

  useEffect(() => {
    setOrderedCategoryIds(storeCategoryIdKey ? storeCategoryIdKey.split("|") : [])
  }, [storeCategoryIdKey])

  const categoryById = useMemo(
    () => new Map(templateCategories.map((category) => [category.id, category])),
    [templateCategories]
  )
  const orderedCategories = useMemo(() => {
    const categories = orderedCategoryIds.flatMap((id) => {
      const category = categoryById.get(id)
      return category ? [category] : []
    })
    const orderedIds = new Set(categories.map((category) => category.id))

    return [...categories, ...templateCategories.filter((category) => !orderedIds.has(category.id))]
  }, [categoryById, orderedCategoryIds, templateCategories])
  const categoryIds = useMemo(() => orderedCategories.map((category) => category.id), [orderedCategories])
  const activeCategory = useMemo(() => {
    if (!activeCategoryId) return null

    return categoryById.get(activeCategoryId) ?? null
  }, [activeCategoryId, categoryById])

  const openCreateModal = () => {
    setEditingCategory(null)
    setLabel("")
    modal.onOpen()
  }

  const openEditModal = (category: ITemplateCategory) => {
    setEditingCategory(category)
    setLabel(category.label)
    modal.onOpen()
  }

  const handleSubmit = async () => {
    const trimmedLabel = label.trim()
    if (!trimmedLabel) return

    const ok = editingCategory
      ? await updateTemplateCategory(editingCategory.id, trimmedLabel)
      : await createTemplateCategory(trimmedLabel)

    if (ok) modal.onClose()
  }

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCategoryId(null)
    if (!over || active.id === over.id) return

    const oldIndex = categoryIds.indexOf(String(active.id))
    const overCategoryId = over.data.current?.categoryId
    if (!overCategoryId) return

    const newIndex = categoryIds.indexOf(overCategoryId)
    if (oldIndex === -1 || newIndex === -1) return

    const nextCategoryIds = arrayMove(categoryIds, oldIndex, newIndex)
    setOrderedCategoryIds(nextCategoryIds)

    const ok = await reorderTemplateCategories(nextCategoryIds)
    if (!ok) setOrderedCategoryIds(categoryIds)
  }

  const handleCategoryDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveCategoryId(String(active.id))
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
          {translate("ui.back")}
        </Button>
        <Flex justify="space-between" align="flex-start" gap={6}>
          <Box>
            <Heading as="h1" fontSize="3xl">
              {translate("siteConfiguration.templateCategories.title", "Permit categories")}
            </Heading>
            <Text color="text.secondary" mt={3}>
              {translate(
                "siteConfiguration.templateCategories.description",
                "Group and order permit templates across public template lists."
              )}
            </Text>
          </Box>
          <Button variant="primary" leftIcon={<Plus />} onClick={openCreateModal}>
            {translate("siteConfiguration.templateCategories.add", "Add category")}
          </Button>
        </Flex>

        {isLoading ? (
          <SharedSpinner />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={handleCategoryDragStart}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
              <VStack align="stretch" spacing={4}>
                {orderedCategories.map((category) => (
                  <TemplateCategorySection
                    key={category.id}
                    category={category}
                    isDragging={activeCategoryId === category.id}
                    onEdit={() => openEditModal(category)}
                    onDelete={() => deleteTemplateCategory(category.id)}
                    onReorderTemplates={(orderedIds) => reorderTemplatesInCategory(category.id, orderedIds)}
                  />
                ))}
              </VStack>
            </SortableContext>
            <DragOverlay>{activeCategory && <CategoryOverlayContent category={activeCategory} />}</DragOverlay>
          </DndContext>
        )}

        {!isLoading && (
          <TemplateBucket
            title={translate("siteConfiguration.templateCategories.uncategorized", "Uncategorized")}
            templates={uncategorizedRequirementTemplates as IRequirementTemplate[]}
            mt={4}
            onReorderTemplates={(orderedIds) => reorderTemplatesInCategory(null, orderedIds)}
          />
        )}
      </VStack>

      <Modal isOpen={modal.isOpen} onClose={modal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingCategory ? translate("ui.edit") : translate("ui.add")}</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>{translate("siteConfiguration.templateCategories.label", "Label")}</FormLabel>
              <Input value={label} onChange={(event) => setLabel(event.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="secondary" onClick={modal.onClose}>
                {translate("ui.cancel")}
              </Button>
              <Button variant="primary" onClick={handleSubmit} isDisabled={!label.trim()}>
                {translate("ui.save")}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
})

interface ITemplateCategorySectionProps {
  category: ITemplateCategory
  isDragging: boolean
  onEdit: () => void
  onDelete: () => Promise<boolean>
  onReorderTemplates: (orderedIds: string[]) => Promise<boolean>
}

const TemplateCategorySection = observer(function TemplateCategorySection({
  category,
  isDragging,
  onEdit,
  onDelete,
  onReorderTemplates,
}: ITemplateCategorySectionProps) {
  const { t } = useTranslation()
  const translate = t as any
  const sortableProps = useSortable({
    id: category.id,
    data: { type: "category", categoryId: category.id },
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(sortableProps.transform),
    transition: sortableProps.transition,
  }

  return (
    <Box ref={sortableProps.setNodeRef} style={style} opacity={isDragging ? 0.35 : 1}>
      <TemplateBucket
        title={category.label}
        templates={category.requirementTemplates}
        onReorderTemplates={onReorderTemplates}
        headerRight={
          <HStack spacing={3}>
            <Button variant="link" size="sm" onClick={onEdit}>
              {translate("ui.edit")}
            </Button>
            <ConfirmationModal
              title={translate("siteConfiguration.templateCategories.deleteTitle", "Delete category")}
              body={translate(
                "siteConfiguration.templateCategories.deleteBody",
                "Templates in this category will move to Uncategorized."
              )}
              triggerText={translate("ui.delete")}
              triggerButtonProps={{ color: "semantic.error", size: "sm" }}
              confirmButtonProps={{ variant: "primary" }}
              onConfirm={async (closeModal) => {
                await onDelete()
                closeModal()
              }}
            />
            <IconButton
              aria-label={translate("siteConfiguration.templateCategories.dragCategory", "Drag category")}
              variant="ghost"
              size="sm"
              icon={<ListIcon />}
              {...sortableProps.listeners}
              {...sortableProps.attributes}
            />
          </HStack>
        }
      />
    </Box>
  )
})

function CategoryOverlayContent({ category }: { category: ITemplateCategory }) {
  const { t } = useTranslation()
  const translate = t as any

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="border.light"
      borderRadius="md"
      boxShadow="lg"
      minW={{ base: "280px", md: "560px" }}
      p={4}
    >
      <HStack spacing={3}>
        <IconButton
          aria-label={translate("siteConfiguration.templateCategories.dragCategory", "Drag category")}
          variant="ghost"
          size="sm"
          icon={<ListIcon />}
          pointerEvents="none"
        />
        <Heading as="h2" size="md" mb={0}>
          {category.label}
        </Heading>
        <Text color="text.secondary" fontSize="sm">
          {translate("siteConfiguration.templateCategories.templateCount", {
            defaultValue: "{{count}} templates",
            count: category.requirementTemplates.length,
          })}
        </Text>
      </HStack>
    </Box>
  )
}

interface ITemplateBucketProps {
  title: string
  templates: IRequirementTemplate[]
  onReorderTemplates: (orderedIds: string[]) => Promise<boolean>
  headerRight?: React.ReactNode
  mt?: number
}

function TemplateBucket({ title, templates, onReorderTemplates, headerRight, mt }: ITemplateBucketProps) {
  const { t } = useTranslation()
  const translate = t as any
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [orderedTemplateIds, setOrderedTemplateIds] = useState<string[]>([])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const storeTemplateIdKey = templates.map((template) => template.id).join("|")
  useEffect(() => {
    setOrderedTemplateIds(storeTemplateIdKey ? storeTemplateIdKey.split("|") : [])
  }, [storeTemplateIdKey])

  const templateById = useMemo(() => new Map(templates.map((template) => [template.id, template])), [templates])
  const orderedTemplates = useMemo(() => {
    const sortedTemplates = orderedTemplateIds.flatMap((id) => {
      const template = templateById.get(id)
      return template ? [template] : []
    })
    const orderedIds = new Set(sortedTemplates.map((template) => template.id))

    return [...sortedTemplates, ...templates.filter((template) => !orderedIds.has(template.id))]
  }, [orderedTemplateIds, templateById, templates])
  const templateIds = orderedTemplates.map((template) => template.id)
  const activeTemplate = useMemo(
    () => (activeTemplateId ? (templateById.get(activeTemplateId) ?? null) : null),
    [activeTemplateId, templateById]
  )

  const handleTemplateDragStart = (event: DragStartEvent) => {
    setActiveTemplateId(String(event.active.id))
  }

  const handleTemplateDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTemplateId(null)
    if (!over || active.id === over.id) return

    const oldIndex = templateIds.indexOf(String(active.id))
    const newIndex = templateIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const nextTemplateIds = arrayMove(templateIds, oldIndex, newIndex)
    setOrderedTemplateIds(nextTemplateIds)

    const ok = await onReorderTemplates(nextTemplateIds)
    if (!ok) setOrderedTemplateIds(templateIds)
  }

  return (
    <Box border="1px solid" borderColor="border.light" borderRadius="md" bg="white" mt={mt}>
      <Flex p={4} borderBottom="1px solid" borderColor="border.light" justify="space-between" align="center">
        <HStack spacing={3}>
          <Heading as="h2" size="md" mb={0}>
            {title}
          </Heading>
          <Text color="text.secondary" fontSize="sm">
            {translate("siteConfiguration.templateCategories.templateCount", {
              defaultValue: "{{count}} templates",
              count: templates.length,
            })}
          </Text>
        </HStack>
        {headerRight}
      </Flex>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleTemplateDragStart}
        onDragEnd={handleTemplateDragEnd}
      >
        <SortableContext items={templateIds} strategy={verticalListSortingStrategy}>
          <VStack align="stretch" spacing={0}>
            {templates.length === 0 ? (
              <Text color="text.secondary" fontSize="sm" fontStyle="italic" p={4}>
                {translate("siteConfiguration.templateCategories.empty", "No templates in this category.")}
              </Text>
            ) : (
              orderedTemplates.map((template) => <SortableTemplateRow key={template.id} template={template} />)
            )}
          </VStack>
        </SortableContext>
        <DragOverlay>
          {activeTemplate && <TemplateRowContent template={activeTemplate as IRequirementTemplate} isOverlay />}
        </DragOverlay>
      </DndContext>
    </Box>
  )
}

function SortableTemplateRow({ template }: { template: IRequirementTemplate }) {
  const { t } = useTranslation()
  const translate = t as any
  const sortableProps = useSortable({
    id: template.id,
    data: { type: "template" },
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(sortableProps.transform),
    transition: sortableProps.transition,
  }

  return (
    <Flex
      ref={sortableProps.setNodeRef}
      style={style}
      p={4}
      align="center"
      justify="space-between"
      borderBottom="1px solid"
      borderColor="border.light"
      _last={{ borderBottom: "none" }}
      bg="white"
    >
      <TemplateRowContent template={template} />
      <HStack spacing={3}>
        <RouterLinkButton to={`/requirement-templates/${template.id}/edit`} size="sm" variant="link">
          {translate("siteConfiguration.templateCategories.openBuilder", "Open builder")}
        </RouterLinkButton>
        <IconButton
          aria-label={translate("siteConfiguration.templateCategories.dragTemplate", "Drag template")}
          variant="ghost"
          size="sm"
          icon={<ListIcon />}
          {...sortableProps.listeners}
          {...sortableProps.attributes}
        />
      </HStack>
    </Flex>
  )
}

function TemplateRowContent({ template, isOverlay = false }: { template: IRequirementTemplate; isOverlay?: boolean }) {
  return (
    <Box
      bg={isOverlay ? "white" : undefined}
      border={isOverlay ? "1px solid" : undefined}
      borderColor={isOverlay ? "border.light" : undefined}
      borderRadius={isOverlay ? "md" : undefined}
      boxShadow={isOverlay ? "lg" : undefined}
      minW={isOverlay ? { base: "260px", md: "420px" } : undefined}
      p={isOverlay ? 4 : undefined}
    >
      <Text fontWeight="bold">{template.nickname}</Text>
      {template.description && (
        <Text color="text.secondary" fontSize="sm" noOfLines={2}>
          {template.description}
        </Text>
      )}
    </Box>
  )
}
