<template>
  <b-jumbotron>
  <h1>{{title}}</h1>
  File Name: {{document.fileName}} <br/>
  SHA256 Hash: {{document.hash}} <br/>
  <span v-if="document.transactionId" class="mt-5">
      Included in transaction: {{ document.transactionId }}
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
    </span>
  <span v-else class="mt-5">
      <h2>Payment address:</h2>
      <img :src="'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl='+paymentUri"/>
      <div>amount: {{document.amount}}</div>
      <div>address: {{document.address}}</div>
  </span>
  </b-jumbotron>
</template>

<script>
import axios from 'axios';
import bitcore from 'bitcore-lib';

export default {
  name: 'Card',
  props: ['id'],
  data() {
    return {
      document: {},
      title: '',
      paymentUri: '',
    };
  },
  mounted() {
    axios.get(`http://localhost:3000/document/${this.id}`)
      .then((response) => {
        this.document = response.data;
        this.title = this.document.transactionId
          ? 'The document is notarized'
          : 'Please complete payment to notarize the document';

        this.paymentUri = new bitcore.URI({
          amount: this.document.amount,
          address: this.document.address,
        });
      })
      .catch(console.log);
  },
};
</script>
