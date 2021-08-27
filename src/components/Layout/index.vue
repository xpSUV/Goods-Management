<template>
  <el-container class="el-containers">
    <el-header>
      <div class="header-div">
        <img src="../../assets/logo.png" alt="" />
        <span>
          <!-- router-link最终会渲染成a标签  所以修改样式时修改 a标签的样式就行了 -->
          <router-link to="/">后台管理系统</router-link>

          <el-button
            style="float: right; margin-top: 10px"
            type="info"
            @click="logoout"
            >退出</el-button
          >
          <span
            style="
              float: right;
              font-size: 16px;
              font-weight: 700;
              margin-top: 19px;
              margin-right: 20px;
            "
            >当前用户：{{ userName }}</span
          >
        </span>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '60px' : '200px'">
        <div class="toggle-button" @click="openCollapse">|||</div>
        <!-- collapse:el属性设置折叠       collapse-transition:动画效果   router:el属性是否是菜单启用超链接功能
        default-active:设置默认活跃状态的路径-->
        <el-menu
          :default-active="activePath"
          class="el-menu-vertical-demo"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
        >
          <!-- 一级菜单 -->
          <!-- 建议尽可能使用 v-for 来提供 key  -->
          <!-- 区别主要在于 虚拟DOM的复用，绑定key可以更好的复用 -->
          <!-- 使用key来给每个节点做一个 唯一标识，Diff算法就可以正确的识别此节点，找到正确的位置区插入新的节点。 -->
          <el-submenu v-for="item in menusData" :index="item.id" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template #title>
              <i class="el-icon-location"></i>
              <span>{{ item.title }}</span>
            </template>

            <!-- 此处设置index属性 是应为 elementplus中默认该组件设置的有该属性（有作用） 作用是设置唯一标识
            但当el-menu设置router属性时  该index属性就可以当做router-link标签中的to属性来使用  即设置路由跳转链接（路径、地址）！！！！！！！！ -->
            <el-menu-item
              v-for="subItem in item.children"
              :index="'/' + subItem.path"
              :key="subItem.id"
              @click="saveNavPath('/' + subItem.path)"
              >{{ subItem.title }}</el-menu-item
            >
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main>
          <router-view></router-view>
        </el-main>
        <el-footer style="height: 40px"
          ><strong>xpsuv</strong> --1942443098@qq.com--
          <strong> v1.0.0</strong></el-footer
        >
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import { onMounted, reactive, toRefs } from "@vue/runtime-core";
import axios from "axios";
import router from "../../router";

function useLoadMenuData(state) {
  axios.get("/menus").then((res) => {
    state.menusData = res.data;
    console.log(res.data);
  });
}
export default {
  setup() {
    const state = reactive({
      userName: "",
      menusData: [],
      isCollapse: false,
      activePath: "",
    });
    onMounted(() => {
      useLoadMenuData(state);
      state.userName = window.sessionStorage.getItem("userName");
      // 浏览器刷新页面后会继续触发onMounted钩子函数
      state.activePath = window.sessionStorage.getItem("activePath"); //避免浏览器刷新页面丢失所获取的之前处于活跃状态的路径
    });

    function openCollapse() {
      state.isCollapse = !state.isCollapse;
    }

    // 保存链接的激活状态
    function saveNavPath(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      state.activePath = activePath;
    }

    // 用户退出登录
    function logoout() {
      window.sessionStorage.clear(); //用户退出登录时清除sessionstorage中的保存的数据 即token
      router.push("/login"); //并跳转到登录界面
    }

    return {
      ...toRefs(state),
      openCollapse,
      logoout,
      saveNavPath,
    };
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
/* 下面的el标签样式为什么都写成类选择器形式 ：这些el标签都会渲染成原生html标签并添加相应的模板样式即例如：class=el-container */
.el-containers {
  height: 100vh;
}
.el-aside {
  transition: width 0.3s;
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.el-header {
  background-color: #373d41;
  color: #fff;
  font-size: 20px;
}
.el-footer {
  text-align: center;
  line-height: 40px;
  background-color: #373d41;
  color: #fff;
  font-size: 14px;
}
a {
  text-decoration: none;
  color: #fff;
}
.header-div img {
  /* 设置图片与文字居中对齐 */
  vertical-align: middle;
  width: 60px;
  height: 60px;
  margin-right: 20px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  /* 改变字符之间的空白间隔 */
  letter-spacing: 0.2em;
  /* em是Elements的缩写，也就是元素的意思。那么1em就是一个元素符号。 */
  /* 在段落中需要首行缩进的效果。一般来说要缩进2个字符，那么就用 */
  /* text-indent: 2em; 而不是 text-indent: 16px; 即em是元素符合的单位 */
  cursor: pointer;
}
</style>