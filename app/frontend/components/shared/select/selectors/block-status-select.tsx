import { Button, HStack, Menu, Portal, Text } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import { EPermitBlockStatus } from "../../../../types/enums"

interface IProps {
  value: EPermitBlockStatus | undefined
  onChange: (value: EPermitBlockStatus) => void
  isTriggerDisabled?: boolean
  isSelectionDisabled?: boolean
}

const statuses = Object.values(EPermitBlockStatus)

const statusColors = {
  [EPermitBlockStatus.draft]: "greys.grey03",
  [EPermitBlockStatus.inProgress]: "semantic.warningLight",
  [EPermitBlockStatus.ready]: "semantic.successLight",
}

export const BlockStatusSelect = observer(function BlockStatusSelect({
  value = EPermitBlockStatus.draft,
  onChange,
  isSelectionDisabled,
  isTriggerDisabled,
}: IProps) {
  const { t } = useTranslation()
  const btnRef = useRef<HTMLButtonElement>()
  const getLabel = (status: EPermitBlockStatus | undefined) =>
    t(`permitCollaboration.blockStatus.${status || EPermitBlockStatus.draft}`)
  const uniqueId = useMemo(uuidv4, [])
  const selectId = `block-status-select-${uniqueId}`
  const labelId = `block-status-select-label-${uniqueId}`

  return (
    <HStack>
      <Text
        id={labelId}
        fontWeight={400}
        textTransform={"uppercase"}
        fontSize={"0.625rem"}
        color={"text.secondary"}
        asChild
      >
        <label htmlFor={selectId} onClick={() => btnRef.current?.focus()}>
          {t("permitCollaboration.status")}
        </label>
      </Text>
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button
            id={selectId}
            ref={btnRef}
            aria-labelledby={labelId}
            aria-haspopup={"listbox"}
            fontSize={"sm"}
            lineHeight="27px"
            borderRadius="sm"
            px={2}
            py={0}
            h={"fit-content"}
            border={"1px solid"}
            borderColor="border.base"
            bg={statusColors[value]}
            css={{
              "& &:focus": { borderColor: "focus" },
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={isTriggerDisabled}
          >
            {getLabel(value)}
            <CaretDown />
          </Button>
        </Menu.Trigger>
        <Portal>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {statuses.map((status) => (
                  <Menu.Item
                    key={status}
                    fontSize={"sm"}
                    role={"option"}
                    _focus={{ bg: "semantic.infoLight" }}
                    bg={statusColors[status]}
                    onSelect={() => onChange(status)}
                    aria-selected={value === status}
                    p={2}
                    disabled={isSelectionDisabled}
                    value="item-0"
                  >
                    {getLabel(status)}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Portal>
      </Menu.Root>
    </HStack>
  )
})
