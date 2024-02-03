import { Box, BoxProps, HStack, IconButton, IconButtonProps, Text } from "@chakra-ui/react"
import { List as ListIcon } from "@phosphor-icons/react/dist/csr/List"
import { observer } from "mobx-react-lite"
import React from "react"
import { IRequirementBlock } from "../../../../../models/requirement-block"
import { useMst } from "../../../../../setup/root"

export interface IRequirementBlockProps {
  containerProps?: Partial<BoxProps>
  dragHandleProps?: Partial<IconButtonProps>
  requirementBlockId: IRequirementBlock
}

export const RequirementBlock = observer<IRequirementBlockProps, HTMLDivElement>(
  function RequirementBlock({ dragHandleProps, requirementBlockId, containerProps }, ref) {
    const { requirementBlockStore } = useMst()
    const requirementBlock = requirementBlockStore.getRequirementBlockById(requirementBlockId)
    return (
      <Box ref={ref} {...containerProps} bg={"white"}>
        <HStack>
          <IconButton variant={"ghost"} aria-label={"section drag handle"} icon={<ListIcon />} {...dragHandleProps} />
          <Text>{requirementBlock?.displayName}</Text>
        </HStack>
      </Box>
    )
  },
  {
    forwardRef: true,
  }
)
