<template>
  <div>
    <loading v-if="isLoading" />

    <p class="error" v-if="isError">{{ errorText }}</p>
    <slot v-else-if="isSuccess"></slot>
    <slot v-else name="initial"></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import Loading from "./Loading.vue";
import { Resource } from "./Resource";

@Component({
  components: { Loading },
})
export default class StatefulResource extends Vue {
  @Prop({ required: true, type: Object })
  public resource!: Resource<any>;

  get isLoading(): boolean {
    return this.resource.loading;
  }

  get isSuccess(): boolean {
    return Resource.isSuccess(this.resource);
  }

  get isError(): boolean {
    return Resource.hasError(this.resource);
  }

  get errorText(): string {
    return Resource.getErrorMessage(this.resource);
  }
}
</script>
<style scoped>
.error {
  color: #c70000;
}
</style>
