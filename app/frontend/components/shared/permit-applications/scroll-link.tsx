import { Link } from "@chakra-ui/react"
import React from "react"

interface ScrollLinkProps {
  to: string
  children: React.ReactNode
  [key: string]: any
}

export const ScrollLink: React.FC<ScrollLinkProps> = ({ to, children, ...props }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    const targetElement = document.getElementById(to)
    if (targetElement) {
      // Scroll to the target element
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" })

      // Focus the target element
      targetElement.tabIndex = -1 // Ensure the element can be focused
      targetElement.focus()

      // Focus on the target form control if present
      const id = targetElement.querySelector("label.col-form-label")?.getAttribute("for")
      const formControlElement = id ? document.getElementById(id) : null
      formControlElement?.focus?.()

      targetElement.addEventListener("blur", () => {
        targetElement.removeAttribute("tabIndex") // Removes the tabIndex attribute, returning it to its default behavior
      })
    }
  }

  return (
    <Link href={`#${to}`} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
