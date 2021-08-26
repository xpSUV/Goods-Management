import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// 导入Element-plus组件库及相应css样式 （此处是全部导入 不是按需导入（按需导入需下载额外的vite插件  并且进行配置））
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';   //导入elementplus中文语言包
//导入nprogress加载条组件及相关样式
import NProgress from 'nprogress';
import "nprogress/nprogress.css";

import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_APP_URL      //导入.env.development文件中配置的路径(环境变量)  设置axios请求的基本地址

// 使用axios拦截器进行添加nprogress进度条  在请求拦截中开启  在服务器返回响应拦截中关闭、
axios.interceptors.request.use((config) => {
    // console.log('config=', config);        //config中保存的是一些axios请求相关的信息
    //把token数据传入到config的headers.Authorization属性中 服务端中设置会默认对该属性进行token的验证  
    // 这样一来每次进行axios请求时都会在请求拦截器中进行token验证了
    // 之前的路由导航守卫是为了让客户端知道你已经登录了 而这里是为了让服务端知道你客户端已经登录了 对应的将你请求的一些接口数据 返回过来
    config.headers.Authorization = window.sessionStorage.getItem('token');
    NProgress.start();    //开启进度条
    return config;
})

axios.interceptors.response.use((config) => {
    NProgress.done();    //关闭进度条
    return config;
})



// 此处下面的 createApp方法 相当于创建了一个vue实例 参数App已导入 是一个对象
// import { createApp } from 'vue';  以前vue2  导入的是 import Vue from 'vue'; 
// 等同于 vue2中的const app = new Vue({el:..  data(){..}  ...})  或  const app = new Vue()  
const app = createApp(App)
app.use(ElementPlus, {
    locale: zhCn,
})              //以前是直接Vue.use(插件)  进行插件的安装  执行插件内部 install方法   此处还设置了使用el中文语言包但在最新版beta版本中不起效果，需额外配置
app.use(router)

// createApp(App).mount('#app')   //此处不能直接createApp(App) 这就相当于重新进行一个vue实例创建了  ‘
// 应为此前已经进行了const app = createApp(App) 而我们需要的是对此前的app vue实例进行挂载而不是一个新的vue实例进行挂载  
//此前的app vue实例已进行了安装ElementPlus   而新的createApp(App)并没有
app.mount('#app')
