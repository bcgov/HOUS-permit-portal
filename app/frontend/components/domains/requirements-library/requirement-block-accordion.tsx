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
import { IRequirementBlock } from "../../../models/requirement-block"
import { ERequirementType } from "../../../types/enums"
import { isQuillEmpty } from "../../../utils/utility-functions"
import { EditorWithPreview } from "../../shared/editor/custom-extensions/editor-with-preview"
import { RequirementFieldDisplay } from "./requirement-field-display"
import { RequirementsBlockModal } from "./requirements-block-modal"

type TProps = {
  requirementBlock: IRequirementBlock
  onRemove?: () => void
  triggerForceCollapse?: boolean
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
        <Box as={"h5"} w={"full"} background={"greys.grey04"} m={0}>
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
              {isEditable && (
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
              <AccordionIcon color={"text.primary"} />
            </HStack>
          </AccordionButton>
        </Box>
        <AccordionPanel pb={8}>
          <Box px={3}>
            {!isQuillEmpty(requirementBlock.displayDescription) && (
              <EditorWithPreview
                containerProps={{
                  mt: 2,
                  mb: 1,
                  py: 0,
                }}
                isReadOnly
                label={t("requirementsLibrary.modals.displayDescriptionLabel")}
                htmlValue={requirementBlock.displayDescription}
                initialTriggerText={t("requirementsLibrary.modals.addDescriptionTrigger")}
              />
            )}
          </Box>
          <VStack
            w={"full"}
            alignItems={"flex-start"}
            spacing={2}
            px={3}
            mt={isQuillEmpty(requirementBlock.displayDescription) ? 5 : 0}
          >
            {requirementBlock.requirements.map((requirement, index) => {
              const requirementType = requirement.inputType
              return (
                <Box
                  key={requirement.id}
                  w={"full"}
                  borderRadius={"sm"}
                  px={3}
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
                      helperText={requirementBlock.hint}
                      unit={requirementType === ERequirementType.number ? requirement?.numberUnit ?? null : undefined}
                      options={requirement?.valueOptions?.map((option) => option.label)}
                      selectProps={{
                        maxW: "339px",
                      }}
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
