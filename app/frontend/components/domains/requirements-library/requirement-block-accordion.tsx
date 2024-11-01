import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AccordionProps,
  Box,
  HStack,
  IconButton,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ERequirementType, EVisibility } from "../../../types/enums"
import {
  IDenormalizedRequirement,
  IDenormalizedRequirementBlock,
  IRequirementBlockCustomization,
} from "../../../types/types"
import { isQuillEmpty } from "../../../utils/utility-functions"
import { Editor } from "../../shared/editor/editor"
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
  const { isOpen, onToggle, onClose, onOpen } = useDisclosure({ defaultIsOpen: true })

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
          {!isQuillEmpty(requirementBlock.displayDescription) && (
            <Box
              sx={{
                ".ql-editor": {
                  p: 0,
                },
              }}
              px={6}
              my={4}
              mx="-4"
              pb={4}
              className="requirement-block-description"
              borderBottom="1px solid"
              borderBottomColor="border.light"
            >
              <Editor htmlValue={requirementBlock.displayDescription} readonly />
            </Box>
          )}
          {!isQuillEmpty(requirementBlockCustomization?.tip) && (
            <Box px={2} my={4}>
              <RichTextTip tip={requirementBlockCustomization.tip} />
            </Box>
          )}
          <VStack
            w={"full"}
            alignItems={"flex-start"}
            spacing={2}
            px={2}
            mt={
              isQuillEmpty(requirementBlock.displayDescription) && isQuillEmpty(requirementBlockCustomization?.tip)
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
                        unit={
                          requirementType === ERequirementType.number
                            ? requirement?.inputOptions?.numberUnit ?? null
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
