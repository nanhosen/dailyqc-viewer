import DataProvider from "../providers/DataProvider"

Data DataProvider

const [reducerServerData, reducerServerDataDispatch] = useReducer(newserverdatareducer, {})

const fetchData = async (requestEndHour, timeDelta, requestUrl) => {
  console.log('in fetch data', requestEndHour, timeDelta)
  reducerServerDataDispatch({ type: 'FETCH_DATA_START', payload:null });
  try {
    const response = await axios.get(requestUrl); // Example endpoint
    console.log('response', response)
    reducerServerDataDispatch({ type: 'FETCH_DATA_SUCCESS', payload: { timeDelta, requestEndHour, data: response.data } });
  } catch (error) {
    console.log('here is an error', error)
    reducerServerDataDispatch({ type: 'FETCH_DATA_FAILURE', payload: error });
  }
};

useEffect(()=>{
  fetchData(requestEndHour, timeDelta, requestUrl)
},[])




function newserverdatareducer(state = {}, action) {
  console.log('this action', action)
  console.log('this state', state)
  const {type, payload} = action
  console.log('payloiad', payload)
  switch (action.type) {
    case 'FETCH_DATA_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_DATA_SUCCESS':
      console.log('this action', action)
  console.log('this state', state)
      let nextState 
      const {timeDelta, requestEndHour, data} = payload
      console.log('nextState', nextState)
      const deltaString = `d${timeDelta}`
      if(!state.data){
        console.log('no state data')
        nextState= {[deltaString]: {[requestEndHour]:data}}
        console.log('nextState', nextState)
      }
      else{
        nextState = {...state.data}
        if(deltaString in nextState){
          
          nextState[deltaString][requestEndHour] = data
          
        }
        else{
          nextState[deltaString] = {[requestEndHour]:data}
        }
        console.log('there is state data', nextState)
      }
      // if (deltaString in stateData){
      //   console.log('already have delta time')
      // }

      // stateData[deltaString]=data
      return {
        ...state,
        loading: false,
        data: {...nextState},
      };
    case 'FETCH_DATA_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
}
