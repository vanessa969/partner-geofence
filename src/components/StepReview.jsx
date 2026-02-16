import { useEffect, useRef } from 'react'
import L from 'leaflet'

export default function StepReview({ formData, polygonData, onSubmit, onBack, submitting }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current || !polygonData.points.length) return

    const map = L.map(mapRef.current, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    })

    // Satellite base layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri',
      maxZoom: 20,
    }).addTo(map)

    // Street labels overlay
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      opacity: 0.8,
    }).addTo(map)

    // Draw the polygon
    const polygon = L.polygon(polygonData.points, {
      color: '#16a34a',
      weight: 3,
      fillColor: '#16a34a',
      fillOpacity: 0.2,
    }).addTo(map)

    // Fit map to polygon bounds with padding
    map.fitBounds(polygon.getBounds(), { padding: [30, 30] })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [polygonData.points])

  return (
    <div className="card">
      <h1 className="card-title">Review & Submit</h1>
      <p className="card-subtitle">Please verify your information before submitting.</p>

      <div className="review-grid">
        <div className="review-section">
          <p className="review-label">Business Name</p>
          <p className="review-value">{formData.businessName}</p>
        </div>

        <div className="review-section">
          <p className="review-label">Business Type</p>
          <p className="review-value">{formData.businessType}</p>
        </div>

        <div className="review-section">
          <p className="review-label">Address</p>
          <p className="review-value">{formData.address}</p>
        </div>

        <div className="review-section">
          <p className="review-label">Contact Email</p>
          <p className="review-value">{formData.contactEmail || '(not provided)'}</p>
        </div>
      </div>

      <div className="review-section" style={{ marginTop: '16px' }}>
        <p className="review-label">Your Boundary ({polygonData.points.length} points)</p>
        <div ref={mapRef} className="review-map" />
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack} disabled={submitting}>
          Back
        </button>
        <button className="btn btn-success" onClick={onSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16 }} />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </div>
  )
}
