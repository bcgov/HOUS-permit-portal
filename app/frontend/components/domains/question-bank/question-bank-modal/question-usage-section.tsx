import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Icon,
  Link,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { ArrowSquareOut, CaretDown, CaretRight, FileText } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { TQuestionUsageBlock, TQuestionUsageTemplate } from "../../../../models/requirement-question"
import { ETemplateVersionStatus } from "../../../../types/enums"
import { TemplateStatusTag } from "../../../shared/requirement-template/template-status-tag"

const requirementBlockEditHref = (blockId: string) => `/requirements-library?openRequirementBlockId=${blockId}`

interface IQuestionUsageSectionProps {
  // From MST: names arrive with the list; nested templates arrive after modal refresh (show).
  linkedBlocks: TQuestionUsageBlock[]
}

export const QuestionUsageSection = observer(function QuestionUsageSection({
  linkedBlocks,
}: IQuestionUsageSectionProps) {
  const { t } = useTranslation()
  const [isCollapsedAll, setIsCollapsedAll] = useState(false)
  const hasExpandableBlocks = linkedBlocks.some((block) => (block.requirementTemplates ?? []).length > 0)

  const templateCount = new Set(
    linkedBlocks.flatMap((block) => (block.requirementTemplates ?? []).map((template) => template.id))
  ).size

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
                    templateCount,
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

                {hasExpandableBlocks && (
                  <Button size={"sm"} variant={"secondary"} onClick={() => setIsCollapsedAll(!isCollapsedAll)}>
                    {isCollapsedAll ? t("ui.expandAll") : t("ui.collapseAll")}
                  </Button>
                )}

                <VStack alignItems={"stretch"} spacing={2} w={"full"}>
                  {linkedBlocks.map((block) => (
                    <BlockUsageRow key={block.id} block={block} isCollapsedAll={isCollapsedAll} />
                  ))}
                </VStack>
              </VStack>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
})

function BlockUsageRow({ block, isCollapsedAll }: { block: TQuestionUsageBlock; isCollapsedAll: boolean }) {
  const { t } = useTranslation()
  const templates = block.requirementTemplates ?? []
  const hasNoTemplates = templates.length === 0
  const { isOpen, onToggle, onClose, onOpen } = useDisclosure({ defaultIsOpen: true })

  useEffect(() => {
    if (hasNoTemplates) return
    if (isCollapsedAll) onClose()
    else onOpen()
  }, [isCollapsedAll])

  const isExpanded = hasNoTemplates || isOpen

  return (
    <Box border={"1px solid"} borderColor={"border.light"} borderRadius={"md"} overflow={"hidden"}>
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
            onClick={onToggle}
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
          <VStack alignItems={"flex-start"} spacing={2} px={4} pb={3} pt={3} bg={"greys.grey04"} pl={10}>
            {templates.map((template) => (
              <TemplateLink key={template.id} template={template} />
            ))}
          </VStack>
        </Collapse>
      )}
    </Box>
  )
}

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

function TemplateLink({ template }: { template: TQuestionUsageTemplate }) {
  const label = template.nickname || template.id

  return (
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
  )
}
