<template>
  <el-card>
    <div class="card-header">
      <img src="../assets/logo.png" style="width: 30px; height: 30px" />
      <span>首页</span>
    </div>

    <el-carousel :interval="4000" type="card" height="180px">
      <el-carousel-item v-for="item in 3" :key="item">
        <h3 class="medium">
          <img src="../assets/123.png" alt="" />
        </h3>
      </el-carousel-item>
    </el-carousel>
    <el-collapse accordion>
      <el-collapse-item>
        <template #title>
          一致性 Consistency<i class="header-icon el-icon-info"></i>
        </template>
        <div>
          与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；
        </div>
        <div>
          在界面中一致：所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。
        </div>
      </el-collapse-item>
      <el-collapse-item title="反馈 Feedback">
        <div>
          控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；
        </div>
        <div>页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。</div>
      </el-collapse-item>
      <el-collapse-item title="效率 Efficiency">
        <div>简化流程：设计简洁直观的操作流程；</div>
        <div>
          清晰明确：语言表达清晰且表意明确，让用户快速理解进而作出决策；
        </div>
        <div>
          帮助用户识别：界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。
        </div>
      </el-collapse-item>
      <el-collapse-item title="可控 Controllability">
        <div>
          用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；
        </div>
        <div>
          结果可控：用户可以自由的进行操作，包括撤销、回退和终止当前操作等。
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
export default {};
</script>

<style>
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #80b1f5;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #7099c7;
}
.card-header img {
  vertical-align: middle;
}
.medium img {
  display: inline-block;
  height: 180px;
}
</style>