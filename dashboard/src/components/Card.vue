<template>
  <span>
  <b-jumbotron v-if="(document.hash && document.hash.length)">
  <h1>{{title}}</h1>
    <div>File Name: {{document.fileName}}</div>
    <div>SHA256 Hash: {{document.hash}}</div>
    <span v-if="document.transactionId" class="mt-5">
      <div>Included in transaction: {{ document.transactionId }}</div>
      <div><a :href="'http://live.blockcypher.com/btc/tx/'+document.transactionId" target="_blank">
        Blockcypher
      </a>
        -
      <a :href="'https://www.smartbit.com.au/tx/'+document.transactionId" target="_blank">
        Smartbit
      </a>
        -
        <a :href="'https://www.blockchain.com/btc/tx/'+document.transactionId" target="_blank">
          Blockchain
        </a>
      </div>
      <b-button variant="link" v-b-toggle.details class="m-1">Details</b-button>
      <b-collapse id="details">
        <b-row cols="2">
          <div>
            <div>Included in block: {{transactionDetail.block_height}}</div>
            <div>Fees: {{transactionDetail.fees}} satoshis</div>
            <div>Confirmed: {{transactionDetail.confirmed}}</div>
            <div>Confirmations: {{transactionDetail.confirmations}}</div>
          </div>
          <div>
            Addresses:
            <div v-for="address in transactionDetail.addresses" :key="address">{{address}}</div>
          </div>
        </b-row>
      </b-collapse>
    </span>
      <span v-else class="mt-5">
      <h2>Payment address:</h2>
      <img v-show="paymentUri" :src="'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl='+paymentUri"/>
      <div class="mt-3">amount: {{document.amount}} satoshis</div>
      <div>address: {{document.address}}</div>
  </span>
  </b-jumbotron>
  <b-jumbotron v-else>
    <h1>Document not found</h1>
    {{ error }}
  </b-jumbotron>
  </span>
</template>

<script>
import axios from 'axios';
import { URI } from 'bitcore-lib';

const host = process.env.VUE_APP_API || 'localhost';
const port = process.env.VUE_APP_API_PORT || 3000;
const endpoint = process.env.VUE_APP_API_ENDPOINT || '';

export default {
  name: 'Card',
  props: ['id'],
  data() {
    return {
      document: {},
      error: null,
      title: '',
      paymentUri: '',
      transactionDetail: null,
    };
  },
  mounted() {
    axios.get(`http://${host}:${port}${endpoint}/document/${this.id}`)
      .then((documentResponse) => {
        this.document = documentResponse.data;
        this.title = this.document.transactionId
          ? 'The document is notarized'
          : 'Please complete payment to notarize the document';

        this.paymentUri = new URI({
          amount: this.document.amount,
          address: this.document.address,
        });

        if (this.document.transactionId) {
          axios.get(`https://api.blockcypher.com/v1/btc/main/txs/${this.document.transactionId}?limit=50&includeHex=true`)
            .then((transactionResponse) => {
              this.transactionDetail = transactionResponse.data;
            })
            .catch(console.log);
        }
      })
      .catch((error) => {
        this.error = error;
      });
  },
};
</script>
