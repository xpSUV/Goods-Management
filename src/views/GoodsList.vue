<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <img src="../assets/logo.png" style="width: 50px; height: 50px" />
        <span>商品列表</span>
      </div>
    </template>
    <!-- elementplus默认flex布局  此处使用栅格进行布局  el-row  el-col  ：gutter  ：span官网都有使用说明 -->
    <el-row :gutter="10">
      <el-col :span="4">
        <!-- h5新属性placeholder，文本框默认显示内容 ，当获取到焦点时隐藏 -->
        <el-input
          placeholder="请输入搜索商品名称"
          v-model="searchContent"
          prefix-icon="el-icon-search"
        ></el-input>
      </el-col>

      <el-col :span="4">
        <!-- elementplus按钮自带的type  有很多样式此处是主要按钮样式primary -->
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="addGoodsInfo()">添加</el-button>
      </el-col>
    </el-row>
    <Skeleton :loading="loads">
      <el-table :data="tableData" style="width: 100%">
        <!-- 下面的el-table-column 通过slot的方式进行数据填充  只不过这是用于自定义列模板的表格 即自定义表格的每列的模板  
      常规（不自定义表格列使用默认的）的是在el-table绑定数据对象后 直接在el-table-column设置prop对应数据对象键即可获得数据-->
        <el-table-column label="编号" width="180">
          <!-- 作用域插槽 此处是先将tableData数据绑定到插槽中了:data="tableData" 
      然后通过作用域插槽#default="scope"  获取到所绑定的数据到scope
      通过内部封装的一些scope的方法row、column、$index可以分别获取到每一行的数据、每一列的数据、及每一行的index
      此处的 每一行数据 就是 tableData数组 数据中的每一条数据例如：{
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }
        同理 列 就是 每一条数据对应的 同名的属性的合集对象
        每一行的index就是 每一条数据在 tableData数组的下标
        element-plus中进行以上这些的封装-->
          <template #default="scope">
            <span style="margin-left: 10px">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" width="180">
          <template #default="scope">
            <el-popover effect="light" trigger="hover" placement="top">
              <template #default>
                <p>商品名称: {{ scope.row.title }}</p>
                <p>单价: {{ scope.row.price }}</p>
              </template>
              <template #reference>
                <div class="name-wrapper">
                  <el-tag size="medium">{{ scope.row.title }}</el-tag>
                </div>
              </template>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column label="商品图片" width="180">
          <template #default="scope">
            <span style="margin-left: 10px">
              <!--  url就是配置的基本路径  thumbnail就是当初添加商品时axios发送数据中的图片链接的后面路径   -->
              <!-- 在addproduct中：params中发送数据的设置thumbnail: state.goodsForm.coverImg, -->
              <img class="imgSet" :src="url + scope.row.thumbnail" alt="" />
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </Skeleton>

    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="changePage"
    >
    </el-pagination>
  </el-card>

  <AddProduct
    :centerDialogVisible="centerDialogVisible"
    @onCloseDialog="closeDialogVisible"
  ></AddProduct>

  <!-- //判断editDialogVisible属性是否为true  为true才进行组件渲染 -->
  <EditProduct
    v-if="editDialogVisible === true"
    :editDialogVisible="editDialogVisible"
    :goodsId="pId"
    @onCloseEditDialog="closeEditDialogVisible"
  ></EditProduct>
</template>

<script>
import { onMounted, reactive, toRefs } from "vue";
import axios from "axios"; // npm install axios --save
import AddProduct from "./AddProduct.vue";
import EditProduct from "./EditProduct.vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import Skeleton from "../components/Skeleton/skeleton.vue";

// 请求数据
function loadData(state) {
  // 注：服务端 已处理相关分页数据
  const params = {
    pageNumber: state.currentPage, //当前页码值（页数）
    pageSize: state.pageSize, //一页显示多少条数据
    search: state.searchContent, //如果没有搜索条件则·服务端接收该数据是空字符串  则默认全部数据返回   有则进行select
  };
  // 应为设置了基础路径在.env.development中  所以此处网络请求可以直接省略基本路径
  setTimeout(() => {
    //邪教做法
    axios.get("/goods", { params }).then((res) => {
      state.tableData = res.data.list; //对应请求页码值上的数据 更新
      state.total = res.data.totalCount; //总的记录数（数据条数） 更新

      state.loads = false;
    });
  }, 700);
}

// 编辑商品信息
function useEdit(state) {
  const handleEdit = (index, row) => {
    state.editDialogVisible = true;
    state.pId = row.id;
    // console.log(row);
  };
  return {
    handleEdit,
  };
}

// 搜素商品数据方法
function useHandleSearch(state) {
  const handleSearch = () => {
    state.currentPage = 1; //搜索完后默认展示第一页数据  所以先要将currentpage设为1
    const params = {
      pageNumber: state.currentPage,
      pageSize: state.pageSize,
      search: state.searchContent,
    };
    axios.get("/goods", { params }).then((res) => {
      state.tableData = res.data.list;
      state.total = res.data.totalCount;
    });
  };
  return {
    handleSearch,
  };
}

