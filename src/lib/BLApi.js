import axios from 'axios';

const API_PRODUCTS = 'https://api.bukalapak.com/v2/products.json';
const API_BASE_URL = 'https://api.bukalapak.com/v2';
const API_PROVINCE = 'https://api.bukalapak.com/v2/address/cities.json';

class BLApi {
  // =============================
  // Api call related functions
  // =============================
  static getProducts(page, keyword, filter = {}) {
    console.log("selected filter are : " , filter);
    return axios.get(API_PRODUCTS, {
      params: {
        page: page || 1,
        per_page: 24,
        keywords: keyword || 'murah',
        category_id: filter.category_id || 159,
        nego: filter.nego || 1,
        harga_pas: filter.harga_pas || 1,
        province: filter.province || 'DKI Jakarta',
        top_seller: filter.top_seller || 0,
        city: filter.city || 'Jakarta Pusat',
        price_min: filter.price_min || 0,
        price_max: filter.price_max || 999999999,
        sort_by: filter.sort_by || 'Termurah', // Termahal, Terbaru, Acak
      },
    });
  }

  static getCity(province){
    return axios.get(API_PROVINCE, {
      params: {
        province: province || 'DKI Jakarta',
      }
    })
  }

  // =============================
  // Static functions
  // =============================

  static mathAnalysis(result) {
    if ( result != null  && result.length > 0 ) {
      const prices = result.sort((a, b) => {
        return a.price - b.price;
      });

      const max_price = prices[prices.length - 1].price;
      const min_price = prices[0].price;
      let avg_price = 0;

      const num_class_interval = Math.round(1 + 3.3 * Math.log10(prices.length));
      const range = max_price - min_price;
      console.log(this);
      const summary = this.initSummary(num_class_interval);

      for (let i = prices.length - 1; i >= 0; i--) {
        avg_price = avg_price + prices[i].price;
        prices[i].class = this.checkClassRange(prices[i].price, min_price, range, num_class_interval);

        const text = `_${prices[i].class}`;

        summary[text].avg_price = summary[text].avg_price + prices[i].price;
        summary[text].avg_sold = summary[text].avg_sold + prices[i].sold;
        summary[text].count = summary[text].count + 1;
      }

      const profit = {};
      for (let i = num_class_interval - 1; i >= 0; i--) {
        const text = `_${i + 1}`;
        // safe division by zero.. not to trigger NaN
        summary[text].avg_price = (summary[text].count > 0 ? summary[text].avg_price / summary[text].count : 0);
        summary[text].avg_sold = (summary[text].count > 0 ? summary[text].avg_sold / summary[text].count : 0);

        profit[text] = summary[text].avg_price * summary[text].avg_sold;
      }

      // find best price
      const best_price_index = this.findBestPrice(profit);
      const best_price = summary[best_price_index].avg_price;

      //generategraphdata
      const graph = this.generateGraphData(summary, num_class_interval);

      // calculate avg_price
      avg_price = avg_price / prices.length;

      const retval = {
        min_price,
        max_price,
        avg_price,
        best_price,
        summary,
        graph,
      };
      return retval;

    }else{

      const retval = {
        min_price : 0,
        max_price : 0,
        avg_price : 0,
        best_price : 0,
        summary : null,
        graph: [],
      };
      return retval;
    }
  }

  // =============================
  // Private functions
  // =============================
  static parsePrice(succ) {
    const prices = [];
    if (succ.products) {
      const products = succ.products;
      for (let i = products.length - 1; i >= 0; i--) {
        prices.push({
          price: products[i].price,
          sold: products[i].sold_count,
          class: '',
        });
      }
    }
    return prices;
  }

  static checkClassRange(value, min_value, range_max_min, num_class) {
    const percentage = (value - min_value) / range_max_min;
    for (let i = num_class - 1; i >= 0; i--) {
      const j = i + 1;
      const lower_limit = i / num_class;
      const upper_limit = j / num_class;
      if (lower_limit <= percentage && percentage < upper_limit) {
        return j;
      }
    }
    return num_class;
  }

  static initSummary(num_class) {
    const summary = {};
    for (let i = 1; i < num_class + 1; i++) {
      const text = `_${i}`;
      summary[text] = {
        avg_price: 0,
        avg_sold: 0,
        count: 0,
      };
    }
    return summary;
  }

  static findBestPrice(profit) {
    let first_time = true;
    let max_key = null;
    for (const key in profit) {
      if (profit.hasOwnProperty(key)) {
        if (first_time) {
          max_key = key;
          first_time = false;
        }

        if (profit[key] > profit[max_key]) {
          max_key = key;
        }
      }
    }
    return max_key;
  }

  static generateGraphData(summary, num_class) {
    const graph = [];
    for (let i = 0; i < num_class; i++) {
      const text = `_${i + 1}`;
      graph.push({
        name: text,
        v: summary[text].count,
      });
    }
    return graph;
  }
}

export default BLApi;
