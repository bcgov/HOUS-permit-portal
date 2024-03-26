import { Box, Heading, Stack } from "@chakra-ui/react"
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
  isCollapsedAll?: boolean
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
    isCollapsedAll,
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
        <Stack
          w="full"
          spacing="6"
          mt="8"
          mb="20"
          mx="auto"
          pl="8"
          pr="130px" // space for floating buttons
          maxWidth="container.lg"
        >
          <Heading as="h3" variant="yellowline" fontSize="2xl">
            {sectionName}
          </Heading>

          {sectionBlocks.map((sectionBlock) => (
            <RequirementBlockAccordion
              as={"section"}
              hideElectiveField={hideElectiveField}
              id={formScrollToId(sectionBlock.id)}
              key={sectionBlock.id}
              requirementBlock={sectionBlock.requirementBlock}
              isCollapsedAll={isCollapsedAll}
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
