require "rails_helper"

RSpec.describe JurisdictionEnablementEvent do
  it "records an observed event when inbox_enabled changes" do
    jurisdiction = create(:sub_district)

    expect { jurisdiction.update!(inbox_enabled: false) }.to change {
      jurisdiction.jurisdiction_enablement_events.observed.count
    }.by(1)

    event = jurisdiction.jurisdiction_enablement_events.observed.last
    expect(event.enabled).to eq(false)
    expect(event.inbox?).to eq(true)
  end
end
