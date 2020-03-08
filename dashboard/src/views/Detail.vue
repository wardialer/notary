<template>
  <card :id="id"></card>
</template>

<script>
import Card from '@/components/Card.vue';

export default {
  name: 'Detail',
  components: {
    Card,
  },
  computed: {
    id() {
      return this.$route.params.id;
    },
  },
};
</script>

<style scoped lang="scss">

</style>
