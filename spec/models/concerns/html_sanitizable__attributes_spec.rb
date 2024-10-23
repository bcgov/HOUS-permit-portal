HtmlSanitizeAttributes

require "rails_helper"

RSpec.describe HtmlSanitizeAttributes do
  class ValidatableModel < ApplicationRecord
    self.table_name = "requirements" # Use an actual table name that matches the fields you'll test
    include HtmlSanitizeAttributes

    validates_rich_text :hint
    sanitizable :label
  end

  describe "validates_rich_text" do
    it "validates a tags" do
      content_invalid =
        "<a href=\"https://www.google.ca\" >GOOGLE</a><span>test</span><a href=\"https://www.google.ca\" />"
      v = ValidatableModel.new(hint: content_invalid)
      expect(v.valid?).to eq true
    end

    it "validates invalid tags" do
      content_invalid = "<span>missing</pan>"
      v = ValidatableModel.new(hint: content_invalid)
      expect(v.valid?).to eq false
      expect(v.errors.full_messages).to include(
        "Hint must be valid rich text html."
      )
    end
  end

  describe "validates via sanitize" do
    it "validates bases on new methods" do
      v = ValidatableModel.new(label: "<span>missing</pan>")
      expect(v.valid?).to eq false
      expect(v.errors.full_messages).to include(
        "Label must be valid rich text html."
      )
    end
  end
end
