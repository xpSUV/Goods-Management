<template>
  <div>
    <!-- el面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- elementplus默认flex布局  此处使用栅格进行布局  el-row  el-col  ：gutter  ：span官网都有使用说明 -->
      <el-row :gutter="20" style="margin-bottom: 5px">
        <el-col span="8">
          <el-input
            placeholder="请输入内容"
            prefix-icon="el-icon-search"
            v-model="searchContent"
          >
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="danger" @click="handleSearch">搜索</el-button>
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="
              () => {
                addUserInfo();
              }
            "
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 当 el-table 元素中注入 data 对象数组后，在 el-table-column 中用 prop 属性来对应对象中的键名即可填入数据，
      用 label 属性来定义表格的列名。可以使用 width 属性来定义列宽。 -->
      <!-- 当然也可以通过slot的方式进行数据填充  只不过这是用于自定义列模板的表格 如goodlist中自定义表格的每列模板 -->
      <el-table :data="tableData" border>
        <!-- prop:对应列内容的字段名，也可以使用 property 属性 -->
        <el-table-column label="编号" prop="id"></el-table-column>
        <el-table-column label="姓名" prop="userName"></el-table-column>
        <el-table-column label="邮箱" prop="userMail"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 7px"
      >
      </el-pagination>
    </el-card>
    <AddUser
      :centerDialogVisible="centerDialogVisible"
      @onCloseDialog="closeDialogVisible"
    ></AddUser>
    <!-- //使用v-if 判断editDialogVisible属性是否为true  为true才进行组件渲染   否则该组件会被渲染  则就会调用该组件内部的onmounted函数-->
    <EditUser
      v-if="editDialogVisible === true"
      :editDialogVisible="editDialogVisible"
      :userId="uId"
      @onCloseEditDialog="closeEditDialogVisible"
    ></EditUser>
  </div>
</template>

<script>
import { onMounted, reactive, toRefs } from "@vue/runtime-core";
import axios from "axios";
import AddUser from "../components/Users/AddUser.vue";
import EditUser from "../components/Users/EditUser.vue";
import { ElMessageBox, ElNotification } from "element-plus";

// 数据请求
async function useLoadData(state) {
  const params = {
    pageNumber: state.currentPage,
    pageSize: state.pageSize,
    search: state.searchContent,
  };
  const res = await axios.get("/users", { params });
  state.tableData = res.data.list;
  state.total = res.data.totalCount;
}

// 监听pageSize改变的事件 el组件定义该事件方法默认传参：设置的每页显示多少条（PageSize），获取每页显示的记录数，然后重新发送请求
function useHandleSizeChange(state) {
  const handleSizeChange = (newSize) => {
    // console.log(newSize);
    state.pageSize = newSize;
    useLoadData(state); //前面定义的数据请求函数
  };
  return {
    handleSizeChange,
  };
}

// 监听页码值改变后，事件触发后执行的处理事件，在该函数中，获取当前的页码值，然后重新发送请求
function useHandleCurrentChange(state) {
  const handleCurrentChange = (newPage) => {
    // console.log(newPage);
    state.currentPage = newPage;
    useLoadData(state);
  };
  return {
    handleCurrentChange,
  };
}

// 实现用户搜索功能
function useSearch(state) {
  const handleSearch = () => {
    state.currentPage = 1;
    const params = {
      pageNumber: state.currentPage,
      pageSize: state.pageSize,
      search: state.searchContent,
    };
    axios.get("/users", { params }).then((res) => {
      state.tableData = res.data.list;
      state.total = res.data.totalCount;
    });
  };
  return {
    handleSearch,
  };
}

//编辑用户信息
function useEdit(state) {
  const handleEdit = (row) => {
    state.editDialogVisible = true;
    state.uId = row.id;
  };
  return {
    handleEdit,
  };
}

// 删除用户数据

function useDelete(state) {
  const handleDelete = (row) => {
    ElMessageBox.confirm("确定要删除该用户数据吗？", "提示", {
      cancelButtonText: "取消",
      confirmButtonText: "确定",
      type: "warning",
      callback: (action) => {
        if (action === "confirm") {
          axios
            .delete("/user/delete", { params: { id: row.id } })
            .then((res) => {
              if (res.data.code === "ok") {
                ElNotification({
                  title: "成功",
                  message: "删除成功",
                  duration: 2000,
                  type: "success",
                });
                useLoadData(state);
              } else {
                ElNotification({
                  title: "失败",
                  message: "删除失败",
                  duration: 2000,
                  type: "error",
                });
              }
            });
        }
      },
    });
  };
  return {
    handleDelete,
  };
}
export default {
  components: {
    AddUser,
    EditUser,
  },
  setup() {
    const state = reactive({
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 3,
      searchContent: "",
      centerDialogVisible: false,
      editDialogVisible: false,
      uId: 0,
    });
    onMounted(() => {
      useLoadData(state);
    });

    // 关闭窗口
    const closeDialogVisible = (visible, data) => {
      state.centerDialogVisible = visible;
      if (data !== undefined) {
        useLoadData(state);
      }
    };

    // 打开窗口
    const addUserInfo = () => {
      state.centerDialogVisible = true;
    };

    // 关闭编辑窗口
    const closeEditDialogVisible = (visible, data) => {
      state.editDialogVisible = visible;
      if (data !== undefined) {
        useLoadData(state);
      }
    };
    return {
      ...toRefs(state),
      ...useHandleSizeChange(state),
      ...useHandleCurrentChange(state),
      ...useSearch(state),
      closeDialogVisible,
      closeEditDialogVisible,
      addUserInfo,
      ...useEdit(state),
      ...useDelete(state),
    };
  },
};
</script>

<style>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 14px;
}
</style>