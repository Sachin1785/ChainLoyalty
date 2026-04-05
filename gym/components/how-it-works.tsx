export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Track',
      description: 'Log your workouts with reps, sets, or cardio duration'
    },
    {
      number: '2',
      title: 'Share',
      description: 'Your workout automatically generates a post for friends to see'
    },
    {
      number: '3',
      title: 'Earn',
      description: 'Hit weekly targets and unlock discount codes for the store'
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-foreground mb-4 text-center">How It Works</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          A simple cycle that keeps you motivated and rewarded
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 text-2xl font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
