class StepCode::Compliance::ProposeStep::Base
  attr_accessor :step, :final_step_reached

  MIN_REQUIRED_STEP = 3
  MAX_STEP = 5

  def initialize(checklist:)
    @checklist = checklist
  end

  def call
    self.final_step_reached = false
    self.step = MIN_REQUIRED_STEP

    until final_step_reached || step > MAX_STEP
      if requirements_met?
        self.step += 1
      else
        self.step = nil if step == MIN_REQUIRED_STEP
        self.final_step_reached = true
      end
    end
    self.step = step - 1 if step && step > MIN_REQUIRED_STEP
    return self
  end

  private

  attr_reader :checklist

  def requirements_met?
    checkers.all? { |c| self.send(c).requirements_met? }
  end

  def checkers
    raise NotImplementedError, "#{__method__} is not implemented"
  end
end
