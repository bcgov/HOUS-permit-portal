import { Box, HStack, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import {
  IDenormalizedRequirement,
  IDenormalizedRequirementBlock,
  IDenormalizedRequirementTemplateSection,
  IRequirementBlockCustomization,
} from "../../../types/types"
import { RequirementBlockAccordion } from "../requirements-library/requirement-block-accordion"

interface IProps extends Omit<ISectionDisplayProps, "section"> {
  sections: IDenormalizedRequirementTemplateSection[]
}

export const SectionsDisplay = observer(function SectionsDisplay(props: IProps) {
  const { sections } = props

  return (
    <Stack w={"full"} alignItems={"flex-start"} spacing={16} p={16}>
      {sections.map((section) => (
        <SectionDisplay key={section.id} section={section} {...props} />
      ))}
    </Stack>
  )
})

interface ISectionDisplayProps {
  section: IDenormalizedRequirementTemplateSection
  shouldCollapseAll?: boolean
  setSectionRef: (el: HTMLElement, id: string) => void
  scrollToId?: string
  formScrollToId: (recordId: string) => string
  renderEdit?: (props: { denormalizedRequirementBlock: IDenormalizedRequirementBlock }) => JSX.Element
  requirementBlockCustomizations?: Record<string, IRequirementBlockCustomization>
  hideElectiveField?: (requirementBlockId: string, requirement: IDenormalizedRequirement) => boolean
}

const SectionDisplay = observer(
  ({
    section,
    shouldCollapseAll,
    setSectionRef,
    formScrollToId,
    renderEdit,
    requirementBlockCustomizations,
    hideElectiveField,
  }: ISectionDisplayProps) => {
    const sectionBlocks = section.templateSectionBlocks
    const sectionName = section.name

    return (
      <Box
        ref={(el) => setSectionRef(el, section.id)}
        as={"section"}
        w={"full"}
        id={formScrollToId?.(section.id)}
        data-section-id={section.id}
      >
        <Box w={"36px"} border={"4px solid"} borderColor={"theme.yellow"} mb={2} />
        <HStack>
          <Text as="h4" w={"full"} maxW={"798px"} fontWeight={700} fontSize={"2xl"}>
            {sectionName}
          </Text>
        </HStack>
        <Stack w={"full"} maxW={"798px"} spacing={6} pl={0} mt={6}>
          {sectionBlocks.map((sectionBlock) => (
            <RequirementBlockAccordion
              as={"section"}
              hideElectiveField={hideElectiveField}
              id={formScrollToId(sectionBlock.id)}
              key={sectionBlock.id}
              requirementBlock={sectionBlock.requirementBlock}
              triggerForceCollapse={shouldCollapseAll}
              isEditable={!!renderEdit}
              renderEdit={
                renderEdit
                  ? () => renderEdit({ denormalizedRequirementBlock: sectionBlock.requirementBlock })
                  : undefined
              }
              requirementBlockCustomization={requirementBlockCustomizations?.[sectionBlock.requirementBlock.id]}
            />
          ))}
        </Stack>
      </Box>
    )
  }
)
