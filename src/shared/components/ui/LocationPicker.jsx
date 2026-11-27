// ═══════════ منتقي الموقع — React Leaflet + OpenStreetMap + Geolocation API ═══════════
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// إصلاح مسارات أيقونة Leaflet الافتراضية مع Vite
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const DEFAULT_CENTER = [15.3694, 44.191] // صنعاء
const round = (n) => Number(n.toFixed(6))

function PickHandler({ onPick, keyboardLabel, keyboardDescriptionId }) {
  const map = useMapEvents({
    click: (e) => onPick(round(e.latlng.lat), round(e.latlng.lng)),
    keydown: (e) => {
      const event = e.originalEvent
      if (!keyboardLabel || event.key !== 'Enter' || event.target !== map.getContainer()) return
      event.preventDefault()
      const { lat, lng } = map.getCenter()
      onPick(round(lat), round(lng))
    },
  })

  useEffect(() => {
    if (!keyboardLabel) return
    const container = map.getContainer()
    container.setAttribute('role', 'region')
    container.setAttribute('aria-label', keyboardLabel)
    if (keyboardDescriptionId) container.setAttribute('aria-describedby', keyboardDescriptionId)
  }, [map, keyboardLabel, keyboardDescriptionId])

  return null
}

function Recenter({ position }) {
  const map = useMap()
  const key = position ? `${position[0]},${position[1]}` : ''
  const last = useRef('')

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => map.invalidateSize({ debounceMoveend: true }))
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])

  useEffect(() => {
    if (position && key !== last.current) {
      last.current = key
      map.setView(position, Math.max(map.getZoom(), 16))
    }
  }, [key, position, map])
  return null
}

export default function LocationPicker({
  lat,
  lng,
  accuracy,
  onChange,
  readOnly = false,
  height = 320,
  initialCenter = DEFAULT_CENTER,
  initialZoom = 6,
  keyboardLabel,
  keyboardDescriptionId,
}) {
  const position = lat != null && lng != null ? [lat, lng] : null
  const interactive = !readOnly && typeof onChange === 'function'

  return (
    <div className="rounded-[8px] overflow-hidden border border-[#D2D6DB] relative z-0" style={{ height }} dir="ltr">
      <MapContainer
        center={position || initialCenter}
        zoom={position ? 16 : initialZoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {interactive && (
          <PickHandler onPick={onChange} keyboardLabel={keyboardLabel} keyboardDescriptionId={keyboardDescriptionId} />
        )}
        <Recenter position={position} />
        {position && accuracy != null && <Circle center={position} radius={accuracy} pathOptions={{ weight: 1, color: '#1B8354' }} />}
        {position && (
          <Marker
            position={position}
            icon={pinIcon}
            draggable={interactive}
            eventHandlers={
              interactive
                ? {
                    dragend: (e) => {
                      const p = e.target.getLatLng()
                      onChange(round(p.lat), round(p.lng))
                    },
                  }
                : undefined
            }
          />
        )}
      </MapContainer>
    </div>
  )
}
