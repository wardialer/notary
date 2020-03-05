import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const host = process.env.VUE_APP_API || 'localhost';
const port = process.env.VUE_APP_API_PORT || 3000;
const endpoint = process.env.VUE_APP_API_ENDPOINT || '';

export default new Vuex.Store({
  state: {
    documents: [],
  },
  getters: {
    processedDocuments: (state) => state.documents.filter((document) => document.transactionId)
      .slice(-10),
    waitingDocuments: (state) => state.documents.filter((document) => !document.transactionId)
      .slice(-10),
  },
  mutations: {
    SET_DOCUMENT_LIST: (state, { list }) => {
      state.documents = list;
    },
  },
  actions: {
    LOAD_DOCUMENT_LIST({ commit }) {
      axios.get(`http://${host}:${port}${endpoint}/document/`)
        .then((response) => {
          commit('SET_DOCUMENT_LIST', { list: response.data });
        })
        .catch(console.log);
    },
  },
  modules: {
  },
});
