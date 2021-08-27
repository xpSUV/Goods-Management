<template>
  <el-skeleton
    style="width: 100vw; padding: 10px"
    :loading="loading"
    animated
    :throttle="0"
    :count="3"
  >
    <template #template>
      <el-row :gutter="20" style="margin-button: 20px; margin-button: 20px">
        <el-col :span="6">
          <el-skeleton-item variant="h3" style="width: 50%" />
          <el-skeleton-item variant="text" style="margin-right: 16px" />
        </el-col>
        <el-col :span="4">
          <el-skeleton-item
            variant="image"
            style="
              width: 100px;
              height: 100px;
              display: block;
              margin: 0 auto;
              text-align: center;
              line-height: 100px;
            "
          />
        </el-col>
        <el-col :span="2">
          <el-skeleton-item variant="button" style="width: 50%" />
        </el-col>
        <el-col :span="2">
          <el-skeleton-item variant="button" style="width: 50%" />
        </el-col>
      </el-row>
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