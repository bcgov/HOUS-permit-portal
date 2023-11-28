import { ToastPositionWithLogical } from "@chakra-ui/react"
import { applySnapshot, Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EFlashMessageStatus } from "../types/enums"

const DEFAULT_STATE = {}

export const FlashMessageModel = types
  .model("FlashMessageModel")
  .props({
    isVisible: types.maybeNull(types.boolean),
    isClosable: types.maybeNull(types.boolean),
    title: types.maybeNull(types.string),
    description: types.maybeNull(types.string),
    status: types.optional(
      types.enumeration<EFlashMessageStatus>(Object.values(EFlashMessageStatus)),
      EFlashMessageStatus.info
    ),
    duration: types.maybeNull(types.number),
    position: types.optional(types.string, "top-right"),
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .views((self) => ({}))
  .actions((self) => ({
    reset() {
      applySnapshot(self, DEFAULT_STATE)
    },
  }))
  .actions((self) => ({
    show(
      status: EFlashMessageStatus,
      title: string | null,
      description: string | null,
      duration: number | null = null,
      isClosable: boolean = true,
      position: ToastPositionWithLogical = "top-right"
    ) {
      const timeout = duration || status == EFlashMessageStatus.error ? 5000 : 2000
      self.status = status
      self.title = title
      self.description = description
      self.isVisible = true
      self.duration = timeout
      self.isClosable = isClosable
      self.position = position

      setTimeout(() => self.reset(), timeout)
    },
  }))

export interface IFlashMessage extends Instance<typeof FlashMessageModel> {}
