import BLApi from '../lib/BLApi';
import axios from 'axios';

export const toggleModal = () => {
  return {
      type: 'TOGGLE_MODAL'
  };
}

export const toggleModalHelp = () => {
  return {
      type: 'TOGGLE_MODAL_HELP'
  };
}

export function getGraph(keyword, filter = null) {
  return dispatch => {
    const promises = [];
    const sampling = filter.sampling || 5;
    for (let i = 0; i < sampling; i++) {
      promises.push(BLApi.getProducts(i, keyword, filter));
    }

    // set loading
    dispatch(fetching(true));

    return axios.all(promises).then(responses => {
      dispatch(fetching(false));
      dispatch(calculating(true));

      // tell ui component that fetching is completed
      const tmp_resp = responses.map(r => r.data);
      console.log("Return dari server adalah ");
      console.log(tmp_resp);
      // collecting all datas
      let prices = [];
      tmp_resp.forEach(t => {
        prices = prices.concat(BLApi.parsePrice(t));
      });

      const result = BLApi.mathAnalysis(prices);

      // tell ui component that calculation is completed
      dispatch(calculating(false));
      dispatch(setData(result));
    })
    .catch(error => {
      throw (error);
    });
  };
}


// ================
// Private functions
// ================
export function setData(data) {
  return {
    type: 'PRICING_ACTION_SET',
    data,
  };
}

export function fetching(flag) {
  return {
    type: 'PRICING_ACTION_FETCHING',
    flag,
  };
}

export function calculating(flag) {
  return {
    type: 'PRICING_ACTION_CALCULATING',
    flag,
  };
}

export function setKeyValue(key, value) {
  return {
    type: 'PRICING_ACTION_SET_KEY_VALUE',
    key,
    value,
  };
}