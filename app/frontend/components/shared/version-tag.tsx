import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { formatTemplateVersion } from "../../utils/utility-functions"

export function VersionTag({ versionDate, ...rest }: { versionDate: Date } & Partial<TagProps>) {
  return (
    <Tag bg={"greys.grey03"} color={"text.secondary"} fontSize={"xs"} {...rest}>
      {formatTemplateVersion(versionDate)}
    </Tag>
  )
}
