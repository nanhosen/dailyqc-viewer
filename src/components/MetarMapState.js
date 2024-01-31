import React, { useEffect, useContext, useState } from "react";

import AppContext from '../contexts/AppContext'
import { MapContainer, TileLayer } from "react-leaflet";
import { GeoJSON } from 'react-leaflet/GeoJSON'
import { CircleMarker } from 'react-leaflet/CircleMarker'
import { Circle } from 'react-leaflet/Circle'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Marker } from 'react-leaflet/Marker'
import { Popup } from 'react-leaflet/Popup'
import getMetarLocations from "../data/metarLocations";
import getDevObsData from "../data/devObsData"
import returnDevObsDataSixhr from "../data/devObsDataSixhr"
import processObs from "../actions/processObs";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LoadingButton from '@mui/lab/LoadingButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import 'leaflet/dist/leaflet.css';
import {icon} from 'leaflet'
import {formatDateReadable, formatMapDate,getKeyByValue} from '../utils/helperFns'
// import '../../public/fogicon.png'

// 

// const cloudIcon = new icon({
//   iconUrl: "/cloud1.png",
//   iconSize: [32, 32],
// })

// const iconObj = {
//   clouds: '/cloud1.png',
//   rain:'/rain.png',
//   snow:'/snow.png',
//   clear: '/sunny.png'
// }
// const colorObj = {
//   "CLR": '/sunny.png',
//   "SKC": '/sunny.png',
//   "FEW": '/sunny.png',
//   "SCT": '/sunny.png',
//   "BKN": '#979392',
//   "VV": '#F5CC4D',
//   "OVC": '#979392',
//   "liquid": '#4D9FF5',
//   "frozen": '#B9DCF1',
//   "missing":'black'
// }
// const getIcon(type){
//   const iconpath = iconObj[type]
//   return new icon({
//     iconUrl: iconpath,
//     iconSize: [32, 32],
//   })
// }
// 
const cloudIcon = new icon({
  iconUrl: "/cloud1.png",
  iconSize: [32, 32],
})

const cloudObj = {
  CLR:0,
  SKC:0,
  FEW:1,
  SCT:2,
  BKN:3,
  VV:4,
  OVC:5,
  RA: 6,
  SN: 7
}
// icons from here: https://www.iconfinder.com/icons/2682821/fog_foggy_forecast_mist_weather_icon?coming-from=related-results

// "CLR": {path:'%PUBLIC_URL%/sunny.png', size:[32,32]},
const getIcon = (type) =>{
  const iconObj = {
    "SKC": {path:'https://www.cbrfc.noaa.gov/dbdata/station/info/dqc/sunny.png', size:[32,32]},
    "CLR": {path:'/dbdata/station/info/dqc/sunny.png', size:[32,32]},
    // "CLR": {path:'https://www.cbrfc.noaa.gov/dbdata/station/info/dqc/sunny.png', size:[32,32]},
    "FEW": {path:'https://www.cbrfc.noaa.gov/dbdata/station/info/dqc/sunny.png', size:[32,32]},
    "SCT": {path:'https://www.cbrfc.noaa.gov/dbdata/station/info/dqc/sunny.png', size:[32,32]},
    "BKN": {path:'https://www.cbrfc.noaa.gov/dbdata/station/info/dqc/cloud1.png', size:[32,32]},
    "VV": {path:'/dbdata/station/info/dqc/fogicon.png', size:[20,20]},
    "OVC": {path:'https://www.cbrfc.noaa.gov/dbdata/station/info/dqc/cloud1.png', size:[32,32]},
    "liquid": {path:'https://www.cbrfc.noaa.gov/dbdata/station/info/dqc/rain.png', size:[20,20]},
    "frozen": {path:'https://www.cbrfc.noaa.gov/dbdata/station/info/dqc/snow.png', size:[20,20]},
    "missing":{path:'https://www.cbrfc.noaa.gov/dbdata/station/info/dqc/missing.png', size:[20,20]}
  }
  const iconpath = type in iconObj ? iconObj[type]['path'] : iconObj['missing']
  const iconSize =  type in iconObj ? iconObj[type]['size'] : iconObj['missing']
  return new icon({
    iconUrl: iconpath,
    iconSize: iconSize,
  })
}
// console.log('icon', ugh)
const dat  =getMetarLocations()
const legalIcon = new icon ({
  iconUrl : 'https://img.icons8.com/external-icongeek26-linear-colour-icongeek26/64/external-legal-business-and-finance-icongeek26-linear-colour-icongeek26.png',
  iconSize : [35,35], // size of the icon
  iconAnchor : [22,94], // point of the icon which will correspond to marker's location
  popupAnchor : [-3, -76] // point from which the popup should open relative to the iconAnchor

})
// const obsDat = returnDevObsDataSixhr('2024-01-24T00:00:00Z') 

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
    "frozen": '#B9DCF1',
    "missing":'black'
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


