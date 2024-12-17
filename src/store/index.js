import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    x_songsList: [], //搜索的歌曲数组对象
  },
  mutations: {
    // 替换整个数组
    m_setItems(state, newItems) {
      state.x_songsList = newItems;
      // 保存数据到本地
      localStorage.setItem("l_songsList", JSON.stringify(state.x_songsList));
    },
  },
  actions: {},
  modules: {},
});
