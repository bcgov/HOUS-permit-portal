import { MutableRefObject, useEffect, useState } from "react"
import { FORMIO_DATA_CLASS_PREFIX } from "../../../../../constants/formio-constants"
import { IRequirementBlockAssignmentNode } from "../block-collaborator-assignment-management"

interface IProps {
  formRef: MutableRefObject<any>
}

export function useCollaborationAssignmentNodes({ formRef }: IProps) {
  const [requirementBlockAssignmentNodes, setRequirementBlockAssignmentNodes] = useState<
    Array<IRequirementBlockAssignmentNode>
  >([])

  useEffect(() => {
    if (!formRef.current?.element) {
      return
    }

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type !== "childList") {
          continue
        }
        // @ts-ignore
        const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes]

        const anyPaneNodeChanged = changedNodes.some((node) => {
          return node.classList?.contains("formio-component-panel")
        })

        if (!anyPaneNodeChanged) {
          continue
        }

        updateRequirementBlockAssignmentNode()
      }
    })

    // Start observing
    observer.observe(formRef.current.element, {
      childList: true,
      subtree: true,
    })
    //
    // Cleanup function to disconnect the observer
    return () => {
      observer.disconnect()
    }
  }, [formRef.current])

  function updateRequirementBlockAssignmentNode() {
    const accordionNodes = document.querySelectorAll<HTMLDivElement>(".formio-component-panel")

    const updatedRequirementBlockAssignmentNodes: Array<IRequirementBlockAssignmentNode> = Array.from(accordionNodes)
      .filter((node) => {
        return (
          node.querySelector(".card-title") &&
          Array.from(node.classList).find((c) => c.startsWith(FORMIO_DATA_CLASS_PREFIX))
        )
      })
      .map((node) => {
        const titleNode = node.querySelector<HTMLElement>(".card-title")
        const requirementBlockId = Array.from(node.classList)
          .find((c) => c.startsWith(FORMIO_DATA_CLASS_PREFIX))
          .split("|RB")
          .at(-1)

        return {
          requirementBlockId,
          panelNode: node,
          attachmentNode: titleNode,
        }
      })

    setRequirementBlockAssignmentNodes(updatedRequirementBlockAssignmentNodes)
  }

  return { requirementBlockAssignmentNodes, updateRequirementBlockAssignmentNode }
}
