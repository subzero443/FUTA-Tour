import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowDownRight, ArrowRight, Bookmark, Check, Compass, Heart,
  LocateFixed, MapPin, Navigation, Route, Search, ShieldCheck,
  Smartphone, Sparkles, WifiOff, X, School, Building2, Home,
  GraduationCap, Target, Info, UserRound, LogOut, Layers3
} from 'lucide-react';
import { FUTA_CENTER, LANDMARKS, categories, metersBetween, formatDistance } from './landmarks.js';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const validCoord = c => c && Number.isFinite(c.lat) && Number.isFinite(c.lng);
const getStored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const categorySymbol = { Academic: '✦', Gate: '↗', Hostel: '⌂', Services: '◆' };

function Splash({ closing }) {
  return <div className={`splash ${closing ? 'splash-out' : ''}`} role="status" aria-live="polite">
    <div className="splash-aurora splash-aurora-one" /><div className="splash-aurora splash-aurora-two" />
    <div className="splash-inner">
      <div className="splash-mark"><div className="splash-mark-ring"/><Compass size={42} strokeWidth={1.7} /></div>
      <div className="splash-eyebrow"><span className="tiny-star">✦</span> MADE FOR EVERY FUTARIAN <span className="tiny-star">✦</span></div>
      <h1>FUTA<span> Tour</span><span className="splash-dot">.</span></h1>
      <p>Your Campus. Beautifully Explored.</p>
      <div className="splash-progress"><span /></div>
    </div>
  </div>;
}

function MapMove({ selected, focusUser, location }) {
  const map = useMap();
  useEffect(() => {
    if (selected) map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 16), { duration: 1.25 });
  }, [selected?.id, map]);
  useEffect(() => {
    if (focusUser && validCoord(location)) map.flyTo([location.lat, location.lng], 17, { duration: 1.1 });
  }, [focusUser, map]);
  return null;
}
function makePin(cat, active) {
  return L.divIcon({
    className: 'landmark-map-pin-wrap',
    html: `<span class="landmark-map-pin ${active ? 'active' : ''}"><span>${categorySymbol[cat] || '•'}</span></span>`,
    iconSize: [42, 49], iconAnchor: [21, 43], popupAnchor: [0, -39]
  });
}
const userPin = L.divIcon({ className: 'user-map-pin-wrap', html: '<div class="user-map-pulse"></div><div class="user-map-dot"></div>', iconSize: [36, 36], iconAnchor: [18, 18] });
// Keep the Leaflet map in sync when an iPad rotates or the sidebar reflows.
function MapResize() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const update = () => window.requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(container);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    update();
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [map]);
  return null;
}

function CampusMap({ landmarks, selected, onSelect, location, focusUser }) {
  return <div className="map-frame">
    <MapContainer center={FUTA_CENTER} zoom={15} minZoom={12} maxZoom={19} scrollWheelZoom={false} zoomControl={false} className="campus-leaflet-map">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' maxZoom={19} />
      <MapResize/>
      <MapMove selected={selected} focusUser={focusUser} location={location}/>
      {landmarks.map(landmark => <Marker key={landmark.id} position={[landmark.lat, landmark.lng]} icon={makePin(landmark.category, selected?.id === landmark.id)} eventHandlers={{ click: () => onSelect(landmark) }}>
        <Popup><div className="pin-popup"><b>{landmark.name}</b><span>{landmark.category}</span><button onClick={() => onSelect(landmark)}>Explore place →</button></div></Popup>
      </Marker>)}
      {validCoord(location) && <><Circle center={[location.lat, location.lng]} radius={Math.min(location.accuracy || 12, 300)} pathOptions={{ color: '#4d8efe', fillColor: '#8fbdff', fillOpacity: 0.11, weight: 1.5 }} /><Marker position={[location.lat, location.lng]} icon={userPin}><Popup>You are here (approximate)</Popup></Marker></>}
      {validCoord(location) && selected && <Polyline positions={[[location.lat, location.lng], [selected.lat, selected.lng]]} pathOptions={{ color: '#7644f4', weight: 4, dashArray: '5 9', opacity: 0.84 }} />}
    </MapContainer>
    <div className="map-overlay-title"><span className="map-overlay-icon"><Layers3 size={14} /></span> Interactive Campus Map <span className="map-live-badge"><span /> LIVE MAP</span></div>
    <div className="map-overlay-footer"><span className="map-badge"><Target size={14}/> FUTA • AKURE, NIGERIA</span><span className="map-control-hint">Drag to explore <ArrowDownRight size={13}/></span></div>
  </div>;
}

