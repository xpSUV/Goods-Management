<template>
  <el-skeleton
    style="width: 240px"
    :loading="loading"
    animated
    :throttle="0"
    :count="3"
  >
    <template #template>
      <el-skeleton-item variant="image" style="width: 400px; height: 267px" />
      <div style="padding: 14px">
        <el-skeleton-item variant="h3" style="width: 50%" />
        <div
          style="
            display: flex;
            align-items: center;
            justify-items: space-between;
            margin-top: 16px;
            height: 16px;
          "
        >
          <el-skeleton-item variant="text" style="margin-right: 16px" />
          <el-skeleton-item variant="text" style="width: 30%" />
        </div>
      </div>
    </template>
    <template #default>
      <slot></slot>
    </template>
  </el-skeleton>
</template>

<script>
import { reactive, toRefs } from "@vue/reactivity";
export default {
  name: "Skeleton",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const state = reactive({
      loading: props.loading,
    });
    return {
      ...toRefs(state),
    };
  },
};
</script>

<style>
</style>