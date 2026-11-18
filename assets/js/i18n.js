(function () {
  const STORAGE_KEY = 'site_lang';
  const origTextMap = new WeakMap();
  const origAttrMap = new WeakMap();
  let isApplying = false;

  function resolveInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('lang') || '').trim();
    if (q === 'zh-CN' || q === 'sc') return 'zh-CN';
    if (q === 'zh-HK' || q === 'zh-TW' || q === 'tc') return 'zh-HK';
    if (q === 'en') return 'en';
    return localStorage.getItem(STORAGE_KEY) || 'en';
  }

  let currentLang = resolveInitialLang();

  // 简体中文 -> 香港繁体专属术语润色
  const HK_OVERRIDES = [
    ['简体中文', '簡體中文'],
    ['繁体中文', '繁體中文'],
    ['软件', '軟件'],
    ['信息', '資訊'],
    ['视频', '影片'],
    ['点赞', '讚好'],
    ['社交媒体', '社交媒體'],
    ['香港教育大学', '香港教育大學'],
    ['计算机辅助设计', '電腦輔助設計'],
    ['数字图像设计', '數碼圖像設計'],
    ['数字叙事', '數碼敘事'],
    ['数字艺术', '數碼藝術'],
    ['数字视觉', '數碼視覺'],
    ['小红书', '小紅書'],
    ['抖音', '抖音'],
    ['微信', '微信'],
    ['打印', '列印'],
    ['屏幕', '螢幕'],
    ['交互', '互動']
  ];

  // 简易兜底繁简映射（防 CDN 加载延迟）
  const FALLBACK_S2T = {
    '简':'簡','繁':'繁','首':'首','页':'頁','关':'關','于':'於','作':'作','品':'品','集':'集',
    '个':'個','人':'人','历':'歷','联':'聯','系':'繫','方':'方','式':'式','你':'你',
    '好':'好','我':'我','是':'是','探':'探','索':'索','交':'交','互':'互','媒':'媒','体':'體',
    '打':'打','造':'造','沉':'沉','浸':'浸','文':'文','化':'化','与':'與','叙':'敘','事':'事',
    '验':'驗','精':'精','选':'選','查':'查','看':'看','更':'更','多':'多','全':'全',
    '部':'部','返':'返','回':'回','列':'列','表':'表','下':'下','载':'載','教':'教','育':'育',
    '背':'背','景':'景','学':'學','硕':'碩','士':'士','在':'在','读':'讀','香':'香','港':'港',
    '大':'大','埔':'埔','中':'中','国':'國','浙':'浙','江':'江','宁':'寧','波':'波','嘉':'嘉',
    '兴':'興','实':'實','习':'習','经':'經','科':'科','研':'研','项':'項','目':'目',
    '荣':'榮','誉':'譽','奖':'獎','技':'技','能':'能','趣':'趣','语':'語',
    '言':'言','专':'專','业':'業','综':'綜','合':'合','力':'力','发':'發','表':'表',
    '常':'常','用':'用','工':'工','具':'具','电':'電','话':'話','邮':'郵','箱':'箱','坐':'坐',
    '标':'標','导':'導','演':'演','主':'主','创':'創','年':'年','份':'份','角':'角','色':'色',
    '赞':'讚','决':'決','定':'定','村':'村','姑':'姑','王':'王','妃':'妃','击':'擊',
    '者':'者','外':'外','佣':'傭','生':'生','病':'病','谁':'誰','来':'來','负':'負','责':'責',
    '摄':'攝','影':'影','设':'設','计':'計','师':'師','绘':'繪','画':'畫','建':'建','模':'模'
  };

  let openccConverter = null;
  function getHKConverter() {
    if (!openccConverter && window.OpenCC && typeof window.OpenCC.Converter === 'function') {
      try {
        openccConverter = window.OpenCC.Converter({ from: 'cn', to: 'hk' });
      } catch (e) {
        openccConverter = null;
      }
    }
    return openccConverter;
  }

  function toHK(cnText) {
    if (!cnText) return cnText;
    let out = cnText;
    const conv = getHKConverter();
    if (conv) {
      out = conv(out);
    } else {
      out = out.split('').map(ch => FALLBACK_S2T[ch] || ch).join('');
    }
    for (const [sc, tc] of HK_OVERRIDES) {
      if (out.includes(sc)) {
        out = out.split(sc).join(tc);
      }
    }
    return out;
  }

  // 全站 100% 页面英文 -> 简体中文词典
  const EXACT_DICT = {
    // 导航与通用
    // 补全首页、About、Contact 与 CV 按钮词条
    'Download my CV (PDF)': '下载个人简历 (PDF)',
    'AI · AR · Interactive Media': 'AI · AR · 交互媒体',
    '🎨 An MA student in New Media & Social Media at EdUHK, exploring AI · AR · Interactive Media.': '🎨 香港教育大学新媒体与社交媒体文学硕士在读，探索 AI · AR · 交互媒体。',
    'to create sustainable cultural and commercial value — and grow into a leader in the': '创造可持续的文化与商业价值，成长为',
    'cultural technology landscape': '文化科技领域的领军者',
    '🇨🇳 Mandarin (Native)': '🇨🇳 普通话（母语）',
    '🇬🇧 English (Fluent — IELTS 7.0, CET-6)': '🇬🇧 英语（流利 — 雅思 7.0，大学英语六级）',
    '· Ningbo Hape Toys Co., Ltd.': '· 宁波怡人玩具有限公司',
    'Mar 2026 – May 2026': '2026年3月 – 2026年5月',
    'Oct 2025 – Jan 2026': '2025年10月 – 2026年1月',
    'Apr 2025 – Jun 2025': '2025年4月 – 2025年6月',
    '· Zhejiang Mid-Vision Co., Ltd.': '· 浙江中视公司',
    'Sep 2024 – Jan 2025': '2024年9月 – 2025年1月',
    'M.A. in New Media and Social Media': '新媒体与社交媒体文学硕士',
    'Sep 2026 – Jun 2027': '2026年9月 – 2027年6月',
    'B.A. in Art and Technology': '艺术与科技文学学士',
    'Sino-German School of Design and Communication, Zhejiang Wanli University': '浙江万里学院 · 中德设计与传播学院',
    'Sep 2022 – Jun 2026': '2022年9月 – 2026年6月',
    'GPA: 3.98 / 5.00 (Rank: 1 / 27)': 'GPA：3.98 / 5.00（专业排名：1 / 27）',
    '🏆 2025: National': '🏆 2025：全国大学生英语竞赛国家级',
    'Second Prize': '二等奖',
    ', National College Student English Competition': '（全国大学生英语竞赛）',
    '🏆 2025: Zhejiang Provincial': '🏆 2025：浙江省未来设计师大赛省级',
    ', Zhejiang Future Designer Competition': '（浙江省未来设计师大赛）',
    '🎖 2022–2024: Zhejiang Provincial Government Scholarship': '🎖 2022–2024：浙江省政府奖学金',
    '🥇 2022–2024: First-Class Academic Scholarship, Zhejiang Wanli University': '🥇 2022–2024：浙江万里学院一等学业奖学金',
    '🌟 2022–2024: Outstanding Student Cadre / Merit Student, Zhejiang Wanli University': '🌟 2022–2024：浙江万里学院优秀学生干部 / 三好学生',
    'Jul 2023 – Nov 2024': '2023年7月 – 2024年11月',
    '· National Innovation & Entrepreneurship Program (No. 654112300195) –': '· 国家级大学生创新创业训练计划项目（编号：654112300195）——',
    'Living Conditions and Service Needs of Solitary Women in Ningbo: Policy-Oriented Research': '《宁波市独居女性生存现状与服务需求：政策导向研究》',
    '; Project Team Leader (5 members); led mixed-methods study informing social policy; research paper scheduled for publication in': '；项目负责人（5人团队）；主导混合研究方法调研以支持社会政策制定；研究论文刊登于',
    '(April 2025 issue, p. 129, CN22-1282/I, ISSN 1009-5489); National-Level Award Winner.': '（2025年4月刊，第129页，CN22-1282/I，ISSN 1009-5489）；获国家级奖项。',
    'Adobe Lightroom – Photo Editing': 'Adobe Lightroom – 摄影后期与调色',
    'Adobe Illustrator – Vector Graphics': 'Adobe Illustrator – 矢量图形设计',
    'Motion Graphics & VFX': '动态图形与视觉特效',
    'Interactive Media': '交互媒体艺术',
    '3D Motion Design': '三维动态视觉设计',
    '3D CAD Design': '三维 CAD 工业建模',
    'Game & Interactive Development': '游戏与交互开发',
    'Physical Computing': '物理计算与硬件交互',
    '3D Avatar Creation': '三维虚拟形象建模',
    'Image Editing': '图像合成与精修',
    'UI/UX Design': 'UI/UX 界面与交互设计',
    'Creative Coding': '创意编程视觉',
    'For inquiries, collaborations, and comments,': '如有任何咨询、合作或交流建议，',
    'please feel free to contact me via the channels below:': '欢迎通过以下方式随时与我联系：',
    'Location:': '现居坐标：',
    'Telephone:': '联系电话：',
    'E-mail:': '电子邮箱：',
    'Portfolio Website:': '个人作品集：',
    'Core Coursework: Applied Communication Research, New Media Education, Psychological Aspects of New Media and AI, New Media Law, Ethics and Regulation, Multimedia Production, New Media, Algorithms and AI': '核心课程：应用传播研究、新媒体教育、新媒体与人工智能心理学、新媒体法律、伦理与监管、多媒体制作、新媒体、算法与人工智能',
    'Core Coursework:': '核心课程：',
    'Core Coursework': '核心课程',
    ': Applied Communication Research, New Media Education, Psychological Aspects of New Media and AI, New Media Law, Ethics and Regulation, Multimedia Production, New Media, Algorithms and AI': '：应用传播研究、新媒体教育、新媒体与人工智能心理学、新媒体法律、伦理与监管、多媒体制作、新媒体、算法与人工智能',
    'Applied Communication Research, New Media Education, Psychological Aspects of New Media and AI, New Media Law, Ethics and Regulation, Multimedia Production, New Media, Algorithms and AI': '应用传播研究、新媒体教育、新媒体与人工智能心理学、新媒体法律、伦理与监管、多媒体制作、新媒体、算法与人工智能',
    'Home': '首页',
    'About': '关于我',
    'Portfolio': '作品集',
    'CV': '个人简历',
    'Contact': '联系方式',
    'Follow': '关注',
    'Email': '电子邮件',
    'WORKS': '全部作品',
    'Back to top': '回到顶部',
    'Sorry, but the page you were trying to view does not exist.': '抱歉，您访问的页面不存在。',

    // 全部 13 个作品分类标题
    'After Effects Works': 'After Effects 作品',
    'Arduino Works': 'Arduino 作品',
    'Cinema 4D Works': 'Cinema 4D 作品',
    'Figma Works': 'Figma 作品',
    'Illustrator Works': 'Illustrator 作品',
    'Lightroom Works': 'Lightroom 摄影作品',
    'Photoshop Works': 'Photoshop 作品',
    'Processing Works': 'Processing 作品',
    'SolidWorks Works': 'SolidWorks 作品',
    'TouchDesigner Works': 'TouchDesigner 作品',
    'Unity Works': 'Unity 作品',
    'Vroid Works': 'Vroid 作品',
    'Video Works': '视频作品',

    // 全部返回按钮
    '← Back to Portfolio': '← 返回作品集',
    '← Back to After Effects Works': '← 返回 After Effects 作品',
    '← Back to Arduino Works': '← 返回 Arduino 作品',
    '← Back to Cinema 4D Works': '← 返回 Cinema 4D 作品',
    '← Back to Figma Works': '← 返回 Figma 作品',
    '← Back to Illustrator Works': '← 返回 Illustrator 作品',
    '← Back to Lightroom Works': '← 返回 Lightroom 摄影作品',
    '← Back to Photoshop Works': '← 返回 Photoshop 作品',
    '← Back to Processing Works': '← 返回 Processing 作品',
    '← Back to SolidWorks Works': '← 返回 SolidWorks 作品',
    '← Back to TouchDesigner Works': '← 返回 TouchDesigner 作品',
    '← Back to Unity Works': '← 返回 Unity 作品',
    '← Back to Vroid': '← 返回 Vroid 作品',
    '← Back to Vroid Works': '← 返回 Vroid 作品',
    '← Back to Video': '← 返回视频列表',

    // 侧边栏与作者信息
    'Ge Yanrou': '葛嫣柔',
    'Yanrou Ge': '葛嫣柔',
    'Hong Kong': '中国香港',
    'EdUHK': '香港教育大学',
    'MA student in New Media and Social Media at EdUHK. Exploring AI, AR, new media operations, and interactive cultural communication.': '香港教育大学新媒体与社交媒体文学硕士在读。探索 AI、AR、新媒体运营与交互文化传播。',
    'Yanrou GE': '葛嫣柔 Yanrou GE',
    'Tai Po, Hong Kong': '中国香港 · 大埔',
    'Jiaxing, Zhejiang, China': '中国浙江 · 嘉兴',
    'The Education University of Hong Kong': '香港教育大学',
    'Sino-German Institute of Design and Communication': '中德设计与传播学院',
    'Sino-German School of Design and Communication': '中德设计与传播学院',
    'Zhejiang Wanli University': '浙江万里学院',
    "Master's student in New Media and Social Media at The Education University of Hong Kong. Interested in AIGC, interactive media, and digital storytelling.": '香港教育大学新媒体与社交媒体文学硕士在读，关注 AIGC、交互媒体与数字叙事。',
    'Undergraduate student in Design & Technology. Interested in AI, AR, and interactive media for cultural heritage narratives.': '设计与技术专业背景，关注 AI、AR 与文化遗产叙事交互媒体。',

    // 首页 index.md
    "👋 Hi, I'm": '👋 你好，我是',
    'Exploring': '探索',
    'to craft': '，打造',
    'immersive cultural experiences': '沉浸式文化与叙事体验',
    'ABOUT ME': '关于我',
    'Featured Works': '精选作品',
    'SEE MORE': '查看更多',
    'Wenchang Chicken Traceability System': '文昌鸡溯源交互系统',
    'Wenchang-Chicken-Traceability-System': '文昌鸡溯源交互系统',
    'Intelligent Liquid Analysis System': '智能液体检测分析系统',
    'Intelligent Liquid Analysis and Reuse System': '智能液体分析与循环利用系统',
    'Hcare Emergency Call Bell': 'Hcare 紧急呼叫铃设计',
    'Dragon Spring Sword': '龙泉宝剑数字交互体验',
    'Tiffany Virtual Run': 'Tiffany 虚拟跑交互游戏',
    'App-Moonlight': 'Moonlight 助眠应用设计',

    // About 页面
    '🎨 A Design & Technology undergraduate exploring the intersection of AI · AR · Interactive Media.': '🎨 探索 AI · AR · 交互媒体交叉领域的数字媒体与设计创作者。',
    '🎨 An M.A. student in New Media & Social Media at EdUHK exploring AIGC, interactive media, and digital storytelling.': '🎨 香港教育大学新媒体与社交媒体硕士在读，探索 AIGC、交互媒体与数字叙事。',
    '💡 My vision: use': '💡 我的愿景：运用',
    'intelligent media': '智能媒体',
    'to create sustainable cultural and commercial value — and grow into a leader in the': '创造可持续的文化与商业价值，成长为',
    'cultural technology landscape': '文化科技领域',
    '🛠 Expertise': '🛠 专业技能',
    'AI Content Production': 'AI 内容创作与生成',
    'Interactive Systems & UX Design': '交互系统与 UX 设计',
    'Cross-Media Narrative & Storytelling': '跨媒体叙事与故事创作',
    'AR / VR Development': 'AR / VR 虚拟现实开发',
    '🤝 Soft Skills': '🤝 综合能力',
    'Audience Insight & Market Analysis': '受众洞察与市场分析',
    'Trend Forecasting · Mixed-Methods Research': '趋势预测 · 混合研究方法',
    'Data Visualization · Social Impact Evaluation': '数据可视化 · 社会影响评估',
    'Bilingual Communication (CN/EN)': '中英双语沟通能力',
    'Team Leadership · Creative Direction': '团队领导力 · 创意指导',
    '🌐 Languages': '🌐 语言能力',
    '🇨🇳 Chinese (Native)': '🇨🇳 中文（母语）',
    '🇬🇧 English (IELTS 7.0)': '🇬🇧 英语（雅思 7.0）',
    '🇭🇰 Cantonese (Basic)': '🇭🇰 粤语（基础）',
    '💼 Experience': '💼 实习与工作经历',
    '🎓 Education': '🎓 教育背景',
    '📄 Publication': '📄 学术发表',
    '⚡ Tools': '⚡ 常用工具',
    'Awards & Recognition': '荣誉与奖项',

    // CV 页面（精准对应简历 PDF）
    '📄 Download my CV (PDF)': '📄 下载个人简历 (PDF)',
    'Location: Tai Po, Hong Kong | Phone: (+852) 62636852 | Email:': '现居：香港大埔 ｜ 电话：(+852) 62636852 ｜ 邮箱：',
    'Portfolio:': '个人主页：',
    'Education': '教育背景',
    'Research & Academic Projects': '学术项目经历',
    'Internship & Work Experience': '实习经历',
    'Campus Activities & Volunteering': '校园活动',
    'Honors & Awards': '荣誉奖项',
    'Zhejiang Provincial Future Designer Competition (2nd Prize)': '浙江省未来设计师大赛二等奖',
    'National College Student English Competition (2nd Prize)': '全国大学生英语竞赛二等奖',
    'Zhejiang Provincial Government Scholarship': '浙江省政府奖学金',
    'First-Class Academic Scholarship, Zhejiang Wanli University': '浙江万里学院一等奖学金',
    'Outstanding Student Cadre, Zhejiang Wanli University': '浙江万里学院优秀学生干部',
    'Merit Student (Three-Good Student), Zhejiang Wanli University': '浙江万里学院三好学生',
    'Wanli Individual Award, Zhejiang Wanli University': '浙江万里学院万里个人奖',
    'Awards & Recognition': '荣誉与奖项',
    '🏆 2025: National': '🏆 2025：全国大学生英语竞赛国家级',
    'Second Prize': '二等奖',
    ', National College Student English Competition': '（全国大学生英语竞赛）',
    '🏆 2025: Zhejiang Provincial': '🏆 2025：浙江省未来设计师大赛省级',
    ', Zhejiang Future Designer Competition': '（浙江省未来设计师大赛）',
    '🎖 2022–2024: Zhejiang Provincial Government Scholarship': '🎖 2022–2024：浙江省政府奖学金',
    '🥇 2022–2024: First-Class Academic Scholarship, Zhejiang Wanli University': '🥇 2022–2024：浙江万里学院一等学业奖学金',
    '🌟 2022–2024: Outstanding Student Cadre / Merit Student, Zhejiang Wanli University': '🌟 2022–2024：浙江万里学院优秀学生干部 / 三好学生',
    'Skills, Certificates & Interests': '技能与兴趣',
    'Master of Arts in New Media and Social Media': '硕士 · 新媒体与社交媒体',
    '(Sep 2026 – Jul 2027)': '（2026年9月 – 2027年7月）',
    'Core Coursework': '主要课程',
    ': Applied Communication Research, New Media Education, Psychological Aspects of New Media and AI, New Media Law, Ethics and Regulation, Multimedia Production, New Media, Algorithms and AI': '：应用传播学研究、新媒体教育、新媒体与人工智能的心理学视角、新媒体法律，道德与监管、多媒体制作、新媒体、算法与人工智能',
    '(Sino-German School of Design and Communication)': '（中德设计与传播学院）',
    'Bachelor of Arts in Art and Technology': '本科 · 艺术与科技专业',
    '(Sep 2022 – Jun 2026)': '（2022年9月 – 2026年6月）',
    'GPA': 'GPA',
    ': 3.98 / 5.00 (Rank: 1 / 27)': '：3.98 / 5.00（排名：1 / 27）',
    ': Computer-Aided Design, Cross-Cultural Communication, Design Aesthetics & Methodology, Digital Image Design, International Design & Innovation Trends, Motion Graphics, Interactive Systems, VR Design, User Experience Design, Media Integration, Interactive Prototyping': '：计算机辅助设计、跨文化交际能力发展、设计美学与方法论、数字图像设计、国际设计与创新趋势、动态图像设计、交互系统、虚拟现实设计、用户体验设计、媒体整合、交互原型',
    'National Innovation and Entrepreneurship Program (No. 654112300195)': '中国创新创业项目（编号：654112300195）',
    '| Jul 2023 – Nov 2024': '｜ 2023年7月 – 2024年11月',
    'Project: Living Conditions and Service Needs of Solitary Women in Ningbo: Policy-Oriented Study': '《宁波独居女性的生活状况与服务需求：政策导向研究》',
    'Project Team Leader (5 members) | National-Level Award Winner': '角色：团队负责人（5人）｜ 获得国家级奖项',
    'Project Overview': '项目概述',
    ': Led a 5-member team conducting social policy research focusing on demographic and household structure shifts, examining the lived experiences and service needs of women living alone in Ningbo to inform policy-making.': '：带领团队开展社会政策研究，关注人口结构和家庭结构的变化，研究宁波独居女性的生活经验与服务需求，为政策制定提供依据。',
    'Methodology': '研究方法',
    ': (1) Quantitative questionnaires capturing demographics, living conditions, and needs; (2) Qualitative in-depth interviews gathering personal experiences, perspectives, and suggestions; (3) Literature review comparing domestic and international practices and policies.': '：1. 问卷调查获取人口学特征、生活状况及需求；2. 深度访谈收集个人经验、观点与建议；3. 文献综述对比国内外实践与政策。',
    'Publication': '成果',
    ': Research paper scheduled for publication in': '：研究论文拟于',
    'Huazhang': '《华章》',
    '(April 2025 issue, p. 129, CN22-1282/I, ISSN 1009-5489).': '2025年4月刊登（第129页，CN22-1282/I；ISSN 1009-5489）。',
    'Ningbo Hape Toys Co., Ltd.': '宁波怡人玩具有限公司',
    '| Ningbo, China': '｜ 中国宁波',
    'New Media Operations Intern': '新媒体运营实习生',
    '(Mar 2026 – May 2026)': '（2026年3月 – 2026年5月）',
    'KOL Management & Outreach': '达人筛选与建联',
    ': Screened 500+ influencers across maternal/child, designer toys, and stress-relief niches; initiated contact with 100+ creators and built a core partner database of 50+, significantly boosting seed-marketing efficiency.': '：筛选母婴/潮玩/解压达人 500+，沟通 100+，建合作库 50+，提升种草匹配效率。',
    'Account Growth & Operations': '账号运营与增长',
    ': Managed Hape’s Xiaohongshu account "Jadore", growing the follower base to 13,300+ and accumulating 104,000+ likes & collects.': '：运营 Hape 账号“Jadore”，粉丝 13300+，获赞收藏 10.4 万。',
    'Content Creation & Copywriting': '内容创作与文案',
    ': Independently authored 80+ posts for brands including TRIDO and Korko, covering new launches, seasonal campaigns, and emotional seeding with natural conversational copy.': '：独立输出 TRIDO、Korko 等品牌小红书文案 80+ 篇，覆盖新品、节日、情绪种草，优化口语化表达。',
    'IP Campaign Execution': '系列内容共创',
    ': Participated in the "Red Phantom" magnetic tile series, creating 20+ styled themes that shifted positioning toward designer toy aesthetics and emotional experience.': '：参与“赤焰幻影”系列，围绕磁力积木输出 20+ 造型主题，转向潮玩美学+情绪体验内容。',
    'Viral Case Analysis': '爆款案例拆解',
    ': Analyzed 100+ viral posts to deconstruct hooks, engagement mechanics, and pacing into actionable topic proposals.': '：分析爆款案例 100+，拆解钩子、互动、节奏，转化为可执行选题建议。',
    'Short Video Production': '品牌短视频拍摄',
    ': Assisted in filming 30+ brand videos by managing scene setup, props, and lighting, mastering short-video production workflows.': '：协助拍摄品牌视频 30+ 条，负责场景、道具、光线，熟悉短视频制作流程。',
    'Seasonal Campaign Planning': '节日节点策划',
    ': Planned festive content for Jadore around Labor Day, Start of Summer, and Mother’s Day to strengthen emotional healing and scenario resonance.': '：结合五一、立夏、母亲节策划 Jadore 节日内容，强化情绪治愈与场景共鸣。',
    'Strategic Growth': '传播思维进阶',
    ': Transitioned from content execution to user emotion and communication logic, enhancing data-driven planning and multi-task coordination.': '：从内容执行转向用户情绪与传播逻辑，提升数据驱动策划及多任务统筹能力。',
    'Content Operations Intern': '内容运营实习生',
    '(Oct 2025 – Jan 2026)': '（2025年10月 – 2026年1月）',
    'Competitor & Market Research': '竞品与市场调研',
    ': Conducted benchmark research on Spanish toy, maternal/child, and gift-box brands, distilling an "Emotional Intervention + Gift Trust" strategy that generated 3 Xiaohongshu topics.': '：竞品调研（西班牙玩具/母婴/礼盒），提炼“情绪干预+送礼信任”策略，输出 3 个小红书选题。',
    'Video Strategy Adaptation': '视频号内容孵化',
    ': Participated in Trido video incubation, refining narrative logic to pivot technical feature demonstrations toward emotional storytelling suited for short-video pacing.': '：参与 Trido 视频孵化，梳理逻辑，推动功能展示转向情绪化表达，适配短视频节奏。',
    'Account Positioning & Branding': '账号定位与运营',
    ': Managed Hape’s account "Silk Road Messenger", establishing a "Healing Lifestyle & Warm Companionship" persona, growing followers to 3,300+ and accumulating 13,000+ likes & collects.': '：运营 Hape 账号“丝路使者”，确立“生活治愈+陪玩温度”人设，粉丝 3300+，获赞收藏 1.3 万。',
    'Digital Manual Optimization': '电子说明书优化',
    ': Proofread electronic manuals and optimized information architecture to lower user comprehension barriers and support unboxing video quality.': '：校对电子说明书，优化结构，降低用户理解成本，支撑开箱类视频质量。',
    'Mindset Transformation': '思维转型与统筹',
    ': Completed the shift from design thinking to market decision-making, mastering data- and psychology-driven planning and multi-task prioritization.': '：完成从设计思维到市场决策思维的转变，学会数据与心理驱动策划，提升多任务优先级判断。',
    'Executive Office Intern': '总裁办实习生',
    '(Apr 2025 – Jun 2025)': '（2025年4月14日 – 2025年6月24日）',
    'IP Commercialization Strategy': '电影主题文化 IP 项目',
    ': Supported film-themed cultural IP projects by researching market-leading merchandise and monetization models, analyzing collaborating artists’ (photographers, directors) styles and profiles, and designing customized merchandise (such as tumblers) with Photoshop and AI tools.': '：支持电影主题文化 IP 项目：调研市场领先的文创产品与盈利模式；分析合作艺术家（摄影师、导演）风格与履历；用 PS、AI 设计个性化衍生品（如水杯），探索艺术 IP 商业化路径。',
    'Business Analysis & Modeling': '儿童友好型餐厅选址研究',
    ': Conducted site-selection research for child-friendly restaurants by benchmarking domestic and international cases on safety, green spaces, and edutainment, and drafted preliminary revenue models.': '：参与儿童友好型餐厅选址研究：对标国内外案例，分析安全性、绿地、寓教于乐等核心因素；初步尝试儿童餐厅营收模型，提高商业数据意识。',
    'VOC Analysis': '亚马逊用户评价分析',
    ': Analyzed customer reviews of Amazon top-selling toys, identifying strengths, weaknesses, and high-frequency feedback to deliver optimization reports.': '：分析亚马逊热门玩具用户评价，提炼优劣势、标注高频反馈，形成优化报告。',
    'AI Promotional Video': 'AI 玩具推广视频制作',
    ': Independently produced AI-generated toy promotional videos, achieving an end-to-end workflow from market insight to creative execution.': '：独立制作 AI 生成的玩具推广视频，实现从市场洞察到创意执行的全链路。',
    'Industry Research & Collaboration': '行业案例与跨部门协作',
    ': Proactively researched industry cases and organized business contact databases, strengthening commercial acumen and cross-departmental collaboration.': '：主动研究行业案例，整理商业人脉数据，强化了商业思维与跨部门协作能力。',
    'Zhejiang Mid-Vision Co., Ltd.': '浙江中视公司',
    'New Media Operator': '新媒体运营',
    '(Sep 2024 – Jan 2025)': '（2024年9月12日 – 2025年1月14日）',
    'End-to-End Content Production': '企业社交媒体账号运营',
    ': Managed corporate social media accounts by planning trending topics, writing scripts, coordinating on-site shoots, and independently completing video editing and cover design, scaling views from dozens to 10,000+.': '：负责企业社交媒体账号运营：策划热点内容、撰写脚本、协调拍摄现场，独立完成视频剪辑与封面设计，播放量从数十次提升至上万。',
    'Script Development & Delivery': '脚本开发与创意调整',
    ': Followed up on script development and refined creative direction to ensure high-quality, on-schedule delivery.': '：跟进脚本开发并调整创意方向，确保高质量按时产出。',
    'Workflow & Teamwork': '全流程理解与协作',
    ': Adapted quickly to fast-paced workflows and collaborated closely across teams, deepening end-to-end content production expertise.': '：快速适应工作节奏，积极沟通与团队协作，提升了内容全流程理解。',
    'Tongxiang Merida Flagship Store': '桐乡美利达旗舰店',
    '| Tongxiang, China': '｜ 中国桐乡',
    'Store Operations Assistant': '门店运营助理',
    '(Jun 2024 – Sep 2024)': '（2024年6月30日 – 2024年9月3日）',
    'Frontline Sales & Consultation': '前台销售与选车顾问',
    ': Identified customer needs across commuting, outdoor, and family scenarios to recommend suitable bicycle models and explain performance features.': '：前台销售：了解顾客需求（通勤、户外、亲子），推荐合适车型并讲解性能。',
    'Weekend Promotional Campaigns': '周末促销活动推广',
    ': Assisted in weekend promotions by crafting sales pitches highlighting commuting convenience and riding enjoyment to drive store foot traffic.': '：协助周末促销活动：设计宣传话术，结合通勤便利与骑行乐趣推广，带动客流量。',
    'Youxuepai (Haining Intime City Experience Store) / Haining Huasheng Trading Co., Ltd.': '优学派（海宁银泰城体验店）/ 海宁华盛贸易有限公司',
    '| Haining, China': '｜ 中国海宁',
    'Retail Sales Specialist': '门店销售专员',
    '(Jun 2023 – Sep 2023)': '（2023年6月20日 – 2023年9月15日）',
    'Targeted Product Demonstration': '分群体产品价值演示',
    ': Tailored value propositions of learning devices by demographic—highlighting educational advantages to parents and demonstrating interactive learning features to children.': '：根据不同年龄群体介绍学习机价值：对家长强调教育优势，对孩子演示互动学习功能。',
    'Bookstore Cultural Promotions': '书店文化联动推广',
    ': Assisted in bookstore cultural campaigns with cross-merchandising displays alongside children’s books and stationery to create an immersive learning environment and gather user feedback.': '：协助书店文化推广活动：与儿童读物、文具进行联动陈列，营造沉浸式学习氛围；收集用户反馈优化产品。',
    'Class Organizing Committee Member (2022 – Present)': '班级组织委员（2022–至今）',
    ': Planned and organized class events (sports meets, cultural festivals), strengthening event planning and team coordination skills.': '：策划并组织班级活动（运动会、文化节），强化了活动策划与团队协调能力。',
    'Student Union Dormitory Department Officer (2023 – 2024)': '学生会宿管部干事（2023–2024）',
    ': Managed dormitory inspections and data organization, enhancing attention to detail and data management capabilities.': '：负责宿舍检查与数据整理，提高了细心与数据管理能力。',
    'Star Farm Volunteer (Oct 14, 2023)': '星星农场志愿者（2023年10月14日）',
    ': Assisted children with autism in building chicken coops, fostering patience and empathy.': '：协助自闭症儿童搭建鸡舍，培养耐心与同理心。',
    '"Inheriting Tradition · Hand-Painted Breeze" Fan Painting Event Leader (Jun 22, 2023)': '“传承传统·手绘清风”团扇彩绘活动负责人（2023年6月22日）',
    ': Guided international students in experiencing Chinese calligraphy and traditional round-fan painting.': '：带领国际学生体验书法与团扇制作。',
    'Ningbo Female College Students Entrepreneurship & Employment Program Participant (Apr 22–23, 2023)': '宁波女大学生创业就业活动参与者（2023年4月22–23日）',
    ': Learned interview skills and entrepreneurship fundamentals and conducted field visits.': '：学习面试技巧与创业基础，开展实地考察。',
    '"Casting Dreams · Vivid English Classroom" Cultural Event Leader (Apr 15, 2023)': '“铸梦铸魂·生动英语课堂”文化活动负责人（2023年4月15日）',
    ': Organized traditional cultural experiences for international students and local children with bilingual guidance.': '：组织国际学生与儿童体验传统文化活动并进行双语引导。',
    'Zhejiang Provincial Future Designer Competition (2nd Prize) | 2025': '浙江省未来设计师大赛二等奖 ｜ 2025',
    'National College Student English Competition (2nd Prize) | 2025': '全国大学生英语竞赛二等奖 ｜ 2025',
    'Zhejiang Provincial Government Scholarship | 2022 – 2024': '浙江省政府奖学金 ｜ 2022–2024',
    'First-Class Academic Scholarship, Zhejiang Wanli University | 2022 – 2024': '浙江万里学院一等奖学金 ｜ 2022–2024',
    'Outstanding Student Cadre, Zhejiang Wanli University | 2022 – 2024': '浙江万里学院优秀学生干部 ｜ 2022–2024',
    'Merit Student (Three-Good Student), Zhejiang Wanli University | 2022 – 2023': '浙江万里学院三好学生 ｜ 2022–2023',
    'Wanli Individual Award, Zhejiang Wanli University | 2022 – 2023': '浙江万里学院万里个人奖 ｜ 2022–2023',
    'Languages': '语言',
    ': Mandarin (Native), English (Fluent), Cantonese (Basic Communication)': '：中文（母语）、英文（流利）、粤语（基础沟通）',
    'Certificates': '证书',
    ': IELTS 7.0; CET-4, CET-6; Putonghua Proficiency Test Certificate; National Computer Rank Certificate': '：IELTS 7.0；CET-4、CET-6；普通话水平测试证书；全国计算机等级证书',
    'Programming & Prototyping': '编程与原型',
    ': C, Arduino': '：C、Arduino',
    'Visual & Creative Software': '视觉创意',
    ': Adobe After Effects, Illustrator, Photoshop, Lightroom, VRoid Studio': '：Adobe AE、AI、PS、LR、VRoid Studio',
    '3D Modeling & Game Engines': '建模与 3D/游戏工具',
    ': Cinema 4D, SolidWorks, Unity (Basic)': '：Cinema 4D、SolidWorks、Unity（基础）',
    'Office & Productivity': '办公软件',
    ': Microsoft Office (Word, Excel, PowerPoint)': '：Microsoft Office（Word、Excel、PPT）',
    'Interests': '兴趣爱好',
    ': Photography, Livestream Content Remixing, End-to-End Video Editing & Publishing, User-Oriented Content Design, New Media Operations, Cultural Communication, Data-Driven Optimization': '：摄影、直播内容二创、全流程剪辑与发布、用户导向内容设计、新媒体运营、文化传播、数据驱动优化',

    // Contact 页面
    'CONTACT ME.': '联系我',
    'For inquiries and comments,': '如有任何合作咨询或交流建议，',
    'please feel free to contact me using the enquiry form below,': '欢迎通过以下社交平台与联系方式与我联系，',
    'by telephone': '联系电话',
    'or by E-mail': '或发送电子邮件至',
    'Rednote': '小红书',
    'TikTok': '抖音',
    'WeChat': '微信',

    // 全部作品标题（Video / AE / Arduino / C4D / Figma / Illustrator / Lightroom / Photoshop / Processing / SolidWorks / TD / Unity / Vroid）
    'The Seed of Hope': '希望之种',
    'The New War': '新战争',
    'Guided Video': 'Tiffany《蓝盒漫游》品牌概念宣传片',
    'Inspirational Video': 'Tiffany《逐光而行》品牌形象宣传片',
    '100 Likes': '《100个赞》——一件越来越不合身的自己',
    'Decided for You': '《已为你决定》',
    'My Village Girl Princess': '《我的村姑王妃》（短剧单集）',
    'The Silent Bystander': '《沉默的目击者》',
    'When a Helper Falls Ill, Who Pays?': '《外佣生病，谁来负责？——医疗责任与保险保障的认知落差》',
    'Dramatic face change': '川剧变脸动态视觉',
    'Dramatic Face Change': '川剧变脸动态视觉',
    'Fantasy Earth': '奇幻地球三维设计',
    'Random Word Technique': '随机词发散视觉海报',
    'Personal LOGO': '个人品牌标识设计',
    'Knitted Future Fashion': '针织未来时尚插画',
    'The Spiritual Charm of Nature': '自然灵韵插画系列',
    'Tree of Life': '生命之树插画',
    'The Lament of Pollution': '污染的悲歌公益海报',
    'The Wind of Freedom': '自由之风插画',
    'Black and White Illusion': '黑白视错觉图形设计',
    'Colorful Reflection of Tradition': '传统的斑斓倒影',
    'Dusk and Dawn': '暮色与黎明',
    'Color Dyed Geometry': '色染几何构成',
    'Fading Home': '消逝的家园',
    'The Land of Melancholy': '忧郁之境',
    'Creative Twelve Shapes': '创意十二形设计',
    'Taekwondo Power, Future Dreams': '跆拳道力量与未来梦想',
    'Colorful Geometric Mosaic Painting': '绚彩几何马赛克绘',
    'Gray Desperation': '灰色绝望合成海报',
    'A Moment of Shooting': '射击瞬间视觉合成',
    'Despair in Ruins (Part 1)': '废墟中的绝望（上）',
    'Despair in Ruins (Part 2)': '废墟中的绝望（下）',
    'Hope in the Crevice': '缝隙中的希望',
    'Reflection in water': '水中倒影',
    'Leg in the Crevice': '石隙掠影',
    'Gaze': '凝望',
    'Person Under the Cow': '牛影之下',
    'Perspective Mirror': '透视之镜',
    'Architectural Mirage in Water': '水映建筑幻影',
    'Cozy Nook': '静谧一隅',
    'Solitude and Promise': '独处与期许',
    "Santa's Present of Joy": '圣诞欢愉礼赞',
    'Infinite Prolongation': '无限延伸',
    'Dangerous “Escort”': '危险“护航”',
    'Day and Night': '昼与夜',
    "Dawn's Glow": '晨曦微光',
    'Echoes of Camel Bells on Timeworn Pathways': '古道驼铃回响',
    'Majestic Drum Tower': '巍峨鼓楼',
    'Minions': '小黄人创意编程绘图',
    'Poster': '动态几何海报设计',
    'She nationality on March 3': '畲族“三月三”文化主题编程海报',
    'Echomoment': 'Echomoment 工业产品建模',
    'Butterfly': '蝴蝶仿生结构建模',
    'Phone Stand': '多功能手机支架设计',
    'Steering Engine': '舵机机械结构建模',
    'Teacup': '极简茶杯造型建模',
    'Cup': '现代水杯工业设计',
    'Cure For Me': 'Cure For Me 音画交互视觉',
    'Dancing Butterflies in Enchantment': '幻境蝶舞实时交互视觉',
    'Anya': '阿尼亚（Anya）三维角色建模',

    // 全部作品详情页简介
    'Grounded in Social Comparison Theory, this 90-second paper-cut collage animation explores how quantified social media metrics turn simple joy into self-doubt. Comparing her 100 likes to another’s 20,000, a girl layers viral outfits onto herself—growing increasingly restricted—before pinning her beloved orange-red fish brooch back on to reclaim her own sense of worth.': '作品基于社会比较理论，以约 90 秒纸偶拼贴动画探讨量化点赞如何让人从愉悦走向自我怀疑。面对 100 个赞与 2 万个赞的落差，女孩在模仿高赞穿搭的叠穿中越发束缚，最终重新戴上橘红色小鱼胸针，找回自我价值。',
    'Exploring automation bias and algorithmic authority, this absurdist urban short follows Lin Zhixia as she outsources everything from daily outfits to career and relationship choices to an AI assistant. When the system begins rewriting her messages and mediating her relationships, she finally turns off auto-decision to send an unpolished, authentic reply—reclaiming her right to doubt, err, and choose for herself.': '作品围绕“自动化偏误”与“算法权威”展开，讲述女主角林知夏从日常穿搭到工作感情逐步依赖 AI 代做决定，甚至连人际沟通也被算法润色接管；最终她关闭自动决策，发出未经修饰的真实心声，重新夺回选择与犯错的主动权。',
    'An AI-assisted micro-drama episode adapted from': '改编自',
    '(《我的村姑王妃》), blending historical romance tropes with fast-paced vertical storytelling. Through expressive character acting, rhythmic pacing, and stylized visual world-building, this short episode brings a lighthearted costume drama conflict to life.': '的 AI 辅助制作竖屏短剧单集，将古风言情设定与紧凑的短剧节奏相结合，通过富有张力的角色演绎与风格化场景呈现，生动演绎轻松戏剧冲突。',
    'Blending campus suspense with psychological reflection, this short film follows high schooler Shen Yan as he uncovers projector and phone clues revealing that his missing classmate’s cries for help were met with apathy—and his own silence. Confronted with the bystander effect, he turns in the evidence, owns up to his complicity, and reaches out to another struggling peer, reminding us that the real horror is not failing to see a cry for help, but choosing to look away.': '短片融合校园悬疑氛围与旁观者效应反思，讲述高中生沉言通过教室投影与手机记录，发现失踪同学林晓曾多次求救却因众人的冷漠与自己的沉默而陷入绝境。意识到自身责任后，沉言向老师交出证据并主动关心另一位陷入困境的同学，提醒人们：真正可怕的不是没有看到求救，而是看到了却选择假装没看到。',
    "Examining healthcare arrangements for foreign domestic helpers in Hong Kong, this journalistic feature explores the boundaries between employer medical liability, employees' compensation, and insurance coverage. Combining interviews with helpers and the public, a real-life case, and policy analysis of the Labour Department’s Standard Employment Contract, the piece highlights the perception gap between employers and helpers and outlines practical channels for seeking support.": '本专题聚焦香港外籍家庭佣工生病或受伤时的医疗安排，结合街头访问、真实个案与香港劳工处标准雇佣合约及法例资料，厘清雇主医疗责任、工伤赔偿与保险保障的界线，呈现劳资双方的认知落差及实用求助渠道。',
    'In a virtual world full of surprises, Blue Box incarnates as a tour guide, leading the audience on a magical journey. To show luxury jewelry and virtual beauty, evoking the yearning and emotion of Tiffany.': '在充满惊喜的虚拟世界中，蓝盒化身向导带领观众踏上奇幻旅程，呈现珠宝与虚拟美学，唤起对 Tiffany 的情感向往。',
    'An instructional video designed to guide and inspire learning.': '一段旨在引导与启发学习体验的演示短片。',
    'This work takes drama full of traditional Chinese elements as the theme to display, presenting rich ethnic characteristics. The splicing and separation skills of facial components are cleverly used to simulate the "face changing" effect in opera. Text and font design combine Song typeface for Chinese characters and Futura for English, forming a modern, dynamic visual presentation.': '本作品以充满中国传统文化元素的戏曲为主题，展现浓郁的民族特色。作品巧妙运用面部元素的拼接与分离技法，模拟川剧“变脸”的戏剧效果；文字与字体设计融合中文宋体与英文 Futura 字体，呈现出兼具现代感与动态张力的视觉表达。',
    'Arduino-based emergency call bell system for Hcare, showing full device design and working process.': '基于 Arduino 开发的 Hcare 紧急呼叫铃系统，完整呈现硬件装置设计与运行交互流程。',
    'Arduino-based intelligent liquid analysis and reuse system, showing multiple stages of design, testing, and operation with detailed images and video demonstration.': '基于 Arduino 开发的智能液体分析与循环利用系统，通过多阶段图文与视频演示呈现设计、测试及运行全流程。',
    'This work, with the theme of the earth, is created by using multiple modeling methods. Circles drawn by NURBS Modeling represent elements such as the earth. Triangles drawn by polygonal modeling depict mountains and forests, and rectangles represent rivers and houses. The unique perspective presents a sense of "fracture". The perspective view enhances expressiveness.': '本作品以地球为主题，融合多种三维建模技法创作而成：以 NURBS 建模绘制的圆形象征地球等宏观元素，多边形建模构建的三角形描绘山峦与森林，矩形则代表河流与居所。独特的透视构图营造出“断裂”的视觉张力，增强了画面的艺术表现力。',
    'Figma UI/UX design project “App-Moonlight”. Includes interactive app screens, interface flow, and design style exploration. Video demonstrates full interaction and prototype walkthrough.': '使用 Figma 完成的“Moonlight”UI/UX 界面设计项目，涵盖高保真交互界面、信息架构流程与视觉风格探索，并通过演示视频完整呈现交互原型操作体验。',
    'The work Black and White Illusions presents nine sets of geometric patterns using pure black and white tones. Basic geometric elements such as diamonds, triangles, and circles are skillfully combined and arranged to create rich visual effects—some seem to produce a dynamic illusion, while others exhibit a sense of spatial extension. By utilizing black-and-white contrast and graphic composition, it creates interesting and imaginative visual illusions, demonstrating the unique artistic expressiveness and visual tension of geometric figures in a black-and-white context.': '《黑白视错觉》以纯粹的黑白双色呈现九组几何图形构成。作品巧妙组合与排列菱形、三角形与圆形等基础几何元素，营造出丰富的视觉层次——有的产生动态旋转错觉，有的呈现空间纵深延伸感。通过强烈的黑白对比与平面构成，展现出几何图形在极简色调下的艺术表现力与视觉张力。',
    'Taking vivid and colorful geometric shapes as the core elements, this work features shapes like circles, squares, and diamonds. These geometric forms intertwine and combine through rich yet harmonious color matching. The overall design not only showcases the sense of order and simplicity of geometric shapes, but also creates a lively and creative visual effect by virtue of color collision and integration. It conveys the unique vitality and artistic tension of geometric art under the rendering of colors.': '作品以明快绚丽的几何图形为核心元素，涵盖圆形、方形与菱形等形态，通过丰富而和谐的色彩搭配相互交织组合。整体设计既保留了几何形态的秩序感与简洁美，又借助色彩的碰撞与融合营造出活泼富有创意的视觉效果，传递出几何艺术在色彩渲染下的独特生命力。',
    'Taking geometric shapes as the core elements, this work uses rich colors such as green, pink, and blue. By splicing and combining shapes like triangles and diamonds, it creates four sets of images with a unified style yet distinct color variations. The matching of different colors and geometric shapes produces a visual effect similar to mosaic inlays. This not only showcases the sense of order and compositional beauty of geometric shapes, but also conveys a vibrant and creative visual experience through the collision of colorful tones, embodying the exploration and expression of the integration of colors and geometric forms in digital visual language.': '本作品以几何图形为核心，运用绿、粉、蓝等丰富色彩，通过三角形与菱形的拼接组合，创作出四组风格统一却色彩各异的系列画面。不同色块与几何形体的契合产生宛如马赛克镶嵌般的视觉肌理，在展现几何构成秩序美的同时，探索数字视觉语言中色彩与几何形态融合的表现力。',
    'Centered on rich colors and traditional patterns, this work uses classic elements such as circles and scrolling grass patterns. Through colorful matching and symmetrical layout, these elements construct decorative patterns with distinct layers. The collision of colors and combination of patterns not only showcase the exquisiteness and sense of order of traditional art, but also inject modern vitality into tradition via vivid tones. It conveys tribute to traditional aesthetics and innovative expressions, presenting the unique charm of tradition under the reflection of colors.': '作品围绕浓郁色彩与传统纹样展开，提取圆形与卷草纹等经典元素，借助缤纷配色与对称构图构建出层次分明的装饰图案。色彩的碰撞与纹样的重组既展现了传统工艺的精致与秩序感，又以明快现代的色调为传统文化注入新活力。',
    'Focusing on the geometric elements of "points, lines, and planes", this work presents twelve groups of creative geometric compositions. Through the aggregation of points, winding of lines, and combination of planes, these figures exhibit diverse visual effects—some resemble rotating vortices, some like blooming flowers, and others display intricate grids. Set against a black background, they highlight the sense of order and artistic creativity of geometric shapes, embodying the exploration and expression of the aesthetics of geometric composition.': '聚焦“点、线、面”三大基础几何元素，呈现十二组富有创意的几何构成图形。通过点的聚集、线的盘绕与面的叠合，画面展现出旋转漩涡、绽放花朵与精密网格等多元视觉形态；在深邃黑色背景的衬托下，凸显出几何构成的形式秩序与艺术创造力。',
    'Taking black, white, and gray as the main tones, this work integrates elements like the moon, sun, and stars with geometric shapes. Through the combination of lines and forms, it creates a sense of time and space for the alternation of day and night. The neatness of geometry intertwines with the imagery of celestial bodies—this not only embodies the tranquility and transition of dawn and dusk, but also conveys the order and poetry contained in the alternation of day and night through abstract visual language, showcasing the unique beauty of the passage of time.': '以黑、白、灰为主色调，将日月星辰等天体意象与几何图形有机融合，通过线条与块面的组合营造出昼夜交替的时空感。规整的几何结构与天体符号交织，以抽象视觉语言诠释晨昏更迭的宁静与诗意，展现时间流转的独特美感。',
    'Taking blue as the main tone, this work combines visual symbols of ice and snow. The glacier-like shape at the top echoes the "HOME" text below—covered in "ice and snow" and seemingly melting—directly showing the gradual disappearance of polar homes like the Antarctic due to global warming. The text cites data to highlight climate issues such as Antarctic warming since 1989. Combining visuals and text, it calls for attention to global warming’s damage to polar homes, conveying anxiety over lost homes and an appeal for environmental protection.': '海报以冷峻蓝色为主调，结合冰雪视觉符号进行公益传达。画面上方的冰川轮廓与下方被冰雪覆盖、逐渐融化的“HOME”字样上下呼应，直观呈现全球变暖背景下南极等极地家园的消逝危机；画面结合 1989 年以来南极升温等气候数据，呼吁公众关注全球变暖与生态环境保护。',
    'This work presents content related to hand-woven clothing from "YERA STUDIO". Integrating elements of Chinese ethnic minorities, the image showcases the fashion style of "NOBILITY AND ELEGANCE" and "SHOW INDIVIDUALITY" through colorful, exquisitely patterned knitted clothing and accessories. It conveys the concept of integrating traditional hand-weaving with modern fashion to create a future-oriented knitted fashion that combines personality and style.': '本作品呈现“YERA STUDIO”手工编织服饰主题视觉，巧妙融入中国少数民族纹样元素，通过色彩绚丽、细节精致的针织服饰与配饰，展现“高贵典雅”与“彰显个性”的时尚态度，传递传统手工编织技艺与现代先锋审美融合的未来时尚理念。',
    'This personal logo design takes the initials of the name as its core element, with the letters arranged from left to right to ensure readability. It uses a sans-serif font to create a fresh and modern visual effect; the font strokes vary in thickness, adding a sense of casual vitality and artistry. Green is chosen as the main color, which symbolizes vigorous vitality, helps people relax, and represents luck and environmental awareness.': '本款个人标识设计以姓名首字母为核心视觉元素，采用自左向右的排列方式确保清晰识别度；无衬线字体搭配粗细变化的笔画，在清新现代的视觉基调中增添灵动与艺术感；主色调选用绿色，象征蓬勃生机、松弛感与自然环保理念。',
    'It adopts a comic storyboard design style, with classic cartoon characters as the visual core, resulting in vivid, lively images and bright colors. Through scenes like teacher-student interaction, it presents content such as the concept, steps, and application examples of "random word method" in a relaxed and easy-to-understand way. Combining fun and knowledge, it makes the explanation of creative thinking methods more approachable and communicative.': '作品采用漫画分镜式版面设计，以生动的卡通角色为视觉核心，色彩明快活泼。通过师生互动等趣味场景，深入浅出地拆解创意思维“随机词法”的核心概念、操作步骤与应用实例，兼具知识性与趣味性。',
    'The poster uses bright yellow as its main tone, exuding vitality and appeal. The cartoon-style taekwondo figures are vivid and lively, with powerful movements that quickly catch the eye. The text information is clearly laid out, and details like promotional offers and course prices are highlighted in color blocks of different shapes—such as orange explosion shapes and blue star shapes. This design is both lively and effective in conveying information; its overall style combines playfulness with promotional practicality, fitting the feature that taekwondo summer courses target teenagers and similar groups.': '海报以明黄色为主调，洋溢着青春活力与视觉感染力。卡通风格的跆拳道人物动作舒展有力，迅速吸引目光；版面信息层级清晰，课程优惠与价格亮点通过橙色爆炸贴、蓝色星形等异形色块突出呈现，兼顾趣味性与暑期青少年课程招生传播的实用性。',
    "This portfolio draws on Kandinsky's style and skillfully uses abstract graphics to vividly show the abundance of pollutants. The unique form of expression endows the picture with strong penetrating power and makes it more three-dimensional. It seems to lead the viewers to penetrate through layers of mist and directly hit the core of the pollution problem, triggering people's profound reflection on the current environmental situation.": '作品借鉴康定斯基的抽象构成风格，巧妙运用抽象几何图形具象化呈现污染物的蔓延与堆积。富有穿透力的层次表现增强了画面的空间纵深感，引导观者穿透迷雾直视环境污染问题核心，引发对生态现状的深刻反思。',
    'Against a black background, colors like pink and blue are paired. The main figure is combined with elements such as teardrops and broken hearts, while the words "TEARS" and "SAD" enhance the sad atmosphere. Through color contrast and the use of symbols, the work creates a space filled with melancholy, conveying a deep sense of sorrow and melancholy.': '在深黑色背景上搭配粉红与冷蓝等对比色调，主体人物与泪滴、碎心等视觉符号相融合，辅以“TEARS”与“SAD”字样强化情绪氛围，通过色彩反差与符号隐喻构建出充满忧郁气息的情感空间。',
    "This portfolio draws on Kandinsky's style and uses abstract graphics to represent the natural environment. The sun symbolizes light and natural energy. The circle represents circulation, such as the change of seasons and the ecological cycle. The element of birds adds agility and vitality, symbolizing the freedom and vitality of nature. This work triggers thoughts on reverence for nature and environmental protection.": '作品借鉴康定斯基的抽象艺术语言演绎自然生态：太阳象征光明与自然能量，圆环寓意四季更迭与生态循环，飞鸟元素则为画面注入灵动生机，象征自然的自由与活力，唤起人们对自然的敬畏与环保意识。',
    "Using black and white lines as the medium, this work shapes an image where figures blend with the wind through dynamic lines. These lines not only outline the figures' contours but also simulate the flow of the wind. By eliminating color distractions, it purely interprets a state of freedom like the intangible wind—embracing and propelling individuals—conveying the yearning for and expression of freedom.": '以纯粹的黑白线条为媒介，通过富有韵律感的动态线条塑造人物与清风相融的意象。线条既勾勒出人物轮廓，又模拟出风的流动轨迹，在剥离色彩干扰后纯粹诠释如风般无拘无束的自由状态。',
    'Against a vivid orange background, this design combines the dynamic posture of a basketball player shooting with letter elements like "EXCIT", and features the phrase "JUST DO IT" below. Through color impact and the capture of the player’s movement, the overall design showcases the passion and vitality of basketball, conveying the spirit of daring to act and enjoying the moment of sports.': '在极具视觉冲击力的明橙色背景下，画面将篮球运动员起跳投篮的动态剪影与“EXCIT”字母元素及下方“JUST DO IT”标语有机结合，通过强烈的色彩张力与动感瞬间捕捉，展现篮球运动的激情活力与果敢行动精神。',
    'The image shows the back of a person standing in front of urban buildings, with an overall dark tone. The word "HOPELESS" and sentences like "I would take shelter but I do not have a port.", "DUGU IS THE NORM OF LIFE" and "You have to keep your loneliness to yourself." convey emotions of loneliness and despair, create a depressing atmosphere, and express the presentation and reflection on the desperate situation.': '画面呈现人物伫立于城市建筑前的背影，整体采用低沉暗调处理。“HOPELESS”字样与周围独白文字共同传递出孤独与无助的情绪张力，营造出深沉压抑的氛围，表达对现代都市疏离与困境的视觉反思。',
    'The image shows the back of a person standing in a ruined city, with an overall dark tone. The word "HOPELESS" and sentences such as "I would take shelter but I do not have a port.", "DUGU IS THE NORM OF LIFE" and "You have to keep your loneliness to yourself." convey a sense of loneliness and despair amid the dilapidated environment. It creates a depressing and helpless atmosphere, demonstrating the expression and reflection on the desperate situation.': '画面描绘人物背对镜头伫立于残垣废墟中的身影，整体色调冷峻压抑。通过“HOPELESS”等视觉文字与破败城市肌理的叠合，传递出置身荒芜境遇中的孤独与绝望感，引发对现实困境的深层思索。',
    "Using black, white, and gray as the main tones, this work creates a depressing atmosphere through the overlapping effect of human figures and urban buildings. The text \"HOPELESS\" along with phrases like \"DUGU IS THE NORM OF LIFE\", \"I would take shelter but I do not have a port.\", and \"You have to keep your loneliness to yourself.\" conveys a sense of despair—characterized by loneliness and having no place to take refuge. It demonstrates the expression and reflection on people's lonely situation in reality.": '以黑、白、灰三色为主调，通过人物剪影与都市楼宇的多重曝光叠合营造出沉郁氛围，结合“HOPELESS”等排印文字，刻画都市人内心孤独与无处栖身的情感张力，表达对现实孤独处境的艺术观照。',
    'SolidWorks modeling project showing Echomoment design in multiple angles.': '基于 SolidWorks 完成的 Echomoment 产品三维建模项目，多视角展示产品外观造型与结构细节。',
    'This TouchDesigner project showcases a visual of dancing butterflies with enchanting effects. The animation explores the fluidity and interaction of multiple elements, creating a dynamic and immersive environment.': '基于 TouchDesigner 创作的“幻境蝶舞”实时视觉交互项目，探索粒子流体与多维元素的动态响应，营造出轻盈梦幻的沉浸式视觉空间。',
    'Visual project combining animation and interactive design to create a Dragon Spring Sword effect. Multi-angle images and video illustrate the full animation sequence and design process.': '融合动态视觉与实时交互设计打造的《龙泉宝剑》数字艺术项目，通过多角度渲染图与演示视频完整呈现动画序列与设计构思。',
    'Unity-based virtual running experience project. Multiple screenshots illustrate the virtual course, environment, and interactive interface for an immersive running simulation.': '基于 Unity 引擎开发的“Tiffany 虚拟跑”互动体验项目，通过多组场景截图与演示视频呈现虚拟赛道环境与沉浸式交互界面设计。',
    'Vroid 3D model showcase of Anya.': '使用 VRoid Studio 制作的“阿尼亚（Anya）”三维二次元角色建模展示。'
  };

  // 香港繁体专属覆盖（直接使用《葛嫣柔-簡歷-v2》官方原句）
  const HK_EXACT_DICT = {
    '📄 Download my CV (PDF)': '📄 下載繁體中文簡歷 (PDF)',
    'Core Coursework: Applied Communication Research, New Media Education, Psychological Aspects of New Media and AI, New Media Law, Ethics and Regulation, Multimedia Production, New Media, Algorithms and AI': '核心課程：應用傳播研究、新媒體教育、新媒體與人工智能心理學、新媒體法律、倫理與監管、多媒體製作、新媒體、算法與人工智能',
    'Core Coursework:': '核心課程：',
    'Core Coursework': '核心課程',
    ': Applied Communication Research, New Media Education, Psychological Aspects of New Media and AI, New Media Law, Ethics and Regulation, Multimedia Production, New Media, Algorithms and AI': '：應用傳播研究、新媒體教育、新媒體與人工智能心理學、新媒體法律、倫理與監管、多媒體製作、新媒體、算法與人工智能',
    'Applied Communication Research, New Media Education, Psychological Aspects of New Media and AI, New Media Law, Ethics and Regulation, Multimedia Production, New Media, Algorithms and AI': '應用傳播研究、新媒體教育、新媒體與人工智能心理學、新媒體法律、倫理與監管、多媒體製作、新媒體、算法與人工智能',
    'Guided Video': 'Tiffany《藍盒漫遊》品牌概念宣傳片',
    'Inspirational Video': 'Tiffany《逐光而行》品牌形象宣傳片',
    'Download my CV (PDF)': '下載繁體中文簡歷 (PDF)',
    'Location: Tai Po, Hong Kong | Phone: (+852) 62636852 | Email:': '現居：香港大埔 ｜ 電話：(+852) 62636852 ｜ 郵箱：',
    'Portfolio:': '個人主頁：',
    ': Applied Communication Research, New Media Education, Psychological Aspects of New Media and AI, New Media Law, Ethics and Regulation, Multimedia Production, New Media, Algorithms and AI': '：應用傳播學研究、新媒體教育、新媒體與人工智能的心理學視角、新媒體法律，道德與監管、多媒體製作、新媒體、算法與人工智能',
    ': Computer-Aided Design, Cross-Cultural Communication, Design Aesthetics & Methodology, Digital Image Design, International Design & Innovation Trends, Motion Graphics, Interactive Systems, VR Design, User Experience Design, Media Integration, Interactive Prototyping': '：計算機輔助設計、跨文化交際能力發展、設計美學與方法論、數字圖像設計、國際設計與創新趨勢、動態圖像設計、交互系統、虛擬現實設計、用戶體驗設計、媒體整合、交互原型',
    ': (1) Quantitative questionnaires capturing demographics, living conditions, and needs; (2) Qualitative in-depth interviews gathering personal experiences, perspectives, and suggestions; (3) Literature review comparing domestic and international practices and policies.': '：1. 問卷調查獲取人口學特徵、生活狀況及需求；2. 深度訪談收集個人經驗、觀點與建議；3. 文獻綜述對比國內外實踐與政策。',
    ': Screened 500+ influencers across maternal/child, designer toys, and stress-relief niches; initiated contact with 100+ creators and built a core partner database of 50+, significantly boosting seed-marketing efficiency.': '：篩選母嬰/潮玩/解壓達人 500+，溝通 100+，建合作庫 50+，提升種草匹配效率。',
    ': Managed Hape’s Xiaohongshu account "Jadore", growing the follower base to 13,300+ and accumulating 104,000+ likes & collects.': '：運營 Hape 賬號“Jadore”，粉絲 13300+，獲讚收藏 10.4 萬。',
    ': Independently authored 80+ posts for brands including TRIDO and Korko, covering new launches, seasonal campaigns, and emotional seeding with natural conversational copy.': '：獨立輸出 TRIDO、Korko 等品牌小紅書文案 80+ 篇，覆蓋新品、節日、情緒種草，優化口語化表達。',
    ': Participated in the "Red Phantom" magnetic tile series, creating 20+ styled themes that shifted positioning toward designer toy aesthetics and emotional experience.': '：參與“赤焰幻影”系列，圍繞磁力積木輸出 20+ 造型主題，轉向潮玩美學+情緒體驗內容。',
    ': Analyzed 100+ viral posts to deconstruct hooks, engagement mechanics, and pacing into actionable topic proposals.': '：分析爆款案例 100+，拆解鉤子、互動、節奏，轉化為可執行選題建議。',
    ': Assisted in filming 30+ brand videos by managing scene setup, props, and lighting, mastering short-video production workflows.': '：協助拍攝品牌視頻 30+ 條，負責場景、道具、光線，熟悉短視頻製作流程。',
    ': Planned festive content for Jadore around Labor Day, Start of Summer, and Mother’s Day to strengthen emotional healing and scenario resonance.': '：結合五一、立夏、母親節策劃 Jadore 節日內容，強化情緒治癒與場景共鳴。',
    ': Transitioned from content execution to user emotion and communication logic, enhancing data-driven planning and multi-task coordination.': '：從內容執行轉向用戶情緒與傳播邏輯，提升數據驅動策劃及多任務統籌能力。',
    ': Conducted benchmark research on Spanish toy, maternal/child, and gift-box brands, distilling an "Emotional Intervention + Gift Trust" strategy that generated 3 Xiaohongshu topics.': '：競品調研（西班牙玩具/母嬰/禮盒），提煉“情緒干預+送禮信任”策略，輸出 3 個小紅書選題。',
    ': Participated in Trido video incubation, refining narrative logic to pivot technical feature demonstrations toward emotional storytelling suited for short-video pacing.': '：參與 Trido 視頻孵化，梳理邏輯，推動功能展示轉向情緒化表達，適配短視頻節奏。',
    ': Managed Hape’s account "Silk Road Messenger", establishing a "Healing Lifestyle & Warm Companionship" persona, growing followers to 3,300+ and accumulating 13,000+ likes & collects.': '：運營 Hape 賬號“絲路使者”，確立“生活治癒+陪玩溫度”人設，粉絲 3300+，獲讚收藏 1.3 萬。',
    ': Proofread electronic manuals and optimized information architecture to lower user comprehension barriers and support unboxing video quality.': '：校對電子說明書，優化結構，降低用戶理解成本，支撐開箱類視頻質量。',
    ': Completed the shift from design thinking to market decision-making, mastering data- and psychology-driven planning and multi-task prioritization.': '：完成從設計思維到市場決策思維的轉變，學會數據與心理驅動策劃，提升多任務優先級判斷。',
    ': Supported film-themed cultural IP projects by researching market-leading merchandise and monetization models, analyzing collaborating artists’ (photographers, directors) styles and profiles, and designing customized merchandise (such as tumblers) with Photoshop and AI tools.': '：支持電影主題文化 IP 項目：調研市場領先的文創產品與盈利模式；分析合作藝術家（攝影師、導演）風格與履歷；用 PS、AI 設計個性化衍生品（如水杯），探索藝術 IP 商業化路徑。',
    ': Conducted site-selection research for child-friendly restaurants by benchmarking domestic and international cases on safety, green spaces, and edutainment, and drafted preliminary revenue models.': '：參與兒童友好型餐廳選址研究：對標國內外案例，分析安全性、綠地、寓教於樂等核心因素；初步嘗試兒童餐廳營收模型，提高商業數據意識。',
    ': Analyzed customer reviews of Amazon top-selling toys, identifying strengths, weaknesses, and high-frequency feedback to deliver optimization reports.': '：分析亞馬遜熱門玩具用戶評價，提煉優劣勢、標註高頻反饋，形成優化報告。',
    ': Independently produced AI-generated toy promotional videos, achieving an end-to-end workflow from market insight to creative execution.': '：獨立製作 AI 生成的玩具推廣視頻，實現從市場洞察到創意執行的全鏈路。',
    ': Proactively researched industry cases and organized business contact databases, strengthening commercial acumen and cross-departmental collaboration.': '：主動研究行業案例，整理商業人脈數據，強化了商業思維與跨部門協作能力。',
    ': Managed corporate social media accounts by planning trending topics, writing scripts, coordinating on-site shoots, and independently completing video editing and cover design, scaling views from dozens to 10,000+.': '：負責企業社交媒體賬號運營：策劃熱點內容、撰寫腳本、協調拍攝現場，獨立完成視頻剪輯與封面設計，播放量從數十次提升至上萬。',
    ': Followed up on script development and refined creative direction to ensure high-quality, on-schedule delivery.': '：跟進腳本開發並調整創意方向，確保高質量按時產出。',
    ': Adapted quickly to fast-paced workflows and collaborated closely across teams, deepening end-to-end content production expertise.': '：快速適應工作節奏，積極溝通與團隊協作，提升了內容全流程理解。',
    ': Identified customer needs across commuting, outdoor, and family scenarios to recommend suitable bicycle models and explain performance features.': '：前台銷售：了解顧客需求（通勤、戶外、親子），推薦合適車型並講解性能。',
    ': Assisted in weekend promotions by crafting sales pitches highlighting commuting convenience and riding enjoyment to drive store foot traffic.': '：協助週末促銷活動：設計宣傳話術，結合通勤便利與騎行樂趣推廣，帶動客流量。',
    ': Tailored value propositions of learning devices by demographic—highlighting educational advantages to parents and demonstrating interactive learning features to children.': '：根據不同年齡群體介紹學習機價值：對家長強調教育優勢，對孩子演示互動學習功能。',
    ': Assisted in bookstore cultural campaigns with cross-merchandising displays alongside children’s books and stationery to create an immersive learning environment and gather user feedback.': '：協助書店文化推廣活動：與兒童讀物、文具進行聯動陳列，營造沉浸式學習氛圍；收集用戶反饋優化產品。'
  };

  function normalizeKey(str) {
    return str
      .replace(/\s+/g, ' ')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[–—]/g, '-')
      .replace(/…/g, '...')
      .trim();
  }

  const NORM_DICT = {};
  for (const [k, v] of Object.entries(EXACT_DICT)) {
    NORM_DICT[normalizeKey(k)] = v;
  }
  const NORM_HK_DICT = {};
  for (const [k, v] of Object.entries(HK_EXACT_DICT)) {
    NORM_HK_DICT[normalizeKey(k)] = v;
  }

  function translateString(raw, lang) {
    if (!raw || lang === 'en') return raw;
    const leadingMatch = raw.match(/^\s*/);
    const trailingMatch = raw.match(/\s*$/);
    const leading = leadingMatch ? leadingMatch[0] : '';
    const trailing = trailingMatch ? trailingMatch[0] : '';
    const core = raw.replace(/\s+/g, ' ').trim();
    if (!core) return raw;
    const normCore = normalizeKey(core);

    if (lang === 'zh-HK' && (HK_EXACT_DICT[core] || NORM_HK_DICT[normCore])) {
      return leading + (HK_EXACT_DICT[core] || NORM_HK_DICT[normCore]) + trailing;
    }

    let cn = EXACT_DICT[core] || NORM_DICT[normCore];

    // 处理全部项目元数据行：Role: ... · Tools: ... · Year: 2024/2026
    if (!cn && core.startsWith('Role:') && core.includes('Tools:') && core.includes('Year:')) {
      cn = core
        .replace('Role:', '角色：')
        .replace('Tools:', '工具：')
        .replace('Year:', '年份：')
        .replace('Creator & Director', '主创与导演')
        .replace('Creator & Producer', '主创与制片')
        .replace('Motion Designer', '动态视觉设计师')
        .replace('UI/UX Designer', 'UI/UX 设计师')
        .replace('3D Modeler', '3D 角色建模师')
        .replace('AIGC Video Production & Editing', 'AIGC 视频制作与剪辑')
        .replace('Field Reporting, Video Production & Editing', '实地采访、视频制作与剪辑');
    }

    if (!cn) return raw;
    const target = lang === 'zh-HK' ? toHK(cn) : cn;
    return leading + target + trailing;
  }

  function updateDownloadLink(lang) {
    const dlBtn = document.getElementById('cv-download-btn');
    if (!dlBtn) return;
    if (lang === 'zh-CN') {
      dlBtn.setAttribute('href', '/files/Yanrou_GE_CV_SC.pdf');
    } else if (lang === 'zh-HK') {
      dlBtn.setAttribute('href', '/files/Yanrou_GE_CV_TC.pdf');
    } else {
      dlBtn.setAttribute('href', '/files/Yanrou_GE_CV.pdf');
    }
  }

  function syncUrlParam(lang) {
    try {
      const url = new URL(window.location.href);
      if (lang === 'en') {
        url.searchParams.delete('lang');
      } else {
        url.searchParams.set('lang', lang);
      }
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  }

  function applyLanguage(lang, updateUrl) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('data-lang', lang);
    if (updateUrl) syncUrlParam(lang);

    document.querySelectorAll('.lang-switcher button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    updateDownloadLink(lang);

    isApplying = true;
    try {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE' || tag === 'PRE') {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest('#lang-switcher')) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      const nodes = [];
      let n;
      while ((n = walker.nextNode())) {
        nodes.push(n);
      }

      for (const node of nodes) {
        if (!origTextMap.has(node)) {
          origTextMap.set(node, node.nodeValue);
        }
        const orig = origTextMap.get(node);
        node.nodeValue = lang === 'en' ? orig : translateString(orig, lang);
      }

      document.querySelectorAll('.author__bio').forEach(el => {
        if (!origAttrMap.has(el)) {
          origAttrMap.set(el, el.textContent);
        }
        const origBio = origAttrMap.get(el);
        const coreBio = origBio.replace(/\s+/g, ' ').trim();
        if (EXACT_DICT[coreBio]) {
          el.textContent = lang === 'en' ? origBio : translateString(coreBio, lang);
        }
      });

      document.querySelectorAll('[title]').forEach(el => {
        if (!origAttrMap.has(el)) {
          origAttrMap.set(el, el.getAttribute('title'));
        }
        const origTitle = origAttrMap.get(el);
        el.setAttribute('title', lang === 'en' ? origTitle : translateString(origTitle, lang));
      });
    } finally {
      isApplying = false;
      window.dispatchEvent(new Event('resize'));
    }
  }

  function mountSwitcher() {
    const existing = document.getElementById('lang-switcher');
    if (existing) {
      existing.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
        if (!btn.dataset.bound) {
          btn.dataset.bound = '1';
          btn.addEventListener('click', () => applyLanguage(btn.dataset.lang, true));
        }
      });
      return;
    }
    const container = document.querySelector('.masthead__inner-wrap') || document.body;
    const switcher = document.createElement('div');
    switcher.id = 'lang-switcher';
    switcher.className = 'lang-switcher';
    switcher.setAttribute('aria-label', 'Language Switcher');

    const options = [
      { code: 'en', label: 'EN' },
      { code: 'zh-CN', label: '简' },
      { code: 'zh-HK', label: '繁' }
    ];

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.lang = opt.code;
      btn.textContent = opt.label;
      if (opt.code === currentLang) btn.classList.add('active');
      btn.addEventListener('click', () => applyLanguage(opt.code, true));
      switcher.appendChild(btn);
    });

    container.appendChild(switcher);
  }

  function init() {
    mountSwitcher();
    if (currentLang !== 'en') {
      applyLanguage(currentLang, false);
    }

    const introEl = document.getElementById('intro');
    if (introEl) {
      let timer = null;
      const obs = new MutationObserver(() => {
        if (isApplying || currentLang === 'en') return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          const txt = introEl.textContent.trim();
          if (EXACT_DICT[txt]) {
            origTextMap.set(introEl.firstChild, introEl.textContent);
            applyLanguage(currentLang, false);
          }
        }, 120);
      });
      obs.observe(introEl, { childList: true, characterData: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
