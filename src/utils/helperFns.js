// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler
import {getCbrfcMetars} from '../data/stnInfo'
function formatDate(inDate){
  const date = new Date(inDate)
  const formattedDate = `${date.getFullYear()}-${
    ('0' + (date.getMonth() + 1)).slice(-2)
  }-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:00:00Z`;
  return formattedDate
}

function getKeyByValue(obj, value) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (obj[keys[i]] === value) {
      return keys[i];
    }
  }
  return null;
}

function formatDateReadable(inDate){
  const date = new Date(inDate)
  const utcDay = date.getUTCDate()
  const utcMonth = date.getUTCMonth() + 1
  const utcHours = date.getUTCHours()
  // console.log('date', date, utcDay, utcMonth)
  return `${utcMonth}/${utcDay} ${utcHours}z`
}

function formatMapDate(beginDateIn, endDateIn){
  // console.log('made it here',beginDateIn, endDateIn)
  const beginDate = new Date(beginDateIn)
  const endDate = new Date(endDateIn)
  const utcDayBegin = beginDate.getUTCDate()
  const utcDayEnd = endDate.getUTCDate()
  // console.log(utcDayBegin, utcDayEnd, utcDayBegin === utcDayEnd, 'dateCompare')
  const utcMonthBegin = beginDate.getUTCMonth() + 1
  const utcHoursBegin = beginDate.getUTCHours()

  const utcMonthEnd = endDate.getUTCMonth() + 1
  const utcHoursEnd = endDate.getUTCHours()
  if(utcDayBegin === utcDayEnd){
    return `${utcMonthBegin}/${utcDayBegin} ${utcHoursBegin}z - ${utcHoursEnd}z`
  }
  else{

    return `${formatDateReadable(beginDateIn)} to ${formatDateReadable(endDateIn)}`
  }
  // console.log('date', date, utcDay, utcMonth)
}

function roundToPreviousZHour(currentTimeIn, timeDelta) {
  const currentTime = new Date(currentTimeIn)
  console.log('currentTime, timeDelta', currentTime, 'current time type', typeof currentTime,  timeDelta)
  // Get the current hour in Z format
  const roundHrObj = {
    1: [1,2,3,4,5,6,7,8,9,0,11,12,13,14,15,16,17,18,19,20,21,22,23],
    6:[0, 6, 12, 18],
    12:[0,12,24],
    24:[0]
  }
  // console.log('here28',roundHrObj, timeDelta, typeof timeDelta)
  const currentHour = currentTime.getUTCHours();
  const currDay = currentTime.getUTCDate()
  const currMonth = currentTime.getUTCMonth() 
  const currYear = currentTime.getUTCFullYear()
  console.log('currrrrrr',currMonth,currDay,currYear)
  let roundedDay
  const zHrAr = roundHrObj[timeDelta]
  console.log(zHrAr, 'currentHour',currentHour)
  const highestLowerNumber =zHrAr.includes(currentHour) ? currentHour : zHrAr.filter(number => number < currentHour).pop();
  console.log('highestLowerNumber',highestLowerNumber)
  if(highestLowerNumber ===0){
      console.log('have to go back because in zero')
      const previousDay = new Date(currentTime);
       previousDay.setDate(currDay - 1);
       const previousDate = currDay
       console.log('previousDay',previousDay, 'previousDate',previousDate)
       roundedDay = previousDate
  }
  else{
      roundedDay = currDay
  }
  const roundedTime = new Date(currYear,currMonth, roundedDay,highestLowerNumber);

  // Return the rounded date and time
  return formatDate(roundedTime);
}

function getNewDateFromDelta(currTime, timeDelta, addOrSubtract = 'subtract'){
  // console.log('curr time', currTime,new Date(currTime))
  // console.log('wtf', currTime, timeDelta, addOrSubtract)
  const originalDate = new Date(currTime);
  // Subtract six hours in milliseconds
  const sixHoursInMs = timeDelta * 60 * 60 * 1000;
  // console.log('sixHoursInMs', sixHoursInMs)
  const subtractedDate = new Date(originalDate.getTime() - sixHoursInMs);
  const addedDate = new Date(originalDate.getTime() + sixHoursInMs);
  // Format the subtracted date
  // console.log('originalDate.getTime()', originalDate.getTime())
  // console.log('originalDate.getTime() - sixHoursInMs.getTime()', originalDate.getTime() - sixHoursInMs)
  const subtractedDateFormatted = subtractedDate.toISOString().slice(0, 19) + 'Z';
  const addedDateFormatted = addedDate.toISOString().slice(0, 19) + 'Z';

  return addOrSubtract === 'add' ? addedDateFormatted : subtractedDateFormatted
}

function makeRequestUrl(requestBeginHour,requestEndHour, timeDelta){
  // console.log('timeDelta', timeDelta)
  const requestMetars = getCbrfcMetars()
  const calcedBeginHour = getNewDateFromDelta(requestEndHour,timeDelta,'subtract')
  const url = `https://api.weather.gov/stations/${requestMetars}/observations?start=${calcedBeginHour}&end=${requestEndHour}`
  // console.log('url', url)
  return url
}

function tranformFunction(resp,dataforApp,timeDelta,requestEndHour){
  let data
  const nextState = {...dataforApp}
  const deltaString = `d${timeDelta}`

    data = JSON.parse(resp);
    // console.log(typeof resp, typeof data, 'types')
    // console.log('resppp', requestEndHour,resp,requestEndHour,dataforApp)
    if(!dataforApp){
      // console.log('no state data')
      nextState= {[deltaString]: {[requestEndHour]:data}}
      // console.log('nextState', nextState)
    }
    else{
      
      if(deltaString in nextState){
        
        nextState[deltaString][requestEndHour] = data
        
      }
      else{
        nextState[deltaString] = {[requestEndHour]:data}
      }
      // console.log('there is state data', nextState)
    }
    return nextState
}

function getUTCThings(date){
  const day = new Date(date).getUTCDate()
  const month = new Date(date).getUTCMonth()
  const year = new Date(date).getUTCFullYear()
  return {day, month, year}
}
function checkDates(newDate, timeDelta){
  console.log('in checkDates', newDate, timeDelta)
  // console.log(newDate,'asdfasdf')
  console.log('calling roundToPreviousZHour from checkDates')
  const newDateRounded = roundToPreviousZHour(new Date(newDate),timeDelta)
  console.log('new date rounded', newDateRounded)
  const {day: newDay, month: newMonth, year: newYear} = getUTCThings(newDateRounded)
  const newDateDate = new Date(newDate)
  console.log('rounding again from line 123 calling roundTo')
  const currDate = roundToPreviousZHour(new Date(),timeDelta)
  const {day: currDay, month: currMonth, year: currYear} = getUTCThings(currDate)

  // console.log('two dates', 'current', currDate, 'forward dtae', newDateRounded)
  // console.log('new', newDay, newMonth, newYear)
  // console.log('curr', currDay, currMonth, currYear)
  const newDateUnix = new Date(newDateRounded).getTime()
  const currDateUnix = new Date(currDate).getTime()
  // console.log('check time',newDateUnix - currDateUnix)
  const timeCheck = newDateUnix - currDateUnix
  console.log('time check', timeCheck)
  return  timeCheck >0 ? 'invalid' : 'valid'

}
export {roundToPreviousZHour, getKeyByValue, getNewDateFromDelta,makeRequestUrl,tranformFunction, checkDates, formatDateReadable, formatMapDate}