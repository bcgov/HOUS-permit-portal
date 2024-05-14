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
import { EFossilFuelsPresence } from "../../../../../../types/enums"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EFossilFuelsPresence
  options: EFossilFuelsPresence[]
}

export const FossilFuelsPresenceSelect = ({ onChange, value, options }: IProps) => {
  return (
    <Popover placement="bottom-end">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <InputGroup w={"full"}>
              <Input
                as={Flex}
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
              >
                {value ? t(`${i18nPrefix}.fossilFuels.${value}`) : t("ui.select")}
              </Input>
              <InputRightElement children={<CaretDown color="gray.300" />} />
            </InputGroup>
          </PopoverTrigger>
          <PopoverContent w={"full"}>
            <VStack align="start" spacing={0} divider={<StackDivider borderColor="border.light" />}>
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
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
