// ========== 数据定义 ==========
var musicList = ["music0.mp3", "music1.mp3", "music2.mp3", "music3.mp3"];
var songNames = ["洛春赋", "Yesterday", "江南烟雨色", "Vision pt.II"];
var authorNames = ["何嘉雄", "何嘉雄", "何嘉雄", "何嘉雄"];
var bgImages = ["bg0.png", "bg1.png", "bg2.png", "bg3.png"];
var recordImages = ["record0.jpg", "record1.jpg", "record2.jpg", "record3.jpg"];
var videoList = ["video0.mp4", "video1.mp4", "video2.mp4", "video3.mp4"];

// ========== 状态变量 ==========
var currentIndex = 0;          // 当前歌曲索引
var playMode = 1;              // 播放模式：1=顺序，2=单曲循环，3=随机
var isPlaying = false;         // 播放状态
var speedList = [1.0, 1.5, 2.0, 0.75];  // 倍速列表
var speedIndex = 0;            // 当前倍速索引
var isMuted = false;           // 静音状态
var isMvOpen = false;          // MV是否打开
var lastVolume = 70;           // 记录静音前的音量

// ========== DOM元素 ==========
var audioTag = document.getElementById("audioTag");
var playPauseBtn = document.getElementById("playPause");
var skipForwardBtn = document.getElementById("skipForward");
var skipBackwardBtn = document.getElementById("skipBackward");
var playModeBtn = document.getElementById("playMode");
var volumeBtn = document.getElementById("volume");
var volumeSlider = document.getElementById("volumn-togger");
var listBtn = document.getElementById("list");
var speedBtn = document.getElementById("speed");
var mvBtn = document.getElementById("MV");
var progressTotal = document.getElementById("progress-total");
var progressBar = document.getElementById("progress");
var playedTime = document.getElementById("playedTime");
var audioTime = document.getElementById("audioTime");
var musicTitle = document.getElementById("music-title");
var authorName = document.getElementById("author-name");
var recordImg = document.getElementById("record-img");
var musicListPanel = document.getElementById("music-list");
var closeListPanel = document.getElementById("close-list");
var body = document.getElementById("body");

// ========== 初始化 ==========
function init() {
  // 设置初始音频源
  audioTag.src = "./mp3/" + musicList[currentIndex];
  audioTag.volume = volumeSlider.value / 100;
  updateSongInfo();
  highlightActiveSong();
}

// 更新歌曲信息（标题、作者、背景、唱片）
function updateSongInfo() {
  musicTitle.textContent = songNames[currentIndex];
  authorName.textContent = authorNames[currentIndex];
  body.style.backgroundImage = 'url("./img/' + bgImages[currentIndex] + '")';
  recordImg.style.backgroundImage = 'url("./img/' + recordImages[currentIndex] + '")';
  highlightActiveSong();
}

// 高亮当前歌曲
function highlightActiveSong() {
  var allItems = document.querySelectorAll(".all-list div");
  for (var i = 0; i < allItems.length; i++) {
    allItems[i].classList.remove("active");
  }
  var currentItem = document.getElementById("music" + currentIndex);
  if (currentItem) {
    currentItem.classList.add("active");
  }
}

// ========== 音频播放时间换算 ==========
function transTime(value) {
  var time = "";
  var h = parseInt(value / 3600);
  value %= 3600;
  var m = parseInt(value / 60);
  var s = parseInt(value % 60);
  if (h > 0) {
    time = formatTime(h + ":" + m + ":" + s);
  } else {
    time = formatTime(m + ":" + s);
  }
  return time;
}

function formatTime(value) {
  var time = "";
  var s = value.split(":");
  var i = 0;
  for (; i < s.length - 1; i++) {
    time += s[i].length == 1 ? "0" + s[i] : s[i];
    time += ":";
  }
  time += s[i].length == 1 ? "0" + s[i] : s[i];
  return time;
}

// ========== 功能1：播放/暂停 ==========
function togglePlay() {
  if (isPlaying) {
    audioTag.pause();
  } else {
    audioTag.play();
  }
}

audioTag.addEventListener("play", function () {
  isPlaying = true;
  playPauseBtn.classList.add("icon-pause");
  recordImg.classList.add("rotate-play");
  recordImg.classList.remove("rotate-pause");
});

audioTag.addEventListener("pause", function () {
  isPlaying = false;
  playPauseBtn.classList.remove("icon-pause");
  recordImg.classList.add("rotate-pause");
});

playPauseBtn.addEventListener("click", togglePlay);

// ========== 功能2：进度条 ==========
audioTag.addEventListener("timeupdate", function () {
  if (audioTag.duration) {
    var percent = (audioTag.currentTime / audioTag.duration) * 100;
    progressBar.style.width = percent + "%";
    playedTime.textContent = transTime(audioTag.currentTime);
  }
});

audioTag.addEventListener("loadedmetadata", function () {
  audioTime.textContent = transTime(audioTag.duration);
});

// 点击进度条跳转
progressTotal.addEventListener("click", function (e) {
  var rect = progressTotal.getBoundingClientRect();
  var clickX = e.clientX - rect.left;
  var percent = clickX / rect.width;
  audioTag.currentTime = percent * audioTag.duration;
});

// ========== 功能3：播放列表与歌曲切换 ==========
function loadSong(index) {
  currentIndex = index;
  audioTag.src = "./mp3/" + musicList[currentIndex];
  audioTag.playbackRate = speedList[speedIndex];
  updateSongInfo();
  progressBar.style.width = "0%";
  playedTime.textContent = "00:00";
  if (isPlaying) {
    audioTag.play();
  }
}

