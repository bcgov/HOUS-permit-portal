import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import { TContactFormData } from "../components/shared/contact/create-edit-contact-modal.js"
import { withEnvironment } from "../lib/with-environment.js"
import { withRootStore } from "../lib/with-root-store.js"
import { IContact, IOption } from "../types/types.js"

// Define the Contact model
export const ContactStoreModel = types
  .model("ContactStore")
  .props({
    isContactsLoading: types.optional(types.boolean, false),
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .actions((self) => ({
    fetchContactOptions: flow(function* fetchContactOptions(query?: string) {
      self.isContactsLoading = true
      const response = yield* toGenerator(self.environment.api.fetchContactOptions(query))
      self.isContactsLoading = false
      return (response?.data?.data ?? []) as IOption<IContact>[]
    }),
    createContact: flow(function* (formData: TContactFormData) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.createContact(formData))

      if (ok) {
        return response.data
      }
    }),
    updateContact: flow(function* (contactId: string, formData: TContactFormData) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.updateContact(contactId, formData))

      if (ok) {
        return response.data
      }
    }),
    destroyContact: flow(function* (contactId: string) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.destroyContact(contactId))

      if (ok) {
        return response.data
      }
    }),
  }))

type ContactKeys = keyof IContact

// If you need to manipulate or use these keys as a constant array in runtime code
export const INPUT_CONTACT_KEYS: ContactKeys[] = [
  "firstName",
  "lastName",
  "title",
  "department",
  "email",
  "phone",
  "cell",
  "address",
  "organization",
  "businessName",
  "businessLicense",
  "professionalAssociation",
  "professionalNumber",
]

export interface IContactStore extends Instance<typeof ContactStoreModel> {}
