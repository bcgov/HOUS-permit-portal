import { InputGroup } from "@/components/ui/input-group"
import { Flex, Input, InputElement, Popover, VStack } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"
import {
  EDoorsPerformanceType,
  EHotWaterPerformanceType,
  ESpaceHeatingCoolingPerformanceType,
  EWindowsGlazedDoorsPerformanceType,
} from "../../../../../../../types/enums"
import { i18nPrefix } from "../i18n-prefix"

type TPerformanceType =
  | EWindowsGlazedDoorsPerformanceType
  | EDoorsPerformanceType
  | ESpaceHeatingCoolingPerformanceType
  | EHotWaterPerformanceType

interface IProps {
  onChange: (event: any) => void
  value: TPerformanceType
  options: TPerformanceType[]
}

export const PerformanceTypeSelect = ({ onChange, value, options }: IProps) => {
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
                <InputGroup w={130}>
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
                    <Flex>{value ? t(`${i18nPrefix}.${value}`) : "-"}</Flex>
                  </Input>
                  <InputElement placement="end" children={<CaretDown color="gray.300" />} />
                </InputGroup>
              </Popover.Trigger>
              <Popover.Positioner>
                <Popover.Content w={130}>
                  <VStack align="start" gap={0}>
                    {options.map((value: TPerformanceType) => (
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
                        {t(`${i18nPrefix}.${value}`)}
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