function MapLayers(props){
  const { obsDatCont } = props
  // console.log('obsDatCont', obsDatCont)
  // const getHourAr = ['2024-01-24T00:00:00Z','2024-01-24T06:00:00Z']
  // const hourKey = hourIndex == 0 ? getHourAr[0] : getHourAr[1]
  // console.log('hourkey', hourKey)
  // const obsDat = returnDevObsDataSixhr(hourKey) 
  // const deltaKey = `d${context.timeDelta}`
  const allfeats = [] 
  
  if(obsDatCont && obsDatCont.features){

    const obsDatForMapSix = processObs(obsDatCont.features) 
    const features = dat['features']
    
    for(const feature in features){
      // console.log('feature', features[feature])
    
      let stnId
      let elevation
      let hourAr
      let stnWx
      let hourWxArStr
      let stnColor = 'black'
      let stnIcon = getIcon('missing')
      if( features[feature]['properties']){
        stnId = features[feature]['properties']['ICAO']
        elevation = features[feature]['properties']['ELEVATION']
        if(obsDatForMapSix[stnId]){
          stnWx =  obsDatForMapSix[stnId]['mapWx']
          hourAr = obsDatForMapSix[stnId]['hourAr']
          const hourWxAr =  hourAr.map(curr => getKeyByValue(cloudObj,curr))
          hourWxArStr = hourWxAr.join(", ")
          
          // console.log('hourWxAr', hourWxAr, hourWxAr.join(", "))
          // console.log(' obsDatForMapSix[stnId]',  stnId, obsDatForMapSix[stnId])
          // console.log('stnId', stnId)
          // console.log('data', obsDatForMapSix[stnId]['mapWx'])
          stnColor = getColor(stnWx)
          stnIcon = getIcon(stnWx)
          // console.log('stncolor', stnColor)
        }
        else{
          // console.log('no obs for', stnId)
        }
        
      }
      if( features[feature]['geometry']){  
        // console.log('feature', features[feature]['geometry']['coordinates'])
        // console.log('station color for map', features[feature])
        const coords = features[feature]['geometry']['coordinates']
        // if(stnId === 'KFBR' || stnId === 'KEMM'){
          // console.log('coords', coords)
        // }
        // allfeats.push(
        // <CircleMarker
        //   center={[coords[1],coords[0]]} 
        //   key={feature} 
        //   pathOptions={{ color: stnColor, fillColor: stnColor }} 
        //   radius={5} 
        // >  
        //   <Popup>
        //       {stnId}, {hourAr}, {stnWx}
        //   </Popup>
        // </CircleMarker> 
        // )
        // console.log([coords[1],coords[0]])
        allfeats.push(
          <Marker 
            position={[coords[1],coords[0]]} 
            key={feature} 
            icon = {stnIcon}  
          >
                       <Popup>
               <b>Station ID:</b> {stnId} <br /> <b>Elevation:</b> {elevation} <br /><b>Hourly Weather:</b>{hourWxArStr}
           </Popup>
          </Marker>
        )
      }
    }
  }
  return allfeats

}
// function HourButtonGroup({loading,handleChange,timeDelta,requestBeginHour,requestEndHour}){
//   if(loading){
    // return (
    //   <>
    //     <ButtonGroup disableElevation={true} size="small"  fullWidth = {false} variant="contained"  aria-label="outlined primary button group">
    //       <LoadingButton onClick = {()=>handleChange('backward')} value='one' > <ChevronLeftIcon />- {context.timeDelta} hrs</LoadingButton>
    //       <Button onClick = {()=>handleChange('forward')} value='one' >+ {context.timeDelta} hrs  <ChevronRightIcon /></Button>
    //     </ButtonGroup>
    //   </Grid>
    //   <Grid item xs={3} sm={3} md={6}  lg={9}>
    //   <Button variant="outlined" size="small" className="align-left">
    //     {formatDateReadable(context.requestBeginHour)} - {formatDateReadable(context.requestEndHour)}
    //   </Button>
    //   </>
    // )
