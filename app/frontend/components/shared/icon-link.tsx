import { Link, VisuallyHidden } from "@chakra-ui/react"
import { Icon as IIcon } from "@phosphor-icons/react"
import React from "react"
import { LinkProps } from "react-router-dom"

interface IProps extends Partial<LinkProps> {
  accessibleText: string
  href: string
  Icon: IIcon
}

export function IconLink({ accessibleText, href, Icon, ...linkProps }: IProps) {
  return (
    <Link href={href} {...linkProps}>
      <Icon aria-hidden={true} />
      <VisuallyHidden>{accessibleText}</VisuallyHidden>
    </Link>
  )
}
