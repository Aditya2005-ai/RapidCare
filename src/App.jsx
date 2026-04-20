/**
 * RapidCare – Emergency Hospital Access System
 * A modern React application for emergency healthcare access in India
 * 
 * Architecture:
 * - Single-file React app with modular component structure
 * - Simulated backend API responses for hospital data
 * - Google Maps-style animated map interface
 * - Emergency search with real-time hospital contact simulation
 * - Bed availability checker with simulated hospital responses
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Bot, Mic, Send, Sparkles, CreditCard, CheckCircle, ShieldAlert } from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet default icons fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Color Palette & Design System ───────────────────────────────────────────
const COLORS = {
  emergency: "#E53935",
  emergencyDark: "#B71C1C",
  emergencyLight: "#FFEBEE",
  healthcare: "#1E88E5",
  healthcareDark: "#1565C0",
  healthcareLight: "#E3F2FD",
  available: "#43A047",
  availableDark: "#2E7D32",
  availableLight: "#E8F5E9",
  warning: "#FB8C00",
  warningLight: "#FFF3E0",
  bg: "#F5F7FA",
  bgDark: "#ECEFF1",
  surface: "#FFFFFF",
  text: "#263238",
  textSecondary: "#546E7A",
  textLight: "#90A4AE",
  border: "#CFD8DC",
};

// ─── Simulated Hospital Database ─────────────────────────────────────────────
const HOSPITAL_DATABASE = [
  {
    id: "h001",
    name: "AIIMS Delhi – Emergency",
    lat: 28.5672, lng: 77.2100,
    distance: 1.2, travelTime: 4,
    rating: 4.8, type: "Government",
    facilities: ["ICU", "Trauma", "Cardiac", "Neuro", "Burns"],
    contact: "+91-11-2658-8500",
    address: "Ansari Nagar East, New Delhi",
    beds: { icu: { total: 80, available: 12 }, ventilator: { total: 40, available: 5 }, oxygen: { total: 120, available: 34 }, general: { total: 300, available: 67 } },
    acceptanceRate: 0.85, avgResponseTime: 2,
    color: "#E53935"
  },
  {
    id: "h002",
    name: "Apollo Hospital Delhi",
    lat: 28.5562, lng: 77.2090,
    distance: 2.8, travelTime: 9,
    rating: 4.9, type: "Private",
    facilities: ["ICU", "Cardiac", "Oncology", "Ortho", "Neuro"],
    contact: "+91-11-2692-5858",
    address: "Sarita Vihar, New Delhi",
    beds: { icu: { total: 60, available: 8 }, ventilator: { total: 30, available: 3 }, oxygen: { total: 100, available: 28 }, general: { total: 250, available: 89 } },
    acceptanceRate: 0.75, avgResponseTime: 3,
    color: "#1E88E5"
  },
  {
    id: "h003",
    name: "Safdarjung Hospital",
    lat: 28.5685, lng: 77.1970,
    distance: 3.5, travelTime: 12,
    rating: 4.2, type: "Government",
    facilities: ["ICU", "Trauma", "Pediatric", "Maternity", "General"],
    contact: "+91-11-2616-5060",
    address: "Safdarjung, New Delhi",
    beds: { icu: { total: 100, available: 18 }, ventilator: { total: 50, available: 11 }, oxygen: { total: 150, available: 45 }, general: { total: 400, available: 123 } },
    acceptanceRate: 0.90, avgResponseTime: 1.5,
    color: "#43A047"
  },
  {
    id: "h004",
    name: "Max Super Speciality",
    lat: 28.5780, lng: 77.2220,
    distance: 5.1, travelTime: 16,
    rating: 4.7, type: "Private",
    facilities: ["ICU", "Cardiac", "Transplant", "Neuro", "Spine"],
    contact: "+91-11-2651-5050",
    address: "Saket, New Delhi",
    beds: { icu: { total: 45, available: 0 }, ventilator: { total: 25, available: 0 }, oxygen: { total: 80, available: 15 }, general: { total: 200, available: 44 } },
    acceptanceRate: 0.60, avgResponseTime: 4,
    color: "#FB8C00"
  },
  {
    id: "h005",
    name: "Fortis Escorts Heart",
    lat: 28.5490, lng: 77.2560,
    distance: 6.3, travelTime: 19,
    rating: 4.6, type: "Private",
    facilities: ["Cardiac", "Cath Lab", "ICU", "CTICU", "Neuro"],
    contact: "+91-11-4713-5000",
    address: "Okhla Road, New Delhi",
    beds: { icu: { total: 55, available: 7 }, ventilator: { total: 28, available: 4 }, oxygen: { total: 90, available: 22 }, general: { total: 180, available: 56 } },
    acceptanceRate: 0.70, avgResponseTime: 3.5,
    color: "#7B1FA2"
  },
  {
    id: "h006",
    name: "RML Hospital",
    lat: 28.6278, lng: 77.2183,
    distance: 7.8, travelTime: 22,
    rating: 4.1, type: "Government",
    facilities: ["Emergency", "Trauma", "ICU", "Surgery", "General"],
    contact: "+91-11-2336-5525",
    address: "Baba Kharak Singh Marg, New Delhi",
    beds: { icu: { total: 70, available: 14 }, ventilator: { total: 35, available: 8 }, oxygen: { total: 130, available: 38 }, general: { total: 350, available: 98 } },
    acceptanceRate: 0.88, avgResponseTime: 2.5,
    color: "#00897B"
  },
];

// ─── Simulated API Layer ──────────────────────────────────────────────────────
const simulateEmergencyRequest = (hospital, radius) => {
  return new Promise((resolve) => {
    const delay = (hospital.avgResponseTime + Math.random() * 2) * 1000;
    setTimeout(() => {
      const accepted = Math.random() < hospital.acceptanceRate && hospital.distance <= radius;
      resolve({ hospitalId: hospital.id, accepted, hospital });
    }, delay);
  });
};

const simulateBedAvailability = (hospital, bedType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const bed = hospital.beds[bedType];
      const available = bed.available > 0;
      const waitTime = available ? 0 : Math.floor(Math.random() * 120) + 15;
      resolve({
        hospitalId: hospital.id,
        bedType,
        available,
        count: bed.available,
        total: bed.total,
        waitTime,
        timestamp: new Date().toISOString(),
      });
    }, 1500 + Math.random() * 1000);
  });
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor", className = "" }) => {
  const icons = {
    emergency: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    hospital: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    location: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    phone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.63 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.54 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    bed: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 4v16"/><path d="M2 8h18a2 2 0 012 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    arrow: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    navigation: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    ambulance: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 17h4V5H3a1 1 0 00-1 1v11"/><path d="M21 17h1a1 1 0 001-1v-4a5 5 0 00-5-5H7"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M7 7h2v4H7zM8 7V5"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    cross: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" className={className}><rect x="10" y="3" width="4" height="18" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/></svg>,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  };
  return icons[name] || null;
};

// ─── Pulse Dot Component (for map) ────────────────────────────────────────────
const PulseDot = ({ color, size = 14 }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    <div style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: color, opacity: 0.3,
      animation: "pulseRing 1.5s ease-out infinite",
      transform: "scale(1)",
    }}/>
    <div style={{
      position: "absolute", inset: 2, borderRadius: "50%",
      background: color,
    }}/>
  </div>
);

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
};

// ─── Animated Map Component ───────────────────────────────────────────────────
const EmergencyMap = ({ hospitals, searchRadius, selectedHospital, onHospitalClick, userLocation }) => {

  const center = userLocation || {
    lat: 28.5672,
    lng: 77.2100
  };

  const selected = hospitals.find(h => h.id === selectedHospital);

  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const hospitalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div style={{ width: "100%", height: "400px", borderRadius: "16px", overflow: "hidden" }}>
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={13} 
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapUpdater center={center} />

        {/* User Location */}
        <Marker position={[center.lat, center.lng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Search Radius */}
        <Circle
          center={[center.lat, center.lng]}
          radius={searchRadius * 1000}
          pathOptions={{
            color: "#E53935",
            fillColor: "#E53935",
            fillOpacity: 0.15,
            weight: 2
          }}
        />

        {/* Hospital Markers */}
        {hospitals.map(h => (
          <Marker
            key={h.id}
            position={[h.lat, h.lng]}
            icon={hospitalIcon}
            eventHandlers={{
              click: () => onHospitalClick(h.id),
            }}
          >
            <Popup>{h.name}</Popup>
          </Marker>
        ))}

        {/* Route (simple line) */}
        {selected && (
          <Polyline 
            positions={[[center.lat, center.lng], [selected.lat, selected.lng]]} 
            pathOptions={{ color: "#1E88E5", weight: 4, dashArray: "10, 10" }} 
          />
        )}
      </MapContainer>
    </div>
  );
};

