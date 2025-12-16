import { Instance, types } from "mobx-state-tree"

export const PdfFormModel = types.model("PdfFormModel", {
  id: types.identifier,
  userId: types.string,
  formType: types.string,
  formJson: types.frozen(),
  status: types.boolean,
  createdAt: types.maybe(types.Date),
  pdfFileData: types.maybeNull(types.frozen()),
})

export interface IPdfForm extends Instance<typeof PdfFormModel> {}
