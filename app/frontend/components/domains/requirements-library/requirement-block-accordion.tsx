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
import { ERequirementType } from "../../../types/enums"
import {
  IDenormalizedRequirement,
  IDenormalizedRequirementBlock,
  IRequirementBlockCustomization,
} from "../../../types/types"
import { isQuillEmpty } from "../../../utils/utility-functions"
import { Editor } from "../../shared/editor/editor"
import { RichTextTip } from "../../shared/rich-text-tip"
import { RequirementFieldDisplay } from "./requirement-field-display"
import { RequirementsBlockModal } from "./requirements-block-modal"

type TProps = {
  requirementBlock: IDenormalizedRequirementBlock
  onRemove?: () => void
  triggerForceCollapse?: boolean
  renderEdit?: () => JSX.Element
  requirementBlockCustomization?: IRequirementBlockCustomization
  hideElectiveField?: (requirementBlockId: string, requirement: IDenormalizedRequirement) => boolean
} & Partial<AccordionProps> &
  (
    | { isEditable?: never; showEditWarning?: never }
    | { isEditable: true; showEditWarning?: boolean }
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
  triggerForceCollapse,
  renderEdit,
  requirementBlockCustomization,
  hideElectiveField,
  ...accordionProps
}: TProps) {
  const { t } = useTranslation()
  const { isOpen, onToggle, onClose } = useDisclosure({ defaultIsOpen: true })

  useEffect(() => {
    if (triggerForceCollapse) {
      onClose()
    }
  }, [triggerForceCollapse])

  return (
    <Accordion
      as={"section"}
      w={"full"}
      border={"1px solid"}
      borderColor={"border.light"}
      borderRadius={"lg"}
      allowToggle
      index={isOpen ? 0 : null}
      {...accordionProps}
    >
      <AccordionItem>
        <Box as={"h5"} w={"full"} background={"greys.grey04"} m={0} borderTopRadius="8px">
          <AccordionButton py={3} px={6} display={"flex"} justifyContent={"space-between"} onClick={onToggle}>
            <HStack spacing={0}>
              <Box fontWeight={700} fontSize={"base"}>
                {requirementBlock.displayName}
              </Box>
              {onRemove && (
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
              {isEditable && !renderEdit && (
                <RequirementsBlockModal
                  showEditWarning={showEditWarning}
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
              {isEditable && renderEdit?.()}
              <AccordionIcon color={"text.primary"} />
            </HStack>
          </AccordionButton>
        </Box>
        <AccordionPanel pb={8}>
          {!isQuillEmpty(requirementBlock.displayDescription) && (
            <Box
              sx={{
                ".ql-editor": {
                  p: 0,
                },
              }}
              px={2}
              my={4}
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
                      sx={{
                        "& input": {
                          maxW: "339px",
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
                        showAddPersonButton={!!requirement?.inputOptions?.canAddMultipleContacts}
                        required={requirement.required}
                      />
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
