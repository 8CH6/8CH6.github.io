---
layout: home
author_profile: false
---

<div class="intro-container">
  <div class="intro-text">
    <h1>👋 Hi, I'm <span class="highlight">Yera</span></h1>
    <p class="tagline">Exploring <strong>AI · AR · Interactive Media</strong> to craft <em>immersive cultural experiences</em>.</p>
    <a href="/about/" class="btn-about">ABOUT ME</a>
  </div>
  <img src="https://cdn.jsdelivr.net/gh/8CH6/picgo/img/bio-photo.jpg" alt="Profile Photo" class="profile-photo">
</div>

<!-- ===== Featured Works Section ===== -->
<section class="works-section">
  <h2 class="works-title">Featured Works</h2>
  <div class="works-grid">
    <div class="work-item">
      <img src="https://cdn.jsdelivr.net/gh/8CH6/picgo/img/work1.png" alt="Work 1">
    </div>
    <div class="work-item">
      <img src="https://cdn.jsdelivr.net/gh/8CH6/picgo/img/work2.png" alt="Work 2">
    </div>
    <div class="work-item">
      <img src="https://cdn.jsdelivr.net/gh/8CH6/picgo/img/work3.png" alt="Work 3">
    </div>
  </div>
  <a href="/portfolio/" class="btn-more">SEE MORE</a>
</section>

<style>
/* ===== Background Animation ===== */
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

/* ===== Intro Section ===== */
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
.profile-photo {
  width: 28%;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
  opacity: 0;
  transform: scale(0.85);
  animation: zoomIn 1.2s ease forwards 0.6s;
}

/* ===== Buttons ===== */
.btn-about, .btn-more {
  display: inline-block;
  margin-top: 25px;
  padding: 12px 28px;
  font-size: 1em;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.btn-about {
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  color: #fff;
}
.btn-about:hover {
  background: linear-gradient(90deg, #00f2fe, #4facfe);
  transform: scale(1.05);
}
.btn-more {
  background: #333;
  color: #fff;
}
.btn-more:hover {
  background: #555;
  transform: scale(1.05);
}

/* ===== Works Section ===== */
.works-section {
  max-width: 1100px;
  margin: 80px auto;
  padding: 0 40px;
  text-align: center;
}
.works-title {
  font-size: 2.4em;
  margin-bottom: 40px;
  color: #111;
  font-weight: 700;
}
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}
.work-item img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.work-item img:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 30px rgba(0,0,0,0.25);
}

/* ===== Animations ===== */
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
@keyframes zoomIn { to { transform: scale(1); opacity: 1; } }

/* ===== Responsive ===== */
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
