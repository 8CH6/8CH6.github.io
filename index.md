---
layout: none
permalink: /
---

<div style="display: flex; align-items: center; justify-content: space-between; height: 100vh; padding: 0 5%;">

  <!-- 左侧文字 -->
  <div style="flex: 3; font-family: Arial, sans-serif; animation: fadeInUp 1.2s ease;">
    <h1 style="font-size: 2.5em; font-weight: 700;">I'm <span style="color:#000;">Yera</span></h1>
    <p style="font-size: 1.2em; line-height: 1.6; color:#333;">
      A <b class="highlight">Design & Technology Undergraduate</b>, <br>
      an <b class="highlight">AI · AR · Interactive Media Explorer</b>, <br>
      and a <b class="highlight">Cultural Technology Innovator</b>.
    </p>
  </div>

  <!-- 右侧照片 -->
  <div style="flex: 1; text-align: center; animation: fadeIn 1.5s ease;">
    <img src="https://cdn.jsdelivr.net/gh/8CH6/picgo/img/bio-photo.jpg" alt="Yera" class="photo">
  </div>

</div>

<style>
/* 淡入向上浮动 */
@keyframes fadeInUp {
  from {opacity:0; transform: translateY(30px);}
  to {opacity:1; transform: translateY(0);}
}
@keyframes fadeIn {
  from {opacity:0;}
  to {opacity:1;}
}

/* 照片悬停放大 */
.photo {
  width: 100%;
  max-width: 280px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.4s ease;
}
.photo:hover {
  transform: scale(1.05);
}

/* 关键词高亮动画 */
.highlight {
  background: linear-gradient(90deg, #ff7eb3, #65c7f7, #ff7eb3);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 6s ease infinite;
}
@keyframes shine {
  0% {background-position: 0% 50%;}
  50% {background-position: 100% 50%;}
  100% {background-position: 0% 50%;}
}
</style>
