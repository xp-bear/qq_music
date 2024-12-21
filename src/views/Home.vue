<template>
  <div id="Home">
    <!-- 顶部搜索框 -->
    <div class="nav">
      <!-- 搜索框 -->
      <div class="search_input" :class="{ border: isShadow }">
        <input type="text" placeholder="搜索音乐、MV、歌单、用户" v-model="keyword" @keyup.enter="debouncedSearchValue" ref="search_input" @focus="onFocus" @blur="onBlur" />
        <div class="search_icon" @click="debouncedSearchValue"><i></i></div>
      </div>
      <div class="hot_key">
        热门搜索:<span v-for="item in hot_key" :key="item.n">{{ item.k }}</span>
      </div>
    </div>

    <a-spin tip="疯狂加载中..." size="large" :spinning="isLoading">
      <!-- 搜索主体 -->
      <div class="content">
        <ul class="title one">
          <li>/</li>
          <li>歌曲</li>
          <li>歌手</li>
          <li>专辑</li>
          <li>时长</li>
        </ul>
        <ul class="title songs" v-for="(item, index) in songsList" :key="item.id">
          <li>{{ index + 1 }}</li>
          <li>
            <span>{{ item.sign_name }}</span>
            <div>
              <a-icon title="播放歌曲" type="play-circle" @click="toPlay(item.uid, item.id)" />
              <a-icon title="下载歌曲" type="download" @click="downloadMusic(item)" />
              <a-icon title="添加到播放列表" type="plus-square" @click="addPlayList(item.uid, item.id)" />
            </div>
          </li>
          <li>{{ item.sign_signer }}</li>
          <li><img :src="item.data.cover" alt="" style="height: 100%" /> {{ item.sign_signer }}的专辑</li>
          <li>{{ item.duration }}</li>
        </ul>
      </div>
      <!-- 空状态切换 -->

      <a-empty description="暂无搜索数据" v-show="isEmpty" style="padding: 10px 0; height: 68vh" />
    </a-spin>
  </div>
</template>

<script>
import { debounce } from "lodash";
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  name: "Home",
  created() {
    // 请求热门搜索关键字
    this.hot_search();
  },
  created() {
    this.debouncedSearchValue = debounce(this.searchValue, 500); // 500ns防抖
  },
  mounted() {
    this.$refs.search_input.focus();
  },
  data() {
    return {
      hot_key: [
        { n: 1, k: "周杰伦" },
        { n: 2, k: "薛之谦" },
        { n: 3, k: "许嵩" },
      ], //热门搜索关键字
      keyword: "周杰伦", //用户搜索关键字
      songsList: [], //歌曲搜索列表
      isEmpty: true, //空状态是否显示
      songUrl: {}, //歌曲链接
      isShadow: false, //搜索框阴影切换的class状态
      isLoading: false, //搜索歌曲加载的状态
    };
  },
  watch: {
    // 监听输入框最新的值
    keyword(newVal, oldVal) {
      this.keyword = newVal.trim();
      if (newVal == "") {
        this.songsList = [];
      }
    },
    // 监听有没有歌曲,判断是不是空状态
    songsList(newVal, oldVal) {
      if (this.songsList.length > 0) {
        this.isEmpty = false;
      } else {
        this.isEmpty = true;
      }
    },
  },
  computed: {
    ...mapState(["x_songsList", "x_playListIndex"]),
  },
  methods: {
    ...mapMutations(["m_setItems", "m_setPlayListIndex", "m_setIsPlaying"]),
    // 获取热门搜索关键字发起请求
    hot_search() {
      // this.$axios.get("/search/hot").then((res) => {
      //   this.hot_key = res.data.data.slice(0, 5); //返回30个,截取5个
      //   this.keyword = this.hot_key[0]["k"];
      // });
    },

    // 根据关键字发起请求音乐列表
    async searchValue(e) {
      console.log("开始请求数据");
      try {
        this.isLoading = true; //开始加载
        // 初始请求获取行数据
        const response = await this.$axios.get(`?msg=${this.keyword}&type=json&br=2`);
        let lines = response.data.split("\n");
        lines.pop(); // 删除最后一个元素

        // 创建保存结果的数组
        let resultPromises = [];

        // 遍历每一行数据并解析
        lines.forEach((line, index) => {
          // 每一行按照 "--" 分割成两部分
          let parts = line.split(" -- ");

          // 提取歌曲名（去掉前面的编号和点）
          let signName = parts[0].split(".").slice(1).join(".").trim();
          // 歌手名
          let signer = parts[1]?.trim();

          // 构造对象并加入到结果数组中
          resultPromises.push(
            (async () => {
              let obj = {};
              // 请求歌曲数据
              const result = await this.$axios.get(`?msg=${this.keyword}&type=json&br=2&n=${index + 1}`);
              obj.data = result.data.data;
              obj.id = index + 1;
              obj.sign_name = signName;
              obj.sign_signer = signer;
              obj.uid = result.data.data.link;
              return obj;
            })()
          );
        });

        // 等待所有请求完成
        const resultArray = await Promise.all(
          resultPromises.map(async (promise, index) => {
            let obj = await promise;

            obj.duration = await this.fetchAudioDuration(obj.data.music_url);
            if (obj.duration == "00:00") {
              return {};
            }

            return obj;
          })
        );
        // 使用filter和Object.keys去除空对象
        this.songsList = resultArray.filter((obj) => Object.keys(obj).length > 0);
        // 保存数据到vuex中
        // this.m_setItems(this.songsList);

        // console.log("歌曲列表: ", this.songsList);

        this.isLoading = false; //结束加载
      } catch (error) {
        // 报错处理
        this.isLoading = false; //结束加载
        this.$message.error("加载失败,请稍后再试!", 1);
      }
    },
    // 输入框聚焦
    onFocus() {
      this.isShadow = true;
    },
    // 输入框失去焦点
    onBlur() {
      this.isShadow = false;
    },
    // 根据uid获取播放对象
    getUidByPlayObj(list, uid) {
      return list.find((item) => item.uid === uid);
    },
    //获取播放链接
    toPlay(uid, id) {
      // 保存索引到vuex中
      this.m_setItems(this.songsList[id - 1]);
      this.m_setPlayListIndex(uid);
      this.m_setIsPlaying(true);
    },
    // 下载音乐
    downloadMusic(item) {
      // 创建一个隐藏的链接元素
      const link = document.createElement("a");
      link.target = "_blank";
      link.href = item.data.music_url; // 歌曲的下载链接
      link.download = item.singer + "-" + item.title + ".mp3"; // 下载的文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // 添加到播放列表
    addPlayList(uid, id) {
      // 保存索引到vuex中
      this.m_setItems(this.songsList[id - 1]);
      this.$message.success("已添加到播放列表", 1);
    },
    // 根据提供的音乐URL获取音频的总时长
    getAudioDuration(url) {
      return new Promise((resolve, reject) => {
        const audio = new Audio(url);
        audio.preload = "metadata"; // 只预加载元数据

        audio.addEventListener("loadedmetadata", function () {
          resolve(audio.duration); // 音频加载完成后返回时长
        });

        audio.addEventListener("error", function () {
          reject(new Error("无法加载音频文件")); // 如果加载失败则抛出错误
        });
      });
    },

    // 调佣函数格式化音乐时长显示
    async fetchAudioDuration(url) {
      try {
        let value = parseInt(await this.getAudioDuration(url));

        let minute = Math.floor(value / 60);
        let second = value % 60;

        if (minute < 10) {
          minute = "0" + minute;
        }
        if (second < 10) {
          second = "0" + second;
        }
        let res = minute + ":" + second;

        return res;
      } catch (error) {
        return "00:00";
      }
    },
  },
  filters: {},
};
</script>

