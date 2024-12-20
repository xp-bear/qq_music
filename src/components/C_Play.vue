<template>
  <div id="C_Play">
    <div class="box" :class="[{ animationYup: isMove == 1 }, { animationYdown: isMove == 2 }]">
      <!-- 右上角关闭角标 -->
      <span class="tag" @click="close_play" :class="[{ isLock: isMove == 2 }]"></span>
      <div class="tag_bg"></div>
      <!-- 内容主体 -->
      <div class="content">
        <!-- 按钮图标 -->
        <div class="btns">
          <div></div>
          <div @click="paly_music" :class="x_isPlaying ? 'isPlayingClass' : 'isPauseClass'"></div>
          <div></div>
        </div>
        <!-- 播放信息 -->
        <div class="play_info">
          <div class="play_img">
            <img :src="d_play_music_info ? d_play_music_info.data.cover : 'https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/default_album.jpg'" alt="" />
          </div>
          <div class="play_name">
            <div class="play_name_info">
              <span>{{ d_play_music_info ? d_play_music_info.data.title : "" }}</span>
              <span>{{ d_play_music_info ? d_play_music_info.data.singer : "" }}</span>
            </div>
            <!-- 进度条 -->
            <div class="progress_bar" ref="progressBar" @click="handleProgressBarClick">
              <div class="progressing" ref="progressing">
                <!-- 进度条图标 -->
                <div class="progressing_icon"></div>
              </div>
            </div>
          </div>
          <!-- 播放信息显示 -->
          <div class="play_music_info">
            <span>{{ formattedCurrentTime }}</span>
            <span>&nbsp;/&nbsp;</span>
            <span>{{ d_play_music_info ? d_play_music_info.duration : "00:00" }}</span>
          </div>
        </div>
        <div style="display: flex">
          <!-- 声音相关信息 -->
          <div class="music_info" :class="playVolume == 0 ? 'music_info_mute' : ''" @click="show_music" ref="music_content">
            <div class="music_content" :style="{ display: isShowVolume ? 'block' : 'none' }" @click.stop>
              <a-slider vertical v-model="playVolume" />
            </div>
          </div>
          <!-- 播放音乐的状态切换 -->
          <div class="play_state" @click="change_play_state" :style="d_change_state">
            <div class="play_state_info" ref="play_state_info"></div>
          </div>
          <!-- 播放列表 -->
          <div class="paly_list" @click="paly_list" ref="play_detail">
            <span>{{ x_songsList.length }}</span>
            <div class="play_detail" v-show="playDetailState" @click.stop>1212</div>
          </div>
        </div>
      </div>
    </div>
    <div class="unfold" @mouseover="hover_unfold"></div>
    <!-- 播放音乐 -->
    <audio :src="d_play_music" autoplay :loop="isPlayState == 2 ? true : false" ref="audioElement"></audio>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
