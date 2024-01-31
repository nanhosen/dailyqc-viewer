import React, {useState} from "react";
import { MapContainer, TileLayer, useMap, Popup,Marker } from 'react-leaflet'
import './App.css';
import 'leaflet/dist/leaflet.css';
import { Icon } from "leaflet";
// import * as parkData from "./data/skateboard-parks.json";
// import Dashboard from "./components/DashboardMasonry";
import Dashboard from "./components/Dashboard";
import DataProvider from './providers/DataProvider'

function App() {
  const position = [42.123, -112.23]; // [latitude, longitude]
  const zoomLevel = 13;
 
  return (
    <div className = "App">
      <DataProvider>
      {/* hi */}
        <Dashboard />
      </DataProvider>
    </div>
  );
}

export default App;