<style lang="less" scoped>
#Home {
  position: relative;
  padding-bottom: 85px;
  .nav {
    // width: 1200px;
    width: 100%;
    height: 250px;
    background: url("../assets/bg_search.png") no-repeat;
    background-size: cover;
    padding-top: 85px;
    margin: 0 auto;
    .search_input {
      display: flex;
      justify-content: space-between;
      width: 640px;
      height: 50px;
      border-radius: 5px;
      overflow: hidden;
      background-color: white;
      margin: 0 auto 0;
      color: black;
      input {
        width: 554px;
        height: 50px;
        padding: 0 70px 0 15px;
        &::placeholder {
          color: #757575;
        }
      }
      .search_icon {
        display: flex;
        align-items: center;
        width: 50px;
        height: 50px;
        i {
          width: 16px;
          height: 16px;
          margin-left: 20px;
          background: url("../assets/icon_sprite.630b3e60.png") no-repeat 0 -40px;
          &:hover {
            background: url("../assets/icon_sprite.630b3e60.png") no-repeat 0 -60px;
          }
        }
      }
    }
    .hot_key {
      margin-top: 20px;
      color: white;
      text-align: center;
      span {
        margin: 0 10px;
      }
    }
  }
  .content {
    width: 1200px;
    margin: 0 auto;
    .title {
      display: flex;
      justify-content: center;
      width: 1200px;
      height: 50px;
      color: #a4a4bf;
      font-size: 14px;
      margin: 0;
      li {
        height: 50px;
        line-height: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      li:nth-child(1) {
        width: 36px;
        padding-left: 10px;
      }
      li:nth-child(2) {
        width: 520px;
      }
      li:nth-child(3) {
        width: 280px;
      }
      li:nth-child(4) {
        width: 290px;
        padding-right: 10px;
      }
      li:nth-child(5) {
        color: #a5a2ba;
        letter-spacing: 1px;
        flex: 1;
      }
    }
    ul:nth-child(even) {
      background-color: #fafafa;
    }
    .songs {
      color: black;
      font-size: 14px;
      li:nth-child(2) {
        display: flex;
        justify-content: space-between;
        align-items: center;
        span {
          width: 400px;
          color: #31c27c;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        div {
          display: flex;
          width: 120px;
          align-items: center;
          i {
            width: 24px;
            height: 24px;
            font-size: 24px;
            color: #a2a2a2;
            margin-right: 15px;
            &:hover {
              transition: all 0.3s;
              color: #31c27c;
            }
          }
        }
      }
    }
  }
  .ant-empty {
    width: 1200px;
    margin: 0 auto;
  }
  .border {
    margin-left: -6px;
    box-shadow: 0 0 6px rgba(77, 190, 181, 0.8);
    transition: all 0.3s;
  }
}
</style>
