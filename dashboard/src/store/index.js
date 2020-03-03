import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    documents: [],
  },
  getters: {
    processedDocuments: (state) => state.documents.filter((document) => document.transactionId),
    waitingDocuments: (state) => state.documents.filter((document) => !document.transactionId),
  },
  mutations: {
    SET_DOCUMENT_LIST: (state, { list }) => {
      state.documents = list;
    },
  },
  actions: {
    LOAD_DOCUMENT_LIST({ commit }) {
      axios.get('http://localhost:3000/document/')
        .then((response) => {
          commit('SET_DOCUMENT_LIST', { list: response.data });
        })
        .catch(console.log);
    },
  },
  modules: {
  },
});
