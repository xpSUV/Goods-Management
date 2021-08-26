import { createRouter, createWebHashHistory } from 'vue-router'  //之前vue2项目是直接全部导入   此处是按需导入了
import Layout from '../components/Layout/index.vue';   //默认导入路由组件方式  这个默认加载展示所以不采用路由懒加载

const routes = [
    {
        path: '/',
        redirect: "/main", //重定向  设置默认界面
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),  //路由懒加载   :作用将路由对应的组件打包成一个个js代码块. 只有在这个路由被访问到的时候, 才加载对应的组件

    },
    {
        // 解释一下此处： 为什么为什么又要将Layout组件对应路由重定向到Home组件路由，应为layout组件是界面外围框 内部划分区域来显示其他组件 
        // 所以使用嵌套路由
        // 实现嵌套路由有两个步骤:
        // 创建对应的子组件, 并且在路由映射中配置对应的子路由.
        // 在父组件内部使用<router-view>标签.

        path: '/main',
        component: Layout,
        redirect: '/home',
        children: [
            {
                path: '/home',
                name: 'Home',
                component: () => import('../views/Home.vue')
            }
        ]
    },
    {
        path: '/goods',
        name: '商品管理',
        component: Layout,
        children: [
            {
                path: 'goods-list',
                name: 'GoodsList',
                component: () => import('../views/GoodsList.vue')
            },
            {
                path: 'goods-info',
                name: '商品详情',
                component: () => import('../views/GoodsInfo.vue')
            }
        ]
    },
    {
        path: '/user',
        name: "用户管理",
        component: Layout,
        children: [
            {
                path: 'user-list',
                name: 'UserList',
                component: () => import('../views/UserList.vue')
            },
            {
                path: 'user-setting',
                name: 'UserSetting',
                component: () => import('../views/UserSetting.vue')
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import("../views/NotFound.vue")
    }
];

const router = createRouter({
    history: createWebHashHistory(),   //指定为hash模式
    routes,
});

// 使用路由导航守卫 来判断用户是否经过登录进入系统其他相关界面  如果没有则返回到登录界面
// 只要通过浏览器去访问相应的一些组件的话 对应的都会执行beforeEach该方法 路由导航守卫  
// （即在通过 路由 跳转组件、界面前执行该钩子函数beforeEach）
router.beforeEach((to, from, next) => {
    // to:将要访问的路径
    // from:表示从哪个路径跳转过来的
    // next:是一个函数，用来放行 继续访问
    if (to.path === '/login') return next();      //如果将要访问的路径是login 那么就让他访问

    // 如果将要访问的路径不是login 而是其他的受保护的url组件地址  那么检查是否具有token 有的话放行 没有的话返回login路径  
    // 也就是说 每次 通过路由 跳转到 非登陆的其他路径 时都会进行一次token检验 如果有就放行可以进行系统的一些API访问 否则返回登陆 
    // 获取token（设置的登录时存放到sessionStorage中）
    const tokenStr = window.sessionStorage.getItem('token');
    if (!tokenStr) return next('/login')
    next();
})

export default router;
