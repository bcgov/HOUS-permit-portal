import { useEffect, useRef } from "react"
import { useMst } from "../setup/root"

export const useJiraCollector = (isActive: boolean = true) => {
  const { sessionStore, userStore } = useMst()
  const { loggedIn } = sessionStore
  const { currentUser } = userStore
  const showCollectorDialogRef = useRef<(() => void) | null>(null)

  // Build user context string
  const buildUserContext = () => {
    const userContext = [
      `Submitted from: ${window.location.href}`,
      `User Agent: ${navigator.userAgent}`,
      loggedIn ? `Logged in: Yes` : `Logged in: No`,
    ]

    if (loggedIn && currentUser) {
      userContext.push(`User ID: ${currentUser.id}`)
      if (currentUser.email) {
        userContext.push(`User Email: ${currentUser.email}`)
      }
      if (currentUser.name) {
        userContext.push(`User Name: ${currentUser.name}`)
      }
    }

    return userContext.join("\n") + "\n\n"
  }

  // Load Jira collector script when active
  useEffect(() => {
    if (isActive) {
      loadJiraCollector()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, loggedIn, currentUser?.id])

  const loadJiraCollector = () => {
    const scriptSrc = import.meta.env.VITE_JIRA_COLLECTOR_SCRIPT_SRC
    if (!scriptSrc) {
      return // Environment variable not set, skip loading
    }

    // Check if script already exists
    if (!document.getElementById("jira-collector-script")) {
      // Set ATL_JQ_PAGE_PROPS BEFORE loading the script
      // The Jira collector script reads this when it initializes
      console.log("[COLLECTOR] Setting ATL_JQ_PAGE_PROPS before loading script")
      ;(window as Window).ATL_JQ_PAGE_PROPS = {
        triggerFunction: function (showCollectorDialog: () => void) {
          console.log("[COLLECTOR] triggerFunction called", showCollectorDialog)
          showCollectorDialogRef.current = showCollectorDialog
        },
        fieldValues: {
          description: buildUserContext(),
        },
      }

      const script = document.createElement("script")
      script.id = "jira-collector-script"
      script.type = "text/javascript"

      script.onload = () => {
        console.log("[COLLECTOR] Jira collector script loaded successfully")
        console.log("[COLLECTOR] jQuery available?", typeof (window as any).jQuery !== "undefined")
        console.log("[COLLECTOR] ATL_JQ_PAGE_PROPS after load:", (window as Window).ATL_JQ_PAGE_PROPS)

        // Check if the script actually initialized anything
        setTimeout(() => {
          console.log(
            "[COLLECTOR] Checking state 1 second after load - showCollectorDialogRef:",
            showCollectorDialogRef.current !== null
          )
        }, 1000)
      }

      script.onerror = () => {
        console.warn("Failed to load Jira collector script")
      }

      script.src = scriptSrc
      document.head.appendChild(script)
    } else {
      // Script already loaded, update context
      if ((window as Window).ATL_JQ_PAGE_PROPS) {
        ;(window as Window).ATL_JQ_PAGE_PROPS.fieldValues = {
          description: buildUserContext(),
        }
      }
    }
  }

  const openFeedbackCollector = (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault()
    const scriptSrc = import.meta.env.VITE_JIRA_COLLECTOR_SCRIPT_SRC

    if (!scriptSrc) {
      // Fallback to email if collector script not configured
      window.location.href = "mailto:digital.codes.permits@gov.bc.ca?subject=Building Permit Hub Feedback"
      return
    }

    // Check if dialog function is available (set by triggerFunction callback)
    if (showCollectorDialogRef.current) {
      showCollectorDialogRef.current()
    } else {
      // Fallback to email if collector hasn't initialized yet or failed to load
      window.location.href = "mailto:digital.codes.permits@gov.bc.ca?subject=Building Permit Hub Feedback"
    }
  }

  return { openFeedbackCollector, loadJiraCollector }
}
