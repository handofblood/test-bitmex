import Axios from 'axios'
import crypto from "crypto"

const API_URL = process.env["VUE_APP_API_URL"];
const API_KEY = process.env["VUE_APP_API_KEY"];
const API_SECRET = process.env["VUE_APP_API_SECRET"];
const config = {};

config.API = Axios.create({
  baseURL: API_URL ,
});



config.setUpHeaders = function (data) {

  const expires = Math.round(new Date().getTime() / 1000) + 60;

  const postBody = data.verb === 'POST' ? JSON.stringify(data.body) : '';

  const signature = crypto.createHmac('sha256', API_SECRET)
      .update(data.verb + '/api/v1' + data.path + expires + postBody)
      .digest('hex');

  const headers = {
    'content-type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'api-expires': expires,
    'api-key': API_KEY,
    'api-signature': signature
  };

  return data.verb === 'POST' ?
      env.API.post(data.path, data.body, {headers: headers}) :
      env.API.get(data.path, {headers: headers});
};




config.getFormattedDate = function(date) {
  const d = new Date(date);
  let curr_date = (d.getDate()>9) ? d.getDate() : '0'+d.getDate();
  let curr_month = (d.getMonth() + 1 >9) ? d.getMonth() + 1 : '0'+(d.getMonth() + 1);
  let curr_year = d.getFullYear();
  let curr_hours = d.getHours()>9? d.getHours() : '0'+d.getHours();
  let curr_min = d.getMinutes()>9? d.getMinutes() : '0'+d.getMinutes();
  let curr_sec = d.getSeconds()>9? d.getSeconds() : '0'+d.getSeconds();
  return curr_date+"-" +curr_month + "-" + curr_year+ " | " + curr_hours + ":" + curr_min+":"+curr_sec;
};


export default config;
