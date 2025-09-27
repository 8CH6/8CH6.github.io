---
layout: home
author_profile: false
---

<!-- 主页开场动画文字 -->
<div class="intro-container">
  <h1 class="fade-in-text">🎨 Exploring AI · AR · Interactive Media to craft immersive cultural experiences.</h1>
  <img src="https://cdn.jsdelivr.net/gh/8CH6/picgo/img/bio-photo.jpg" alt="Profile Photo" class="profile-photo">
</div>

<style>
/* 布局：左文字右图片 */
.intro-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  margin-top: 50px;
}

/* 左侧文字动画 */
.fade-in-text {
  font-size: 1.8em;
  font-weight: bold;
  line-height: 1.5;
  max-width: 65%;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 1.5s ease-out forwards;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 右侧图片 */
.profile-photo {
  width: 25%;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  transform: scale(0.9);
  opacity: 0;
  animation: zoomIn 1.2s ease forwards 0.5s;
}

@keyframes zoomIn {
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 手机端优化 */
@media (max-width: 768px) {
  .intro-container {
    flex-direction: column;
    text-align: center;
  }
  .fade-in-text {
    max-width: 100%;
  }
  .profile-photo {
    width: 60%;
  }
}
</style>