//   }
  
// }

function HourButtonGroup({loading,handleChange,timeDelta}){
  if(loading){
    return(
      <ButtonGroup disableElevation={true} size="small" className="align-left"  fullWidth = {false} variant="contained"  aria-label="outlined primary button group">
          <LoadingButton loading  value='one' > -</LoadingButton>
          <LoadingButton loading  value='one' >+</LoadingButton>
      </ButtonGroup>
    )
  }
  else{
    return(
      <ButtonGroup disableElevation={true} size="small"  className="align-left" fullWidth = {false} variant="contained"  aria-label="outlined primary button group">
          <Button onClick = {()=>handleChange('backward')} value='one' > <ChevronLeftIcon />- {timeDelta} hrs</Button>
          <Button onClick = {()=>handleChange('forward')} value='one' >+ {timeDelta} hrs  <ChevronRightIcon /></Button>
        </ButtonGroup>
    )
  }
}
export default function MetarMapState () {
  const context = useContext(AppContext)
  const [hourIndex, setHourIndex] = React.useState(0)
  const [hourKey, setHourKey] = React.useState('2024-01-24T00:00:00Z')
  const [obsDatCont, setObsDat] = useState({})
  const position = [38.12, -111.97]; // [latitude, longitude]
  const zoomLevel = 6

  useEffect(()=>{
    // console.log('map for data should be cahnging')
    if(context.dataforApp && context.requestEndHour &&context.timeDelta){
      const deltaKey = `d${context.timeDelta}`
      if(deltaKey in context.dataforApp){
        if(context.requestEndHour in context.dataforApp[deltaKey]){
          const obsDatContext = context['dataforApp'][deltaKey][context.requestEndHour]
          setObsDat(obsDatContext)
          // console.log(obsDatContext,'pleeeease')
        }
      }

      
      // console.log('fuuu', context.dataforApp, context.requestEndHour,context.timeDelta)
      // 
      
    }
  },[context.dataforApp, context.requestEndHour,context.timeDelta])

  useEffect(()=>{
    console.log('context changed',context)
  },[context])
  // const handleChange = (in)=>{
  //   console.log('in', in)
  // }
  const handleChange = (
    event
  ) => {
    // console.log('event, enea', event)
    let nextIndex
    if(event == 'forward'){
      nextIndex = hourIndex + 1
      console.log('clicked foraward delta', context.timeDelta)
      context.setRequestEndHourDispatch({type: 'forward', payload: {appData: context.dataforApp, timeDelta: context.timeDelta}})
      setHourIndex()
    }
    else if(event == 'backward'){
      nextIndex = hourIndex>0 ? hourIndex - 1 : hourIndex
      context.setRequestEndHourDispatch({type: 'back', payload:{appData: context.dataforApp, timeDelta: context.timeDelta}})
    }
    else{
      console.log('this is weird i am not a recovnized event', event)
      nextIndex = hourIndex
    }
    setHourIndex(nextIndex)
  };
  React.useEffect(()=>{
    // console.log('hour index changed', hourIndex)
    // const getHourAr = ['2024-01-24T00:00:00Z','2024-01-24T06:00:00Z']
    // const nextHourKey = hourIndex == 0 ? getHourAr[0] : getHourAr[1]
    // setHourKey(nextHourKey)
  // console.log('hourkey', hourKey)
  },[hourIndex])
  // const fuuu = ({properties},latlng)=>{
  //   const {lat,lng} = latlng
  //   // console.log('lat', lat, 'lon', lng)
  //   return (
  //     <Marker
  //       position = {[lat,lng]}
  //     />
  //   )
  // }
  const pointToLayer = (feature, latlng) => {
    // console.log('feature', feature, 'latlong',latlng)
    return (
      <CircleMarker
        center={latlng}
        radius={10} // adjust radius as needed
        color="red" // set desired color
      />
    );
  };
  return (
    <>
    <MapContainer 
        center={position} 
        zoom={zoomLevel} 
        scrollWheelZoom={true}
    >
      <MapLayers obsDatCont = {obsDatCont} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
    </MapContainer>
    <Box>
    <Grid container spacing={1} sx={{mt:1}} alignItems="flex-start" justifyContent="center" >
      <Grid item xs={"auto"} sm={"auto"} md={"auto"}  lg={"auto"}>
      {/* <Button variant="outlined" size="small" className="align-left"> */}
        {/* {formatDateReadable(context.requestBeginHour)} - {formatDateReadable(context.requestEndHour)} */}
      {/* </Button> */}

        <Typography variant="h6"  align = 'left'>
        {/* {context.requestBeginHour} to {context.requestEndHour} */}
        Map Time: {formatMapDate(context.requestBeginHour, context.requestEndHour)}
        </Typography>
      </Grid>
      <Grid item xs={"auto"} sm={"auto"} md={"auto"} lg={"auto"}>
        {< HourButtonGroup loading ={context.loading} handleChange = {handleChange} timeDelta = {context.timeDelta} />}

        {/* <ButtonGroup disableElevation={true} size="small"  fullWidth = {false} variant="contained"  aria-label="outlined primary button group">
          <LoadingButton loading onClick = {()=>handleChange('backward')} value='one' > <ChevronLeftIcon />- {context.timeDelta} hrs</LoadingButton>
          <Button onClick = {()=>handleChange('forward')} value='one' >+ {context.timeDelta} hrs  <ChevronRightIcon /></Button>
        </ButtonGroup> */}
      </Grid>
      <Grid item xs={"auto"} sm={"auto"} md={"auto"} lg={"auto"}>
        <ControlledRadioButtonsGroup />
      </Grid>
      
      
    </Grid>

    </Box>
    

    </>
  );
};

function ControlledRadioButtonsGroup() {
  const context = useContext(AppContext)
  // const [value, setValue] = React.useState(context.timeDelta);

  const handleChange = (event) => {
    console.log('clicked',event.target.value)
    context.setTimeDelta(event.target.value);
  };

  return (
    <FormControl size="small" >
      <FormLabel  labelPlacement = 'start' id="demo-controlled-radio-buttons-group">Summary Hours</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-controlled-radio-buttons-group"
        name="controlled-radio-buttons-group"
        value={context.timeDelta}
        onChange={handleChange}
        
      >
        <FormControlLabel value={1} control={<Radio />} label='1' />
        <FormControlLabel value={6} control={<Radio />} label='6' />
        <FormControlLabel value={12} control={<Radio />} label='12' />
        <FormControlLabel value={24} control={<Radio />} label='24' />
      </RadioGroup>
    </FormControl>
  );
}