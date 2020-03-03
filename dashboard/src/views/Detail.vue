<template>
    <card :id="id"></card>
</template>

<script>
import Card from '@/components/Card.vue';

export default {
  name: 'Detail',
  data() {
    return {
      id: '',
    };
  },
  components: {
    Card,
  },
  created() {
    this.id = this.$route.params.id;
  },
};
</script>

<style scoped lang="scss">

</style>
