require 'time'

class Logger
	def initialize()
		@step = 1
  end
  
  def step(msg)
    log("#{@step}: #{msg}")

    @step += 1
  end

  def info(msg)
    log("  - #{msg}")
  end

  def log(msg)
    puts "#{Time.now.utc.iso8601} | #{msg}"
  end
end