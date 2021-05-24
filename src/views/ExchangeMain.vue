<template>
  <div class="home">
    <div v-if="loaded.pairs" class="order-form">
      <div class="order-form-element">
        <div class="currency-pair-list sm">
          <div class="list-tab">
            <div class="tab-el">Symbol</div>
            <div class="tab-el">Value</div>
          </div>
            <div
              v-for="pair in currencyInstruments"
              @click="getQuotes(pair)"
              :style="isCurrent(pair)? 'color:green' :''"
              class="list-element">
              <div class="symb">{{pair.symbol}}</div>
              <div class="price">{{pair.lastPrice}}</div>
            </div>
        </div>
        <div v-if="loaded.quotes" class="quotes-history-list b">
          <div class="list-tab">
            <div class="tab-el">Timestamp</div>
            <div class="tab-el">Open</div>
            <div class="tab-el">High</div>
            <div class="tab-el">Low</div>
            <div class="tab-el">Close</div>
            <div class="tab-el">grossValue</div>
          </div>
          <div
            v-for="quote in quotes"
            class="list-element">
            <div class="el">{{getDate(quote.timestamp)}}</div>
            <div class="el">{{quote.open}}</div>
            <div class="el">{{quote.high}}</div>
            <div class="el">{{quote.low}}</div>
            <div class="el">{{quote.close}}</div>
            <div class="el">{{quote.volume}}</div>
          </div>
        </div>
        <div v-else class="quotes-history-load b">
          <Preloader />
        </div>
        <div class="new-order sm">
          <div class="operation-w">
            <button :disabled="!orderValue" @click="orderSell(orderValue)" >Sell</button>
            <InputPositive class="custom-input" v-model="orderValue" />
            <button :disabled="!orderValue" @click="orderBuy(orderValue)">Buy</button>
          </div>
        </div>
      </div>
      <div class="order-form-element">
      <div class="orders-history">
        <div class="list-tab">
          <div class="tab-el">ID</div>
          <div class="tab-el">Pair</div>
          <div class="tab-el">OrderQty</div>
          <div class="tab-el">Timestamp</div>
          <div class="tab-el">Type</div>
          <div class="tab-el">Price</div>
          <div class="tab-el">Status</div>
        </div>
        <div
          v-for="order in orderHistory"
          class="list-element">
          <div class="el">{{order.orderID}}</div>
          <div class="el">{{order.symbol}}</div>
          <div class="el">{{order.orderQty}}</div>
          <div class="el">{{getDate(order.timestamp)}}</div>
          <div class="el">{{order.side}}</div>
          <div class="el">{{order.price}}</div>
          <div class="el">{{order.ordStatus}}</div>

        </div>
      </div>
      </div>
    </div>
    <Preloader v-else />
  </div>
</template>

<script>
import {OrdersAPI} from "../../api";

import InputPositive from "@/components/ui/inputPositive";
import Preloader from "@/components/ui/preloader";

