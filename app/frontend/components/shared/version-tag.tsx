import { Tag } from "@chakra-ui/react"
import React from "react"
import { formatTemplateVersion } from "../../utils/utility-funcitons"

export function VersionTag({ versionDate }: { versionDate: Date }) {
  return (
    <Tag bg={"greys.grey03"} color={"text.secondary"} fontSize={"xs"}>
      {formatTemplateVersion(versionDate)}
    </Tag>
  )
}
