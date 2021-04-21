export default (state, action) => {
  switch (action.type) {
    case 'INC': return { ...state, count: state.count + 1 }
    case 'DEC': return { ...state, count: state.count - 1 }
    case 'LOG': {
      // this is wrong and only done for quick side effect testing
      console.log(action.payload)
      return state
    }
    default: return state
  }
}
