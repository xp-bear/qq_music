<template>
  <div class="C_Play" ref="play_detail">
    <div class="box" :class="[{ animationYup: isMove == 1 }, { animationYdown: isMove == 2 }]">
      <!-- 右上角关闭角标 -->
      <span class="tag" @click="close_play" :class="[{ isLock: isMove == 2 }]"></span>
      <div class="tag_bg"></div>
      <!-- 内容主体 -->
      <div class="content">
        <!-- 按钮图标 -->
        <div class="btns">
          <div @click="previous_song"></div>
          <div title="ctrl+空格 播放" @click="paly_music" :class="x_isPlaying ? 'isPlayingClass' : 'isPauseClass'"></div>
          <div @click="next_song"></div>
        </div>
        <!-- 播放信息 -->
        <div class="play_info">
          <div class="play_img">
            <img :src="d_play_music_info ? d_play_music_info.data.cover : 'https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/default_album.jpg'" alt="" />
          </div>
          <div class="play_name">
            <div class="play_name_info">
              <span @click="paly_list" style="user-select: none">{{ d_play_music_info ? d_play_music_info.data.title : "" }}</span>
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
          <div class="play_state" @click="change_play_state" :class="d_change_state" :title="isPlayState == 1 ? '循环' : isPlayState == 2 ? '单曲循环' : '随机'">
            <div class="play_state_info" ref="play_state_info"></div>
          </div>
          <!-- 播放列表 右边 -->
          <div class="paly_list" @click="paly_list">
            <span class="paly_list_1">{{ x_songsList.length }}</span>
            <div class="play_detail" v-show="playDetailState" @click.stop>
              <div class="play_left">
                <div class="play_left_title">
                  <h4>播放列表({{ x_songsList.length }})</h4>
                  <div class="play_delete" @click="clear_play_list">
                    <span></span>
                    <span>清除</span>
                  </div>
                </div>
                <!-- 播放列表主体区域 -->
                <div class="play_list_content play_list_bar">
                  <div class="play_list_item" :class="item.data.link == x_playListIndex ? 'play_list_bg' : ''" v-for="(item, index) in x_songsList" :key="index" @click="changePlayInfo(item.uid)">
                    <div class="play_list_item_info">
                      <div class="py_title">
                        <div class="py_tit_info">
                          <span :style="item.data.link == x_playListIndex ? 'background: url(' + isCurPlayingImg + ') no-repeat -182px 0' : ''"></span>
                          <span class="py_tit_info_2">{{ item.data.title }}</span>
                        </div>
                        <!-- 操作按钮 -->
                        <div class="py_btns">
                          <span class="py_btns_1" title="下载" @click="download_play_info($event, item)" style="margin-right: 20px"> </span>
                          <span class="py_btns_1" title="删除" @click="delete_play_info($event, item.uid)"></span>
                        </div>
                      </div>
                      <div class="py_name">
                        <span class="py_name_1">{{ item.data.singer }}</span>
                        <span class="py_name_2">{{ item.duration }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="play_right">
                <!-- 歌曲标题 -->
                <div class="play_info_title">
                  <div class="play_info_title_1">
                    {{ d_play_music_info ? d_play_music_info.sign_name : "" }}
                    <span class="play_info_title_2" @click="toClosePlayList"> </span>
                  </div>
                </div>
                <!-- 歌词区域 -->
                <div class="play_info_lyric play_list_bar" ref="lyricsContainer">
                  <div class="play_info_lyric_content">
                    <div v-for="(line, index) in parsedLyrics" :key="index" :class="{ highlighted: currentLineIndex == index }" ref="lyricLines">{{ line.text }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="unfold" @mouseover="hover_unfold"></div>
    <!-- 播放音乐 -->
    <audio :src="d_play_music" :loop="isPlayState == 2 ? true : false" ref="audioElement"></audio>
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

      isCurPlayingImg: require("../assets/playlist.png"), //当前播放音乐图片

      lyrics: "", //歌词
      lrc_url: "", //歌词地址
    };
  },
  mounted() {
    // 每秒更新一次当前播放时间
    this.intervalId = setInterval(this.updateCurrentTime, 1000);
    // 监听空格键
    window.addEventListener("keyup", this.handleSpaceKey);

    // 获取本地数据保存到vux中
    this.m_setSongsList();

    // 全局点击事件
    document.addEventListener("click", this.handleClickOutside);

    //默认暂停播放
    this.m_setIsPlaying(false);

    // 初始的默认音量应该是50。
    this.$refs.audioElement.volume = this.playVolume / 100;
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.intervalId);
    // 移除事件监听
    window.removeEventListener("keyup", this.handleSpaceKey);

    // 移除全局点击事件
    document.removeEventListener("click", this.handleClickOutside);
  },
  watch: {
    playVolume(newVolume) {
      // 监听音量变化
      this.$refs.audioElement.volume = newVolume / 100;
    },
    // 监听歌词地址变化
    lrc_url(newUrl) {
      if (newUrl) {
        this.fetchLyrics();
      }
    },
  },
  computed: {
    ...mapState(["x_isLysicString", "x_playListIndex", "x_songsList", "x_isPlaying"]),

    // 解析歌词
    parsedLyrics() {
      // 假设歌词格式为 [时间] 歌词
      return this.lyrics.split("\n").map((line) => {
        const match = line.match(/\[(\d+):(\d+)\.(\d+)\](.*)/);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const milliseconds = parseInt(match[3], 10);
          const time = minutes * 60 + seconds + milliseconds / 1000; // 偏移一下歌词显示，因为不是当前音乐的接口。
          return { time, text: match[4] };
        }
        return { time: 9999, text: line };
      });
    },
    // 当前播放的歌词行索引
    currentLineIndex() {
      for (let i = this.parsedLyrics.length - 1; i >= 0; i--) {
        if (this.currentTime >= this.parsedLyrics[i].time) {
          return i;
        }
      }
      return 0;
    },

    // 播放状态切换
    d_change_state() {
      if (this.isPlayState == 1) {
        return "d_change_state_1";
      } else if (this.isPlayState == 2) {
        return "d_change_state_2";
      } else if (this.isPlayState == 3) {
        return "d_change_state_3";
      }
    },
    // 播放音乐
    d_play_music() {
      if (this.x_playListIndex != "-1") {
        return this.x_songsList.find((item) => item.uid === this.x_playListIndex)?.data.music_url;
      } else {
        return ""; //如果没有数据则返回空字符串
      }
    },
    // 播放音乐的信息
    d_play_music_info() {
      if (this.x_playListIndex != "-1") {
        return this.x_songsList.find((item) => item.uid === this.x_playListIndex);
      } else {
        return false; //如果没有数据 反回false
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
    ...mapMutations(["m_clearSongsList", "m_setIsPlaying", "m_setSongsList", "m_setIsPlayVolume", "m_setPlayListIndex", "m_setSongsListLocal"]),

    // 关闭播放列表
    toClosePlayList() {
      this.playDetailState = false;
    },

    // 清除播放列表
    clear_play_list() {
      this.m_clearSongsList(); //清除播放列表
      this.lyrics = "[00:00.00] "; //初始化歌词
    },

    // 下载音乐
    download_play_info(event, item) {
      event.stopPropagation(); //阻止事件冒泡
      // 创建一个隐藏的链接元素
      const link = document.createElement("a");
      link.target = "_blank";
      link.href = item.data.music_url; // 歌曲的下载链接
      link.download = item.singer + "-" + item.title + ".mp3"; // 下载的文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // 删除播放列表
    delete_play_info(event, uid) {
      event.stopPropagation(); //阻止事件冒泡

      const index = this.x_songsList.findIndex((item) => item.uid == uid);
      // 如果找到了对应的对象，则使用splice方法删除它
      if (index !== -1) {
        // 删除选中歌曲
        if (uid == this.x_playListIndex) {
          this.x_songsList.splice(index, 1); //删除当前歌曲
          // 如果删除的最后一首歌曲,则赋值前一首歌曲
          if (index == this.x_songsList.length) {
            this.m_setPlayListIndex(this.x_songsList[index - 1].uid);
          } else {
            this.m_setPlayListIndex(this.x_songsList[index].uid); //删除后播放下一首
          }

          // 请求歌词
          let sign_name = this.x_songsList.find((item) => item.uid === this.x_playListIndex).sign_name;
          sign_name = sign_name.split("(")[0];
          this.lrc_url = `https://api.cenguigui.cn/api/douyin/music/?msg=${sign_name}&page=1&limit=1&type=json&n=1`;
        } else {
          this.x_songsList.splice(index, 1); //删除当前歌曲
        }
      }

      // 保存到本地
      this.m_setSongsListLocal();
    },
    // 请求歌词
    async fetchLyrics() {
      try {
        const response = await this.$axios.get(this.lrc_url);
        this.lyrics = response.data.data.lrc;
      } catch (error) {
        console.error("Error fetching lyrics:", error);
      }
    },

    // 点击播放列表
    async changePlayInfo(uid) {
      this.m_setPlayListIndex(uid);
      this.m_setIsPlaying(true);
      // 请求歌词
      let sign_name = this.x_songsList.find((item) => item.uid === uid).sign_name;
      sign_name = sign_name.split("(")[0];
      this.lrc_url = `https://api.cenguigui.cn/api/douyin/music/?msg=${sign_name}&page=1&limit=1&type=json&n=1`;
    },
    // 点击播放列表 右下角的播放列表。
    paly_list() {
      this.playDetailState = !this.playDetailState;
      if (this.playDetailState) {
        // 判断一下能不能正常找到。如果找不到，就不请求了
        if (this.x_playListIndex == "-1" || localStorage.getItem("l_playListIndex") == null) {
          console.log("没有找到当前播放的歌曲");
          return;
        }
        // 请求歌词
        let sign_name = this.x_songsList.find((item) => item.uid === this.x_playListIndex).sign_name;
        sign_name = sign_name.split("(")[0];
        this.lrc_url = `https://api.cenguigui.cn/api/douyin/music/?msg=${sign_name}&page=1&limit=1&type=json&n=1`;
      }
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
    handleSpaceKey(event) {
      // 播放音乐 ctrl + 空格
      if (event.code === "Space" && event.ctrlKey) {
        this.paly_music();
      }
      // 上一首歌曲 ctrl + 方向左
      if (event.code === "ArrowLeft" && event.ctrlKey) {
        this.previous_song();
      }
      // 下一首歌曲 ctrl + 方向右
      if (event.code === "ArrowRight" && event.ctrlKey) {
        this.next_song();
      }
    },

    // 滚动到当前行
    scrollToCurrentLine() {
      const container = this.$refs.lyricsContainer;
      const lines = this.$refs.lyricLines;

      const currentLine = lines[this.currentLineIndex];

      if (currentLine) {
        const containerHeight = container.clientHeight;
        const lineHeight = currentLine.clientHeight;
        const scrollTop = currentLine.offsetTop - containerHeight / 2 + lineHeight / 2;

        // 添加平滑滚动效果
        container.style.scrollBehavior = "smooth";
        container.scrollTop = scrollTop;

        // 移除平滑滚动效果，以便下次立即生效
        setTimeout(() => {
          container.style.scrollBehavior = "auto";
        }, 500); // 动画持续时间
      }
    },

    // 更新当前播放时间
    updateCurrentTime() {
      this.durationTime = this.$refs.audioElement.duration;
      this.currentTime = this.$refs.audioElement.currentTime;
      // 滚动到当前行
      this.scrollToCurrentLine();

      this.$refs.progressing.style.width = `${(this.currentTime / this.durationTime) * 100}%`;
      if (this.currentTime >= this.durationTime) {
        this.m_setIsPlaying(false);
      }
      // 判断是否为顺序播放,且播放完毕,自动切换到下一首
      if (this.isPlayState == 1 && this.currentTime >= this.durationTime) {
        // 找到当前歌曲的索引
        // 使用findIndex方法找到具有指定uid的对象的索引
        let curPlayIndex = this.x_songsList.findIndex((item) => item.uid === this.x_playListIndex);
        // 判断到了最后一首歌曲
        if (curPlayIndex === this.x_songsList.length - 1) {
          return this.$message.info("当前已经是最后一首歌曲", 1);
        }
        this.m_setPlayListIndex(this.x_songsList[curPlayIndex + 1].uid);
        this.m_setIsPlaying(true);
      } else if (this.isPlayState == 3 && this.currentTime >= this.durationTime) {
        // 随机播放
        let randomIndex = Math.floor(Math.random() * this.x_songsList.length);
        this.m_setPlayListIndex(this.x_songsList[randomIndex].uid);
        this.m_setIsPlaying(true);
      }

      // 切换播放状态
      if (this.x_isPlaying) {
        this.$refs.audioElement.play();
      } else {
        this.$refs.audioElement.pause();
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
    // 上一首歌曲
    previous_song() {
      // 找到当前歌曲的索引
      // 使用findIndex方法找到具有指定uid的对象的索引
      let curPlayIndex = this.x_songsList.findIndex((item) => item.uid === this.x_playListIndex);
      // 判断到了最后一首歌曲
      if (curPlayIndex === 0) {
        return this.$message.info("当前已经是第一首歌曲", 1);
      }
      this.m_setPlayListIndex(this.x_songsList[curPlayIndex - 1].uid);
      this.m_setIsPlaying(true);

      // 请求歌词
      let sign_name = this.x_songsList.find((item) => item.uid === this.x_playListIndex).sign_name;
      sign_name = sign_name.split("(")[0];
      this.lrc_url = `https://api.cenguigui.cn/api/douyin/music/?msg=${sign_name}&page=1&limit=1&type=json&n=1`;
    },
    // 下一首歌曲
    next_song() {
      // 找到当前歌曲的索引
      // 使用findIndex方法找到具有指定uid的对象的索引
      let curPlayIndex = this.x_songsList.findIndex((item) => item.uid === this.x_playListIndex);
      // 判断到了最后一首歌曲
      if (curPlayIndex === this.x_songsList.length - 1) {
        return this.$message.info("当前已经是最后一首歌曲", 1);
      }
      this.m_setPlayListIndex(this.x_songsList[curPlayIndex + 1].uid);
      this.m_setIsPlaying(true);

      // 请求歌词
      let sign_name = this.x_songsList.find((item) => item.uid === this.x_playListIndex).sign_name;
      sign_name = sign_name.split("(")[0];
      this.lrc_url = `https://api.cenguigui.cn/api/douyin/music/?msg=${sign_name}&page=1&limit=1&type=json&n=1`;
    },
    // 播放音乐
    paly_music() {
      // 判断有没有歌曲
      if (this.x_playListIndex == "-1" || localStorage.getItem("l_playListIndex") == null) {
        return this.$message.info("当前没有歌曲", 1);
      }
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

      // 判断有没有歌曲
      if (this.x_playListIndex == "-1" || localStorage.getItem("l_playListIndex") == null) {
        return this.$message.info("当前没有歌曲", 1);
      }
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
.d_change_state_1 {
  background: url(../assets/playbar.png) no-repeat -6px -344px !important;
  &:hover {
    background: url(../assets/playbar.png) no-repeat -36px -344px !important;
  }
}
.d_change_state_2 {
  background: url(../assets/playbar.png) no-repeat -69px -344px !important;
  &:hover {
    background: url(../assets/playbar.png) no-repeat -96px -344px !important;
  }
}
.d_change_state_3 {
  background: url(../assets/playbar.png) no-repeat -69px -249px !important;
  &:hover {
    background: url(../assets/playbar.png) no-repeat -96px -249px !important;
  }
}
.highlighted {
  color: red;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.3s;
}
.play_list_bg {
  background-color: #0d0d0d;
}
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
  background: url("../assets/playbar.png") no-repeat -2px -166px !important; //暂停
  &:hover {
    background: url("../assets/playbar.png") no-repeat -42px -166px !important; //暂停图标
  }
}
.isPauseClass {
  background: url("../assets/playbar.png") no-repeat -2px -205px !important; //播放按钮
  &:hover {
    background: url("../assets/playbar.png") no-repeat -42px -205px !important; //播放按钮图标
  }
}

.C_Play {
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
          z-index: 3;
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
        .paly_list_1 {
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
          display: flex;
          .play_left {
            flex: 1;
            height: 100%;
            background-color: #161616;
            .play_left_title {
              display: flex;
              justify-content: space-between;
              align-items: center;
              height: 40px;
              padding: 0 20px;
              background: url("../assets/playlist_bg.png") no-repeat;
              h4 {
                font-size: 14px;
                color: #e2e2e2;
                font-weight: 700;
                margin: 0;
              }
              .play_delete {
                display: flex;
                align-items: center;
                &:hover {
                  span {
                    &:nth-child(1) {
                      background: url("../assets/playlist.png") no-repeat -51px -17px;
                    }
                    &:nth-child(2) {
                      text-decoration: underline;
                      color: #e2e2e2;
                    }
                  }
                }
                span {
                  margin: 0;
                  cursor: pointer;
                  &:nth-child(1) {
                    display: inline-block;
                    width: 18px;
                    height: 20px;
                    background: url("../assets/playlist.png") no-repeat -51px 3px;
                  }
                  &:nth-child(2) {
                    color: #cccccc;
                  }
                }
              }
            }
            .play_list_content {
              height: 260px;
              overflow: auto;
              .play_list_item {
                padding: 0 20px;
                height: 30px;
                display: flex;
                align-items: center;
                color: #cccccc;
                &:hover {
                  color: #ffffff;
                  .py_name_1,
                  .py_name_2 {
                    color: #ffffff !important;
                  }
                  background-color: #0d0d0d;
                }
                .play_list_item_info {
                  width: 100%;
                  display: flex;
                  justify-content: space-between;
                  .py_title {
                    width: 350px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    .py_tit_info {
                      display: flex;
                      align-items: center;
                      span {
                        margin: 0;
                        &:nth-child(1) {
                          width: 15px;
                          height: 13px;
                          margin-right: 5px;
                        }
                        .py_tit_info_2 {
                          width: 220px;
                          color: #bcbcbc;
                          white-space: nowrap;
                          text-overflow: ellipsis;
                          overflow: hidden;
                          word-break: break-all;
                        }
                      }
                    }
                    .py_btns {
                      display: flex;
                      .py_btns_1 {
                        width: 15px;
                        height: 15px;
                        background-color: #fff;
                        &:nth-child(1) {
                          background: url("../assets/playlist.png") no-repeat -57px -50px;
                          &:hover {
                            background: url("../assets/playlist.png") no-repeat -80px -50px;
                          }
                        }
                        &:nth-child(2) {
                          background: url("../assets/playlist.png") no-repeat -51px 0;
                          &:hover {
                            background: url("../assets/playlist.png") no-repeat -51px -20px;
                          }
                        }
                      }
                    }
                  }
                  .py_name {
                    display: flex;
                    justify-content: space-between;
                    width: 125px;
                    .py_name_1 {
                      width: 80px;
                      white-space: nowrap;
                      text-overflow: ellipsis;
                      overflow: hidden;
                      word-break: break-all;
                      color: #9b9b9b;
                    }
                    .py_name_2 {
                      width: 30%;
                      text-align: right;
                      color: #5e5e5e;
                    }
                  }
                }
              }
            }
          }
          .play_right {
            width: 430px;
            height: 100%;
            background-color: #191919;
            cursor: pointer;
            .play_info_title {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              height: 40px;
              padding: 0 20px;
              background: url("../assets/playlist_bg.png") no-repeat;
              .play_info_title_1 {
                position: relative;
                font-size: 14px;
                color: #fff;
                font-size: 14px;
                margin: 0;
                flex: 1;
                text-align: center;
              }
              .play_info_title_2 {
                position: absolute;
                right: 0;
                width: 18px;
                height: 20px;
                background: url("../assets/playlist.png") no-repeat -200px 5px;
                &:hover {
                  background: url("../assets/playlist.png") no-repeat -200px -25px;
                }
              }
            }
            .play_info_lyric {
              height: 260px;
              overflow: auto;
              color: #8c8c8c;
              font-size: 12px;
              .play_info_lyric_content {
                height: 260px;
                height: 32px;
                line-height: 32px;
                padding: 0 20px;
                text-align: center;
                transition: scroll-behavior 0.5s ease; /* 添加过渡效果 */
              }
            }
          }
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
