<template>
  <SkeletonList :loading="loads">
    <Cart />
  </SkeletonList>
</template>

<script>
import { reactive, toRefs } from "@vue/reactivity";
import Cart from "../components/Card/card.vue";
import SkeletonList from "../components/Skeleton/skeletonList.vue";
export default {
  components: {
    Cart,
    SkeletonList,
  },
  setup() {
    const state = reactive({
      loads: true,
    });
    return {
      ...toRefs(state),
    };
  },
};
</script>

<style>
</style>