import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    x_songsList: [], //搜索的歌曲数组对象
    x_playListIndex: "", //当前播放的歌曲uid
    x_isPlaying: false, //是否正在播放
  },
  mutations: {
    // 添加歌曲到播放数组
    m_setItems(state, newItems) {
      // 根据uid 进行去重
      state.x_songsList.push(newItems);
      let originalData = state.x_songsList; // 原始数据
      // 用于存储唯一的 uid 和最终结果
      const seenUIDs = new Set();
      const uniqueSongs = [];

      originalData.forEach((song) => {
        const songUID = song.uid;
        if (!seenUIDs.has(songUID)) {
          seenUIDs.add(songUID);
          uniqueSongs.push(song);
        }
      });

      // 利用集合去重
      state.x_songsList = uniqueSongs;
      // 保存数据到本地
      localStorage.setItem("l_songsList", JSON.stringify(state.x_songsList));
    },
    // 本地存储的数据转存到vuex
    m_setSongsList(state) {
      // 本地存储的数据转存到vuex
      if (localStorage.getItem("l_songsList")) {
        state.x_songsList = JSON.parse(localStorage.getItem("l_songsList"));
      }
      if (localStorage.getItem("l_playListIndex")) {
        state.x_playListIndex = localStorage.getItem("l_playListIndex");
      }
      if (localStorage.getItem("l_isPlaying")) {
        state.x_isPlaying = false; //默认不播放
      }
    },
    // 清空数据
    m_clearSongsList(state) {
      state.x_songsList = [];
      state.x_playListIndex = "-1";
      state.x_isPlaying = false;
      // 清空本地存储
      localStorage.clear();
    },
    // vuex数据保存到本地
    m_setSongsListLocal(state) {
      // 保存数据到本地
      localStorage.setItem("l_songsList", JSON.stringify(state.x_songsList));
      localStorage.setItem("l_playListIndex", state.x_playListIndex);
      localStorage.setItem("l_isPlaying", state.x_isPlaying);
    },
    // 添加当前播放的歌曲索引
    m_setPlayListIndex(state, index) {
      state.x_playListIndex = index;
      // 保存数据到本地
      localStorage.setItem("l_playListIndex", state.x_playListIndex);
    },
    // 是否正在播放
    m_setIsPlaying(state, isPlaying) {
      state.x_isPlaying = isPlaying;
      // 保存数据到本地
      localStorage.setItem("l_isPlaying", state.x_isPlaying);
    },
  },
  actions: {},
  modules: {},
});
