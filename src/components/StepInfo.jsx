import { useState } from 'react'

const BUSINESS_TYPES = [
  'Dog Training Facility',
  'Dog Bar / Restaurant',
  'Dog Park',
  'Doggy Daycare',
  'Pet Store / Supply',
  'Boarding / Kennel',
  'Grooming',
  'Veterinary / Clinic',
  'Dog-Friendly Cafe',
  'Other',
]

export default function StepInfo({ formData, setFormData, onNext }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.businessType) {
      newErrors.businessType = 'Please select a business type'
    }
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  return (
    <div className="card">
      <h1 className="card-title">Business Information</h1>
      <p className="card-subtitle">Tell us about your location so we can set it up correctly.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Business Name</label>
          <input
            type="text"
            className={`form-input ${errors.businessName ? 'error' : ''}`}
            placeholder="e.g., Happy Paws Daycare"
            value={formData.businessName}
            onChange={handleChange('businessName')}
          />
          {errors.businessName && <p className="form-error">{errors.businessName}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Full Address</label>
          <input
            type="text"
            className={`form-input ${errors.address ? 'error' : ''}`}
            placeholder="e.g., 123 Main St, Austin, TX 78701"
            value={formData.address}
            onChange={handleChange('address')}
          />
          <p className="form-hint">Include street, city, state, and zip code for accurate map location</p>
          {errors.address && <p className="form-error">{errors.address}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Business Type</label>
          <select
            className={`form-select ${errors.businessType ? 'error' : ''}`}
            value={formData.businessType}
            onChange={handleChange('businessType')}
          >
            <option value="">Select a type...</option>
            {BUSINESS_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.businessType && <p className="form-error">{errors.businessType}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Contact Email <span className="optional">(optional)</span></label>
          <input
            type="email"
            className={`form-input ${errors.contactEmail ? 'error' : ''}`}
            placeholder="you@example.com"
            value={formData.contactEmail}
            onChange={handleChange('contactEmail')}
          />
          {errors.contactEmail && <p className="form-error">{errors.contactEmail}</p>}
        </div>

        <div className="btn-row">
          <button type="submit" className="btn btn-primary">
            Next: Draw Boundary
          </button>
        </div>
      </form>
    </div>
  )
}
