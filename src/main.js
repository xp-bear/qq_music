import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import "animate.css";
import "ant-design-vue/dist/antd.css";
import { Button, message, Input, Table, Pagination, Icon, Empty, Tooltip } from "ant-design-vue";
Vue.use(Button);
Vue.use(Input);
Vue.use(Table);
Vue.use(Pagination);
Vue.use(Icon);
Vue.use(Empty);
Vue.use(Tooltip);

Vue.config.productionTip = false;
Vue.prototype.$message = message;
Vue.prototype.$axios = axios;
axios.defaults.baseURL = "http://150.158.21.251:3300";

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
