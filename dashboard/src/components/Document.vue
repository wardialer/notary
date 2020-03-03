<template>
  <b-container>
    <card v-if="response" :id="response.hash"></card>
    <drop class="drop" @drop="handleDrop">Drop files</drop>
    <div>{{ fileName }}</div>
    <b-button :disabled="!fileName" class="m-2" variant="outline-primary" @click="uploadFiles()">
      Upload
    </b-button>
    <b-button :disabled="!fileName" class="m-2" variant="outline-danger" @click="removeFiles()">
      Remove
    </b-button>
  </b-container>
</template>

<script>
import { Drop } from 'vue-drag-drop';
import Card from '@/components/Card.vue';
import axios from 'axios';

export default {
  name: 'Document',
  components: {
    Drop,
    Card,
  },
  data() {
    return {
      files: [],
      fileName: null,
      response: null,
    };
  },
  methods: {
    handleDrop(data, event) {
      event.preventDefault();
      const { files } = event.dataTransfer;
      this.files = files;
      this.fileName = files[0].name;
    },
    removeFiles() {
      this.files = [];
      this.fileName = null;
      this.response = null;
    },
    uploadFiles() {
      const formData = new FormData();

      for (let i = 0; i < this.files.length; i += 1) {
        const file = this.files[i];

        formData.append('document', file);
      }

      axios.post('http://localhost:3000/document/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then((response) => {
        this.response = response.data;
      })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style scoped lang="scss">
  .drop {
    padding: 2em;
    margin: 1em;
    border: 3px dashed #42b983;
    border-radius: 4px;
  }
</style>