function InstallDialog({ platform, canPrompt, onInstall, onClose }) {
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-card install-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title">
      <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
      <div className="modal-icon"><Smartphone size={30}/></div>
      <span className="overline">YOUR CAMPUS, YOUR PRIDE</span>
      <h2 id="install-title">Make FUTA Tour feel like an app.</h2>
      <p>Add FUTA Tour to your home screen for an app-like, full-screen experience — no app store needed.</p>
      {canPrompt ? <button className="btn btn-primary modal-submit" onClick={onInstall}><Smartphone size={17}/> Install FUTA Tour <ArrowRight size={17}/></button>
        : platform === 'ios' ? <div className="install-steps"><div><b>1</b><span>Open this page in Safari or your iPhone browser.</span></div><div><b>2</b><span>Tap the <strong>Share</strong> icon in the browser.</span></div><div><b>3</b><span>Choose <strong>Add to Home Screen</strong> (or <strong>Open as Web App</strong>).</span></div></div>
          : <div className="install-steps"><div><b>1</b><span>Open the site on HTTPS with Chrome or Edge.</span></div><div><b>2</b><span>Use the browser menu <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</span></div><div><b>3</b><span>If not visible, the browser may need a moment to detect installability.</span></div></div>}
      <p className="modal-fineprint"><ShieldCheck size={13}/> Works online </p>
    </div>
  </div>;
}
function LoginDialog({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <form className="modal-card login-dialog" role="dialog" aria-modal="true" aria-labelledby="sign-in-title" onSubmit={e => { e.preventDefault(); if (name.trim()) onSubmit({ name: name.trim().slice(0, 45) }); }}>
      <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
      <div className="modal-icon"><UserRound size={26}/></div>
      <span className="overline">WELCOME TO YOUR CAMPUS</span>
      <h2 id="sign-in-title">Let's get you exploring.</h2>
      <p>This is a Student Tour Website | No password required.</p>
      <label className="form-label" htmlFor="profile-name">What should we call you?</label>
      <input id="profile-name" className="login-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your first name" maxLength={45} required autoFocus />
      <button className="btn btn-primary modal-submit" type="submit">Continue <ArrowRight size={18}/></button>
      <span className="modal-fineprint">Student Tour Website only; no university credentials required.</span>
    </form>
  </div>;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashClosing, setSplashClosing] = useState(false);
  const [section, setSection] = useState('explore');
  const [landmarks, setLandmarks] = useState(LANDMARKS);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [favorites, setFavorites] = useState(() => getStored('futa-favorites', []));
  const [profile, setProfile] = useState(() => getStored('futa-demo-profile', null));
  const [loginOpen, setLoginOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [installBanner, setInstallBanner] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
  const [online, setOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState(null);
  const [locationOn, setLocationOn] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [focusUser, setFocusUser] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const focusedFirstFixRef = useRef(false);
  const platform = (/iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) ? 'ios' : 'other';

  useEffect(() => {
    const closeTimer = setTimeout(() => setSplashClosing(true), 1350);
    const removeTimer = setTimeout(() => setShowSplash(false), 1850);
    return () => { clearTimeout(closeTimer); clearTimeout(removeTimer); };
  }, []);
  useEffect(() => {
    const checkOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', checkOnline); window.addEventListener('offline', checkOnline);
    const before = e => { e.preventDefault(); setInstallEvent(e); };
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); setInstallOpen(false); };
    window.addEventListener('beforeinstallprompt', before);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('online', checkOnline); window.removeEventListener('offline', checkOnline);
      window.removeEventListener('beforeinstallprompt', before); window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  useEffect(() => {
    if (installed || getStored('futa-install-dismissed', false)) return;
    const timer = setTimeout(() => {
      if (window.matchMedia('(max-width: 670px)').matches) setInstallBanner(true);
    }, 4200);
    return () => clearTimeout(timer);
  }, [installed]);
  function dismissInstallBanner() {
    setInstallBanner(false);
    localStorage.setItem('futa-install-dismissed', 'true');
  }
  useEffect(() => { localStorage.setItem('futa-favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { if (profile) localStorage.setItem('futa-demo-profile', JSON.stringify(profile)); else localStorage.removeItem('futa-demo-profile'); }, [profile]);
  useEffect(() => {
    fetch(`${API_URL}/api/landmarks`).then(r => { if (!r.ok) throw Error('Landmarks unavailable'); return r.json(); }).then(list => {
      if (Array.isArray(list) && list.every(p => validCoord(p) && typeof p.name === 'string')) setLandmarks(list);
    }).catch(() => { /* Offline seed stays available. */ });
  }, []);

  // Phone browsers may suspend GPS when the page is hidden.
  // Track only on the visible page and only when the student asks for location.
  useEffect(() => {
    if (!locationOn) return;
    if (!navigator.geolocation) { setLocationError('Geolocation is unavailable in this browser.'); return; }
    let watchId = null;
    function stop() {
      if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    }
    function start() {
      if (document.hidden || watchId !== null) return;
      watchId = navigator.geolocation.watchPosition(position => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy });
        setLocationError('');
      }, error => {
        setLocationError(error.code === 1 ? 'Location permission denied. Enable location in browser settings.' : 'Unable to get a GPS fix. Try again outdoors.');
        if (error.code === 1) setLocationOn(false);
      }, { enableHighAccuracy: false, maximumAge: 12000, timeout: 15000 });
    }
    const visibility = () => { if (document.hidden) stop(); else start(); };
    start(); document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); stop(); };
  }, [locationOn]);

  useEffect(() => {
    if (locationOn && validCoord(location) && !focusedFirstFixRef.current) {
      focusedFirstFixRef.current = true;
      setFocusUser(value => value + 1);
    }
  }, [locationOn, location]);

  const filtered = useMemo(() => landmarks.filter(item =>
    (category === 'All' || category === item.category) && (!showFavorites || favorites.includes(item.id)) &&
    `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [landmarks, category, query, showFavorites, favorites]);
  const pick = useCallback((item) => { setSelected(item); setSection('explore'); }, []);
  const locate = () => { setLocationError(''); setLocationOn(true); if (location) setFocusUser(v => v + 1); };
  const toggleFav = id => setFavorites(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]);
  const signIn = data => { setProfile(data); setLoginOpen(false); };
  const logout = () => { setLocationOn(false); setProfile(null); setLocation(null); focusedFirstFixRef.current = false; setSection('explore'); };
  async function install() {
    if (!installEvent) return;
    try { await installEvent.prompt(); await installEvent.userChoice; } catch { /* Browser may refuse; instructions remain accessible. */ }
    setInstallEvent(null); setInstallOpen(false);
  }
  const distance = selected && validCoord(location) ? metersBetween(location, selected) : null;

  return <div className="app-root">
    {showSplash && <Splash closing={splashClosing}/>}
    <div className="page-haze haze-one"/><div className="page-haze haze-two"/><div className="page-grid" />
    <header className="site-header"><div className="header-inner">
      <a className="brand" href="#home" onClick={() => setSection('explore')} aria-label="FUTA Tour home"><span className="brand-symbol"><Compass size={22} strokeWidth={2.3}/></span><span>FUTA<span className="brand-secondary">Tour</span><span className="brand-dot">.</span></span></a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <button className={section === 'explore' ? 'nav-active' : ''} onClick={() => setSection('explore')}>Explore</button>
        <button className={section === 'landmarks' ? 'nav-active' : ''} onClick={() => setSection('landmarks')}>Landmarks</button>
      </nav>
      <div className="header-actions">
        {!installed && <button className="install-nav" onClick={() => setInstallOpen(true)}><Smartphone size={16}/><span>Install app</span></button>}
        {profile ? <button className="profile-button" onClick={logout} title="Sign out"><span className="profile-avatar">{profile.name.slice(0, 1).toUpperCase()}</span><span>{profile.name}</span><LogOut size={15}/></button>
          : <button className="signin-button" onClick={() => setLoginOpen(true)}>Sign in <ArrowRight size={15}/></button>}
      </div>
    </div></header>

    <main id="home" className="main-content">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-text">
          <div className="hero-eyebrow"><span className="eyebrow-orb"><Sparkles size={13}/></span> THE SMARTER WAY AROUND CAMPUS <span className="eyebrow-line" /></div>
          <h1 id="hero-title">Your campus.<br/><span className="gradient-title">Uncomplicated<span className="title-spark">✦</span></span></h1>
          <p>New to FUTA? Find your lecture hall, discover cool spots and move around campus with confidence. Your next stop starts here.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => { setSection('explore'); document.querySelector('#campus-explorer')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore campus <ArrowRight size={18}/></button>
            <button className="btn btn-soft" onClick={() => { setSection('landmarks'); document.querySelector('#campus-explorer')?.scrollIntoView({ behavior: 'smooth' }); }}><MapPin size={17}/> Browse places</button>
          </div>
          <div className="hero-assurance"><span className="hero-check"><Check size={12}/></span>No app store needed <span className="assurance-divider">•</span><span className="hero-check"><Check size={12}/></span>Made for freshers</div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
          <div className="floating-pill pill-one"><span className="float-icon float-purple"><MapPin size={16}/></span><div><strong>Find it faster</strong><span>9+ campus landmarks</span></div></div>
          <div className="hero-phone"><div className="phone-top"><span/><span/></div><div className="phone-content"><div className="phone-brand"><Compass size={13}/> FUTA Tour <span>●</span></div><div className="phone-greeting">Good morning, Students ✨</div><div className="phone-heading">Where to today?</div><div className="phone-search"><Search size={12}/> Search the campus...</div><div className="phone-map"><div className="phone-map-street street-a"/><div className="phone-map-street street-b"/><div className="phone-map-street street-c"/><div className="phone-map-street street-d"/><span className="phone-label label-a">NORTH GATE</span><span className="phone-label label-b">SENATE</span><span className="phone-label label-c">LIBRARY AREA</span><span className="phone-pn pin-a"><MapPin size={15} fill="currentColor"/></span><span className="phone-pn pin-b"><MapPin size={15} fill="currentColor"/></span><span className="phone-blip"/></div><div className="phone-bottom"><span><Compass size={12}/> Explore</span><span><Bookmark size={12}/> Saved</span><span><UserRound size={12}/> You</span></div></div></div>
          <div className="floating-pill pill-two"><span className="float-icon float-green"><Navigation size={15}/></span><div><strong>Ready to go</strong><span>Your campus, mapped</span></div></div>
          <div className="hero-glitter glitter-a">✦</div><div className="hero-glitter glitter-b">✧</div>
        </div>
      </section>

      <section className="quick-stats" aria-label="App highlights">
        <div><span className="stat-icon stat-pink"><School size={20}/></span><span><b>{landmarks.length} places</b><small>Campus landmarks</small></span></div>
        <div><span className="stat-icon stat-indigo"><Navigation size={20}/></span><span><b>Real-time GPS</b><small>On-device positioning</small></span></div>
        <div><span className="stat-icon stat-green"><Smartphone size={20}/></span><span><b>Install in seconds</b><small>One tap, no app store</small></span></div>
        <div><span className="stat-icon stat-orange"><Bookmark size={20}/></span><span><b>Saved places</b><small>Quick campus access</small></span></div>
      </section>

      <section id="campus-explorer" className="explorer-section" aria-labelledby="explorer-title">
        <div className="section-heading"><div><span className="overline"><span className="section-line"/> INTERACTIVE EXPERIENCE</span><h2 id="explorer-title">The campus, at your fingertips<span className="purple-point">.</span></h2><p>A little less lost. A lot more exploring.</p></div><div className="section-heading-badge"><span className="pulse-point"/> FUTA · AKURE</div></div>
        {!online && <div className="offline-banner"><WifiOff size={17}/> Offline: your saved app shell and bundled landmark directory work, but uncached map tiles need internet.</div>}
        <div className="explorer-layout">
          <aside className="explorer-sidebar">
            <div className="sidebar-head"><div className="sidebar-top"><span className="sidebar-label"><Compass size={16}/> CAMPUS GUIDE</span><button className="ghost-icon" onClick={() => setShowFavorites(v => !v)} title="Filter saved locations" aria-label="Show saved places"><Heart size={18} fill={showFavorites ? '#864ef7' : 'none'} color={showFavorites ? '#864ef7' : 'currentColor'}/></button></div>
              <h3>{section === 'landmarks' ? 'All the good spots' : 'Where to, fresher?'}</h3>
              <p>Pick a destination and we’ll point you there.</p>
            </div>
            <>
              <label className="searchbox" htmlFor="landmark-search"><Search size={18}/><input id="landmark-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search hall, gate, hostel..."/><span className="shortcut-kbd">⌕</span></label>
              <div className="category-row" aria-label="Landmark categories">{categories.map(cat => <button key={cat} className={`category-chip ${category === cat ? 'chosen' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>)}</div>
              <div className="places-list-heading"><span>{showFavorites ? 'SAVED PLACES' : section === 'landmarks' ? 'LANDMARK DIRECTORY' : 'POPULAR DESTINATIONS'}</span><span>{filtered.length} FOUND</span></div>
              <div className="places-scroll">
                {filtered.length ? filtered.map(item => <div key={item.id} className={`place-card ${selected?.id === item.id ? 'selected' : ''}`}>
                  <button className="place-main" onClick={() => pick(item)}><span className={`place-icon place-${item.category.toLowerCase()}`}>{item.category === 'Gate' ? <Navigation size={19}/> : item.category === 'Hostel' ? <Home size={19}/> : item.category === 'Academic' ? <GraduationCap size={20}/> : <Building2 size={19}/>}</span><span className="place-copy"><strong>{item.name}</strong><small><MapPin size={12}/>{item.category} <span>•</span> FUTA Campus</small></span><ArrowRight className="place-arrow" size={17}/></button>
                  <button className="favorite-btn" onClick={() => toggleFav(item.id)} aria-label={`${favorites.includes(item.id) ? 'Remove' : 'Save'} ${item.name}`} title="Save place"><Bookmark size={17} fill={favorites.includes(item.id) ? '#7345f2' : 'none'} color={favorites.includes(item.id) ? '#7345f2' : 'currentColor'}/></button>
                </div>) : <div className="empty-places"><Search size={22}/><b>Nothing found yet</b><span>Try another search or category.</span><button onClick={() => { setQuery(''); setCategory('All'); setShowFavorites(false); }}>Clear filters</button></div>}
              </div>
            </>
            <div className="sidebar-foot"><Sparkles size={17}/><span>Good things take you places.<br/><strong>Enjoy finding yours.</strong></span></div>
          </aside>

          <div className="map-column"><div className="map-topbar"><div><span className="map-gps-indicator"><span/></span><b>FUTA Campus Explorer</b><span className="map-subtitle">Campus map overview</span></div><div className="map-top-buttons"><button onClick={locate} className="map-utility-btn" title="Find my location"><LocateFixed size={17}/><span>My location</span></button><button onClick={() => { setSelected(null); setFocusUser(0); }} className="map-utility-btn icon-only" title="Clear destination"><X size={18}/></button></div></div>
            <CampusMap landmarks={landmarks} selected={selected} onSelect={pick} location={location} focusUser={focusUser}/>
            {locationError && <div className="location-message"><Info size={16}/>{locationError}<button onClick={() => setLocationError('')} aria-label="Dismiss"><X size={14}/></button></div>}
            <div className="map-detail-panel">
              {selected ? <><div className="detail-location-icon"><MapPin size={21}/></div><div className="detail-copy"><span>YOUR SELECTED DESTINATION</span><strong>{selected.name}</strong><small>{distance === null ? 'Enable location to see straight-line distance' : `${formatDistance(distance)} straight-line distance · not walking directions`}</small></div><button className="detail-action" onClick={locate}><LocateFixed size={16}/>{location ? 'Re-center' : 'Locate me'}<ArrowRight size={15}/></button></>
                : <><div className="detail-location-icon"><Route size={21}/></div><div className="detail-copy"><span>READY WHEN YOU ARE</span><strong>Choose a landmark to get started</strong><small>Explore the map or pick a place from the directory</small></div><div className="map-tip-logo"><Compass size={27}/></div></>}
            </div>
            <p className="map-disclaimer"><Info size={13}/> Location pins are reference points from older field surveys. Dashed lines show straight-line bearings, not safe walking routes. Verify entrances and footpaths before navigating.</p>
          </div>
        </div>
      </section>

      <section className="cta-section"><div className="cta-graphic" aria-hidden="true"><div className="cta-ring"><Compass size={39}/></div><span className="cta-star cta-star-one">✦</span><span className="cta-star cta-star-two">✧</span></div><div><span className="overline light-overline">A LITTLE SHORTCUT TO EVERYTHING</span><h2>Every FUTA adventure<br/>starts somewhere<span>.</span></h2><p>Add FUTA Tour to your home screen and make campus a little more familiar, one stop at a time.</p></div><button className="cta-button" onClick={() => setInstallOpen(true)}><Smartphone size={18}/> {installed ? 'How installation works' : 'Get FUTA Tour'} <ArrowRight size={18}/></button></section>
    </main>
    <footer className="site-footer"><div className="footer-inner"><span className="footer-brand"><Compass size={19}/> FUTA<span>Tour.</span></span><span>Made for students, with a little extra love <Heart size={13} fill="currentColor"/></span><span>Independent prototype · Not an official FUTA service</span></div></footer>
    <nav className="mobile-nav" aria-label="Mobile navigation"><button className={section === 'explore' ? 'active' : ''} onClick={() => { setSection('explore'); document.querySelector('#campus-explorer')?.scrollIntoView({ behavior: 'smooth' }); }}><Compass size={21}/>Explore</button><button className={section === 'landmarks' ? 'active' : ''} onClick={() => { setSection('landmarks'); document.querySelector('#campus-explorer')?.scrollIntoView({ behavior: 'smooth' }); }}><MapPin size={21}/>Places</button><button onClick={() => { setShowFavorites(true); document.querySelector('#campus-explorer')?.scrollIntoView({ behavior: 'smooth' }); }}><Bookmark size={21}/>Saved</button><button onClick={() => setInstallOpen(true)}><Smartphone size={21}/>Install</button></nav>
    {installBanner && !installed && <div className="install-banner" role="region" aria-label="Install FUTA Tour">
      <span className="install-banner-icon"><Smartphone size={20}/></span><div><strong>Take FUTA Tour with you</strong><small>Add it to your Phone's Home Screen.</small></div>
      <button className="install-banner-yes" onClick={() => { dismissInstallBanner(); setInstallOpen(true); }}>Install</button>
      <button className="install-banner-close" aria-label="Maybe later" onClick={dismissInstallBanner}><X size={17}/></button>
    </div>}
    {installOpen && <InstallDialog platform={platform} canPrompt={!!installEvent} onInstall={install} onClose={() => setInstallOpen(false)}/>}
    {loginOpen && <LoginDialog onSubmit={signIn} onClose={() => setLoginOpen(false)}/>}
  </div>;
}
