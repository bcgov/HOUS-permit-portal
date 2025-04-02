import { Box, Heading, Stack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
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
    <Stack w={"full"} alignItems={"flex-start"} spacing={16}>
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

    const { requirementBlockStore } = useMst()
    const { getIsRequirementBlockEditable } = requirementBlockStore

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
          pr="var(--app-permit-form-right-white-space)"
          maxWidth="container.lg"
        >
          <Heading as="h3" variant="yellowline" fontSize="2xl">
            {sectionName}
          </Heading>

          {sectionBlocks.map(
            (sectionBlock) =>
              sectionBlock.requirementBlock && (
                <RequirementBlockAccordion
                  as={"section"}
                  hideElectiveField={hideElectiveField}
                  id={formScrollToId(sectionBlock.requirementBlock.id)}
                  key={sectionBlock.id}
                  requirementBlock={sectionBlock.requirementBlock}
                  isCollapsedAll={isCollapsedAll}
                  isEditable={!!renderEdit && getIsRequirementBlockEditable(sectionBlock.requirementBlock)}
                  renderEdit={
                    renderEdit
                      ? () => renderEdit({ denormalizedRequirementBlock: sectionBlock.requirementBlock })
                      : undefined
                  }
                  requirementBlockCustomization={requirementBlockCustomizations?.[sectionBlock.requirementBlock.id]}
                />
              )
          )}
        </Stack>
      </Box>
    )
  }
)
