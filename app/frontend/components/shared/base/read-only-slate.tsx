import { Box, BoxProps } from "@chakra-ui/react"
import React, { useMemo } from "react"
import { Descendant, createEditor } from "slate"
import { Editable, Slate, withReact } from "slate-react"

export interface IReadOnlySlateProps extends BoxProps {
  initialValue: Descendant[]
}

export const ReadOnlySlate = ({ initialValue, ...rest }: IReadOnlySlateProps) => {
  const editor = useMemo(() => withReact(createEditor()), [])

  return (
    <Box {...rest}>
      {initialValue && (
        <Slate editor={editor} onChange={() => {}} initialValue={initialValue}>
          <Editable readOnly />
        </Slate>
      )}
    </Box>
  )
}
