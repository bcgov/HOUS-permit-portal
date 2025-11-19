import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AccordionProps,
  Box,
  Flex,
  HStack,
  IconButton,
  Link,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { Link as LinkIcon, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EFileUploadAttachmentType, ERequirementType, EResourceCategory, EVisibility } from "../../../types/enums"
import {
  IDenormalizedRequirement,
  IDenormalizedRequirementBlock,
  IRequirementBlockCustomization,
  IResource,
} from "../../../types/types"
import { formatFileSize, getFileExtension } from "../../../utils/file-utils"
import { isTipTapEmpty } from "../../../utils/utility-functions"
import { FileDownloadButton } from "../../shared/base/file-download-button"
import { SafeTipTapDisplay } from "../../shared/editor/safe-tiptap-display"
import { ElectiveTag } from "../../shared/elective-tag"
import { FirstNationsTag } from "../../shared/first-nations-tag"
import { RichTextTip } from "../../shared/rich-text-tip"
import { VisibilityTag } from "../../shared/visibility-tag.tsx"
import { RequirementFieldDisplay } from "./requirement-field-display"
import { RequirementsBlockModal } from "./requirements-block-modal"
type TProps = {
  requirementBlock: IDenormalizedRequirementBlock
  onRemove?: () => void
  isCollapsedAll?: boolean
  renderEdit?: () => JSX.Element
  requirementBlockCustomization?: IRequirementBlockCustomization
  hideElectiveField?: (requirementBlockId: string, requirement: IDenormalizedRequirement) => boolean
} & Partial<AccordionProps> &
  (
    | { isEditable?: boolean; showEditWarning?: never }
    | { isEditable: boolean; showEditWarning?: boolean }
    | {
        isEditable: false
        showEditWarning?: never
      }
  )

