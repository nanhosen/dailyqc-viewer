import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { GeoJSON } from 'react-leaflet/GeoJSON'
import { CircleMarker } from 'react-leaflet/CircleMarker'
import { Circle } from 'react-leaflet/Circle'
import { Marker } from 'react-leaflet/Marker'
import getMetarLocations from "../data/metarLocations";
import getDevObsData from "../data/devObsData"
import returnDevObsDataSixhr from "../data/devObsDataSixhr"
import processObs from "../actions/processObs";
const dat  =getMetarLocations()
// const obsDat = returnDevObsDataSixhr('2024-01-24T00:00:00Z') 
const obsDat = returnDevObsDataSixhr('2024-01-24T06:00:00Z') 
const obsDatForMapSix = processObs(obsDat.features)
// const makeLayerDat = (feature)=>{
//   console.log('feature', feature)
// }
const getColor = (wxType)=>{
  const colorObj = {
    "CLR": '#F5CC4D',
    "SKC": '#F5CC4D',
    "FEW": '#F5CC4D',
    "SCT": '#F5CC4D',
    "BKN": '#979392',
    "VV": '#F5CC4D',
    "OVC": '#979392',
    "liquid": '#4D9FF5',
    "frozen": '#B9DCF1'
  }
  const errorColor = 'red'
  if(wxType in colorObj){
    return colorObj[wxType]
  }
  else{
    return errorColor
  }
}
// console.log(returnDevObsDataSixhr())
const features = dat['features']
const allfeats = [] 
for(const feature in features){
  // console.log('feature', features[feature])
  let stnId
  let stnColor = 'black'
  if( features[feature]['properties']){
    stnId = features[feature]['properties']['ICAO']
    if(obsDatForMapSix[stnId]){
      const stnWx =  obsDatForMapSix[stnId]['mapWx']
      // console.log(' obsDatForMapSix[stnId]',  stnId, obsDatForMapSix[stnId])
      // console.log('stnId', stnId)
      // console.log('data', obsDatForMapSix[stnId]['mapWx'])
      stnColor = getColor(stnWx)
      // console.log('stncolor', stnColor)
    }
    else{
      console.log('no obs for', stnId)
    }
    
  }
  if( features[feature]['geometry']){
    // console.log('feature', features[feature]['geometry']['coordinates'])
    // console.log('station color for map', stnColor)
    const coords = features[feature]['geometry']['coordinates']
    allfeats.push(<CircleMarker center={[coords[1],coords[0]]} key={feature} pathOptions={{ color: stnColor, fillColor: stnColor }} radius={3} />)
  }
}
export const MetarMap = () => {
  const position = [42.1, -112.13]; // [latitude, longitude]
  const zoomLevel = 5;
  const fuuu = ({properties},latlng)=>{
    const {lat,lng} = latlng
    console.log('lat', lat, 'lon', lng)
    return (
      <Marker
        position = {[lat,lng]}
      />
    )
  }
  const pointToLayer = (feature, latlng) => {
    console.log('feature', feature, 'latlong',latlng)
    return (
      <CircleMarker
        center={latlng}
        radius={10} // adjust radius as needed
        color="red" // set desired color
      />
    );
  };
  return (
    <MapContainer 
        center={position} 
        zoom={zoomLevel} 
        scrollWheelZoom={true}
    >
    {allfeats}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
    </MapContainer>
  );
};

export default MetarMap