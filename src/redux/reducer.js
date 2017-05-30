const initialState = {
  isModalOpen: false,
  isModalHelpOpen: true,
  graph: [], // array of object, please refer to react-node-pathjs-charts format
  max_price: 0,
  min_price: 0,
  avg_price: 0,
  best_price: 0,
  filter: {}, // Please refer to superagent passing params to http get. used to store filter
  isFetching: false,
  isCalculating: false,
  keyword: '',
};

export default(state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_MODAL':
      return { ...state, isModalOpen: !state.isModalOpen };
    case 'PRICING_ACTION_SET': {
      const { min_price, max_price, avg_price, best_price, graph } = action.data;
      return { ...state, max_price, min_price, avg_price, best_price, graph };
    }
    case 'TOGGLE_MODAL_HELP': 
      return { ...state, isModalHelpOpen: !state.isModalHelpOpen };
    case 'PRICING_ACTION_FETCHING':
      return { ...state, isFetching: action.flag };
    case 'PRICING_ACTION_CALCULATING':
      return { ...state, isCalculating: action.flag };
    case 'PRICING_ACTION_SET_KEY_VALUE':
      return { ...state, [action.key]: action.value };
    default:
      return state;
  }
};
