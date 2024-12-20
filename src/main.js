import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import "animate.css";
import "ant-design-vue/dist/antd.css";
import { Button, message, Input, Table, Pagination, Icon, Empty, Tooltip, Spin, Slider } from "ant-design-vue";
Vue.use(Button);
Vue.use(Input);
Vue.use(Table);
Vue.use(Pagination);
Vue.use(Icon);
Vue.use(Empty);
Vue.use(Tooltip);
Vue.use(Spin);
Vue.use(Slider);

Vue.config.productionTip = false;
Vue.prototype.$message = message;
Vue.prototype.$axios = axios;
axios.defaults.baseURL = "https://api.cenguigui.cn/api/mg_music/";

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