export default {
  name: 'Home',
  data() {
    return {
      loaded: {
        pairs: false,
        quotes: false,
        orderHistory: false,
      },
      socket: {
        socketQuote: null,
      },
      orderValue: 1,
      currentPair: '',
    }
  },
  computed: {
    currencyInstruments() {
      return this.$store.getters['trade/currencyInstruments'];
    },
    quotes() {
      return this.$store.getters['trade/quotes'];
    },
    orderHistory() {
      return this.$store.getters['trade/orderHistory'];
    }
  },
  methods: {
    getQuotes(pair) {
      this.loaded.quotes = false;
      this.currentPair = pair;
      this.$store.dispatch('trade/loadQuotes', pair.symbol).then(() => {
        this.loaded.quotes = true;
        this.openSocketQuote(pair.symbol)
      });
    },
    orderBuy(value) {
      OrdersAPI.orderCreate(
          {
            ordType: "Market",
            symbol: this.currentPair.symbol,
            orderQty: value,
            side: 'Buy',
          })
          .then(res => {
            console.log(res);
            this.$store.dispatch('trade/loadOrderHistory');
          }).catch(err => {
        alert(err.response.data.error.message);
      });
    },
    openSocketQuote(symbol) {
      this.socket.socketQuote.send(JSON.stringify({op: 'unsubscribe', args: 'tradeBin1m'}));

      this.socket.socketQuote.send(JSON.stringify({op: 'subscribe', args: `tradeBin1m:${symbol}`}));
    },
    orderSell(value) {
      OrdersAPI.orderCreate(
          {
            ordType: "Market",
            symbol: this.currentPair.symbol,
            orderQty: value,
            side: 'Sell',
          })
          .then(res => {
            console.log(res);
            this.$store.dispatch('trade/loadOrderHistory');
          }).catch(err => {
        alert(err.response.data.error.message);
      });
    },
    createSocketsConnection(symbol) {
      this.socket.socketQuote = new WebSocket("wss://testnet.bitmex.com/realtime");
      this.socket.socketQuote.onopen = (e) => {
        this.socket.socketQuote.send(JSON.stringify({op: 'subscribe', args: 'instrument'}));
        this.socket.socketQuote.send(JSON.stringify({op: 'subscribe', args: `tradeBin1m:${symbol}`}));
      };

      this.socket.socketQuote.binaryType = "arraybuffer";
      this.socket.socketQuote.onmessage = (e) => {

        let {table, data} = JSON.parse(e.data);
        if (data){
        if (table === 'tradeBin1m') {
          if (new Date(this.quotes[0].timestamp) < new Date(data[0].timestamp)) {
            this.$store.commit('trade/updateLatestQuote', data[0]);
          }
        } else {
          this.currencyInstruments.forEach(item => {
            if (item.symbol === data[0].symbol) {
              this.$store.commit('trade/updateBySymbolName', data[0]);
            }
          });
        }
        }
      };
    },
    getDate(d) {
      return env.getFormattedDate(d);
    },
    isCurrent(pair) {
      return this.currentPair.symbol === pair.symbol
    }
  },
  components: {
    InputPositive,
    Preloader
  },
  created() {

    this.$store.dispatch('trade/loadInstruments').then((res) => {
      this.loaded.pairs = true;
      this.$store.dispatch('trade/loadQuotes', res[0].symbol).then(() => {
        this.loaded.quotes = true;
        this.currentPair = res[0];
        this.createSocketsConnection(res[0].symbol);
      });
    });

    this.$store.dispatch('trade/loadOrderHistory');

  }
}
</script>
<style scoped lang="scss">
  .home{
    background: rgba(128, 128, 128, 0.6);
    height: 1050px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-x: hidden;
  }
  .order-form{
    padding: 5px;
    width: 100%;
    height: 1050px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(128, 128, 128, 0.6);
    .order-form-element{
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      border: 2px solid black;
      height :50%;
      width: 100%;
      .sm{
        width: 20%;
      }
      .b{
        width: 60%;
      }
      .currency-pair-list{
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
        border-right: 1px solid black;
        .list-tab{
          grid-template-columns:  1fr 1fr;
        }
        .list-element{
          width: 100%;
          display: grid;
          grid-template-columns:  1fr 1fr;
          &:hover{
            border: 1px solid black;
            cursor: pointer;
          }
        }
      }
      .quotes-history-load{
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .quotes-history-list{
        overflow-y: auto;
        overflow-x: hidden;

        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .list-tab{
          grid-template-columns:  1fr 1fr 0.5fr 1fr 0.5fr 0.5fr 0.5fr;
        }
        .list-element{
          display: grid;
          grid-template-columns:  1fr 1fr 0.5fr 1fr 0.5fr 0.5fr 0.5fr;
          .el{
            text-align: center;
          }
        }
      }
      .new-order{
        width: 33%;
        height: 100%;
        border-left: 1px solid black;
        display: flex;
        align-items: center;
        justify-content: center;
        .operation-w{
          .custom-input{
            height: 30px;
            width: 200px;
            font-size: 20px;
            text-align: center;
            border-radius: 5px;
          }
          button{
            margin: 0 10px;
            width: 100px;
            height: 30px;
            border-radius: 10px;
          }
        }
      }
      .orders-history{
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
        width: 100%;
        border-right: 1px solid black;
        .list-tab{
          grid-template-columns:  1fr 1fr 0.5fr 1fr 0.5fr 0.5fr 0.5fr;
        }
        .list-element{

          display: grid;
          grid-template-columns:  1fr 1fr 0.5fr 1fr 0.5fr 0.5fr 0.5fr;

          .el{
            height: 18px;
             min-width: 50px;
            text-align: center;
          }
        }
      }
    }
  }
  .list-tab{
    font-weight: bold;
    display: grid;
    padding-bottom: 5px;
  }
</style>