import { Box, IconButton, IconButtonProps, Popover, Text, VStack } from "@chakra-ui/react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"
import { Trans } from "react-i18next"

interface IProps extends Partial<IconButtonProps> {}

export function BrowserSearchPrompt({ ...buttonProps }: IProps) {
  return (
    <Popover.Root
      positioning={{
        placement: "bottom-start",
      }}
    >
      <Popover.Trigger asChild>
        <IconButton variant="ghost" color="white" aria-label="search-help" {...buttonProps}>
          <MagnifyingGlass size={16} />
        </IconButton>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Arrow />
          <Popover.Body color="text.primary" fontSize="sm">
            <VStack>
              <Text>{t("permitApplication.browserSearch.prompt")}</Text>
              <VStack gap={1}>
                <Box>
                  <Trans
                    i18nKey={"permitApplication.browserSearch.windows"}
                    components={{
                      1: <Box as="span" fontWeight="bold" rounded="base" bg="greys.grey03" px={1.5} py={0.5} />,
                    }}
                  />
                </Box>
                <Box>
                  <Trans
                    i18nKey={"permitApplication.browserSearch.mac"}
                    components={{
                      1: <Box as="span" fontWeight="bold" rounded="base" bg="greys.grey03" px={1.5} py={0.5} />,
                    }}
                  />
                </Box>
              </VStack>
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
