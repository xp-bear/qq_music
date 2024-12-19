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
          <div @click="paly_music" :class="isPlaying ? 'isPlayingClass' : 'isPauseClass'"></div>
          <div></div>
        </div>
        <!-- 播放信息 -->
        <div class="play_info"></div>
      </div>
    </div>
    <div class="unfold" @mouseover="hover_unfold"></div>
  </div>
</template>

<script>
import { animateJsMove } from "../tools/index";
export default {
  name: "C_Play",
  data() {
    return {
      isMove: 1, //0默认条件 1出来 2回去
      isPlaying: false, //是否播放
    };
  },
  mounted() {},
  methods: {
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
      this.isPlaying = !this.isPlaying;
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
      margin-top: 5px;
      overflow: hidden;
      width: 1200px;
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
