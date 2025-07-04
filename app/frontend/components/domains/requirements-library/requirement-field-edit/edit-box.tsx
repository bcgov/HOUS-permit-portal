import { Box, BoxProps, Button, Flex, useDisclosure } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface IEditBoxProps {
  label: string
  helperText?: string
  children: ReactNode
}

export function EditBox({ label, helperText, children, ...rest }: IEditBoxProps & BoxProps) {
  const { isOpen, onToggle } = useDisclosure()
  const { t } = useTranslation()

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} {...rest}>
      <Flex justify="space-between" align="center">
        <Box>
          <Box fontWeight="semibold">{label}</Box>
          {helperText && <Box color="gray.500">{helperText}</Box>}
        </Box>
        <Button onClick={onToggle}>{isOpen ? t("common.buttons.cancel") : t("common.buttons.edit")}</Button>
      </Flex>
      {isOpen && <Box mt={4}>{children}</Box>}
    </Box>
  )
}