export default {
  name: "C_Play",
  data() {
    return {
      playbarImage: require("../assets/playbar.png"),
      isMove: 1, //0默认条件 1出来 2回去

      isShowVolume: false, //是否显示音量
      isPlayState: 1, //播放状态 1循环播放 2单曲循环 3随机播放
      hideTimeout: null, //隐藏定时器

      currentTime: 0, // 当前音乐播放时间，单位为秒
      durationTime: 0, // 音乐总时长，单位为秒
      intervalId: null, // 音乐播放时间定时器 ID
      playVolume: 50, //音量

      playDetailState: false, //播放列表详情
    };
  },
  mounted() {
    // 每秒更新一次当前播放时间
    this.intervalId = setInterval(this.updateCurrentTime, 1000);
    // 监听空格键
    // window.addEventListener("keydown", this.handleSpaceKey);

    // 获取本地数据保存到vux中
    this.m_setSongsList();

    // 全局点击事件
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.intervalId);
    // 移除事件监听
    // window.removeEventListener("keydown", this.handleSpaceKey);

    // 移除全局点击事件
    document.removeEventListener("click", this.handleClickOutside);
  },
  watch: {
    playVolume(newVolume) {
      // 监听音量变化
      this.$refs.audioElement.volume = newVolume / 100;
    },
  },
  computed: {
    ...mapState(["x_playListIndex", "x_songsList", "x_isPlaying"]),

    // 播放状态切换
    d_change_state() {
      if (this.isPlayState == 1) {
        return {
          background: `url(${this.playbarImage}) no-repeat -33px -344px`,
        };
      } else if (this.isPlayState == 2) {
        return {
          background: `url(${this.playbarImage}) no-repeat -93px -344px`,
        };
      } else if (this.isPlayState == 3) {
        return {
          background: `url(${this.playbarImage}) no-repeat -93px -249px`,
        };
      }
    },
    // 播放音乐
    d_play_music() {
      if (this.x_playListIndex != "-1") {
        return this.x_songsList.find((item) => item.uid === this.x_playListIndex).data.music_url;
      } else {
        return "";
      }
    },
    // 播放音乐的信息
    d_play_music_info() {
      if (this.x_playListIndex != "-1") {
        return this.x_songsList.find((item) => item.uid === this.x_playListIndex);
      } else {
        return false;
      }
    },
    // 格式化当前时间
    formattedCurrentTime() {
      const minutes = Math.floor(this.currentTime / 60);
      const seconds = Math.floor(this.currentTime % 60);
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    },
  },
  methods: {
    ...mapMutations(["m_setIsPlaying", "m_setSongsList", "m_setIsPlayVolume"]),

    // 点击播放列表
    paly_list() {
      this.playDetailState = !this.playDetailState;
    },
    // 全局点击事件
    handleClickOutside(event) {
      if (this.$refs.music_content && !this.$refs.music_content.contains(event.target)) {
        this.isShowVolume = false;
      }
      if (this.$refs.play_detail && !this.$refs.play_detail.contains(event.target)) {
        this.playDetailState = false;
      }
    },
    // 监听空格播放状态
    // handleSpaceKey(event) {
    //   if (event.code === "Space") {
    //     this.paly_music();
    //   }
    // },
    // 更新当前播放时间
    updateCurrentTime() {
      this.durationTime = this.$refs.audioElement.duration;
      this.currentTime = this.$refs.audioElement.currentTime;
      this.$refs.progressing.style.width = `${(this.currentTime / this.durationTime) * 100}%`;
      if (this.currentTime >= this.durationTime) {
        this.m_setIsPlaying(false);
      }
    },
    // 点击播放状态 2s后隐藏
    change_play_state() {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }
      this.isPlayState = this.isPlayState == 3 ? 1 : this.isPlayState + 1; //1 2 3 随机切换
      this.$refs.play_state_info.style.display = "block";
      this.$refs.play_state_info.innerHTML = this.isPlayState == 1 ? "循环" : this.isPlayState == 2 ? "单曲循环" : "随机";

      this.hideTimeout = setTimeout(() => {
        this.$refs.play_state_info.style.display = "none";
      }, 2000);
    },
    //点击音乐图标
    show_music() {
      this.isShowVolume = !this.isShowVolume;
    },
    // 鼠标经过
    hover_unfold() {
      this.isMove = 1; //滑动出来
    },
    //点击关闭按钮
    close_play() {
      this.isMove = 2; //点击关闭按钮
    },
    // 播放音乐
    paly_music() {
      this.m_setIsPlaying(!this.x_isPlaying);
      if (this.x_isPlaying) {
        this.$refs.audioElement.play();
      } else {
        this.$refs.audioElement.pause();
      }
    },
    // 点击进度条获取进度条
    handleProgressBarClick(event) {
      const progressBar = this.$refs.progressBar;
      const rect = progressBar.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const percentage = (offsetX / rect.width) * 100;
      // 在这里处理点击事件，例如更新播放进度
      this.$refs.progressing.style.width = `${percentage}%`;

      // 切换播放状态
      this.m_setIsPlaying(true);

      const newTime = (percentage * this.durationTime) / 100;
      this.$refs.audioElement.currentTime = newTime;
      this.$refs.audioElement.play();
    },
  },
};
</script>
<style lang="less" scoped>
.animationYup {
  animation: fadeInUp 0.5s 0s ease both;
}
@keyframes fadeInUp {
  0% {
    transform: translateY(0px);
  }
  100% {
    transform: translateY(-55px);
  }
}
.animationYdown {
  animation: fadeInDown 0.5s 0s ease both;
}
@keyframes fadeInDown {
  0% {
    transform: translateY(-55px);
  }
  100% {
    transform: translateY(0px);
  }
}

.isLock {
  background: url(../assets/playbar.png) repeat-x 226px -401px !important; //开锁
}
.isPlayingClass {
  background: url("../assets/playbar.png") no-repeat -42px -166px !important; //暂停图标
}
.isPauseClass {
  background: url("../assets/playbar.png") no-repeat -42px -205px !important; //播放按钮图标
}

