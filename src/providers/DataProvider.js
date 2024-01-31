import React, { useState, useEffect, useReducer, useCallback } from 'react'
import { useImmerReducer } from "use-immer";
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
      // console.log('forwardddd', 'state',state, action)
      newDate = getNewDateFromDelta(state,timeDelta, 'add')
      // console.log('newDate', newDate, 'newDateRounded', roundToPreviousZHour(newDate,timeDelta))
      const isValid = checkDates(newDate, timeDelta)
      // console.log('here2', 'isValid', isValid, isValid == 'valid')
      const returnDate = isValid === 'valid' ? newDate : state
      // console.log('returnDate', returnDate, 'newDate', newDate)
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
      // console.log('loading', state, action)
      return 'loading'
    case 'done':
      // console.log('done', state, action)
      return 'done'
    case 'error':
      // console.log('error', state, action)
      return 'error'
    default:
      // console.log('default', state, action)
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
const initDelta = 6
const initEndHour = roundToPreviousZHour(new Date(),initDelta)
const initBeginHour = getNewDateFromDelta(initEndHour,initDelta, 'subtract')

const immerDateReducer = (draft, action)=>{
  // console.log('in immer', draft, action, 'draft request end hour', draft.requestEndHour)
  const currDelta = draft.timeDelta
  const currEndDate = draft.requestEndHour
  switch(action.type){
    case "deltaChange":
      const newDelta = action.payload.newDelta
      // console.log('in delta, this is current end date.', currEndDate)
      const compatibleEnd = roundToPreviousZHour(currEndDate,newDelta)
      // console.log('in delta this is compatible end date', compatibleEnd)
      const thisBeginDate = getNewDateFromDelta(compatibleEnd,newDelta, 'subtract')
      draft.timeDelta = newDelta
      draft.requestBeginHour = thisBeginDate
      draft.requestEndHour = compatibleEnd
      break;
    case "forward" :
      // console.log('immer wants to go forward', draft, action)
      // console.log('forwardddd', 'state',state, action)
      const draftEndDate = getNewDateFromDelta(currEndDate,currDelta, 'add')
      // console.log('draft end date forwardt', draftEndDate)
      const isValid = checkDates(draftEndDate, currDelta)
      const newEndDate = isValid === 'valid' ? draftEndDate : currEndDate
      // console.log('new end date forwardt', newEndDate)
      const newBeginDate = getNewDateFromDelta(newEndDate,currDelta, 'subtract')
      // console.log('newBeginDate', newBeginDate)
      draft.timeDelta = currDelta
      draft.requestBeginHour = newBeginDate
      draft.requestEndHour = newEndDate
      break
    case "backward":
      // console.log('immer went backward', action, draft, 'that was the draft')
      const newEnd = getNewDateFromDelta(currEndDate,currDelta, 'subtract')
      const newBegin = getNewDateFromDelta(newEnd,currDelta, 'subtract')
      draft.requestBeginHour = newBegin
      draft.requestEndHour = newEnd
      break;
      
    default:
      break;
      // console.log('newDate', newDate, 'newDateRounded', roundToPreviousZHour(newDate,timeDelta))
      // const isValid = checkDates(newDate, timeDelta)
      // console.log('here2', 'isValid', isValid, isValid == 'valid')
      // const returnDate = isValid === 'valid' ? newDate : state
      // console.log('returnDate', returnDate, 'newDate', newDate)
      // return isValid == 'valid' ? newDate : state

  }

}


export default function DataProvider({children}){
  // const [timeDelta, setTimeDelta] = useState(6)
  // const [requestEndHour, setRequestEndHourDispatch] = useReducer(requestHourReducer, roundToPreviousZHour(new Date(),timeDelta))
  const [data2, setData2] = useState({})
  // const [requestBeginHour, setRequestBeginHour] = useState(getNewDateFromDelta(requestEndHour,timeDelta, 'subtract'))
  const [requestUrl, setRequestUrl] = useState(makeRequestUrl(initBeginHour,initEndHour,initDelta))
  const [dataStatus, dataStatusDispatch] = useReducer(dataStatusReducer, 'done')
  const [testDateState, dispatchTestDateState] = useImmerReducer( immerDateReducer,{requestBeginHour:initBeginHour, requestEndHour: initEndHour, timeDelta: initDelta}    )
  // const [{ data:requestData, loading, error }, refetch] = useAxios(requestUrl)
  const [dataforApp, setDataForApp] = useState({})
  // const [reducerServerData, reducerServerDataDispatch] = useReducer(newserverdatareducer, {})
  const useAxios1 = makeUseAxios({
    axios: axios.create({
      transformResponse:[
        (data1) =>{
          const reqTimeDelta = testDateState.timeDelta
          const reqReqEndHour = testDateState.requestEndHour

          // console.log('calling this hello fuuuuuuuu url', requestUrl)
          let resp;
          let transformedData
          const deltaString = `d${reqTimeDelta}`
          try {
            resp = JSON.parse(data1)
            // console.log('resppppp', resp.status === undefined)
            transformedData = tranformFunction(data1,dataforApp,reqTimeDelta,reqReqEndHour)
            // console.log('i am setting the data for the app wtf')
            setDataForApp(transformedData)
          } catch (error) {
            // console.log('!!!!!!! error')
            return{data: null, loading: null, error: JSON.stringify(error), reqTimeDelta, reqReqEndHour}
        
          }
          if (!resp.status) {
            // console.log('in success here')
            setDataForApp(transformedData)
            return{data: resp, loading: null, error: null, reqTimeDelta, reqReqEndHour}
          } else {
            return{data: null, loading: null, error: resp, reqTimeDelta, reqReqEndHour}
          }
        }
      ]
    })
  })
  const [{ data:requestData, loading, error }, refetch] = useAxios1(requestUrl)
  // console.log('loading', loading, 'error', error,'requestEndHour',requestEndHour,'this is rounded', roundToPreviousZHour(requestEndHour,timeDelta)) 
  // useEffect(()=>{
  //   // setRequestBeginHour(getNewDateFromDelta(requestEndHour,timeDelta, 'subtract'))
  //   // setRequestUrl(makeRequestUrl(requestBeginHour,requestEndHour,timeDelta))


  // },[requestEndHour,timeDelta])

  useEffect(()=>{
    // console.log('this is from the immer test, would make a new URL')
    // console.log('terst date state', testDateState)
    const urlBegin = testDateState.requestBeginHour
    const urlEnd = testDateState.requestEndHour
    const urlDelta = testDateState.timeDelta
    const newUrl = makeRequestUrl(urlBegin, urlEnd, urlDelta)
    // console.log('making url with this',urlBegin, urlEnd, urlDelta )
    // console.log('this is the new url', newUrl)
    setRequestUrl(makeRequestUrl(urlBegin,urlEnd,urlDelta))
  },[testDateState])

  // useEffect(()=>{
  //   // console.log('time delta changed', timeDelta, 'this is the request end hour', requestEndHour)


  // },[timeDelta])

  useEffect(()=>{
    
    // console.log('zzzzzzzzzzzzzzz',requestUrl)
  },[requestUrl])

  return (
    // <AppContext.Provider value={{timeDelta,setTimeDelta,requestEndHour,requestBeginHour,requestData,loading,error, dataforApp,setRequestEndHourDispatch,testDateState, dispatchTestDateState}}>
    <AppContext.Provider value={{requestData,loading,error, dataforApp,testDateState, dispatchTestDateState}}>
          {children}
    </AppContext.Provider>
  );
}
