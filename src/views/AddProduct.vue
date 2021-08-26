<template>
  <!-- v-model双向绑定  绑定的是该标签的value值与变量  所以相当于设置该标签的value 为true时显示-->
  <el-dialog
    title="添加商品信息"
    v-model="centerDialogVisible"
    width="37%"
    center
    @close="closeDialog(false)"
  >
    <!-- Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可 -->
    <!-- 整个表单必须要绑定：model	表单数据对象  否则后期对整个表单校验 以及各个el-form-item进行rulers校验 估计会没用 -->
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
        <el-button type="primary" @click="sumbitAdd">添加商品</el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button
          @click="
            () => {
              closeDialog(false);
            }
          "
          >取 消</el-button
        >
        <el-button type="primary" @click="sumbitAdd">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { reactive, toRefs, ref } from "vue";
//npm install @vueup/vue-quill@beta --save
//QuillEditor  //富文本编辑器 组件
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import axios from "axios";
import { ElMessage } from "element-plus";

//添加商品的方法   此处是为了不让setup函数中的代码太多才写外面了 最后返回sumbitAdd方法函数
// 然后在setup函数中的return中调用一下该函数则会向外暴露出subitAdd方法   单击添加商品按钮（即模板中）则就可以使用该方法了
function useAdd(state, validateForm, editor, emit) {
  const sumbitAdd = () => {
    //其他表单输入的值一般通过v-modul传给数据属性变量    但在父文本编辑器中的双向绑定好像没用
    //下面是为了替换掉富文本编辑器中的<br/>换行符默认值   并让富文本编辑器中的输入数据传给state.goodsForm.goodsDetail属性
    // 如果有br换行符则给state.goodsForm.goodsDetail 一个空值  如果没有则给他正常获取该富文本编辑器中的内容
    // editor.value.getText()获取该富文本编辑器中的值     editor就是ref获取的该富文本编辑器元素
    state.goodsForm.goodsDetail =
      editor.value.getText().replace(/(\r\n|\n|\r)/gm, "<br />") !== "<br />"
        ? editor.value.getHTML()
        : "";
    //为什么要通过getHTML获取来给值而不是gettext  是应为该富文本编辑器可以设置一些加粗 倾斜等html标签效果  所以要用getHTML()来获取

    ///
    // ref接收一个原始值，返回一个包装对象，包装对象具有.value属性。通过.value访问这个值
    // 对通过ref获取到的validateForm元素（即该表单）中的值通过 validate方法(el内部定义) 进行校验
    // validate方法：  elmentplus封装好的用于对 整个表单 进行验证（根据之前设置的rules进行整个表单的校验）
    // validate的参数是一个 回调函数。该回调函数在校验结束后被调用，是否校验成功和未通过校验的字段。 valid 是一个 布尔值 校验成功为true反之false
    // 若不传入回调函数，则会返回以 promise
    validateForm.value.validate((valid) => {
      if (valid) {
        const params = {
          //设置通过axios发送到服务端的相应的参数
          title: state.goodsForm.title,
          price: state.goodsForm.price,
          thumbnail: state.goodsForm.coverImg,
          goodsDetail: state.goodsForm.goodsDetail,
        };

        // 此处是上传数据成功后服务端内部设置返回上传成功的数据参数(res.data)再给客户端即params  是response参数：就是网络请求成功后服务端返回的数据  可以在浏览器调试network中查看response
        axios.post("/goods/add", params).then((res) => {
          validateForm.value.resetFields(); // 发送数据到服务端成功后重置表单 但富文本编辑器不受影响）  方法：resetFields()
          editor.value.setText(""); //清空富文本编辑器
          console.log(res.data);
          emit("onCloseDialog", false, res.data); //把false(添加成功商品后关闭添加窗口)和服务端返回的添加成功的结果数据（商品信息）传过去
          // 当点击添加商品 成功添加商品后就会触发该自定义函数   从而达到即时展示添加成功的数据
        });
      }
    });
  };
  return {
    sumbitAdd,
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
  // 父传子：
  // vue3中的父传子与2中的没有什么大区别
  // 只是需要最后在setup函数中添加props参数  并通过props参数获取数据进行添加变量 最后return 这样模板中才能使用
  props: {
    centerDialogVisible: Boolean,
  },

  //   子传父：（在setup以外使用emit方法还需return出去）
  //   vue3在子传父的自定义事件一定要先在emits中进行一个声明   然后通过setup的第二个参数（context）对象解构出emit方法  最后直接使用该方法就可！！！
  //  setup函数 第二个参数提供了一个上下文对象，该对象暴露了以前在 this 上暴露的 property 的选择列表：
  emits: ["onCloseDialog"],
  setup(props, { emit }) {
    // 在vue2中我们可以通过给元素添加ref=‘xxx’,然后在代码中通过refs.xxx的方式来获取元素,在vue3中也可以通过ref来获取元素.
    // 但不是像以往这种熟悉的方式,因为在vue3中没有$和refs这些东西.  ref=‘xxx’  通过const xxx = ref（）来获取元素  最后必须要return出去xxx!!!!!!!1
    // ref接收一个原始值，返回一个包装对象，包装对象具有.value属性。通过.value访问这个值
    const validateForm = ref();
    const editor = ref();

    const state = reactive({
      centerDialogVisible: props.centerDialogVisible,
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

    const closeDialog = (visible) => {
      state.imageUrl = "";
      validateForm.value.resetFields();
      emit("onCloseDialog", visible);
    };

    // 上面单击添加商品后整体校验表单时又进行了一次axios请求发送数据,下面的这次是添加图片时进行了一次  两次服务端返回的response数据不一样  执行操作也不一样
    //上传成功以后，执行的处理函数  此处只是为了获取到图片上传后的 网络地址 用来前端展示
    // 此处的 response参数 就是网络请求成功后服务端返回的数据  可以在浏览器调试network中查看response
    //  //这里服务端response只返回该路径，因为在app.js文件中已经对静态文件进行了配置   前面及下面注释就是服务端中的代码部分
    //  res.send({ msg: '/images/' + newfileName, flag: 'ok' });
    const handleAvatarSuccess = (response) => {
      state.imageUrl = import.meta.env.VITE_APP_URL + response.msg;
      console.log(response);
      console.log(state.imageUrl);
      // 此处给coverImg赋值是应为校验规则中定义了该表单须有值  否则不通过表单校验 则在上传成功后给该属性赋一下值  主要是用来axios发送时设置图片地址参数
      state.goodsForm.coverImg = response.msg;
    };

    // 表单的校验规则设置  也许返回  模板中使用到的都要返回
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

    // setup return总结(执行上下文)：内部（setup内部）可以直接访问外部（setup外部）
    //  外部不能直接访问内部数据  需在内部通过函数参数传递形式得到setup内部数据
    // 所以当外部的函数方法需用到内部数据时,需嵌套一层函数用来接收setup调用该函数传来的内部参数 最后再返回该内层函数,如果不需要setup中的数据则不用使用双层函数
    // 模板访问内部和外部都需 return出去  也就是说setup的return 只是针对模板的 为了让模板得到js中的数据
    // 由于return中不能调用函数  只能返回一个函数  所以调用后需加...  例如：...useAdd(state, validateForm, editor, emit)
    return {
      ...toRefs(state),
      closeDialog,
      rules,
      handleAvatarSuccess,
      // 应为返回的是一个对象中包含这个函数  所以需要扩展运算符进行解构出该方法   方法不能直接返回应该
      ...useAdd(state, validateForm, editor, emit), //state是setup函数中存放数据的对象

      // 在setup函数中 通过ref获取到的该元素需要返回出去，否则外部的模板得不到该元素
      // 说白了setup函数的return是为了返回给外部让模板使用其内部定义或获取到的一些数据  否则模板拿不到
      validateForm,
      editor,
      handleBeforeUpload, //定义在setup外部的函数 或者说在export default外部的函数方法等  也要通过setup方法的return返回 否则模板拿不到这些方法
    };
  },
};
</script>

<style>
/* 下面的el标签样式为什么都写成类选择器形式 ：这些el标签都会渲染成原生html标签并添加相应的模板样式即例如：class=el-container */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  display: flex;
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 103px;
  line-height: 178px;
  padding-top: 75px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
}
</style>
