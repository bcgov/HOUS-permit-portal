import { InputGroup } from "@/components/ui/input-group"
import { Flex, Input, InputElement, Popover, VStack } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"
import { EFossilFuelsPresence } from "../../../../../../../types/enums"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EFossilFuelsPresence
  options: EFossilFuelsPresence[]
}

export const FossilFuelsPresenceSelect = ({ onChange, value, options }: IProps) => {
  return (
    <Popover.Root
      positioning={{
        placement: "bottom-end",
      }}
    >
      <Popover.Context>
        {({ setOpen: setOpen }) => {
          const onClose = () => setOpen(false)

          return (
            <>
              <Popover.Trigger asChild>
                <InputGroup w={"full"}>
                  <Input
                    minH="var(--input-height)"
                    fontSize="sm"
                    h="auto"
                    bg="white"
                    cursor="pointer"
                    alignItems="center"
                    borderColor="gray.200"
                    borderWidth={1}
                    rounded="base"
                    shadow="base"
                    asChild
                  >
                    <Flex>{value ? t(`${i18nPrefix}.fossilFuels.${value}`) : t("ui.select")}</Flex>
                  </Input>
                  <InputElement placement="end" children={<CaretDown color="gray.300" />} />
                </InputGroup>
              </Popover.Trigger>
              <Popover.Positioner>
                <Popover.Content w={"full"}>
                  <VStack align="start" gap={0}>
                    {options.map((value) => (
                      <Flex
                        key={value}
                        onClick={() => {
                          onChange(value)
                          onClose()
                        }}
                        px={2}
                        py={1.5}
                        w="full"
                        cursor="pointer"
                        _hover={{ bg: "hover.blue" }}
                      >
                        {t(`${i18nPrefix}.fossilFuels.${value}`)}
                      </Flex>
                    ))}
                  </VStack>
                </Popover.Content>
              </Popover.Positioner>
            </>
          )
        }}
      </Popover.Context>
    </Popover.Root>
  )
}
