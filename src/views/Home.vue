<template>
  <div id="Home">
    <!-- 顶部搜索框 -->
    <div class="nav">
      <!-- 搜索框 -->
      <div class="search_input">
        <input type="text" placeholder="搜索音乐、MV、歌单、用户" v-model="keyword" @keyup.enter="searchValue" @focus="onFocus" @blur="onBlur" />
        <div class="search_icon" @click="searchValue"><i></i></div>
      </div>
      <div class="hot_key">
        热门搜索:<span v-for="item in hot_key" :key="item.n">{{ item.k }}</span>
      </div>
    </div>

    <!-- 搜索主体 -->
    <div class="content">
      <ul class="title one">
        <li></li>
        <li>歌曲</li>
        <li>歌手</li>
        <li>专辑</li>
        <li>时长</li>
      </ul>
      <ul class="title songs" v-for="(item, index) in songsList" :key="item.songmid">
        <li>{{ index + 1 }}</li>
        <li>
          <span>{{ item.songname }}</span>
          <div>
            <a-tooltip>
              <template slot="title"> 播放歌曲 </template>
              <a-icon type="play-circle" @mouseenter="toPlay(item.songmid)" />
            </a-tooltip>
            <a-tooltip>
              <template slot="title"> 下载歌曲 </template>
              <a-icon type="vertical-align-bottom" />
            </a-tooltip>
            <a-tooltip>
              <template slot="title"> 添加到我的歌单 </template>
              <a-icon type="plus-square" />
            </a-tooltip>
          </div>
        </li>
        <li>
          <span v-for="sign in item.singer" :key="sign.id">{{ item.singer.length > 1 ? sign.name + " / " : sign.name }}</span>
        </li>
        <li>{{ item.albumname }}</li>
        <li>{{ item.interval | getMinute }}</li>
      </ul>
    </div>
    <!-- 空状态切换 -->
    <a-empty description="暂无搜索数据" v-show="isEmpty" style="padding: 10px 0; height: 68vh" />
  </div>
</template>

<script>
export default {
  name: "Home",
  created() {
    // 请求热门搜索关键字
    this.hot_search();
  },
  mounted() {
    // 设置cookie信息
    // this.$axios
    //   .post(`/user/setCookie`, {
    //     data: "ts_uid=735691528; pgv_pvid=192372140; eas_sid=K1b6U5b1C312O2w8t2y2P4r9E7; RK=fl/Z822QZ5; ptcz=9a706184f39add4b9767fb6b575b7997c89f8ed9c2b7b968a4ddee8beb91ab0a; fqm_pvqid=a1ef3e00-c897-486b-b537-a6a835873c23; ptui_loginuin=1693889638; tmeLoginType=2; euin=oKCqoicFNKCiNn**; ts_refer=ADTAGmyqq; fqm_sessionid=b83ba967-5c0d-4be2-af7b-e3eb2eace832; pgv_info=ssid=s6774386820; ts_last=y.qq.com/; _qpsvr_localtk=0.770934420309467; login_type=1; psrf_qqrefresh_token=EA27219DF698D25F5983F3FB5829FBE8; qqmusic_key=Q_H_L_5rd_kOcTzFRMkbzyxcgixk9Xp-jtLDbtbVTc20SWVA1qoab4N061dRA; wxopenid=; psrf_access_token_expiresAt=1662603315; psrf_qqunionid=E264BA66D62E7209D87E029DAD376ADD; psrf_qqaccess_token=39FA746E53427C02F1AE53E7BA90D4F7; wxrefresh_token=; qm_keyst=Q_H_L_5rd_kOcTzFRMkbzyxcgixk9Xp-jtLDbtbVTc20SWVA1qoab4N061dRA; psrf_musickey_createtime=1654827315; psrf_qqopenid=3F7A6D6A4E62B93E966110DECE6D8455; wxunionid=; qm_keyst=Q_H_L_5rd_kOcTzFRMkbzyxcgixk9Xp-jtLDbtbVTc20SWVA1qoab4N061dRA; uin=1693889638",
    //   })
    //   .then((res) => {
    //     console.log(res.data);
    //   });
  },
  data() {
    return {
      hot_key: [], //热门搜索关键字
      keyword: "", //用户搜索关键字
      songsList: [], //歌曲搜索列表
      isEmpty: true, //空状态是否显示
    };
  },
  watch: {
    // 监听最新的值
    keyword(newVal, oldVal) {
      this.keyword = newVal.trim();
      if (newVal == "") {
        this.songsList = [];
      }
    },
    songsList(newVal, oldVal) {
      if (this.songsList.length > 0) {
        this.isEmpty = false;
      } else {
        this.isEmpty = true;
      }
    },
  },
  methods: {
    // 获取搜索关键字请求
    hot_search() {
      this.$axios.get("/search/hot").then((res) => {
        this.hot_key = res.data.data.slice(0, 5); //返回30个,截取5个
        this.keyword = this.hot_key[0]["k"];
      });
    },
    //获取音乐列表请求
    getSongList() {
      this.$axios.get(`/search?key=${this.keyword}`).then((res) => {
        this.songsList = res["data"]["data"]["list"];
      });
    },

    // 函数-输入框搜索关键字
    searchValue(e) {
      this.getSongList();
    },
    onFocus() {
      console.log(11);
    },

    onBlur() {
      console.log(22);
    },
    //获取播放链接
    toPlay(id) {
      console.log(id);
      this.$axios.get(`/song/url?id=${id}`).then((res) => {
        console.log(res.data);
      });
    },
  },
  filters: {
    // 把秒钟转分钟
    getMinute(value) {
      let minute = Math.floor(value / 60);
      let second = value % 60;

      if (minute < 10) {
        minute = "0" + minute;
      }
      if (second < 10) {
        second = "0" + second;
      }

      return minute + ":" + second;
    },
  },
};
</script>

<style lang="less" scoped>
#Home {
  // background-color: #fafafa;
  .nav {
    // width: 1200px;
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
          background-color: rebeccapurple;
          background: url("../assets/icon_sprite.630b3e60.png") no-repeat 0 -40px;
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
          color: #31c27c;
        }
        div {
          display: flex;
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
}
</style>
