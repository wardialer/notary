<template>
  <b-row cols="2">
    <b-col class="waiting">
      <h2>Waiting:</h2>
      <ul>
        <li v-for="document in waitingDocuments" :key="document.hash">
          <a :href="'/document/' + document.hash">{{document.address}}</a>
        </li>
      </ul>
    </b-col>
    <b-col class="processed">
      <h2>Processed:</h2>
      <ul>
          <li v-for="document in processedDocuments" :key="document.hash">
            <a :href="'/document/' + document.hash">{{document.address}}</a>
          </li>
      </ul>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'List',
  mounted() {
    this.$store.dispatch('LOAD_DOCUMENT_LIST');
  },
  data() {
    return {

    };
  },
  computed: {
    ...mapGetters([
      'processedDocuments',
      'waitingDocuments',
    ]),
  },
};
</script>

<style scoped lang="scss">
  ul {
    list-style-type: none;
    padding: 0;
  }
  ul li {
    padding: 20px;
    background: #E9E9E9;
    margin-bottom: 8px;
  }
</style>