//删除商品数据
function useDelete(state) {
  const handleDelete = (index, row) => {
    console.log("index=", index);
    console.log("row=", row);
    // ElMessageBox：
    // 窗口被关闭后，它默认会返回一个Promise对象便于进行后续操作的处理
    //  传入options(选项)作为第三个参数，它是一个字面量对象。
    // type字段表明消息类型，可以为success，error，info和warning，无效的设置将会被忽略。
    // 注意，第二个参数title必须定义为String类型，如果是Object，会被理解为options。
    // !!!!!!!若不使用 Promise，可以使用options中callback对象指定 MessageBox 关闭后的回调函数：	function(action, instance)，
    // action 的值为'confirm', 'cancel'或'close', instance 为 MessageBox 实例，可以通过它访问实例上的属性和方法
    ElMessageBox.confirm("确定要删除该记录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      callback: (action) => {
        if (action === "confirm") {
          // console.log("id=", row.id);
          axios
            .delete("/goods/delete", { params: { id: row.id } })
            .then((res) => {
              // res.data.code服务端设置的返回信息(可在network上的response)  若为ok则删除成功
              if (res.data.code === "ok") {
                ElNotification({
                  title: "成功",
                  message: "删除成功",
                  type: "success",
                  duration: 2000,
                });
                // 为了实时展示数据 再调用一下之前设置的方法loadData：向服务端发送请求获取新的数据信息到tableDate中 最终展示新的tableDate数据
                loadData(state);
              } else {
                ElNotification({
                  title: "失败",
                  message: "删除失败",
                  type: "error",
                  duration: 2000,
                });
              }
            });
        }
      },
    });
  };
  return { handleDelete };
}

export default {
  components: {
    AddProduct,
    EditProduct,
    Skeleton,
  },
  setup() {
    const state = reactive({
      tableData: [],
      centerDialogVisible: false, //控制添加商品窗口的显示与隐藏

      editDialogVisible: false, //控制编辑商品窗口的显示与隐藏
      loads: true,
      total: 0,
      pageSize: 3,
      currentPage: 1,
      searchContent: "", //搜索条件
      pId: 0, //要编辑商品的id
    });

    const url = import.meta.env.VITE_APP_URL;

    onMounted(() => {
      loadData(state);
    });

    const addGoodsInfo = () => {
      state.centerDialogVisible = true;
    };

    const closeDialogVisible = (visible, data) => {
      state.centerDialogVisible = visible;
      if (data !== undefined) {
        // state.tableData.push(data); //为了实时展示数据  所以通过push将成功添加的数据给该数组  最终展示在界面上  触发时机在AddProduct中有注释
        loadData(state); //再次请求数据  实时展示数据  并更新了分页相关参数
      }
    };

    const closeEditDialogVisible = (visible, data) => {
      state.editDialogVisible = visible;
      if (data !== undefined) {
        loadData(state); //再次请求数据  实时展示数据  并更新了分页相关参数
      }
    };

    // 页码切换的时候执行该方法   该事件触发时的方法有一默认参值val就是要切换到的页码值
    const changePage = (val) => {
      state.currentPage = val;
      loadData(state); //重新调用该方法获取改变过页码后的数据
    };

    // setup return总结(执行上下文)：内部（setup内部）可以直接访问外部（setup外部）
    //  外部不能直接访问内部数据  需在内部通过函数参数传递形式得到setup内部数据
    // 所以当外部的函数方法需用到内部数据时,需嵌套一层函数用来接收setup调用该函数传来的内部参数 最后再返回该内层函数,如果不需要setup中的数据则不用使用双层函数
    // 模板访问内部和外部都需 return出去  也就是说setup的return 只是针对模板的 为了让模板得到js中的数据
    // 由于return中不能调用函数  只能返回一个函数  所以调用后需加...  例如：...useAdd(state, validateForm, editor, emit)
    return {
      ...toRefs(state), //原本state通过...进行解构后能够得到其内部的属性：tableData
      // 但解构其内部属性不是响应式了  所以要额外通过 toRefs 方法将一个响应式对象中的属性转换为响应式属性
      url,
      addGoodsInfo,
      closeDialogVisible,
      closeEditDialogVisible,
      changePage,
      ...useHandleSearch(state),
      ...useDelete(state),
      ...useEdit(state),
    };
  },
};
</script>

<style>
.el-main {
  height: 600px;
}
.imgSet {
  width: 180px;
  height: 180px;
  border: 2px solid #c5d0e6;
  border-radius: 8px;
  /* 设置边框不占用位置大小 */
  box-sizing: border-box;

  transform: translate(-20.5px);
}
</style>