#C_Play {
  position: relative;
  .box {
    position: fixed;
    bottom: -55px;
    width: 100%;
    height: 55px;
    background-color: #85ffbd;
    box-sizing: border-box;
    z-index: 1;
    background: url(../assets/playbar.png) repeat-x 0 0;
    .content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 5px;
      width: 1000px;
      height: 100%;
      padding-top: 5px;
      margin: 0 auto;
      .btns {
        display: flex;
        align-items: center;
        div {
          width: 28px;
          height: 28px;
          margin-right: 8px;
          background: url("../assets/playbar.png") no-repeat -2px -130px;
          &:hover {
            background: url("../assets/playbar.png") no-repeat -32px -130px;
          }
          &:nth-child(2) {
            width: 36px;
            height: 36px;
            background-color: #85ffbd;
            background: url("../assets/playbar.png") no-repeat -2px -205px;
            &:hover {
              background: url("../assets/playbar.png") no-repeat -42px -205px;
            }
          }
          &:nth-child(3) {
            background: url("../assets/playbar.png") no-repeat -82px -131px;
            &:hover {
              background: url("../assets/playbar.png") no-repeat -112px -131px;
            }
          }
        }
      }
      .play_info {
        display: flex;
        align-items: center;
        .play_img {
          margin-right: 20px;
          img {
            width: 35px;
            height: 35px;
            border-radius: 5px;
          }
        }
        .play_name {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 35px;
          color: #fff;
          margin-right: 10px;
          .play_name_info {
            span {
              &:nth-child(1) {
                font-size: 12px;
                color: #e8e8e8;
                margin-right: 20px;
                cursor: pointer;
                &:hover {
                  text-decoration: underline;
                }
              }
              &:nth-child(2) {
                font-size: 12px;
                color: #9b9b9b;
              }
            }
          }
          .progress_bar {
            position: relative;
            width: 500px;
            height: 10px;
            background: url("../assets/statbar.png") no-repeat 0 0px;
            border-radius: 5px;
            .progressing {
              position: absolute;
              top: 0;
              left: 0px;
              width: 0%;
              height: 100%;
              background: url("../assets/statbar.png") no-repeat 0 -65px;
              border-radius: 5px;
              .progressing_icon {
                position: absolute;
                top: -6px;
                right: -15px;
                width: 20px;
                height: 20px;
                background: url("../assets/iconall.png") no-repeat 0 -280px;
                transform: translateX(-50%);
              }
            }
          }
        }
        .play_music_info {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 40px;
          margin-right: 20px;
          span {
            font-size: 12px;
            color: #bfb9b9;
            &:nth-child(2) {
              color: #797979;
            }
            &:nth-child(3) {
              color: #797979;
            }
          }
        }
      }
      .music_info {
        position: relative;
        width: 25px;
        height: 25px;
        margin-right: 20px;
        background: url("../assets/playbar.png") no-repeat -5px -248px;

        &:hover {
          background: url("../assets/playbar.png") no-repeat -34px -248px;
        }
        .music_content {
          position: absolute;
          display: flex;
          align-items: center;
          height: 100px;
          bottom: 35px;
          left: -6px;
          background-color: #303030;
          display: none;
          .ant-slider-vertical {
            height: 90%;
          }
        }
      }
      .music_info_mute {
        background: url("../assets/playbar.png") no-repeat -105px -68px;
        &:hover {
          background: url("../assets/playbar.png") no-repeat -128px -68px;
        }
      }
      .play_state {
        position: relative;
        width: 25px;
        height: 25px;
        margin-right: 20px;
        .play_state_info {
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 5px;
          font-size: 12px;
          position: absolute;
          width: 70px;
          height: 32px;
          text-align: center;
          line-height: 32px;
          background-color: #191919;
          color: #fff;
          bottom: 39px;
          right: -24px;
          display: none;
        }
      }
      .paly_list {
        position: relative;
        width: 60px;
        height: 21px;
        background: url("../assets/playbar.png") no-repeat -45px -71px;
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        user-select: none;
        &:hover {
          background: url("../assets/playbar.png") no-repeat -45px -101px;
        }
        span {
          color: #5d5d5d;
          font-size: 12px;
          margin-right: 20px;
        }
        .play_detail {
          position: absolute;
          bottom: 34px;
          width: 980px;
          height: 300px;
          background-color: #1c1c1c;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
          font-size: 12px;
          color: #e2e2e2;
        }
      }
    }
    .tag {
      position: absolute;
      top: -8px;
      right: 27px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: url(../assets/playbar.png) repeat 206px -401px; //闭锁
    }
    .tag_bg {
      position: absolute;
      top: -21px;
      right: 7px;
      width: 70px;
      height: 30px;
      background: url(/img/playbar.db568b1c.png) repeat-x 14px -373px;
      z-index: -1;
    }
  }
  .unfold {
    position: fixed;
    bottom: 0px;
    width: 100%;
    height: 5px;
    background: url(../assets/playbar.png) repeat-x 0 -3px;
    z-index: 0;
  }
}
</style>
