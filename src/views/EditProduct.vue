<template>
  <!-- v-model双向绑定  绑定的是该标签的value值与变量  所以相当于设置该标签的value 为true时显示-->
  <el-dialog
    title="编辑商品信息"
    v-model="editDialogVisible"
    width="37%"
    center
    @close="closeEditDialog(false)"
  >
    <!-- Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可 -->
    <el-form
      :model="goodsForm"
      :rules="rules"
      ref="validateForm"
      label-width="100px"
    >
      <el-form-item label="商品名称" prop="title">
        <el-input v-model="goodsForm.title"></el-input>
      </el-form-item>
      <el-form-item label="商品价格" prop="price">
        <el-input v-model="goodsForm.price"></el-input>
      </el-form-item>

      <el-form-item label="商品图片" prop="coverImg">
        <!-- action属性指定要上传的服务端地址 -->
        <el-upload
          class="avatar-uploader"
          :action="uploadURL"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="handleBeforeUpload"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="商品详情" prop="goodsDetail">
        <!-- 注意富文本编辑器中的双向绑定v-model好像没有用  所以此处通过ref获取富文本编辑器进行其他方式校验 并将富文本编辑器中的值传给state中的属性变量 -->
        <QuillEditor
          theme="snow"
          ref="editor"
          style="height: 100px"
        ></QuillEditor>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitEdit">编辑商品</el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button
          @click="
            () => {
              closeEditDialog(false);
            }
          "
          >取 消</el-button
        >
        <el-button type="primary" @click="submitEdit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { reactive, toRefs, ref, onMounted } from "vue";
//npm install @vueup/vue-quill@beta --save
//QuillEditor  //富文本编辑器 组件
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import axios from "axios";
import { ElMessage } from "element-plus";

//根据商品编号查询要编辑的数据
function useLoadEditData(state, editor) {
  axios
    .get("/goods/get", { params: { goodsId: state.goodsId } })
    .then((res) => {
      state.goodsForm = res.data;
      //   注意此处 单独 给 富文本编辑器 与 图片 设置值是因为：
      // 在富文本编辑器中v-model双向绑定没用
      // 所以state.goodsForm.goodsDetail就算获得值也不能绑定到元素中  所以手动获取富文本编辑器元素并添加设置setHTML
      // 图片路径设置后才会显示图片  获取的只是图片部分路径需拼接到state.imageUrl
      state.imageUrl = import.meta.env.VITE_APP_URL + res.data.thumbnail;
      state.goodsForm.coverImg = res.data.thumbnail;
      editor.value.setHTML(res.data.goodsDetail);
    });
}

// 完成商品编辑函数
function useEditData(state, validateForm, editor, emit) {
  const submitEdit = () => {
    // 富文本编辑器中的内容数据需要额外添加  应为他不能用v-model
    state.goodsForm.goodsDetail =
      editor.value.getText().replace(/(\r\n|\n|\r)/gm, "<br />") !== "<br />"
        ? editor.value.getHTML()
        : "";
    validateForm.value.validate((vaild) => {
      if (vaild) {
        const params = {
          goodsId: state.goodsId,
          title: state.goodsForm.title,
          price: state.goodsForm.price,
          thumbnail: state.goodsForm.coverImg,
          goodsDetail: state.goodsForm.goodsDetail,
        };
        axios.post("/goods/edit", params).then((res) => {
          emit("onCloseEditDialog", false, res.data); //成功后关闭窗口  并把服务端传递的数据传过去  实时更新数据
        });
      }
    });
  };
  return {
    submitEdit,
  };
}

// 完成文件上传类型校验   file参数是存储的文件上传信息   该方法是图片文件上传前的处理函数
const handleBeforeUpload = (file) => {
  // file.name:获取上传文件名称    split('.'):对字符串以'.'进行分割 得到一个数组（数组转字符串join用法相反）   [1]:拿到该数组第二个参数  即文件后缀名
  const arr = file.name.split(".")[1];
  //.includes(test)判断是否包含在test中
  if (!["jpg", "jpeg", "png"].includes(arr)) {
    ElMessage.error("请上传jpg,jpeg,png类型的图片文件"); //ElMessage:  element-plus组件  js中使用组件 需要import导入
    return false;
  }
};

export default {
  components: {
    QuillEditor,
  },
  props: {
    editDialogVisible: Boolean,
    goodsId: Number,
  },

  emits: ["onCloseEditDialog"],
  setup(props, { emit }) {
    const validateForm = ref();
    const editor = ref();
    const state = reactive({
      editDialogVisible: props.editDialogVisible,
      goodsId: props.goodsId,
      // 设置上传到服务端的路径（服务端端口地址）（虽然是本地服务，但这个连接URL不等于文件在本机中的地址这是服务端端口地址）
      uploadURL: import.meta.env.VITE_APP_URL + "/goods/fileUpload",
      imageUrl: "",
      goodsForm: {
        title: "",
        price: 0,
        coverImg: "",
        goodsDetail: "",
      },
    });

    onMounted(() => {
      //   console.log("goodsId=", state.goodsId);
      useLoadEditData(state, editor);
    });

    // 上传成功以后，执行的处理函数
    const handleAvatarSuccess = (response) => {
      state.imageUrl = import.meta.env.VITE_APP_URL + response.msg;
      console.log(response);
      console.log(state.imageUrl);
      // 此处给coverImg赋值是应为校验规则中定义了该表单须有值  否则不通过表单校验 则在上传成功后给该属性赋一下值  主要是用来axios发送时设置图片地址参数
      state.goodsForm.coverImg = response.msg;
    };

    const closeEditDialog = (visible) => {
      emit("onCloseEditDialog", visible);
    };

    // 表单的校验规则设置

    const rules = {
      // html表单中  onblur：失去焦点时触发该事件   css中blur是模糊滤镜
      title: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
      price: [{ required: true, message: "请输入商品价格", trigger: "blur" }],
      coverImg: [
        { required: true, message: "请上传商品主图", trigger: "blur" },
      ],

      goodsDetail: [
        { required: true, message: "请输入商品详情", trigger: "blur" },
      ],
    };

    return {
      ...toRefs(state),

      rules,
      closeEditDialog,
      validateForm,
      editor,
      ...useEditData(state, validateForm, editor, emit),
    };
  },
};
</script>

<style>
</style>