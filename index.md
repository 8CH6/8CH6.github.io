---
layout: home
author_profile: false
---

<div class="intro-container">
  <div class="intro-text">
    <h1>👋 Hi, I'm <span class="highlight">Yera</span></h1>
    <p class="tagline">Exploring <strong>AI · AR · Interactive Media</strong> to craft <em>immersive cultural experiences</em>.</p>
    <a href="/about/" class="about-btn">ABOUT ME</a>
  </div>
  <img src="https://cdn.jsdelivr.net/gh/8CH6/picgo/img/bio-photo.jpg" alt="Profile Photo" class="profile-photo">
</div>

<!-- ===== 作品展示区域 ===== -->
<section class="works-section">
  <h2 class="works-title">精选作品</h2>
  <div class="works-grid">
    <div class="work-card">
      <img src="https://cdn.jsdelivr.net/gh/8CH6/picgo/img/work1.png" alt="Work 1" class="work-img">
      <p>Work 1</p>
    </div>
    <div class="work-card">
      <img src="https://cdn.jsdelivr.net/gh/8CH6/picgo/img/work2.png" alt="Work 2" class="work-img">
      <p>Work 2</p>
    </div>
    <div class="work-card">
      <img src="https://cdn.jsdelivr.net/gh/8CH6/picgo/img/work3.png" alt="Work 3" class="work-img">
      <p>Work 3</p>
    </div>
  </div>
</section>

<style>
/* ===== 背景动画 ===== */
body {
  margin: 0;
  background: linear-gradient(-45deg, #e0f7fa, #e1bee7, #bbdefb, #c8e6c9);
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* ===== 主容器 ===== */
.intro-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
  margin: 100px auto;
  max-width: 1100px;
  padding: 0 50px;
  background: rgba(255,255,255,0.85);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  backdrop-filter: blur(10px);
}

/* ===== 左侧文字 ===== */
.intro-text { flex: 1; }
.intro-text h1 {
  font-size: 3.5em;
  font-weight: 800;
  margin-bottom: 25px;
  line-height: 1.2;
  color: #111;
}
.intro-text .highlight {
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.intro-text .tagline {
  font-size: 1.6em;
  line-height: 1.6;
  color: #333;
  max-width: 90%;
  animation: fadeInUp 1.2s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}
.about-btn {
  display: inline-block;
  margin-top: 25px;
  padding: 12px 30px;
  font-size: 1.1em;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  border-radius: 30px;
  text-decoration: none;
  transition: all 0.3s ease;
}
.about-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

/* ===== 右侧图片 ===== */
.profile-photo {
  width: 28%;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
  opacity: 0;
  transform: scale(0.85);
  animation: zoomIn 1.2s ease forwards 0.6s;
}

/* ===== 动画 ===== */
@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}
@keyframes zoomIn {
  to { transform: scale(1); opacity: 1; }
}

/* ===== 作品展示 ===== */
.works-section {
  margin: 100px auto;
  max-width: 1100px;
  text-align: center;
  padding: 0 20px;
}
.works-title {
  font-size: 2.2em;
  font-weight: 700;
  margin-bottom: 50px;
  color: #222;
}
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}
.work-card {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.work-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}
.work-img {
  width: 100%;
  height: 220px;         /* 统一高度 */
  object-fit: cover;     /* 保持比例，裁剪溢出部分 */
  border-radius: 12px;
  margin-bottom: 15px;
}
.work-card p {
  font-size: 1.1em;
  color: #444;
  margin: 0;
}

/* ===== 手机端优化 ===== */
@media (max-width: 768px) {
  .intro-container {
    flex-direction: column;
    text-align: center;
    margin: 50px auto;
    padding: 30px 20px;
  }
  .intro-text h1 { font-size: 2.5em; }
  .intro-text .tagline { font-size: 1.3em; max-width: 100%; }
  .profile-photo { width: 75%; margin-top: 30px; }
}
</style>
