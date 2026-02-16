  import { useState } from 'react'
  import Steps from './components/Steps'
  import StepInfo from './components/StepInfo'
  import StepDraw from './components/StepDraw'
  import StepReview from './components/StepReview'

  const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
  const ACCESS_PASSWORD = import.meta.env.VITE_ACCESS_PASSWORD || 'fipartner2024'

  export default function App() {
    const [authenticated, setAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState(false)

    const [step, setStep] = useState(1)
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
      businessName: '',
      address: '',
      businessType: '',
      contactEmail: '',
    })

    const [polygonData, setPolygonData] = useState({
      points: [],
      boundary: null,
      position: '',
      centerLat: null,
      centerLng: null,
    })

    const handleNext = () => setStep(s => s + 1)
    const handleBack = () => setStep(s => s - 1)

    const handleSubmit = async () => {
      setSubmitting(true)

      const payload = {
        businessName: formData.businessName,
        address: formData.address,
        businessType: formData.businessType,
        contactEmail: formData.contactEmail,
        centerLat: polygonData.centerLat?.toFixed(8) || '',
        centerLng: polygonData.centerLng?.toFixed(8) || '',
        position: polygonData.position,
        pointCount: polygonData.points.length,
        boundary: JSON.stringify(polygonData.boundary),
        submittedAt: new Date().toISOString(),
      }

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        setSubmitted(true)
      } catch (err) {
        console.error('Submit error:', err)
        setSubmitted(true)
      } finally {
        setSubmitting(false)
      }
    }

    const handlePasswordSubmit = (e) => {
      e.preventDefault()
      if (password === ACCESS_PASSWORD) {
        setAuthenticated(true)
        setPasswordError(false)
      } else {
        setPasswordError(true)
      }
    }

    if (!authenticated) {
      return (
        <div className="container">
          <div className="card">
            <h1 className="card-title">Partner Access</h1>
            <p className="card-subtitle">Enter the access code provided in your email to continue.</p>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Access Code</label>
                <input
                  type="password"
                  className={`form-input ${passwordError ? 'error' : ''}`}
                  placeholder="Enter access code"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError(false)
                  }}
                  autoFocus
                />
                {passwordError && <p className="form-error">Invalid access code. Please check your email and try again.</p>}
              </div>

              <div className="btn-row">
                <button type="submit" className="btn btn-primary">
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    }

    if (submitted) {
      return (
        <div className="container">
          <div className="card success-screen">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="success-title">You're all set!</h1>
            <p className="success-message">
              Thanks for submitting your location boundary. Our team will review it and add your location to the system shortly.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="container">
        <Steps currentStep={step} />

        {step === 1 && (
          <StepInfo
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
          />
        )}

        {step === 2 && (
          <StepDraw
            address={formData.address}
            polygonData={polygonData}
            setPolygonData={setPolygonData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <StepReview
            formData={formData}
            polygonData={polygonData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            submitting={submitting}
          />
        )}
      </div>
    )
  }
