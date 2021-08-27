<template>
  <el-card :body-style="{ padding: '0px' }" class="card">
    <img
      src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
      class="image"
    />
    <div style="padding: 14px">
      <span>{{ name }}</span>
      <span style="float: right">价格：{{ price }}元</span>
      <div style="margin-top: 10px">商品详情：{{ detail }}</div>
      <div class="bottom">
        <time class="time">{{ currentDate }}</time>
        <el-button type="primary" class="button">编辑</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import { defineComponent, reactive, ref, toRefs } from "vue";

export default {
  setup() {
    const currentDate = ref(new Date());
    const state = reactive({
      name: "汉堡",
      price: "100",
      detail: "kkkkk",
    });

    return {
      ...toRefs(state),
      currentDate,
    };
  },
};
</script>
<style>
.card {
  width: 250px;
  padding-bottom: 10px;
  border-radius: 13px;
}
.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button {
  width: 60px;
  height: 30px;
  padding: 0;
  min-height: auto;
}

.image {
  width: 250px;
  display: block;
}
</style>