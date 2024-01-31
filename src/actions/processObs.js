
function getKeyByValue(obj, value) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (obj[keys[i]] === value) {
      return keys[i];
    }
  }
  return null;
}
const processObs = (features)=>{
  
  function getMaxCloud(cloudAr, returnType = 'int'){
    const cloudObj = {
      'CLR':0,
      'SKC':0,
      'FEW':1,
      'SCT':2,
      'BKN':3,
      'VV':4,
      'OVC':5,
      'missing':-1
    }
    if (returnType === 'obj'){
      return cloudObj
    }
    else{
      const codeAr = []
      for(const layer in cloudAr){
        const layerAmt = cloudAr[layer]['amount']
        codeAr.push(cloudObj[layerAmt])
      }
      const maxValInt = Math.max(...codeAr)
      let mapCloudValStr
      for(const abbrev in cloudObj){
        if(maxValInt === cloudObj[abbrev]){
          mapCloudValStr =  abbrev
          break
        }
      }
      // console.log('mapCloudVal', mapCloudValStr)  
      return maxValInt
    }
    
  }
  function getWeather(weatherAr, returnType = 'int'){
    const liquidTypes = {typeAr:['drizzle',   'hail','spray', 'rain','squalls',  'thunderstorms'], typeCode:6}
    const frozenTypes = {typeAr:['snow_pellets',  'ice_crystals', 'ice_pellets', 'snow_grains', 'snow'],typeCode:7}   
    const otherTypes = {typeAr:['fog'],typeCode:8}   
    if(returnType == 'obj'){
      return {liquid: 6, frozen: 7}
    }
    else{
      const wxAr = weatherAr
      .filter(curr => liquidTypes.typeAr.includes(curr.weather) || frozenTypes.typeAr.includes(curr.weather))
      .map((curr)=>{ 
        // console.log('curr', curr)
        if(liquidTypes.typeAr.includes(curr.weather)){
          // console.log('curr weather is liquit', curr.weather)
          return liquidTypes.typeCode
        }
        else if(frozenTypes.typeAr.includes(curr.weather)){
          // console.log('curr weather is liquit', curr.weather)
          return frozenTypes.typeCode
        }
        else{
          return otherTypes.typeCode
        }
      })
    // console.log('wxAr', wxAr)  
    // # this will be undefined if the weather type is one in neither arrray
    let returnInt
    if(wxAr.length > 0){
      // console.log('weatherAr', weatherAr)
      returnInt =  wxAr[0]
      // returnStr ='l' 
    }
    else{
      returnInt = 0
    }
    return returnInt
    }
    

  }
  const stationObj = {}
  for (const featureNum in features){
    const feature = features[featureNum]
    // const props = feature.properties
    // const {elevationIdleDeadline, stationIdleDeadline, timestampIdleDeadline, rawMessageIdleDeadline, textDescriptionIdleDeadline, iconIdleDeadline, presentWeatherIdleDeadline, temperatureIdleDeadline, dewpointIdleDeadline, windDirectionIdleDeadline, windSpeedIdleDeadline, windGustIdleDeadline, barometricPressureIdleDeadline, seaLevelPressureIdleDeadline, visibilityIdleDeadline, maxTemperatureLast24HoursIdleDeadline, minTemperatureLast24HoursIdleDeadline, precipitationLastHourIdleDeadline, precipitationLast3HoursIdleDeadline, precipitationLast6HoursIdleDeadline, relativeHumidityIdleDeadline, windChillIdleDeadline, heatIndexIdleDeadline, cloudLayers}  = properties
    // console.log(Object.keys(props))
    // console.log('feature', feature)
    if(feature['properties']){
      const {elevation, station, timestamp, rawMessage, textDescription, icon, presentWeather, temperature, dewpoint, windDirection, windSpeed, windGust, barometricPressure, seaLevelPressure, visibility, maxTemperatureLast24Hours, minTemperatureLast24Hours, precipitationLastHour, precipitationLast3Hours, precipitationLast6Hours, relativeHumidity, windChill, heatIndex, cloudLayers} = feature.properties
      const stnId = station.split('/')[4]
      if(stnId == 'KLGU'){
        // console.log('KLGU',presentWeather, timestamp, 'cloudLayers', cloudLayers )
      }
      // console.log('stn', stnId) 
      // console.log(cloudLayers, cloudLayers.length)
      let mapWx
      const maxCloud = cloudLayers.length ==0 ?-1 : getMaxCloud(cloudLayers)
      // console.log('maxcloud', maxCloud)
      if(presentWeather.length >0){
        // console.log('presentWeather',presentWeather,  getWeather(presentWeather))
        // # this will be undefined if the weather type is one in neither arrray
         mapWx = getWeather(presentWeather) ? getWeather(presentWeather) : maxCloud
        
        
      }
      else{
         mapWx = maxCloud
      }
      // console.log('mapQx', mapWx)
      if(stnId in stationObj){
        // console.log('this exists going to add')
        stationObj[stnId]['hourAr'].push(mapWx)
      }
      else{
        // console.log('needto add to thing')
        stationObj[stnId] = {'hourAr':[mapWx]}
      }

      
    }

  }
  // console.log('stationObj',stationObj)
  const cloudObj = getMaxCloud([], 'obj')
  const liquidTypeMap = getWeather([], 'obj')
  const masterTypeMap = {...cloudObj, ...liquidTypeMap}
  for(const stnId in stationObj){
    const currObj = stationObj[stnId]
    // console.log('aasdfasdf', currObj.hourAr)
    const stationMax = Math.max(...currObj.hourAr)
    stationObj[stnId]['mapWx'] = getKeyByValue(masterTypeMap,stationMax)

  }
  // console.log('stationObj',stationObj)
  // console.log('masterTypeMap',masterTypeMap)
  // console.log('cloudObj',cloudObj)
  return stationObj
}

export default processObs
// function getDataSourceKeys(dataSource){
//   const crosswalkObj = {
//     both:{keep:['rfcData', 'nrcsData'],ignore:[]},
//     cbrfc:{keep:['rfcData'],ignore:['nrcsData']},
//     nrcs:{keep:['nrcsData'],ignore:['rfcData']}
//   }
//   const keep = crosswalkObj[dataSource]['keep']
//   const ignore = crosswalkObj[dataSource]['ignore']
//   // console.log('keep', keep, 'ignore', ignore)
//   // if(dataSource === 'nrcs'){
//   //   setBasinFilters([])
//   // }
//   return {keep, ignore}
// }

