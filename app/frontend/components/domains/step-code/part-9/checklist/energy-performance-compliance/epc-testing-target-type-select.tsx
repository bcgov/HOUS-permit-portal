import { InputGroup } from "@/components/ui/input-group"
import { Flex, Input, InputElement, Popover, VStack } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../../../setup/root"
import { EStepCodeEPCTestingTargetType } from "../../../../../../types/enums"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EStepCodeEPCTestingTargetType
}

export const EPCTestingTargetTypeSelect = observer(function EPCTestingTargetTypeSelect({ onChange, value }: IProps) {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()

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
                <InputGroup w={320}>
                  <Input
                    bg="white"
                    cursor="pointer"
                    alignItems="center"
                    borderColor="gray.200"
                    borderWidth={1}
                    rounded="base"
                    shadow="base"
                    asChild
                  >
                    <Flex>
                      {value
                        ? t(`${i18nPrefix}.epcTestingTargetType.options.${value}`)
                        : t(`${i18nPrefix}.epcTestingTargetType.select`)}
                    </Flex>
                  </Input>
                  <InputElement placement="end" children={<CaretDown color="gray.300" />} />
                </InputGroup>
              </Popover.Trigger>
              <Popover.Positioner>
                <Popover.Content minW={320}>
                  <VStack align="start" gap={0}>
                    {selectOptions.epcTestingTargetTypes.map((value) => (
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
                        {t(`${i18nPrefix}.epcTestingTargetType.options.${value}`)}
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
})
