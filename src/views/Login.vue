<template>
  <div class="login_box">
    <!-- model	表单数据对象 -->
    <!-- rules	表单验证规则 -->
    <!-- Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可 -->
    <!-- 整个表单必须要绑定：model	表单数据对象  否则后期对整个表单  以及各个el-form-item进行rulers 校验估计会没用 -->
    <el-form
      class="login_form"
      :model="loginForm"
      :rules="loginFormRules"
      ref="loginFormRef"
    >
      <el-form-item prop="username">
        <!-- prefix-icon	输入框头部图标    其内容就是el组件库中的字体图标编号 -->
        <el-input
          v-model="loginForm.username"
          prefix-icon="el-icon-user-solid"
        ></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          prefix-icon="el-icon-lock"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetLoginForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { reactive, ref, toRefs } from "@vue/reactivity";
import axios from "axios";
import router from "../router";
import { ElMessage } from "element-plus";
import { computed } from "@vue/runtime-core";
//重置按钮
function useRestLog(loginFormRef) {
  const resetLoginForm = () => {
    //   el-form标签中即el表单的方法resetFields  重置表单值
    loginFormRef.value.resetFields();
  };
  return {
    resetLoginForm,
  };
}

// 登录按钮
function useLogin(state, loginFormRef) {
  const login = () => {
    // 此处使用async和await操作来代替promise then操作
    // async 表示函数里有异步操作，await 表示紧跟在后面的表达式需要等待结果(即返回一个promise)。
    // 同 Generator 函数一样，async 函数返回一个 Promise 对象，可以使用 then 方法添加回调函数。
    // 当函数执行的时候，一旦遇到 await 就会先返回，等到触发的异步操作完成，再接着执行函数体内后面的语句。
    loginFormRef.value.validate(async (valid) => {
      if (!valid) return;
      const params = {
        userName: state.loginForm.username,
        userPwd: state.loginForm.password,
      };
      const res = await axios.post("/user/login", params);
      if (res.data.code === 0) {
        ElMessage.success("登陆成功");
        // 把服务端返回的token数据存储到浏览器窗口的sessionStorage中 存放格式:键值对  浏览器关闭该网页后销毁
        // token数据:一般登录时服务端返回的  用来用户访问其他系统API（如添加商品等）时发送给服务端 服务端进行token校验  校验成功则可访问
        window.sessionStorage.setItem("userName", state.loginForm.username);
        window.sessionStorage.setItem("token", res.data.myToken);
        router.push("/"); //登录成功并保存token后进行路由跳转  由于vue3 compositionAPI没有this与$
        // 所以此处不再使用 this.$router 而是直接采用import导入 router 拿到路由实例 然后再使用其方法push进行路由跳转
      } else {
        ElMessage.error("登陆失败");
      }
    });
  };
  return {
    login,
  };
}
export default {
  setup() {
    const loginFormRef = ref();
    const state = reactive({
      loginForm: {
        username: "",
        password: "",
      },
      // xxk: computed(() => loginForm.username = "xxk"),
    });

    const loginFormRules = {
      // trigger:触发   blur失去焦点时触发
      username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        {
          min: 3,
          max: 10,
          message: "用户名的长度在3到10个字符之间",
          trigger: "blur",
        },
      ],
      password: [
        { required: true, message: "请输入用户密码", trigger: "blur" },
        {
          min: 6,
          max: 15,
          message: "用户密码的长度在6到15个字符之间",
          trigger: "blur",
        },
      ],
    };

    return {
      ...toRefs(state),
      loginFormRules,
      loginFormRef,
      ...useRestLog(loginFormRef),
      ...useLogin(state, loginFormRef),
    };
  },
};
</script>

<style>
.login_box {
  width: 450px;
  height: 200px;
  /* 设置水平居中 */
  margin: 20px auto;
  background-color: #fff;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 4px 3px rgba(188, 185, 201, 0.5);
}
.login_form {
  width: 100%;
  padding: 15px 20px;
  box-sizing: border-box;
}
</style>