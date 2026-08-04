import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonGroup,
  Collapse,
  Flex,
  HStack,
  Icon,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react"
import { ArrowSquareOut, CaretDown, CaretRight, FileText } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { TQuestionUsageBlock, TQuestionUsageTemplate } from "../../../../models/requirement-question"
import { ETemplateVersionStatus } from "../../../../types/enums"
import { TemplateStatusTag } from "../../../shared/requirement-template/template-status-tag"

type TViewMode = "hierarchy" | "compact"

const requirementBlockEditHref = (blockId: string) => `/requirements-library?openRequirementBlockId=${blockId}`

const expandableBlockIds = (blocks: TQuestionUsageBlock[]) =>
  new Set(blocks.filter((block) => (block.requirementTemplates ?? []).length > 0).map((block) => block.id))

interface IQuestionUsageSectionProps {
  linkedBlocks: TQuestionUsageBlock[]
}

export const QuestionUsageSection = observer(function QuestionUsageSection({
  linkedBlocks,
}: IQuestionUsageSectionProps) {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<TViewMode>("hierarchy")
  const [expandedBlockIds, setExpandedBlockIds] = useState<Set<string>>(() => expandableBlockIds(linkedBlocks))

  const uniqueTemplateCount = useMemo(() => {
    const ids = new Set<string>()
    linkedBlocks.forEach((block) => {
      ;(block.requirementTemplates ?? []).forEach((template) => ids.add(template.id))
    })
    return ids.size
  }, [linkedBlocks])

  const setMode = (mode: TViewMode) => {
    setViewMode(mode)
    setExpandedBlockIds(mode === "hierarchy" ? expandableBlockIds(linkedBlocks) : new Set())
  }

  const toggleBlock = (blockId: string) => {
    setExpandedBlockIds((prev) => {
      const next = new Set(prev)
      if (next.has(blockId)) next.delete(blockId)
      else next.add(blockId)
      return next
    })
  }

  return (
    <Box mt={10} w={"full"} border={"1px solid"} borderColor={"border.light"} borderRadius={"md"} bg={"white"}>
      <Accordion allowToggle defaultIndex={[0]}>
        <AccordionItem border="none">
          <AccordionButton px={6} py={4} _hover={{ bg: "transparent" }}>
            <Flex flex={1} alignItems={"center"} justifyContent={"space-between"} gap={4} textAlign={"left"}>
              <HStack spacing={2}>
                <AccordionIcon />
                <Text fontWeight={700} fontSize={"sm"}>
                  {t("questionBank.modals.usage.title")}
                </Text>
              </HStack>
              {linkedBlocks.length > 0 && (
                <Text fontSize={"xs"} color={"text.secondary"} whiteSpace={"nowrap"}>
                  {t("questionBank.modals.usage.summary", {
                    blockCount: linkedBlocks.length,
                    templateCount: uniqueTemplateCount,
                  })}
                </Text>
              )}
            </Flex>
          </AccordionButton>
          <AccordionPanel px={6} pb={5} pt={0}>
            {linkedBlocks.length === 0 ? (
              <VStack alignItems={"flex-start"} spacing={2}>
                <Text fontSize={"sm"} color={"text.secondary"}>
                  {t("questionBank.modals.usage.noBlocks")}
                </Text>
                <Button
                  as={Link}
                  href={"/requirements-library"}
                  isExternal
                  variant={"link"}
                  fontSize={"sm"}
                  fontWeight={"normal"}
                >
                  {t("questionBank.modals.usage.addToRequirementBlock")}
                </Button>
              </VStack>
            ) : (
              <VStack alignItems={"flex-start"} spacing={4} w={"full"}>
                <Text fontSize={"xs"} color={"text.secondary"}>
                  {t("questionBank.modals.usage.description")}
                </Text>

                <ButtonGroup size={"sm"} spacing={2}>
                  <Button
                    variant={viewMode === "hierarchy" ? "primary" : "secondary"}
                    onClick={() => setMode("hierarchy")}
                  >
                    {t("questionBank.modals.usage.fullHierarchy")}
                  </Button>
                  <Button variant={viewMode === "compact" ? "primary" : "secondary"} onClick={() => setMode("compact")}>
                    {t("questionBank.modals.usage.compact")}
                  </Button>
                </ButtonGroup>

                <VStack alignItems={"stretch"} spacing={2} w={"full"}>
                  {linkedBlocks.map((block) => {
                    const templates = block.requirementTemplates ?? []
                    const hasNoTemplates = templates.length === 0
                    const isExpanded = hasNoTemplates || expandedBlockIds.has(block.id)

                    return (
                      <Box
                        key={block.id}
                        border={"1px solid"}
                        borderColor={"border.light"}
                        borderRadius={"md"}
                        overflow={"hidden"}
                      >
                        <Flex alignItems={"center"} gap={2} px={3} py={3} w={"full"}>
                          {!hasNoTemplates && (
                            <Button
                              variant={"ghost"}
                              size={"xs"}
                              minW={"unset"}
                              h={"auto"}
                              p={0}
                              aria-expanded={isExpanded}
                              aria-label={t("questionBank.modals.usage.toggleBlockTemplates")}
                              onClick={() => toggleBlock(block.id)}
                            >
                              <Icon as={isExpanded ? CaretDown : CaretRight} boxSize={4} />
                            </Button>
                          )}
                          <BlockLink blockId={block.id} name={block.name} />
                          <Text fontSize={"xs"} color={"text.secondary"} flexShrink={0}>
                            {t("questionBank.modals.usage.usedInTemplates", { count: templates.length })}
                          </Text>
                        </Flex>

                        {hasNoTemplates ? (
                          <Text fontSize={"sm"} color={"text.secondary"} px={3} pb={3}>
                            {t("questionBank.modals.usage.noTemplates")}
                          </Text>
                        ) : (
                          <Collapse in={isExpanded} animateOpacity>
                            <VStack
                              alignItems={"flex-start"}
                              spacing={2}
                              px={4}
                              pb={3}
                              pt={1}
                              bg={"greys.grey04"}
                              pl={10}
                            >
                              {templates.map((template) => (
                                <TemplateLink key={template.id} template={template} showSecondary />
                              ))}
                            </VStack>
                          </Collapse>
                        )}
                      </Box>
                    )
                  })}
                </VStack>
              </VStack>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
})

function BlockLink({ blockId, name }: { blockId: string; name: string }) {
  return (
    <Link
      href={requirementBlockEditHref(blockId)}
      isExternal
      display={"inline-flex"}
      alignItems={"center"}
      gap={1.5}
      fontSize={"sm"}
      color={"text.link"}
      whiteSpace={"normal"}
      textAlign={"left"}
      fontWeight={"normal"}
    >
      <Text as={"span"}>{name}</Text>
      <ArrowSquareOut size={14} />
    </Link>
  )
}

function TemplateLink({ template, showSecondary }: { template: TQuestionUsageTemplate; showSecondary?: boolean }) {
  const label = template.nickname || template.id

  return (
    <Box>
      <HStack spacing={2} alignItems={"center"} flexWrap={"wrap"}>
        <Link
          href={`/requirement-templates/${template.id}/edit`}
          isExternal
          display={"inline-flex"}
          alignItems={"center"}
          gap={1.5}
          fontSize={"sm"}
          color={"text.link"}
        >
          <FileText size={14} />
          <Text as={"span"}>{label}</Text>
          <ArrowSquareOut size={14} />
        </Link>
        {template.published && <TemplateStatusTag status={ETemplateVersionStatus.published} />}
      </HStack>
      {showSecondary && template.templateCategoryLabel && (
        <Text fontSize={"xs"} color={"text.secondary"} pl={5}>
          {template.templateCategoryLabel}
        </Text>
      )}
    </Box>
  )
}
