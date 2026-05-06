import { InputGroup } from "@/components/ui/input-group"
import { Flex, Input, InputElement, Popover, VStack } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../setup/root"
import { EStepCodeCompliancePath } from "../../../../types/enums"

interface IProps {
  onChange: (event: any) => void
  value: EStepCodeCompliancePath
}

export const CompliancePathSelect = observer(function CompliancePathSelect({ onChange, value }: IProps) {
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
                <InputGroup w={"full"}>
                  <Input
                    bg="white"
                    pointerEvents="none"
                    cursor="pointer"
                    alignItems="center"
                    borderColor="gray.200"
                    borderWidth={1}
                    rounded="base"
                    readOnly
                    shadow="base"
                    placeholder={t("stepCode.import.compliancePath.select")}
                    value={value ? t(`stepCode.import.compliancePath.options.${value}`) : ""}
                  />
                  <InputElement placement="end" children={<CaretDown color="gray.300" />} pointerEvents={"none"} />
                </InputGroup>
              </Popover.Trigger>
              <Popover.Positioner>
                <Popover.Content>
                  <VStack align="start" gap={0}>
                    {selectOptions.compliancePaths.map((path) => (
                      <Flex
                        key={path}
                        onClick={() => {
                          onChange(path)
                          onClose()
                        }}
                        px={2}
                        py={1.5}
                        w="full"
                        cursor="pointer"
                        _hover={{ bg: "hover.blue" }}
                      >
                        {t(`stepCode.import.compliancePath.options.${path}`)}
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
