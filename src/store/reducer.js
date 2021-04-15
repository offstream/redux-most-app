export default (state, action) => {
  switch (action.type) {
    case 'INC': return { ...state, count: state.count + 1 }
    case 'DEC': return { ...state, count: state.count - 1 }
    case 'LOG': {
      console.log(action.payload)
      return state
    }
    default: return state
  }
}
