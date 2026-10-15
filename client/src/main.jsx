import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import 'leaflet/dist/leaflet.css';
import './style.css';
import './responsive.css';
import App from './App.jsx';

registerSW({ immediate: true, onRegisterError: error => console.warn('Service worker:', error) });
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
