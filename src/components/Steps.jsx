export default function Steps({ currentStep }) {
  return (
    <div className="steps-indicator">
      {[1, 2, 3].map(step => (
        <div
          key={step}
          className={`step-dot ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
        />
      ))}
    </div>
  )
}
