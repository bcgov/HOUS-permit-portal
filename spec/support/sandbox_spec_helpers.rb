module SandboxSpecHelpers
  # A jurisdiction already has a published sandbox. create(:sandbox) on that
  # jurisdiction fails the scope uniqueness check.
  def published_sandbox(jurisdiction = nil)
    (jurisdiction || create(:sub_district)).sandboxes.published.first
  end
end
