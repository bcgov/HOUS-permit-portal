import { Box, HStack, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { IDenormalizedRequirementTemplateSection } from "../../../../types/types"
import { RequirementBlockAccordion } from "../../requirements-library/requirement-block-accordion"
import { formScrollToId } from "./template-version-screen"

interface IProps {
  shouldCollapseAll?: boolean
  setSectionRef: (el: HTMLElement, id: string) => void
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

const SectionDisplay = observer(
  ({
    section,
    shouldCollapseAll,
    setSectionRef,
  }: {
    section: IDenormalizedRequirementTemplateSection
    shouldCollapseAll?: boolean
    setSectionRef: (el: HTMLElement, id: string) => void
  }) => {
    const sectionBlocks = section.templateSectionBlocks
    const sectionName = section.name

    return (
      <Box
        ref={(el) => setSectionRef(el, section.id)}
        as={"section"}
        w={"full"}
        id={formScrollToId(section.id)}
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
              id={formScrollToId(sectionBlock.id)}
              key={sectionBlock.id}
              requirementBlock={sectionBlock.requirementBlock}
              triggerForceCollapse={shouldCollapseAll}
            />
          ))}
        </Stack>
      </Box>
    )
  }
)
