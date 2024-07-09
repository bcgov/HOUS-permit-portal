import {
  Box,
  IconButton,
  IconButtonProps,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
} from "@chakra-ui/react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"
import { Trans } from "react-i18next"

interface IProps extends Partial<IconButtonProps> {}

export function BrowserSearchPrompt({ ...buttonProps }: IProps) {
  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <IconButton
          variant="ghost"
          color="white"
          aria-label="search-help"
          icon={<MagnifyingGlass size={16} />}
          {...buttonProps}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody color="text.primary" fontSize="sm">
          <VStack>
            <Text>{t("permitApplication.browserSearch.prompt")}</Text>
            <VStack spacing={1}>
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
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
