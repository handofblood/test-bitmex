import {OrdersAPI} from "./../../api";
import store from "@/store";

export default {
  namespaced: true,
  state: {
    currencyInstruments: [],
    quotes: [],
    orderHistory:[],
  },
  mutations: {
    saveInstruments(state, data) {
      state.currencyInstruments = data;
    },
    saveOrderHistory(state, data) {
      state.orderHistory = data;
    },
    updateBySymbolName(state, data) {
      state.currencyInstruments.forEach(item=>{
        if (item.symbol===data.symbol){
         if (data.lastPrice){
            item.lastPrice =data.lastPrice;
          }
        }
      });
    },
    updateLatestQuote(state, data) {
      state.quotes.unshift(data);
      state.quotes.length=100;
    },
    saveQuotes(state, data) {
      state.quotes = data;
    },
  },
  actions: {
    loadInstruments(context) {
      return OrdersAPI.instrumentsAll().then(res => {
        context.commit("saveInstruments", res.data);
        return res.data;
      });
    },
    loadOrderHistory(context) {
      OrdersAPI.orderHistory().then(res=>{
        context.commit("saveOrderHistory", res.data);
        return res.data;
      });
    },
    loadQuotes({commit}, payload) {
      return OrdersAPI.quotesLast(payload).then(res => {
        commit("saveQuotes", res.data);
        return res.data;
      });
    },
  },
  getters: {
    currencyInstruments(state) {
      return state.currencyInstruments;
    },
    quotes(state) {
      return state.quotes;
    },
    orderHistory(state) {
      return state.orderHistory;
    },
  }
};
