<template>
  <div class="about">
    <h1><small>About</small> Bitcoin Notary Service</h1>
      <b-card-group deck class="mt-5 mb-5">
        <b-card
          title="Select">
          <b-icon icon="document-text" font-scale="4" class="mb-4" variant="success"></b-icon>
          <b-card-text>
            Select your document: add your file by dragging it into the browser.
          </b-card-text>
        </b-card>
        <b-card
          title="Fund">
          <b-icon icon="arrow-left-right" font-scale="4" class="mb-4" variant="success"></b-icon>
          <b-card-text>
            Fund your transaction: send Bitcoin to the address provided and fund your transaction.
          </b-card-text>
        </b-card>
        <b-card
          title="Sign">
          <b-icon icon="award" font-scale="4" class="mb-4" variant="success"></b-icon>
          <b-card-text>
            Sign to the blockchain: your file will be forever signed into the blockchain with a
            unique address and timestamp.
          </b-card-text>
        </b-card>
        <b-card
          title="Proof">
          <b-icon icon="check-box" font-scale="4" class="mb-4" variant="success"></b-icon>
          <b-card-text>
            Show your proof: see your proof on the blockchain by checking the transaction in any
            block explorer.
          </b-card-text>
        </b-card>
      </b-card-group>
      <p class="lead">Instant, anonymous, distributed, and secure proof of existence
        for any document,
      agreement, or contract.</p>
      <h3>How it works</h3>
      <ol>
        <li>Add your file by dragging it into the browser.</li>
        <li>Follow the prompt to send Bitcoin and fund your blockchain anchor.</li>
        <li>See your proof on the blockchain by checking the transaction in a block explorer.</li>
      </ol>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  BootstrapVue, BIcon, BIconDocumentText, BIconArrowLeftRight, BIconAward, BIconCheckBox,
} from 'bootstrap-vue';

Vue.use(BootstrapVue);
Vue.component('BIcon', BIcon);
Vue.component('BIconDocumentText', BIconDocumentText);
Vue.component('BIconArrowLeftRight', BIconArrowLeftRight);
Vue.component('BIconAward', BIconAward);
Vue.component('BIconCheckBox', BIconCheckBox);


export default {
};
</script>

<style scoped>
  p, ol, h3 {
    text-align: justify;
  }
</style>
