class ReleaseNote < ApplicationRecord
  enum :status, { draft: 0, published: 1 }, default: :draft
end
