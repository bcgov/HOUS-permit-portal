import { Link } from "@chakra-ui/react"
import React from "react"

export const ScrollLink = ({ to, children, ...props }) => {
  const handleClick = (event) => {
    event.preventDefault()
    const targetElement = document.getElementById(to)

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <Link href={`#${to}`} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
