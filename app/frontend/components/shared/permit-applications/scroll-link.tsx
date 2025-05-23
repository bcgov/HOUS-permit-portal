import { Link } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"

interface ScrollLinkProps {
  to: string
  children: React.ReactNode
  [key: string]: any
}

export const ScrollLink: React.FC<ScrollLinkProps> = observer(({ to, children, ...props }) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const findElement = () => {
      let element = document.getElementById(to)
      if (!element) {
        const classElements = document.getElementsByClassName(to)
        if (classElements.length > 0) {
          element = classElements[0] as HTMLElement
        }
      }
      setTargetElement(element)
    }

    findElement() // Initial attempt to find the element

    // Observe DOM changes to find the element if it appears later
    const observer = new MutationObserver(findElement)
    observer.observe(document.body, { childList: true, subtree: true })

    // Cleanup function to disconnect the observer
    return () => {
      observer.disconnect()
    }
  }, [to])

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    let targetElement = document.getElementById(to)
    // If no element found by ID, try finding by class
    if (!targetElement) {
      const classElements = document.getElementsByClassName(to)
      if (classElements.length > 0) {
        targetElement = classElements[0] as HTMLElement
      }
    }
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

      const handleBlur = () => {
        // Removes the tabIndex attribute, returning it to its default behavior
        targetElement.removeAttribute("tabIndex")
        // Clean up the event listener
        targetElement.removeEventListener("blur", handleBlur)
      }

      targetElement.addEventListener("blur", handleBlur)
    }
  }

  return (
    <Link
      href={targetElement ? `#${to}` : undefined}
      onClick={handleClick}
      color={targetElement ? "text.link" : "text.secondary"}
      textDecoration={targetElement ? "underline" : "line-through"}
      _hover={{
        color: targetElement ? undefined : "text.secondary",
        cursor: targetElement ? undefined : "not-allowed",
      }}
      {...props}
    >
      {children}
    </Link>
  )
})
