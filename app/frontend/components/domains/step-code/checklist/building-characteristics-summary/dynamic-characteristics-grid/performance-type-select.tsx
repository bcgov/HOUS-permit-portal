import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
  StackDivider,
  VStack,
} from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"
import {
  EDoorsPerformanceType,
  EHotWaterPerformanceType,
  ESpaceHeatingCoolingPerformanceType,
  EWindowsGlazedDoorsPerformanceType,
} from "../../../../../../types/enums"
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
    <Popover placement="bottom-end">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <InputGroup w={130}>
              <Input
                as={Flex}
                bg="white"
                cursor="pointer"
                alignItems="center"
                borderColor="gray.200"
                borderWidth={1}
                rounded="base"
                shadow="base"
              >
                {value ? t(`${i18nPrefix}.${value}`) : "-"}
              </Input>
              <InputRightElement children={<CaretDown color="gray.300" />} />
            </InputGroup>
          </PopoverTrigger>
          <PopoverContent w={130}>
            <VStack align="start" spacing={0} divider={<StackDivider borderColor="border.light" />}>
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
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
