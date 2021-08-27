<template>
  <el-empty description="访问页面不存在"></el-empty>
  <el-button type="primary" @click="click">回到首页</el-button>
</template>

<script>
import router from "../router";
export default {
  setup() {
    const click = () => {
      router.push("/");
    };
    return {
      click,
    };
  },
};
</script>

<style>
.el-button {
  /* margin: 0 auto; 生效必须为块级元素 */
  display: block;
  margin: 0 auto;
}
</style>