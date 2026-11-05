require "rails_helper"

RSpec.describe "Search test isolation" do
  it "persists ordinary fixtures without sending indexing requests" do
    expect(Searchkick.client.transport).not_to receive(:perform_request)
    expect {
      create(:requirement_block_with_requirements, requirements_count: 2)
    }.to change(Requirement, :count).by(2)
  end

  it "requires an explicit integration tag for real queries" do
    expect { RequirementBlock.search("*") }.to raise_error(
      /require search: true/
    )
  end

  context "real callbacks", search: true do
    it "indexes a committed record through its application callbacks" do
      block = create(:requirement_block, name: "Indexed through callbacks")
      RequirementBlock.search_index.refresh
      expect(
        RequirementBlock.search("Indexed through callbacks").map(&:id)
      ).to eq([block.id])
    end

    it "begins with an empty index regardless of example order" do
      expect(RequirementBlock.search("*").map(&:id)).to be_empty
      block =
        create(:requirement_block, name: "Second independently indexed record")
      RequirementBlock.search_index.refresh
      expect(RequirementBlock.search("*").map(&:id)).to eq([block.id])
    end
  end
end
