<template>
  <b-container>
      <child></child>
      <list></list>
  </b-container>
</template>

<script>
import Child from '@/components/Document.vue';
import List from '@/components/List.vue';

export default {
  name: 'Document',
  components: {
    Child,
    List,
  },
};
</script>
