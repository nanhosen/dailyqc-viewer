import React, { useState, useEffect, useReducer } from 'react'
import { AppContext } from '../contexts/AppContext'
import axios from 'axios'
import useAxios from 'axios-hooks' 
import {makeUseAxios} from 'axios-hooks'
import {roundToPreviousZHour, getNewDateFromDelta,makeRequestUrl, tranformFunction,checkDates} from '../utils/helperFns'



function requestHourReducer(state={}, action){
  const {payload, type} = action
  const {timeDelta} = payload
  // const stateRoundedToZ = roundToPreviousZHour(state,timeDelta) //this is for when go to 1 hour increments and end time is like 13 z or something. then if go to 6 or 24 hour increments this should make it line up with those time chunks
  console.log('action here', action, state, 'stateRounded', state)
  let newDate
  switch (action.type) {
    case 'forward':
      console.log('forwardddd', 'state',state, action)
      newDate = getNewDateFromDelta(state,timeDelta, 'add')
      console.log('newDate', newDate, 'newDateRounded', roundToPreviousZHour(newDate,timeDelta))
      const isValid = checkDates(newDate, timeDelta)
      console.log('here2', 'isValid', isValid, isValid == 'valid')
      const returnDate = isValid === 'valid' ? newDate : state
      console.log('returnDate', returnDate, 'newDate', newDate)
      return isValid == 'valid' ? newDate : state
    case 'back':
      newDate = getNewDateFromDelta(state,timeDelta, 'subtract')
      return newDate
    default:
      return state;
  }


}

function dataStatusReducer(state='done', action){
  const {payload, type} = action
  console.log('action here', action, state)
  switch (action.type) {
    case 'loading':
      console.log('loading', state, action)
      return 'loading'
    case 'done':
      console.log('done', state, action)
      return 'done'
    case 'error':
      console.log('error', state, action)
      return 'error'
    default:
      console.log('default', state, action)
      return 'done';
  }


}

// function data2Reducer(state={}, action){
//   const {payload, type} = action
//   console.log('action here', action, state)
//   let newDate
//   switch (action.type) {
//     case 'forward':
//       // console.log('forward', 'state',state, action)
//       newDate = getNewDateFromDelta(state,6, 'add')
//       const isValid = checkDates(newDate)
//       // console.log('isValid', isValid, isValid == true)
//       return isValid === true ? newDate : state
//     case 'back':
//       newDate = getNewDateFromDelta(state,6, 'subtract')
//       return newDate
//     default:
//       return state;
//   }


// }


export default function DataProvider({children}){
  const [timeDelta, setTimeDelta] = useState(6)
  const [requestEndHour, setRequestEndHourDispatch] = useReducer(requestHourReducer, roundToPreviousZHour(new Date(),timeDelta))
  const [data2, setData2] = useState({})
  const [requestBeginHour, setRequestBeginHour] = useState(getNewDateFromDelta(requestEndHour,timeDelta, 'subtract'))
  const [requestUrl, setRequestUrl] = useState(makeRequestUrl(requestBeginHour,requestEndHour,timeDelta))
  const [dataStatus, dataStatusDispatch] = useReducer(dataStatusReducer, 'done')
  // const [{ data:requestData, loading, error }, refetch] = useAxios(requestUrl)
  const [dataforApp, setDataForApp] = useState({})
  // const [reducerServerData, reducerServerDataDispatch] = useReducer(newserverdatareducer, {})
  const useAxios1 = makeUseAxios({
    axios: axios.create({
      transformResponse:[
        (data1) =>{
          let resp;
          let transformedData
          const deltaString = `d${timeDelta}`
          try {
            resp = JSON.parse(data1)
            // console.log('resppppp', resp.status === undefined)
            transformedData = tranformFunction(data1,dataforApp,timeDelta,requestEndHour)
            setDataForApp(transformedData)
          } catch (error) {
            // console.log('!!!!!!! error')
            return{data: null, loading: null, error: JSON.stringify(error), timeDelta, requestEndHour}
        
          }
          if (!resp.status) {
            // console.log('in success here')
            setDataForApp(transformedData)
            return{data: resp, loading: null, error: null, timeDelta, requestEndHour}
          } else {
            return{data: null, loading: null, error: resp, timeDelta, requestEndHour}
          }
        }
      ]
    })
  })
  const [{ data:requestData, loading, error }, refetch] = useAxios1(requestUrl)
  console.log('loading', loading, 'error', error,'requestEndHour',requestEndHour,'this is rounded', roundToPreviousZHour(requestEndHour,timeDelta)) 
  useEffect(()=>{
    setRequestBeginHour(getNewDateFromDelta(requestEndHour,timeDelta, 'subtract'))
    setRequestUrl(makeRequestUrl(requestBeginHour,requestEndHour,timeDelta))


  },[requestEndHour,timeDelta])

  useEffect(()=>{
    console.log('time delta changed', timeDelta, 'this is the request end hour', requestEndHour)


  },[timeDelta])

  useEffect(()=>{
    
    // console.log('zzzzzzzzzzzzzzz',requestUrl)
  },[requestUrl])

  return (
    <AppContext.Provider value={{timeDelta,setTimeDelta,requestEndHour,requestBeginHour,requestData,loading,error, dataforApp,setRequestEndHourDispatch}}>
          {children}
    </AppContext.Provider>
  );
}
