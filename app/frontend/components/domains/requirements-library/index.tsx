import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { ToggleArchivedButton } from "../../shared/buttons/toggle-archived-button"
import { RequirementBlocksTable } from "./requirement-blocks-table"
import { RequirementsBlockModal } from "./requirements-block-modal"

export const RequirementsLibraryScreen = observer(function RequirementsLibrary() {
  const { t } = useTranslation()
  const { requirementBlockStore } = useMst()
  const [searchParams, setSearchParams] = useSearchParams()
  const openRequirementBlockId = searchParams.get("openRequirementBlockId")
  const [autoOpenBlock, setAutoOpenBlock] = useState<{ id: string; key: number } | null>(null)

  useEffect(() => {
    if (!openRequirementBlockId) return

    let cancelled = false
    ;(async () => {
      const block = await requirementBlockStore.fetchRequirementBlock(openRequirementBlockId)
      if (cancelled || !block) return
      setAutoOpenBlock({ id: block.id, key: Date.now() })
    })()

    return () => {
      cancelled = true
    }
  }, [openRequirementBlockId, requirementBlockStore])

  const consumeOpenRequirementBlock = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete("openRequirementBlockId")
        return next
      },
      { replace: true }
    )
  }, [setSearchParams])

  const viewingBlock = autoOpenBlock ? requirementBlockStore.getRequirementBlockById(autoOpenBlock.id) : undefined

  return (
    <Container maxW="container.lg" p={8} as="main">
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"} gap={6}>
          <Box>
            <Heading as="h1" color={"text.primary"}>
              {t("requirementsLibrary.index.title")}
            </Heading>
            <Text color={"text.secondary"} mt={1}>
              {t("requirementsLibrary.index.description")}
            </Text>
          </Box>
          <RequirementsBlockModal />
        </Flex>
        <RequirementBlocksTable alignItems={"flex-start"} w={"full"} />
        <ToggleArchivedButton searchModel={requirementBlockStore} mt={3} />
      </VStack>

      {autoOpenBlock && viewingBlock && (
        <RequirementsBlockModal
          key={autoOpenBlock.key}
          requirementBlock={viewingBlock}
          withOptionsMenu
          autoOpen={!!openRequirementBlockId}
          onAutoOpenConsumed={consumeOpenRequirementBlock}
          triggerButtonProps={{ display: "none" }}
        />
      )}
    </Container>
  )
})