export const RequirementBlockAccordion = observer(function RequirementBlockAccordion({
  requirementBlock,
  onRemove,
  isEditable,
  showEditWarning,
  isCollapsedAll,
  renderEdit,
  requirementBlockCustomization,
  hideElectiveField,
  ...accordionProps
}: TProps) {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore
  const { isOpen, onToggle, onClose, onOpen } = useDisclosure({ defaultIsOpen: true })

  // Get resources based on resourceIds in customization
  const selectedResources = useMemo(() => {
    const resourceIds = requirementBlockCustomization?.resourceIds
    if (!resourceIds || resourceIds.length === 0 || !currentUser?.jurisdiction?.resources) {
      return []
    }

    return currentUser.jurisdiction.resources.filter((resource) => resourceIds.includes(resource.id))
  }, [requirementBlockCustomization?.resourceIds, currentUser?.jurisdiction?.resources])

  // Group resources by category
  const resourcesByCategory = useMemo(() => {
    const grouped: Record<string, IResource[]> = {}
    selectedResources.forEach((resource) => {
      if (!grouped[resource.category]) grouped[resource.category] = []
      grouped[resource.category].push(resource)
    })
    return grouped
  }, [selectedResources])

  const categoryLabels = {
    [EResourceCategory.planningZoning]: t("home.configurationManagement.resources.categories.planningZoning"),
    [EResourceCategory.bylawsRequirements]: t("home.configurationManagement.resources.categories.bylawsRequirements"),
    [EResourceCategory.additionalResources]: t("home.configurationManagement.resources.categories.additionalResources"),
  }

  useEffect(() => {
    if (isCollapsedAll) {
      onClose()
    } else {
      onOpen()
    }
  }, [isCollapsedAll])

  return (
    <Accordion
      as={"section"}
      w={"full"}
      border={"1px solid"}
      borderColor={"border.light"}
      borderRadius={"lg"}
      bg="greys.grey04"
      _focus={{ bg: "semantic.warningLight", borderColor: "semantic.warning" }}
      allowMultiple
      index={isOpen ? 0 : null}
      {...accordionProps}
    >
      <AccordionItem border="0">
        <Box as={"h5"} w={"full"} m={0} borderTopRadius="radii.lg">
          <AccordionButton
            as="div"
            minH="10"
            py={0}
            pl={6}
            pr={3}
            display={"flex"}
            justifyContent={"space-between"}
            onClick={onToggle}
          >
            <HStack spacing={1}>
              <Box fontWeight={700} fontSize={"base"}>
                {requirementBlock.displayName}
              </Box>
              {isOpen && onRemove && (
                <IconButton
                  color={"text.primary"}
                  variant={"ghost"}
                  aria-label={"Remove Requirement Block"}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                  }}
                  icon={<X size={16} />}
                />
              )}
            </HStack>

            <HStack spacing={2}>
              <VisibilityTag visibility={requirementBlock.visibility} />
              <Box mr={2}>{requirementBlock.firstNations && <FirstNationsTag />}</Box>
              {isOpen && !renderEdit && (
                <RequirementsBlockModal
                  forEarlyAccess={requirementBlock.visibility === EVisibility.earlyAccess}
                  showEditWarning={showEditWarning}
                  isEditable={isEditable}
                  requirementBlock={requirementBlock}
                  triggerButtonProps={{
                    color: "text.primary",
                    textDecoration: "none",
                    _hover: {
                      textDecoration: "underline",
                    },
                  }}
                />
              )}
              {renderEdit?.()}
              <IconButton variant="unstyled" aria-label="Collapse or expand accordion">
                <AccordionIcon color={"text.primary"} />
              </IconButton>
            </HStack>
          </AccordionButton>
        </Box>
        <AccordionPanel
          pb={8}
          borderTop="1px solid"
          borderTopColor="border.light"
          bg="greys.white"
          borderBottomRadius="8px"
        >
          {!isTipTapEmpty(requirementBlock.displayDescription) && (
            <Box
              sx={{
                ".tiptap-editor-readonly": {
                  p: 0,
                },
              }}
              px={6}
              mx="-4"
              p={6}
              className="requirement-block-description"
              borderBottom="1px solid"
              borderBottomColor="border.light"
            >
              {/* Use SafeTipTapDisplay for safe HTML rendering */}
              <SafeTipTapDisplay htmlContent={requirementBlock.displayDescription} />
            </Box>
          )}
          {!R.isEmpty(requirementBlock.requirementDocuments) && (
            <Flex
              direction={"column"}
              gap={2}
              mb={4}
              px={6}
              pb={6}
              mx="-4"
              borderBottom="1px solid"
              borderBottomColor="border.light"
            >
              <Text fontWeight={700}>{t("requirementsLibrary.fields.requirementDocuments")}</Text>
              {requirementBlock.requirementDocuments?.map((document) => (
                <FileDownloadButton
                  key={document.id}
                  document={document}
                  modelType={EFileUploadAttachmentType.RequirementDocument}
                />
              ))}
            </Flex>
          )}
          {(!isTipTapEmpty(requirementBlockCustomization?.tip) || selectedResources.length > 0) && (
            <Box px={2} my={4}>
              <RichTextTip tip={requirementBlockCustomization.tip} />
              {selectedResources.length > 0 && (
                <VStack
                  align="start"
                  spacing={4}
                  mt={!isTipTapEmpty(requirementBlockCustomization?.tip) ? 3 : 0}
                  w="full"
                >
                  {(Object.entries(resourcesByCategory) as [string, IResource[]][]).map(([category, resources]) => (
                    <Box key={category} w="full">
                      <Text fontWeight={600} fontSize="xs" color="text.secondary" mb={2}>
                        {categoryLabels[category]}{" "}
                        {(t("home.configurationManagement.resources.title") as string).toLowerCase()}
                      </Text>
                      <VStack align="start" spacing={3} w="full">
                        {resources.map((resource) => {
                          let linkContent: React.ReactNode
                          let titleWithMetadata = resource.title

                          if (resource.resourceType === "link") {
                            linkContent = (
                              <Link
                                href={resource.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="semantic.info"
                                fontSize="md"
                                display="inline-flex"
                                alignItems="center"
                                gap={1}
                              >
                                <LinkIcon size={16} />
                                {titleWithMetadata}
                              </Link>
                            )
                          } else if (resource.resourceDocument) {
                            const fileExt = getFileExtension(
                              resource.resourceDocument.file.metadata.filename,
                              resource.resourceDocument.file.metadata.mimeType
                            )
                            const fileSize = formatFileSize(resource.resourceDocument.file.metadata.size)
                            titleWithMetadata = `${resource.title} (${fileExt}, ${fileSize})`

                            linkContent = (
                              <FileDownloadButton
                                document={resource.resourceDocument}
                                modelType={EFileUploadAttachmentType.ResourceDocument}
                                variant="link"
                                color="semantic.info"
                                size="sm"
                                px={0}
                              >
                                {titleWithMetadata}
                              </FileDownloadButton>
                            )
                          }

                          return (
                            <Box key={resource.id} w="full">
                              {linkContent}
                              {resource.description && (
                                <Text fontSize="xs" color="text.secondary" mt={1}>
                                  {resource.description}
                                </Text>
                              )}
                            </Box>
                          )
                        })}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          )}
          <VStack
            w={"full"}
            alignItems={"flex-start"}
            spacing={2}
            px={2}
            mt={
              isTipTapEmpty(requirementBlock.displayDescription) && isTipTapEmpty(requirementBlockCustomization?.tip)
                ? 4
                : 0
            }
          >
            {requirementBlock.requirements
              .filter((requirement) => {
                if (!requirement.elective) {
                  return true
                }

                if (!hideElectiveField) {
                  return true
                }

                if (hideElectiveField) {
                  return !hideElectiveField(requirementBlock.id, requirement)
                }
              })
              .map((requirement: IDenormalizedRequirement, index) => {
                const requirementType = requirement.inputType
                return (
                  <Box
                    key={requirement.id}
                    w={"full"}
                    borderRadius={"sm"}
                    pt={index !== 0 ? 1 : 0}
                    pb={5}
                    pos={"relative"}
                  >
                    <Box
                      w={"full"}
                      position="relative"
                      pr="var(--app-permit-fieldset-right-white-space)"
                      sx={{
                        "& input": {
                          maxW: "var(--app-permit-input-field-short)",
                        },
                      }}
                    >
                      <RequirementFieldDisplay
                        requirementType={requirementType}
                        label={requirement.label}
                        helperText={requirement?.hint}
                        instructions={requirement?.instructions}
                        inputOptions={requirement?.inputOptions}
                        unit={
                          requirementType === ERequirementType.number
                            ? (requirement?.inputOptions?.numberUnit ?? null)
                            : undefined
                        }
                        options={requirement?.inputOptions?.valueOptions?.map((option) => option.label)}
                        selectProps={{
                          maxW: "339px",
                        }}
                        showAddButton={!!requirement?.inputOptions?.canAddMultipleContacts}
                        required={requirement.required}
                      />
                      {requirement?.elective && <ElectiveTag position="absolute" right="0" top="0" />}
                    </Box>
                  </Box>
                )
              })}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
})