// ─── Hospital Card Component ──────────────────────────────────────────────────
const HospitalCard = ({ hospital, isAccepted, onSelect, isSelected, compact = false }) => {
  const occupancyColor = (bed) => {
    const pct = bed.available / bed.total;
    if (pct > 0.2) return COLORS.available;
    if (pct > 0.05) return COLORS.warning;
    return COLORS.emergency;
  };

  return (
    <div
      onClick={() => isAccepted && onSelect(hospital.id)}
      style={{
        background: COLORS.surface,
        border: `2px solid ${isSelected ? COLORS.healthcare : isAccepted ? "rgba(67,160,71,0.3)" : "#E0E0E0"}`,
        borderRadius: 16,
        padding: compact ? "12px 16px" : "16px 20px",
        cursor: isAccepted ? "pointer" : "default",
        transition: "all 0.2s",
        boxShadow: isSelected ? `0 4px 20px ${COLORS.healthcare}30` : "0 2px 8px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accepted badge */}
      {isAccepted && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: COLORS.availableLight,
          color: COLORS.availableDark,
          padding: "2px 10px", borderRadius: 20,
          fontSize: 11, fontWeight: 700,
          fontFamily: "'Poppins', sans-serif",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <Icon name="check" size={12} color={COLORS.availableDark}/>
          ACCEPTS
        </div>
      )}

      {/* Hospital color accent */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        background: hospital.color, borderRadius: "16px 0 0 16px",
      }}/>

      <div style={{ paddingLeft: 8 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `${hospital.color}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="cross" size={20} color={hospital.color}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.text, lineHeight: 1.2 }}>
              {hospital.name}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2, fontFamily: "'Inter', sans-serif" }}>
              {hospital.type} • {hospital.address}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, marginBottom: compact ? 0 : 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="location" size={14} color={COLORS.healthcare}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.healthcare, fontFamily: "'Poppins', sans-serif" }}>
              {hospital.distance} km
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="clock" size={14} color={COLORS.warning}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.warning, fontFamily: "'Poppins', sans-serif" }}>
              ~{hospital.travelTime} min
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="star" size={12} color="#FFC107"/>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: "'Poppins', sans-serif" }}>
              {hospital.rating}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="phone" size={14} color={COLORS.available}/>
            <span style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif" }}>
              {hospital.contact}
            </span>
          </div>
        </div>

        {/* Facilities */}
        {!compact && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {hospital.facilities.map(f => (
              <span key={f} style={{
                background: COLORS.healthcareLight, color: COLORS.healthcareDark,
                padding: "2px 8px", borderRadius: 20, fontSize: 11,
                fontFamily: "'Inter', sans-serif", fontWeight: 500,
              }}>{f}</span>
            ))}
          </div>
        )}

        {/* Bed availability mini-summary */}
        {!compact && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(hospital.beds).map(([type, data]) => (
              <div key={type} style={{
                background: COLORS.bg, borderRadius: 8, padding: "4px 8px",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: occupancyColor(data) }}/>
                <span style={{ fontSize: 10, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>
                  {type === "icu" ? "ICU" : type.charAt(0).toUpperCase() + type.slice(1)}: <strong style={{ color: COLORS.text }}>{data.available}</strong>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Select button */}
        {isAccepted && !compact && (
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(hospital.id); }}
            style={{
              marginTop: 12, width: "100%", padding: "10px",
              background: isSelected ? COLORS.healthcare : COLORS.healthcareLight,
              color: isSelected ? "#fff" : COLORS.healthcareDark,
              border: "none", borderRadius: 10, cursor: "pointer",
              fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s",
            }}
          >
            <Icon name="navigation" size={14} color={isSelected ? "#fff" : COLORS.healthcareDark}/>
            {isSelected ? "Selected – View Route" : "Select This Hospital"}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Bed Availability Component ───────────────────────────────────────────────
const BedAvailabilityChecker = ({ hospitals }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedBedType, setSelectedBedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const BED_TYPES = [
    { id: "icu", label: "ICU Bed", icon: "🏥", desc: "Intensive Care Unit" },
    { id: "ventilator", label: "Ventilator", icon: "💨", desc: "Mechanical Ventilation" },
    { id: "oxygen", label: "Oxygen Bed", icon: "🫁", desc: "High-flow Oxygen" },
    { id: "general", label: "General Bed", icon: "🛏", desc: "General Ward" },
  ];

  const checkAvailability = async () => {
    if (!selectedHospital || !selectedBedType) return;
    setLoading(true);
    setResult(null);
    const hospital = hospitals.find(h => h.id === selectedHospital);
    const res = await simulateBedAvailability(hospital, selectedBedType);
    setResult(res);
    setLoading(false);
    setHistory(prev => [{ ...res, hospitalName: hospital.name, bedLabel: BED_TYPES.find(b => b.id === selectedBedType)?.label }, ...prev.slice(0, 4)]);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.text, marginBottom: 6 }}>
          Hospital Availability Checker
        </h3>
        <p style={{ color: COLORS.textSecondary, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          Check real-time bed and resource availability at any hospital
        </p>
      </div>

      {/* Hospital Selection */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13, color: COLORS.text, marginBottom: 8 }}>
          Select Hospital
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {hospitals.map(h => (
            <div key={h.id}
              onClick={() => setSelectedHospital(h.id)}
              style={{
                padding: "12px 16px", borderRadius: 12,
                border: `2px solid ${selectedHospital === h.id ? COLORS.healthcare : COLORS.border}`,
                background: selectedHospital === h.id ? COLORS.healthcareLight : COLORS.surface,
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: h.color }}/>
                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13, color: COLORS.text }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{h.distance} km • {h.type}</div>
                </div>
              </div>
              {selectedHospital === h.id && <Icon name="check" size={16} color={COLORS.healthcare}/>}
            </div>
          ))}
        </div>
      </div>

      {/* Bed Type Selection */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13, color: COLORS.text, marginBottom: 8 }}>
          Resource Type
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {BED_TYPES.map(bt => (
            <div key={bt.id}
              onClick={() => setSelectedBedType(bt.id)}
              style={{
                padding: "12px", borderRadius: 12,
                border: `2px solid ${selectedBedType === bt.id ? COLORS.healthcare : COLORS.border}`,
                background: selectedBedType === bt.id ? COLORS.healthcareLight : COLORS.surface,
                cursor: "pointer", transition: "all 0.2s", textAlign: "center",
              }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{bt.icon}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 12, color: COLORS.text }}>{bt.label}</div>
              <div style={{ fontSize: 10, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif" }}>{bt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Check Button */}
      <button
        onClick={checkAvailability}
        disabled={!selectedHospital || !selectedBedType || loading}
        style={{
          width: "100%", padding: "14px",
          background: selectedHospital && selectedBedType && !loading ? COLORS.healthcare : COLORS.border,
          color: "#fff", border: "none", borderRadius: 12,
          fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15,
          cursor: selectedHospital && selectedBedType && !loading ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s", marginBottom: 16,
        }}>
        {loading ? (
          <>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              animation: "spin 0.8s linear infinite",
            }}/>
            Contacting Hospital...
          </>
        ) : (
          <>
            <Icon name="refresh" size={18} color="#fff"/>
            Check Availability
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div style={{
          padding: 16, borderRadius: 12,
          background: result.available ? COLORS.availableLight : COLORS.emergencyLight,
          border: `2px solid ${result.available ? COLORS.available : COLORS.emergency}`,
          marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {result.available ? (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.available, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" size={14} color="#fff"/>
              </div>
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.emergency, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="x" size={14} color="#fff"/>
              </div>
            )}
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15, color: result.available ? COLORS.availableDark : COLORS.emergencyDark }}>
                {result.available ? `${result.count} Beds Available` : "Currently Unavailable"}
              </div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif" }}>
                {BED_TYPES.find(b => b.id === result.bedType)?.label} • {result.total} total capacity
              </div>
            </div>
          </div>
          {!result.available && result.waitTime > 0 && (
            <div style={{
              padding: "8px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.7)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Icon name="clock" size={14} color={COLORS.warning}/>
              <span style={{ fontSize: 12, fontFamily: "'Inter', sans-serif", color: COLORS.text }}>
                Estimated wait time: <strong>{result.waitTime} minutes</strong>
              </span>
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: 10, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif" }}>
            Last updated: {new Date(result.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 }}>
            Recent Checks
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {history.map((h, i) => (
              <div key={i} style={{
                padding: "8px 12px", borderRadius: 8,
                background: COLORS.bg, display: "flex", alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <span style={{ fontSize: 12, fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: COLORS.text }}>
                    {h.hospitalName.split("–")[0].trim()}
                  </span>
                  <span style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif" }}> • {h.bedLabel}</span>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: h.available ? COLORS.available : COLORS.emergency,
                  fontFamily: "'Poppins', sans-serif",
                }}>
                  {h.available ? `${h.count} avail.` : "Full"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Hospital Dashboard Component (Mock) ─────────────────────────────────────
const HospitalDashboard = ({ pendingRequests, onRespond }) => {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.text, marginBottom: 6 }}>
          Hospital Dashboard
        </h3>
        <p style={{ color: COLORS.textSecondary, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          Manage incoming emergency requests from patients
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Active Requests", value: pendingRequests.length, color: COLORS.emergency },
          { label: "Accepted Today", value: 14, color: COLORS.available },
          { label: "Avg Response", value: "2.3m", color: COLORS.healthcare },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "12px", borderRadius: 12,
            background: COLORS.surface, border: `1px solid ${COLORS.border}`,
            textAlign: "center",
          }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 22, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Pending requests */}
      {pendingRequests.length === 0 ? (
        <div style={{
          padding: 32, textAlign: "center",
          background: COLORS.bg, borderRadius: 12,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: COLORS.textSecondary }}>
            No pending requests
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pendingRequests.map((req, i) => (
            <div key={i} style={{
              padding: 16, borderRadius: 12,
              background: COLORS.emergencyLight,
              border: `2px solid ${COLORS.emergency}`,
              animation: "blinkFade 2s ease-in-out infinite",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: COLORS.emergency,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="emergency" size={18} color="#fff"/>
                </div>
                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.text }}>
                    Emergency Request #{req.id}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>
                    Patient nearby • {req.distance} km • {req.time}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => onRespond(req.id, true)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 8,
                    background: COLORS.available, color: "#fff",
                    border: "none", cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>
                  <Icon name="check" size={14} color="#fff"/> Accept
                </button>
                <button
                  onClick={() => onRespond(req.id, false)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 8,
                    background: COLORS.bg, color: COLORS.text,
                    border: `1px solid ${COLORS.border}`, cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>
                  <Icon name="x" size={14} color={COLORS.text}/> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── AI Emergency Agent Component ──────────────────────────────────────────────
const AIAgentOverlay = ({ onClose, hospitals, userLocation }) => {
  const [phase, setPhase] = useState("input"); // input, analyzing, matched, paying, success
  const [inputText, setInputText] = useState("");
  const [matchedHospital, setMatchedHospital] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleAnalyze = () => {
    if (!inputText.trim() && phase === "input") {
      setInputText("Bike accident, severe bleeding");
    }
    setPhase("analyzing");
    setTimeout(() => {
      // Find a hospital ideally with ICU and Trauma
      const targetHospital = hospitals.find(h => h.facilities.includes("ICU")) || hospitals[0];
      setMatchedHospital(targetHospital);
      setPhase("matched");
    }, 3000);
  };

  const handleVoiceMock = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support the Web Speech API. Please type your emergency.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handlePayment = () => {
    setPhase("upi_payment");
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
      display: "flex", flexDirection: "column",
      justifyContent: "flex-end", animation: "fadeIn 0.3s ease"
    }}>
      <div style={{
        background: COLORS.surface,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "24px", minHeight: "75vh", maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.2)",
        animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
            }}>
              <Bot color="#fff" size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: "'Poppins', sans-serif", fontSize: 18, color: COLORS.text }}>AI Emergency Agent</h3>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif" }}>Smart Triage & Fast-Track</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            <Icon name="x" size={24} color={COLORS.textSecondary} />
          </button>
        </div>

        {/* Content Box */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          
          {phase === "input" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: COLORS.bg, padding: 16, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
                <p style={{ margin: 0, fontSize: 14, color: COLORS.text, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                  Hello. I am your <strong>AI Emergency Responder</strong>. Please describe the emergency or tap the mic, and I will find the best-equipped hospital optimized for your exact situation and current location.
                </p>
              </div>
              <textarea 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Describe the incident... (e.g., 'Bike accident, severe bleeding')"
                style={{
                  width: "100%", height: 140, padding: 16, borderRadius: 16, border: `1px solid ${COLORS.border}`,
                  fontFamily: "'Inter', sans-serif", fontSize: 15, resize: "none", outline: "none",
                  backgroundColor: "#fff", color: COLORS.text, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                }}
              />
              <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
                <button onClick={handleVoiceMock} style={{
                  flex: 1, padding: "16px", borderRadius: 12, border: `1px solid ${isListening ? COLORS.emergency : COLORS.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: isListening ? COLORS.emergency : COLORS.text, cursor: "pointer", fontWeight: 600, fontFamily: "'Poppins', sans-serif",
                  background: isListening ? COLORS.emergencyLight : COLORS.bg,
                  transition: "all 0.3s ease"
                }}>
                  <Mic size={20} color={isListening ? COLORS.emergency : COLORS.textSecondary} style={{ animation: isListening ? "pulseRing 1.5s ease-out infinite" : "none", borderRadius: "50%" }} />
                  {isListening ? "Listening..." : "Speak"}
                </button>
                <button onClick={handleAnalyze} style={{
                  flex: 2, padding: "16px", borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #a855f7)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                }}>
                  <Send size={20} /> Analyze & Match
                </button>
              </div>
            </div>
          )}

          {phase === "analyzing" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center" }}>
              <div style={{ 
                width: 80, height: 80, background: "#f3f4f6", borderRadius: "50%", 
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "emergencyPulse 1.5s infinite"
              }}>
                <Sparkles size={40} color="#6366f1" />
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px", fontFamily: "'Poppins', sans-serif", fontSize: 20, color: "#6366f1" }}>AI is analyzing condition...</h3>
                <p style={{ margin: 0, fontSize: 14, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif", maxWidth: 280, marginInline: "auto", lineHeight: 1.5 }}>
                  Cross-referencing symptoms with real-time hospital ICU, Trauma capabilities, and distance from your actual location...
                </p>
              </div>
            </div>
          )}

          {phase === "matched" && matchedHospital && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
               <div style={{ background: COLORS.availableLight, padding: 16, borderRadius: 16, border: `1px solid ${COLORS.available}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <ShieldAlert size={20} color={COLORS.availableDark} />
                  <span style={{ fontSize: 14, color: COLORS.availableDark, fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>Critical Match Found</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: COLORS.availableDark, lineHeight: 1.5 }}>
                  <strong>{matchedHospital.name}</strong> is fully equipped with specialized trauma facilities and available ICU beds for this emergency.
                </p>
              </div>
              
              <div style={{ background: COLORS.bg, padding: 20, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 18, fontFamily: "'Poppins', sans-serif", color: COLORS.text }}>{matchedHospital.name}</h4>
                
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  <div style={{ background: "#fff", padding: "8px 12px", borderRadius: 8, flex: 1 }}>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 }}>Distance</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{matchedHospital.distance} km</div>
                  </div>
                  <div style={{ background: "#fff", padding: "8px 12px", borderRadius: 8, flex: 1 }}>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 }}>Est. Arrival</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.warning }}>{matchedHospital.travelTime} mins</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: COLORS.textSecondary, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {matchedHospital.facilities.map(f => (
                    <span key={f} style={{ background: "#e0e7ff", color: "#4338ca", padding: "4px 8px", borderRadius: 12, fontWeight: 600 }}>{f}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ textAlign: "center", fontSize: 12, color: COLORS.textSecondary, margin: 0, lineHeight: 1.4 }}>
                  Ensure immediate attention. Pay the emergency fee to bypass the general triage queue.
                </p>
                <button onClick={handlePayment} style={{
                  width: "100%", padding: "16px", borderRadius: 16, background: COLORS.emergency, border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#fff", cursor: "pointer", 
                  fontWeight: 700, fontSize: 16, fontFamily: "'Poppins', sans-serif", boxShadow: `0 4px 16px ${COLORS.emergency}40`
                }}>
                  <CreditCard size={22} /> Pay ₹5000 for Fast-Track
                </button>
              </div>
            </div>
          )}

          {phase === "paying" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", border: "4px solid #f3f3f3", borderTopColor: COLORS.emergency, animation: "spin 1s linear infinite" }} />
              <div style={{ textAlign: "center" }}>
                <h3 style={{ margin: "0 0 8px", fontFamily: "'Poppins', sans-serif", fontSize: 20, color: COLORS.text }}>Processing Payment...</h3>
                <p style={{ margin: 0, fontSize: 14, color: COLORS.textSecondary }}>Securing Green Corridor Pass and alerting the trauma team...</p>
              </div>
            </div>
          )}

          {phase === "upi_payment" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ margin: "0 0 4px", fontFamily: "'Poppins', sans-serif", fontSize: 20, color: COLORS.text }}>Complete Payment</h3>
                <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>Scan QR with any UPI App</p>
              </div>
              
              <div style={{ background: "#fff", padding: 16, borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: `2px solid ${COLORS.emergency}` }}>
                <QRCodeSVG value="upi://pay?pa=8077060610@ybl&pn=RapidCare%20Emergency&am=5000.00&cu=INR" size={180} level="H" />
              </div>
              
              <a href="upi://pay?pa=8077060610@ybl&pn=RapidCare%20Emergency&am=5000.00&cu=INR" style={{
                  width: "100%", padding: "14px", borderRadius: 12, background: "#111827", textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#fff",
                  fontWeight: 600, fontSize: 15, fontFamily: "'Poppins', sans-serif"
              }}>
                  <CreditCard size={20} /> Open UPI App to Pay ₹5000
              </a>

              <button onClick={() => {
                setPhase("paying"); 
                setTimeout(() => setPhase("success"), 2500); 
              }} style={{
                  width: "100%", padding: "12px", borderRadius: 12, background: "transparent", color: COLORS.availableDark, border: `2px solid ${COLORS.available}`,
                  fontWeight: 600, fontSize: 14, fontFamily: "'Poppins', sans-serif", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
                  <CheckCircle size={18} /> Simulate Payment Success
              </button>
            </div>
          )}

          {phase === "success" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, textAlign: "center" }}>
              <div style={{ animation: "slideUp 0.4s ease" }}>
                <CheckCircle size={72} color={COLORS.available} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px", fontFamily: "'Poppins', sans-serif", fontSize: 24, color: COLORS.availableDark }}>Payment Successful!</h3>
                <p style={{ margin: 0, fontSize: 14, color: COLORS.textSecondary, maxWidth: 280 }}>Hospital trauma team alerted. Show this QR to bypass regular triage upon arrival.</p>
              </div>
              <div style={{ background: "#fff", padding: 16, borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: `2px solid ${COLORS.available}` }}>
                <QRCodeSVG value="RapidCare-Emergency-GreenPass-9382" size={180} level="H" />
              </div>
              <div style={{ width: "100%", background: COLORS.availableLight, padding: 16, borderRadius: 16, border: `1px dashed ${COLORS.available}` }}>
                <h4 style={{ margin: "0 0 4px", color: COLORS.availableDark, fontFamily: "'Poppins', sans-serif", fontSize: 16 }}>🟩 GREEN CORRIDOR PASS</h4>
                <p style={{ margin: 0, fontSize: 13, color: COLORS.availableDark, fontWeight: 600 }}>Fast Track Entry Authorized</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Navigation Component ─────────────────────────────────────────────────────
const RouteDisplay = ({ hospital, onBack }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: "🚗", text: `Head towards ${hospital.address}`, dist: "0.3 km", time: "1 min" },
    { icon: "↗️", text: "Turn right onto Ring Road", dist: "1.1 km", time: "4 min" },
    { icon: "↖️", text: "Turn left onto Aurobindo Marg", dist: "0.8 km", time: "3 min" },
    { icon: "⬆️", text: "Continue straight for 500m", dist: "0.5 km", time: "2 min" },
    { icon: "🏥", text: `Arrive at ${hospital.name}`, dist: "", time: `~${hospital.travelTime} min total` },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Route header */}
      <div style={{
        padding: "16px 20px", borderRadius: 16, marginBottom: 16,
        background: `linear-gradient(135deg, ${COLORS.healthcare}, ${COLORS.healthcareDark})`,
        color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16 }}>
            {hospital.name}
          </div>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
            borderRadius: 8, padding: "4px 10px", cursor: "pointer",
            fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600,
          }}>
            ✕ Close
          </button>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <div style={{ fontSize: 24, fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}>{hospital.travelTime} min</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Est. arrival</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}>{hospital.distance} km</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Distance</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}>{hospital.contact.split("-")[1]}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Quick call</div>
          </div>
        </div>
      </div>

      {/* Turn-by-turn steps */}
      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 }}>
        TURN-BY-TURN NAVIGATION
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            padding: "12px 16px", borderRadius: 12,
            background: i === step ? COLORS.healthcareLight : COLORS.bg,
            border: `2px solid ${i === step ? COLORS.healthcare : "transparent"}`,
            display: "flex", alignItems: "center", gap: 12,
            transition: "all 0.3s",
          }}>
            <div style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: COLORS.text, fontWeight: i === step ? 600 : 400 }}>
                {s.text}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {s.dist && <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.healthcare, fontFamily: "'Poppins', sans-serif" }}>{s.dist}</div>}
              <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{s.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency call button */}
      <a href={`tel:${hospital.contact}`} style={{ textDecoration: "none" }}>
        <button style={{
          marginTop: 16, width: "100%", padding: "14px",
          background: COLORS.available, color: "#fff",
          border: "none", borderRadius: 12, cursor: "pointer",
          fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <Icon name="phone" size={18} color="#fff"/>
          Call Hospital Now · {hospital.contact}
        </button>
      </a>
    </div>
  );
};

// ─── MAIN APPLICATION ─────────────────────────────────────────────────────────
export default function RapidCare() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchPhase, setSearchPhase] = useState("idle"); // idle, searching, results, selected
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState({ lat: 28.5672, lng: 77.2100 });
  const [respondedHospitals, setRespondedHospitals] = useState([]);
  const [acceptedHospitals, setAcceptedHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const [dynamicHospitals, setDynamicHospitals] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });

          const query = `[out:json];
(
  nwr["amenity"="hospital"](around:20000,${lat},${lng});
  nwr["healthcare"="hospital"](around:20000,${lat},${lng});
);
out center 15;`;
          fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.elements && data.elements.length > 0) {
                const mapped = data.elements.map((el, i) => {
                  const elLat = el.lat || el.center?.lat;
                  const elLng = el.lon || el.center?.lon;
                  const dist = Math.sqrt(Math.pow(elLat - lat, 2) + Math.pow(elLng - lng, 2)) * 111;
                  return {
                    id: `dyn_${el.id}`,
                    name: el.tags?.name || `Local Hospital ${i + 1}`,
                    lat: elLat,
                    lng: elLng,
                    distance: parseFloat(dist.toFixed(1)),
                    travelTime: Math.max(2, Math.floor(dist * 4)),
                    rating: (4.0 + Math.random()).toFixed(1),
                    type: i % 2 === 0 ? "Private" : "Government",
                    facilities: ["ICU", "Trauma", "Cardiac", "Emergency"],
                    contact: node.tags?.phone || "+91-9999999999",
                    address: node.tags?.["addr:full"] || node.tags?.["addr:street"] || node.tags?.["addr:city"] || "Nearby Location",
                    beds: { 
                      icu: { total: 50, available: Math.floor(Math.random() * 15) }, 
                      ventilator: { total: 20, available: Math.floor(Math.random() * 5) }, 
                      oxygen: { total: 80, available: Math.floor(Math.random() * 30) }, 
                      general: { total: 200, available: Math.floor(Math.random() * 80) } 
                    },
                    acceptanceRate: 0.75 + Math.random() * 0.2,
                    avgResponseTime: 1.5 + Math.random() * 2,
                    color: i % 2 === 0 ? "#1E88E5" : "#43A047"
                  };
                });
                setDynamicHospitals(mapped);
              }
            })
            .catch(err => console.error("Overpass API failed:", err));
        },
        (error) => {
          console.error("Error asking for location:", error);
        }
      );
    }
  }, []);

  const fetchHospitalsManual = (lat, lng) => {
    const query = `[out:json];
(
  nwr["amenity"="hospital"](around:20000,${lat},${lng});
  nwr["healthcare"="hospital"](around:20000,${lat},${lng});
);
out center 15;`;
    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.elements && data.elements.length > 0) {
          const mapped = data.elements.map((el, i) => {
            const elLat = el.lat || el.center?.lat;
            const elLng = el.lon || el.center?.lon;
            const dist = Math.sqrt(Math.pow(elLat - lat, 2) + Math.pow(elLng - lng, 2)) * 111;
            return {
              id: `dyn_${el.id}`,
              name: el.tags?.name || `Local Hospital ${i + 1}`,
              lat: elLat,
              lng: elLng,
              distance: parseFloat(dist.toFixed(1)),
              travelTime: Math.max(2, Math.floor(dist * 4)),
              rating: (4.0 + Math.random()).toFixed(1),
              type: i % 2 === 0 ? "Private" : "Government",
              facilities: ["ICU", "Trauma", "Cardiac", "Emergency"],
              contact: node.tags?.phone || "+91-9999999999",
              address: node.tags?.["addr:full"] || node.tags?.["addr:street"] || node.tags?.["addr:city"] || "Nearby Location",
              beds: { 
                icu: { total: 50, available: Math.floor(Math.random() * 15) }, 
                ventilator: { total: 20, available: Math.floor(Math.random() * 5) }, 
                oxygen: { total: 80, available: Math.floor(Math.random() * 30) }, 
                general: { total: 200, available: Math.floor(Math.random() * 80) } 
              },
              acceptanceRate: 0.75 + Math.random() * 0.2,
              avgResponseTime: 1.5 + Math.random() * 2,
              color: i % 2 === 0 ? "#1E88E5" : "#43A047"
            };
          });
          setDynamicHospitals(mapped);
        }
      })
      .catch(err => console.error("Overpass API failed:", err));
  };

  const [pendingDashboardRequests, setPendingDashboardRequests] = useState([
    { id: "REQ-001", distance: 1.2, time: "Just now" },
    { id: "REQ-002", distance: 3.4, time: "2 min ago" },
  ]);
  const [emergencyPulse, setEmergencyPulse] = useState(false);

  const activeHospitals = dynamicHospitals.length > 0 ? dynamicHospitals : HOSPITAL_DATABASE;

  // Filtered hospitals within radius
  const hospitalsInRadius = activeHospitals.filter(h => h.distance <= radius);

  // Start emergency search
  const startEmergencySearch = useCallback(async () => {
    setSearchPhase("searching");
    setRespondedHospitals([]);
    setAcceptedHospitals([]);
    setSelectedHospital(null);
    setSearchProgress(0);
    setActiveTab("emergency");

    // Send simulated requests to all hospitals in radius
    const requests = hospitalsInRadius.map(h => simulateEmergencyRequest(h, radius));
    
    let completed = 0;
    const responses = [];

    // Process responses as they come in
    requests.forEach((req, i) => {
      req.then(res => {
        completed++;
        responses.push(res);
        setRespondedHospitals(prev => [...prev, res]);
        if (res.accepted) {
          setAcceptedHospitals(prev => [...prev, res.hospital]);
        }
        setSearchProgress(Math.round((completed / hospitalsInRadius.length) * 100));
        
        if (completed === hospitalsInRadius.length) {
          setTimeout(() => setSearchPhase("results"), 500);
        }
      });
    });
  }, [radius, hospitalsInRadius]);

  // Handle hospital selection
  const handleSelectHospital = (hospitalId) => {
    setSelectedHospital(hospitalId);
    setSearchPhase("selected");
  };

  const selectedHospitalData = selectedHospital
    ? activeHospitals.find(h => h.id === selectedHospital)
    : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.bg,
      fontFamily: "'Inter', sans-serif",
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
      boxShadow: "0 0 40px rgba(0,0,0,0.15)",
    }}>
      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes pingOut {
          0% { transform: translate(-50%,-50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
        }
        @keyframes blinkFade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes emergencyPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(229,57,53,0.5), 0 8px 24px rgba(229,57,53,0.3); transform: scale(1); }
          50% { box-shadow: 0 0 0 20px rgba(229,57,53,0), 0 8px 24px rgba(229,57,53,0.5); transform: scale(1.03); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
      `}</style>

      {/* STATUS BAR */}
      <div style={{
        background: COLORS.emergency,
        color: "#fff", padding: "8px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 12, fontFamily: "'Poppins', sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="cross" size={14} color="#fff"/>
          <span style={{ fontWeight: 700 }}>RapidCare</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.9 }}>
          <span>📍 New Delhi</span>
          <span>●●●●</span>
          <span>9:41 AM</span>
        </div>
      </div>

      {/* HOME TAB */}
      {activeTab === "home" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          {/* Hero Section */}
          <div style={{
            background: `linear-gradient(160deg, ${COLORS.emergencyDark} 0%, ${COLORS.emergency} 50%, #EF5350 100%)`,
            padding: "32px 24px 40px",
            color: "#fff",
            position: "relative", overflow: "hidden",
          }}>
            {/* Background decoration */}
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 160, height: 160, borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}/>
            <div style={{
              position: "absolute", bottom: -20, left: -20,
              width: 100, height: 100, borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            }}/>

            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="cross" size={24} color="#fff"/>
                </div>
                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 22 }}>RapidCare</div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>Emergency Hospital Access</div>
                </div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9, marginBottom: 0, fontFamily: "'Inter', sans-serif" }}>
                India's fastest emergency hospital finder. Connect with nearby hospitals instantly during medical emergencies.
              </p>
            </div>
          </div>

          {/* Location & Radius */}
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{
              background: COLORS.surface, borderRadius: 16, padding: 16,
              border: `1px solid ${COLORS.border}`, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: COLORS.healthcareLight,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon name="location" size={20} color={COLORS.healthcare}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.text }}>
                  📍 Current Location
                </div>
                <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{userLocation.lat?.toFixed(4)}°N, {userLocation.lng?.toFixed(4)}°E · GPS Active</div>
              </div>
              <button 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        setUserLocation({ lat, lng });
                        fetchHospitalsManual(lat, lng);
                      },
                      (error) => {
                        console.error("Error asking for location:", error);
                        alert("Could not access your location. Please check browser permissions.");
                      }
                    );
                  }
                }}
                style={{
                  background: COLORS.availableLight, color: COLORS.availableDark,
                  padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4
                }}>
                <Icon name="refresh" size={12} color={COLORS.availableDark}/> LOCATE ME
              </button>
            </div>

            {/* Radius Selector */}
            <div style={{ background: COLORS.surface, borderRadius: 16, padding: 16, border: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13, color: COLORS.text }}>
                  Search Radius
                </span>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.emergency }}>
                  {radius} km
                </span>
              </div>
              <input
                type="range" min="5" max="20" value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                style={{ width: "100%", accentColor: COLORS.emergency, cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: COLORS.textLight }}>5 km</span>
                <span style={{ fontSize: 10, color: COLORS.textLight }}>20 km</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif" }}>
                {hospitalsInRadius.length} hospitals found within {radius} km
              </div>
            </div>
          </div>

          {/* EMERGENCY BUTTON */}
          <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <button
              onClick={startEmergencySearch}
              onMouseEnter={() => setEmergencyPulse(true)}
              onMouseLeave={() => setEmergencyPulse(false)}
              style={{
                width: 200, height: 200, borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, #EF5350, ${COLORS.emergencyDark})`,
                color: "#fff", border: "none", cursor: "pointer",
                fontFamily: "'Poppins', sans-serif",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                animation: "emergencyPulse 2s ease-in-out infinite",
                boxShadow: `0 8px 32px rgba(229,57,53,0.4)`,
                transition: "transform 0.1s",
              }}
            >
              <Icon name="emergency" size={48} color="#fff"/>
              <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>EMERGENCY</span>
              <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 500 }}>Tap to Search</span>
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif", maxWidth: 280 }}>
              Press the emergency button to instantly contact all hospitals within {radius} km
            </p>
          </div>

          {/* AI Emergency Agent Banner */}
          <div style={{ padding: "0 20px 24px" }}>
            <button 
              onClick={() => setShowAIAgent(true)}
              style={{
                width: "100%", padding: "16px 20px", borderRadius: 16,
                background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "#fff",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.25)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={28} color="#fff" />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>AI Emergency Agent</div>
                <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.3, fontFamily: "'Inter', sans-serif" }}>Smart situation analysis, instant ICU matching & fast-track entry</div>
              </div>
              <Sparkles size={20} color="#fff" />
            </button>
          </div>

          {/* Feature Cards */}
          <div style={{ padding: "0 20px 24px" }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text, marginBottom: 16 }}>
              Features
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: "🔴", title: "Emergency Mode", desc: "Instant hospital search within radius", color: COLORS.emergencyLight, accent: COLORS.emergency },
                { icon: "🗺", title: "Live Map", desc: "Real-time hospital tracking", color: COLORS.healthcareLight, accent: COLORS.healthcare },
                { icon: "🛏", title: "Bed Checker", desc: "Check availability instantly", color: COLORS.availableLight, accent: COLORS.available },
                { icon: "📍", title: "Navigation", desc: "Fastest route guidance", color: "#FFF3E0", accent: COLORS.warning },
              ].map((f, i) => (
                <div key={i} style={{
                  padding: 16, borderRadius: 14, background: f.color,
                  border: `1px solid ${f.accent}30`,
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.text, marginBottom: 2 }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif" }}>
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Hospitals */}
          <div style={{ padding: "0 20px 24px" }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text, marginBottom: 16 }}>
              Nearby Hospitals
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {hospitalsInRadius.slice(0, 3).map(h => (
                <HospitalCard key={h.id} hospital={h} isAccepted={false} onSelect={() => {}} isSelected={false} compact/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY TAB */}
      {activeTab === "emergency" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          {/* Header */}
          <div style={{
            background: searchPhase === "idle" ? COLORS.text : COLORS.emergency,
            padding: "16px 20px",
            color: "#fff",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <button onClick={() => setActiveTab("home")} style={{
              background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
              borderRadius: 8, padding: "6px 10px", cursor: "pointer",
            }}>
              <Icon name="back" size={18} color="#fff"/>
            </button>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 16 }}>
                {searchPhase === "searching" ? "🔴 Contacting Hospitals..." :
                 searchPhase === "results" ? `✅ ${acceptedHospitals.length} Hospitals Responded` :
                 searchPhase === "selected" ? "🗺 Route to Hospital" : "Emergency Search"}
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                {searchPhase === "searching" ? `Searching ${radius} km radius...` :
                 searchPhase === "results" ? "Select a hospital to navigate" :
                 searchPhase === "selected" ? selectedHospitalData?.name : ""}
              </div>
            </div>
          </div>

          <div style={{ padding: "16px 20px" }}>
            {/* Progress bar during search */}
            {searchPhase === "searching" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: COLORS.text }}>
                    Contacting hospitals...
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.emergency, fontFamily: "'Poppins', sans-serif" }}>
                    {searchProgress}%
                  </span>
                </div>
                <div style={{ background: COLORS.border, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${searchProgress}%`,
                    background: `linear-gradient(90deg, ${COLORS.emergency}, ${COLORS.healthcare})`,
                    borderRadius: 4, transition: "width 0.3s ease",
                  }}/>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif" }}>
                  {respondedHospitals.length} of {hospitalsInRadius.length} hospitals responded
                </div>
              </div>
            )}

            {/* Live Map */}
            <div style={{ marginBottom: 16 }}>
              <EmergencyMap
                hospitals={hospitalsInRadius}
                searchRadius={radius}
                searchPhase={searchPhase}
                selectedHospital={selectedHospital}
                respondedHospitals={respondedHospitals}
                userLocation={userLocation}
                onHospitalClick={handleSelectHospital}
              />
            </div>

            {/* Route display for selected hospital */}
            {searchPhase === "selected" && selectedHospitalData && (
              <div style={{ animation: "slideUp 0.3s ease" }}>
                <RouteDisplay hospital={selectedHospitalData} onBack={() => setSearchPhase("results")}/>
              </div>
            )}

            {/* Responding hospitals (real-time) */}
            {(searchPhase === "searching" || searchPhase === "results") && (
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 12 }}>
                  {searchPhase === "searching" ? "Live Responses" : `Hospitals Available (${acceptedHospitals.length})`}
                </div>

                {/* Accepted hospitals */}
                {acceptedHospitals.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.available, fontFamily: "'Poppins', sans-serif", marginBottom: 8 }}>
                      ✅ ACCEPTING PATIENTS
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {acceptedHospitals
                        .sort((a, b) => a.distance - b.distance)
                        .map(h => (
                          <div key={h.id} style={{ animation: "slideUp 0.3s ease" }}>
                            <HospitalCard
                              hospital={h}
                              isAccepted={true}
                              onSelect={handleSelectHospital}
                              isSelected={selectedHospital === h.id}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Declined / no response */}
                {respondedHospitals.filter(r => !r.accepted).length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textLight, fontFamily: "'Poppins', sans-serif", marginBottom: 8 }}>
                      ❌ NOT AVAILABLE
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {respondedHospitals.filter(r => !r.accepted).map(r => (
                        <div key={r.hospitalId} style={{
                          padding: "10px 14px", borderRadius: 10,
                          background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#B0BEC5" }}/>
                            <span style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: COLORS.textSecondary }}>
                              {r.hospital.name}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: COLORS.textLight }}>Full / Unavailable</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Searching indicators */}
                {searchPhase === "searching" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {hospitalsInRadius
                      .filter(h => !respondedHospitals.find(r => r.hospitalId === h.id))
                      .map(h => (
                        <div key={h.id} style={{
                          padding: "10px 14px", borderRadius: 10,
                          background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: "50%", background: h.color,
                              animation: "blinkFade 0.8s ease-in-out infinite",
                            }}/>
                            <span style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: COLORS.text }}>
                              {h.name}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, color: COLORS.textLight, fontSize: 11 }}>
                            <div style={{
                              width: 14, height: 14, borderRadius: "50%",
                              border: "2px solid #CFD8DC",
                              borderTopColor: COLORS.healthcare,
                              animation: "spin 0.8s linear infinite",
                            }}/>
                            Contacting...
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* No results */}
                {searchPhase === "results" && acceptedHospitals.length === 0 && (
                  <div style={{
                    padding: 24, textAlign: "center",
                    background: COLORS.emergencyLight, borderRadius: 14,
                    border: `2px solid ${COLORS.emergency}30`,
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>😔</div>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.text, marginBottom: 8 }}>
                      No beds available nearby
                    </div>
                    <p style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>
                      Try increasing your search radius or call emergency services
                    </p>
                    <a href="tel:112" style={{ textDecoration: "none" }}>
                      <button style={{
                        padding: "12px 24px", background: COLORS.emergency, color: "#fff",
                        border: "none", borderRadius: 10, cursor: "pointer",
                        fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14,
                      }}>
                        📞 Call 112 – National Emergency
                      </button>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Retry button */}
            {searchPhase === "results" && (
              <button
                onClick={startEmergencySearch}
                style={{
                  marginTop: 16, width: "100%", padding: "12px",
                  background: COLORS.emergencyLight, color: COLORS.emergency,
                  border: `2px solid ${COLORS.emergency}40`, borderRadius: 12, cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                <Icon name="refresh" size={16} color={COLORS.emergency}/>
                Retry Search
              </button>
            )}
          </div>
        </div>
      )}

          {/* BED AVAILABILITY TAB */}
      {activeTab === "beds" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{
            background: COLORS.available,
            padding: "16px 20px", color: "#fff",
          }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 18 }}>
              🛏 Bed Availability
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Check real-time hospital resources</div>
          </div>
          <div style={{ padding: 20 }}>
            <BedAvailabilityChecker hospitals={activeHospitals}/>
          </div>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{
            background: COLORS.healthcare,
            padding: "16px 20px", color: "#fff",
          }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 18 }}>
              🏥 Hospital Dashboard
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Manage emergency requests</div>
          </div>
          <div style={{ padding: 20 }}>
            <HospitalDashboard
              pendingRequests={pendingDashboardRequests}
              onRespond={(id, accepted) => {
                setPendingDashboardRequests(prev => prev.filter(r => r.id !== id));
              }}
            />
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <div style={{
        position: "sticky", bottom: 0,
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.border}`,
        display: "flex",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        zIndex: 100,
      }}>
        {[
          { id: "home", icon: "hospital", label: "Home" },
          { id: "emergency", icon: "emergency", label: "Emergency" },
          { id: "beds", icon: "bed", label: "Beds" },
          { id: "dashboard", icon: "map", label: "Dashboard" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "emergency" && searchPhase === "idle") {
                startEmergencySearch();
              } else {
                setActiveTab(tab.id);
              }
            }}
            style={{
              flex: 1, padding: "12px 8px", border: "none", cursor: "pointer",
              background: activeTab === tab.id
                ? tab.id === "emergency" ? COLORS.emergencyLight : COLORS.healthcareLight
                : "transparent",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              transition: "all 0.2s",
              borderTop: activeTab === tab.id
                ? `2px solid ${tab.id === "emergency" ? COLORS.emergency : COLORS.healthcare}`
                : "2px solid transparent",
            }}>
            <Icon
              name={tab.icon} size={20}
              color={activeTab === tab.id
                ? tab.id === "emergency" ? COLORS.emergency : COLORS.healthcare
                : COLORS.textLight}
            />
            <span style={{
              fontSize: 10, fontFamily: "'Poppins', sans-serif", fontWeight: 600,
              color: activeTab === tab.id
                ? tab.id === "emergency" ? COLORS.emergency : COLORS.healthcare
                : COLORS.textLight,
            }}>{tab.label}</span>
            {/* Emergency badge */}
            {tab.id === "emergency" && (searchPhase === "searching" || searchPhase === "results") && (
              <div style={{
                position: "absolute",
                top: 8, right: "calc(75% - 14px)",
                width: 8, height: 8, borderRadius: "50%",
                background: COLORS.emergency,
                animation: "blinkFade 0.8s ease-in-out infinite",
              }}/>
            )}
          </button>
        ))}
      </div>

      {/* AI Agent Overlay */}
      {showAIAgent && (
        <AIAgentOverlay 
          onClose={() => setShowAIAgent(false)} 
          hospitals={activeHospitals}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}
