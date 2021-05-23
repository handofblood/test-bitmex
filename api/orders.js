const OrdersAPI = {

  instrumentsAll() {
    return env.setUpHeaders({verb: 'GET', path: '/instrument/active'});
  },

   quotesLast(symbol) {
    return env.setUpHeaders({
      verb: 'GET',
      path: `/trade/bucketed?binSize=1m&partial=false&count=100&reverse=true&symbol=${symbol}`
    });
  },

  orderCreate(data) {
    return env.setUpHeaders({verb: 'POST', body: data, path: '/order'});
  },

  orderHistory() {
    return env.setUpHeaders({verb: 'GET', path: '/order'});
  }

};
export {OrdersAPI}