<template>
    <b-row cols="1">
      <child></child>
      <list></list>
    </b-row>
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
