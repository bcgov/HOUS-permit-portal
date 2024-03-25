import { Link } from "@chakra-ui/react"
import React from "react"

export const ScrollLink = ({ to, children, ...props }) => {
  const handleClick = (event) => {
    event.preventDefault()
    const targetElement = document.getElementById(to)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
      const id = targetElement.querySelector("label.col-form-label")?.getAttribute("for")
      const formControlElement = document.getElementById(id)
      if (formControlElement?.focus && typeof formControlElement.focus === "function") {
        formControlElement.focus()
      }
    }
  }

  return (
    <Link href={`#${to}`} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
