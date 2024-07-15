class StepCode::Compliance::ProposeStep::Base
  attr_accessor :step, :final_step_reached
  attr_reader :checklist, :min_required_step

  def initialize(checklist:, min_required_step:)
    @checklist = checklist
    @min_required_step = min_required_step
  end

  def call
    self.final_step_reached = false
    self.step = min_required_step || min_step

    until final_step_reached || step > max_step
      if requirements_met?
        self.step += 1
      else
        self.step = nil unless min_requirement_met?
        self.final_step_reached = true
      end
    end
    self.step = step - 1 if min_requirement_met?
    return self
  end

  private

  def min_requirement_met?
    step && step > (min_required_step || min_step)
  end

  def requirements_met?
    checkers.all? { |c| self.send(c).requirements_met? }
  end

  def min_step
    raise NotImplementedError, "#{__method__} is not implemented"
  end

  def max_step
    raise NotImplementedError, "#{__method__} is not implemented"
  end

  def checkers
    raise NotImplementedError, "#{__method__} is not implemented"
  end
end
