import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

export default function StepDraw({ address, polygonData, setPolygonData, onNext, onBack }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const pointMarkersRef = useRef([])
  const previewLayerRef = useRef(null)
  const savedPolygonRef = useRef(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState(polygonData.points || [])
  const [isSaved, setIsSaved] = useState(polygonData.points.length >= 3)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState(null)

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [39.8283, -98.5795], // Center of US
      zoom: 4,
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

    mapInstanceRef.current = map

    // Geocode the address
    geocodeAddress(address, map)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Geocode address
  const geocodeAddress = async (addr, map) => {
    setGeocoding(true)
    setGeocodeError(null)

    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1`
      )
      const data = await resp.json()

      if (data.length > 0) {
        const { lat, lon } = data[0]
        map.flyTo([parseFloat(lat), parseFloat(lon)], 19, { duration: 1.5 })
      } else {
        setGeocodeError('Could not find that address. Please try a more specific address or zoom/pan to your location manually.')
      }
    } catch (err) {
      console.error('Geocode error:', err)
      setGeocodeError('Could not geocode address. Please zoom to your location manually.')
    } finally {
      setGeocoding(false)
    }
  }

  // Handle map clicks when drawing
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const handleClick = (e) => {
      if (!isDrawing) return
      const { lat, lng } = e.latlng
      setPoints(prev => [...prev, [lat, lng]])
    }

    map.on('click', handleClick)
    return () => map.off('click', handleClick)
  }, [isDrawing])

  // Update map markers and preview
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers
    pointMarkersRef.current.forEach(m => m.remove())
    pointMarkersRef.current = []

    // Clear preview
    if (previewLayerRef.current) {
      previewLayerRef.current.remove()
      previewLayerRef.current = null
    }

    // Clear saved polygon if we're redrawing
    if (savedPolygonRef.current && !isSaved) {
      savedPolygonRef.current.remove()
      savedPolygonRef.current = null
    }

    // Add point markers
    points.forEach((point, i) => {
      const isFirst = i === 0
      const marker = L.circleMarker(point, {
        radius: 8,
        fillColor: isFirst ? '#16a34a' : '#2563eb',
        color: 'white',
        weight: 2,
        fillOpacity: 1,
      }).addTo(map)
      pointMarkersRef.current.push(marker)
    })

    // Draw preview
    if (points.length >= 2 && !isSaved) {
      if (points.length === 2) {
        // Just a line
        previewLayerRef.current = L.polyline(points, {
          color: '#2563eb',
          weight: 2,
          dashArray: '5, 5',
        }).addTo(map)
      } else {
        // Polygon preview
        previewLayerRef.current = L.polygon(points, {
          color: '#2563eb',
          weight: 2,
          dashArray: '5, 5',
          fillColor: '#2563eb',
          fillOpacity: 0.1,
        }).addTo(map)
      }
    }
  }, [points, isSaved])

  // Draw saved polygon
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isSaved || points.length < 3) return

    if (savedPolygonRef.current) {
      savedPolygonRef.current.remove()
    }

    savedPolygonRef.current = L.polygon(points, {
      color: '#16a34a',
      weight: 3,
      fillColor: '#16a34a',
      fillOpacity: 0.2,
    }).addTo(map)
  }, [isSaved, points])

  // Update cursor
  useEffect(() => {
    const container = mapRef.current
    if (container) {
      container.style.cursor = isDrawing ? 'crosshair' : ''
    }
  }, [isDrawing])

  const handleStartDrawing = () => {
    setIsDrawing(true)
    setIsSaved(false)
    setPoints([])
    setPolygonData({
      points: [],
      boundary: null,
      position: '',
      centerLat: null,
      centerLng: null,
    })
  }

  const handleUndo = () => {
    setPoints(prev => prev.slice(0, -1))
  }

  const handleDone = () => {
    if (points.length < 3) return

    setIsDrawing(false)
    setIsSaved(true)

    // Calculate center
    const centerLat = points.reduce((s, p) => s + p[0], 0) / points.length
    const centerLng = points.reduce((s, p) => s + p[1], 0) / points.length

    // Build GeoJSON (convert lat,lng to lng,lat)
    const coordinates = points.map(p => [p[1], p[0]])
    coordinates.push(coordinates[0]) // Close the ring
    const boundary = { type: 'Polygon', coordinates: [coordinates] }

    const position = `(${centerLng.toFixed(8)},${centerLat.toFixed(8)})`

    setPolygonData({
      points,
      boundary,
      position,
      centerLat,
      centerLng,
    })
  }

  const handleRedraw = () => {
    handleStartDrawing()
  }

  const canProceed = isSaved && points.length >= 3

  return (
    <div className="card">
      <h1 className="card-title">Draw Your Boundary</h1>
      <p className="card-subtitle">Click around your property to draw its boundary. Include any outdoor areas like patios or yards.</p>

      {geocoding && (
        <div className="loading">
          <div className="spinner" />
          <span>Finding your address...</span>
        </div>
      )}

      {geocodeError && (
        <div className="map-instructions" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }}>
          {geocodeError}
        </div>
      )}

      {!isDrawing && !isSaved && (
        <div className="map-instructions">
          Click "Start Drawing" then click on the map to place points around your property boundary.
        </div>
      )}

      {isDrawing && (
        <div className="map-instructions">
          Click on the map to add points. You need at least 3 points. Click "Done" when finished.
        </div>
      )}

      <div ref={mapRef} className="map-container" />

      <div className="drawing-controls">
        {!isDrawing && !isSaved && (
          <button className="btn btn-primary btn-sm" onClick={handleStartDrawing}>
            Start Drawing
          </button>
        )}

        {isDrawing && (
          <>
            <button className="btn btn-outline btn-sm" onClick={handleUndo} disabled={points.length === 0}>
              Undo
            </button>
            <button className="btn btn-success btn-sm" onClick={handleDone} disabled={points.length < 3}>
              Done
            </button>
          </>
        )}

        {isSaved && (
          <button className="btn btn-outline btn-sm" onClick={handleRedraw}>
            Redraw
          </button>
        )}

        <span className="point-count">
          {points.length} point{points.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn btn-primary" onClick={onNext} disabled={!canProceed}>
          Next: Review
        </button>
      </div>
    </div>
  )
}
