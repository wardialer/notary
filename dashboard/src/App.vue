<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand href="#">Bitcoin Notary</b-navbar-brand>

      <b-navbar-nav>
        <b-nav-item to="/">Home</b-nav-item>
        <b-nav-item to="/about">About</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-form @submit="onSubmit">
          <b-form-input
            :state="hashState"
            size="sm"
            class="mr-sm-2"
            v-model="documentHash"
            placeholder="Document Hash"
          />
          <b-button :disabled="!hashState" size="sm"
          class="my-2 my-sm-0" type="submit">
            Search
          </b-button>
        </b-nav-form>
      </b-navbar-nav>
    </b-navbar>
    <b-container class="mt-5">
      <router-view :key="$route.path" />
    </b-container>
  </div>
</template>

<script>
export default {
  computed: {
    hashState() {
      const hash = this.documentHash;
      const regex = /^[a-f0-9]{64}$/;
      return hash && hash.length > 0 && regex.test(hash);
    },
  },
  data() {
    return {
      documentHash: null,
    };
  },
  methods: {
    onSubmit(event) {
      event.preventDefault();
      const hash = this.documentHash;
      const regex = /^[a-f0-9]{64}$/;

      if (regex.test(hash)) {
        this.$router.push({ name: 'Detail', params: { id: hash } });
      }

      this.documentHash = null;
    },
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
