<template>
  <div>
    <hr class="mt-5"/>
    <h2>Latest uploaded documents:</h2>
  <b-row cols="2">
    <b-col class="waiting">
      <h4 class="mt-3 mb-3">Waiting for payment:</h4>
      <b-list-group>
        <b-list-group-item v-for="document in waitingDocuments" :key="document.hash"
                           :href="'/document/' + document.hash" class="truncate">
          {{document.hash}}
        </b-list-group-item>
      </b-list-group>
    </b-col>
    <b-col class="processed">
      <h4 class="mt-3 mb-3">Processed:</h4>
      <b-list-group>
          <b-list-group-item v-for="document in processedDocuments" :key="document.hash"
                             :href="'/document/' + document.hash" class="truncate">
            {{document.hash}}
          </b-list-group-item>
      </b-list-group>
    </b-col>
  </b-row>
  </div>
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
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