// 上一首
function skipForward() {
  var newIndex;
  if (playMode === 3) {
    newIndex = getRandomIndex();
  } else {
    newIndex = (currentIndex - 1 + musicList.length) % musicList.length;
  }
  loadSong(newIndex);
}

// 下一首
function skipBackward() {
  var newIndex;
  if (playMode === 3) {
    newIndex = getRandomIndex();
  } else {
    newIndex = (currentIndex + 1) % musicList.length;
  }
  loadSong(newIndex);
}

function getRandomIndex() {
  var newIndex;
  do {
    newIndex = Math.floor(Math.random() * musicList.length);
  } while (newIndex === currentIndex && musicList.length > 1);
  return newIndex;
}

skipForwardBtn.addEventListener("click", skipForward);
skipBackwardBtn.addEventListener("click", skipBackward);

// 播放结束自动下一首
audioTag.addEventListener("ended", function () {
  if (playMode === 2) {
    // 单曲循环
    audioTag.currentTime = 0;
    audioTag.play();
  } else if (playMode === 3) {
    // 随机播放
    loadSong(getRandomIndex());
  } else {
    // 顺序播放
    var nextIndex = (currentIndex + 1) % musicList.length;
    loadSong(nextIndex);
  }
});

// ========== 播放模式切换 ==========
function switchPlayMode() {
  playMode++;
  if (playMode > 3) {
    playMode = 1;
  }
  playModeBtn.style.backgroundImage = 'url("./img/mode' + playMode + '.png")';
}

playModeBtn.addEventListener("click", switchPlayMode);

// ========== 功能4：MV功能 ==========
function toggleMV() {
  if (isMvOpen) {
    closeMV();
    return;
  }
  isMvOpen = true;

  // 暂停音乐
  audioTag.pause();

  // 创建MV遮罩
  var overlay = document.createElement("div");
  overlay.className = "mv-overlay";
  overlay.id = "mv-overlay";

  var video = document.createElement("video");
  video.id = "mv-video";
  video.src = "./mp4/" + videoList[currentIndex];
  video.controls = true;
  video.autoplay = true;
  overlay.appendChild(video);

  var closeBtn = document.createElement("button");
  closeBtn.className = "mv-close";
  closeBtn.textContent = "关闭MV";
  closeBtn.addEventListener("click", closeMV);
  overlay.appendChild(closeBtn);

  document.body.appendChild(overlay);
}

function closeMV() {
  var overlay = document.getElementById("mv-overlay");
  if (overlay) {
    var video = document.getElementById("mv-video");
    if (video) {
      video.pause();
    }
    document.body.removeChild(overlay);
  }
  isMvOpen = false;
  // 恢复音乐播放
  audioTag.play();
}

mvBtn.addEventListener("click", toggleMV);

// ========== 功能5：倍速切换 ==========
function switchSpeed() {
  speedIndex = (speedIndex + 1) % speedList.length;
  var speed = speedList[speedIndex];
  audioTag.playbackRate = speed;
  speedBtn.textContent = speed.toFixed(1) + "X";
}

speedBtn.addEventListener("click", switchSpeed);

// ========== 功能6：音量控制 ==========
volumeSlider.addEventListener("input", function () {
  var vol = volumeSlider.value;
  audioTag.volume = vol / 100;
  if (vol == 0) {
    volumeBtn.classList.add("volume-mute");
  } else {
    volumeBtn.classList.remove("volume-mute");
  }
  lastVolume = vol;
});

volumeBtn.addEventListener("click", function () {
  if (isMuted) {
    // 取消静音
    isMuted = false;
    audioTag.volume = lastVolume / 100;
    volumeSlider.value = lastVolume;
    volumeBtn.classList.remove("volume-mute");
  } else {
    // 静音
    isMuted = true;
    lastVolume = volumeSlider.value;
    audioTag.volume = 0;
    volumeSlider.value = 0;
    volumeBtn.classList.add("volume-mute");
  }
});

// ========== 列表面板 ==========
var listOpen = false;

function toggleList() {
  listOpen = !listOpen;
  if (listOpen) {
    musicListPanel.className = "music-list";
    closeListPanel.className = "close-list";
    musicListPanel.style.transform = "translateX(0)";
    closeListPanel.style.transform = "translateX(0)";
    closeListPanel.style.position = "fixed";
    closeListPanel.style.left = "0";
    closeListPanel.style.top = "0";
    closeListPanel.style.width = "calc(100vw - 300px)";
    closeListPanel.style.height = "100vh";
    closeListPanel.style.background = "rgba(0,0,0,0.3)";
    closeListPanel.style.zIndex = "199";
  } else {
    closeListPanel.style.background = "none";
    closeListPanel.style.width = "0";
    musicListPanel.style.transform = "translateX(100%)";
    closeListPanel.style.transform = "translateX(-100%)";
  }
}

listBtn.addEventListener("click", toggleList);

closeListPanel.addEventListener("click", function () {
  if (listOpen) {
    toggleList();
  }
});

// 点击列表中的歌曲
var allListItems = document.querySelectorAll(".all-list div");
for (var i = 0; i < allListItems.length; i++) {
  (function (index) {
    allListItems[index].addEventListener("click", function () {
      loadSong(index);
      audioTag.play();
    });
  })(i);
}

// ========== 键盘快捷键 ==========
document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  }
});

// ========== 启动 ==========
init();
