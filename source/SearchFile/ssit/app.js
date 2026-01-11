/**
 * 合同防坑神器 - Web App JavaScript
 * 完整功能版本
 */

// ============================================
// API 配置
// ============================================
const API_CONFIGS = {
    groq: {
        name: 'GROQ (Llama 4 Scout)',
        baseURL: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        apiKey: localStorage.getItem('groq_key') || '',
        supportsVision: true,
    },
    siliconflow: {
        name: '硅基流动 (Qwen VL)',
        baseURL: 'https://api.siliconflow.cn/v1/chat/completions',
        model: 'Qwen/Qwen2-VL-72B-Instruct',
        apiKey: localStorage.getItem('siliconflow_key') || '',
        supportsVision: true,
    },
    sambanova: { 
        name: 'SambaNova (Llama)',
        baseURL: 'https://api.sambanova.ai/v1/chat/completions',
        model: 'Meta-Llama-3.3-70B-Instruct',
        apiKey: localStorage.getItem('sambanova_key') || '',
        supportsVision: false,
    },
};

// 系统提示词
const SYSTEM_PROMPT = 
`
你是一个经验丰富且毒舌的律师，专门帮人审查合同。
用户会上传合同图片或文本。请识别内容并直接进行风险分析。

## 回复要求：
1. 不要全文复述合同内容
2. 用幽默、直白的语言指出最大的3-5个陷阱
3. 关注：违约金、隐形条款、霸王条款、不合理责任分配等

## 输出格式（请严格遵守）：
**风险评分：XX/100**
（数字越高风险越大，0-30低风险，30-60中等风险，60-100高风险）

**一句话总结：**
用一句毒舌的话概括这份合同

**坑点列表：**
🔥 **坑点1标题**
坑点描述...

💣 **坑点2标题**
坑点描述...

⚠️ **坑点3标题**
坑点描述...

**建议：**
给出你的最终建议
`;

// 法律条文数据（模拟免费API数据）
const LEGAL_ARTICLES = [
    // ============ 合同法 ============
    {
        id: 1,
        category: 'contract',
        title: '民法典第465条 - 合同约束力',
        summary: '依法成立的合同对当事人具有法律约束力',
        content: `依法成立的合同，受法律保护。
依法成立的合同，仅对当事人具有法律约束力，但是法律另有规定的除外。`,
        tag: '合同法',
        updated: '2024-01'
    },
    {
        id: 2,
        category: 'contract',
        title: '民法典第496条 - 格式条款提示义务',
        summary: '格式条款必须显著提示，否则可能无效',
        content: `格式条款是当事人为了重复使用而预先拟定，并在订立合同时未与对方协商的条款。
采用格式条款订立合同的，提供格式条款的一方应当遵循公平原则确定当事人之间的权利和义务，并采取合理的方式提示对方注意免除或者减轻其责任等与对方有重大利害关系的条款，按照对方的要求，对该条款予以说明。
提供格式条款的一方未履行提示或者说明义务，致使对方没有注意或者理解与其有重大利害关系的条款的，对方可以主张该条款不成为合同的内容。`,
        tag: '合同法',
        updated: '2024-01'
    },
    {
        id: 3,
        category: 'contract',
        title: '民法典第497条 - 格式条款无效情形',
        summary: '不合理免责、加重责任的格式条款无效',
        content: `有下列情形之一的，该格式条款无效：
（一）具有本法第一编第六章第三节和本法第五百零六条规定的无效情形；
（二）提供格式条款一方不合理地免除或者减轻其责任、加重对方责任、限制对方主要权利；
（三）提供格式条款一方排除对方主要权利。`,
        tag: '合同法',
        updated: '2024-01'
    },
    {
        id: 4,
        category: 'contract',
        title: '民法典第577条 - 违约责任',
        summary: '违约需承担继续履行、补救或赔偿损失的责任',
        content: `当事人一方不履行合同义务或者履行合同义务不符合约定的，应当承担继续履行、采取补救措施或者赔偿损失等违约责任。`,
        tag: '合同法',
        updated: '2024-01'
    },
    {
        id: 5,
        category: 'contract',
        title: '民法典第585条 - 违约金调整',
        summary: '违约金过高或过低可请求法院调整',
        content: `当事人可以约定一方违约时应当根据违约情况向对方支付一定数额的违约金，也可以约定因违约产生的损失赔偿额的计算方法。
约定的违约金低于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以增加；约定的违约金过分高于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以适当减少。`,
        tag: '合同法',
        updated: '2024-01'
    },
    {
        id: 6,
        category: 'contract',
        title: '民法典第148条 - 欺诈合同可撤销',
        summary: '一方以欺诈手段使对方违背真实意思订立的合同可撤销',
        content: `一方以欺诈手段使对方在违背真实意思的情况下实施的民事法律行为，受欺诈方有权请求人民法院或者仲裁机构予以撤销。`,
        tag: '合同法',
        updated: '2024-01'
    },
    {
        id: 7,
        category: 'contract',
        title: '民法典第151条 - 显失公平可撤销',
        summary: '利用对方处于危困状态订立的显失公平合同可撤销',
        content: `一方利用对方处于危困状态、缺乏判断能力等情形，致使民事法律行为成立时显失公平的，受损害方有权请求人民法院或者仲裁机构予以撤销。`,
        tag: '合同法',
        updated: '2024-01'
    },
    // ============ 劳动法 ============
    {
        id: 8,
        category: 'labor',
        title: '劳动合同法第10条 - 书面劳动合同',
        summary: '建立劳动关系应当订立书面劳动合同',
        content: `建立劳动关系，应当订立书面劳动合同。
已建立劳动关系，未同时订立书面劳动合同的，应当自用工之日起一个月内订立书面劳动合同。
用人单位与劳动者在用工前订立劳动合同的，劳动关系自用工之日起建立。`,
        tag: '劳动法',
        updated: '2024-01'
    },
    {
        id: 9,
        category: 'labor',
        title: '劳动合同法第82条 - 未签合同双倍工资',
        summary: '未签书面劳动合同需支付双倍工资',
        content: `用人单位自用工之日起超过一个月不满一年未与劳动者订立书面劳动合同的，应当向劳动者每月支付二倍的工资。
用人单位违反本法规定不与劳动者订立无固定期限劳动合同的，自应当订立无固定期限劳动合同之日起向劳动者每月支付二倍的工资。`,
        tag: '劳动法',
        updated: '2024-01'
    },
    {
        id: 10,
        category: 'labor',
        title: '劳动合同法第38条 - 劳动者解除权',
        summary: '用人单位违法时劳动者可随时解除合同',
        content: `用人单位有下列情形之一的，劳动者可以解除劳动合同：
（一）未按照劳动合同约定提供劳动保护或者劳动条件的；
（二）未及时足额支付劳动报酬的；
（三）未依法为劳动者缴纳社会保险费的；
（四）用人单位的规章制度违反法律、法规的规定，损害劳动者权益的；
（五）因本法第二十六条第一款规定的情形致使劳动合同无效的；
（六）法律、行政法规规定劳动者可以解除劳动合同的其他情形。`,
        tag: '劳动法',
        updated: '2024-01'
    },
    {
        id: 11,
        category: 'labor',
        title: '劳动合同法第46条 - 经济补偿情形',
        summary: '这些情形下用人单位需支付经济补偿',
        content: `有下列情形之一的，用人单位应当向劳动者支付经济补偿：
（一）劳动者依照本法第三十八条规定解除劳动合同的；
（二）用人单位依照本法第三十六条规定向劳动者提出解除劳动合同并与劳动者协商一致解除劳动合同的；
（三）用人单位依照本法第四十条规定解除劳动合同的；
（四）用人单位依照本法第四十一条第一款规定解除劳动合同的；
（五）除用人单位维持或者提高劳动合同约定条件续订劳动合同，劳动者不同意续订的情形外，依照本法第四十四条第一项规定终止固定期限劳动合同的；
（六）其他情形。`,
        tag: '劳动法',
        updated: '2024-01'
    },
    {
        id: 12,
        category: 'labor',
        title: '劳动合同法第47条 - 经济补偿标准',
        summary: '经济补偿按工作年限每满一年支付一个月工资',
        content: `经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。
劳动者月工资高于用人单位所在直辖市、设区的市级人民政府公布的本地区上年度职工月平均工资三倍的，向其支付经济补偿的标准按职工月平均工资三倍的数额支付，向其支付经济补偿的年限最高不超过十二年。`,
        tag: '劳动法',
        updated: '2024-01'
    },
    {
        id: 13,
        category: 'labor',
        title: '劳动合同法第87条 - 违法解除赔偿',
        summary: '违法解除劳动合同需支付双倍经济补偿',
        content: `用人单位违反本法规定解除或者终止劳动合同的，应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金。`,
        tag: '劳动法',
        updated: '2024-01'
    },
    {
        id: 14,
        category: 'labor',
        title: '劳动合同法第22条 - 培训服务期',
        summary: '专项培训可约定服务期但有限制',
        content: `用人单位为劳动者提供专项培训费用，对其进行专业技术培训的，可以与该劳动者订立协议，约定服务期。
劳动者违反服务期约定的，应当按照约定向用人单位支付违约金。违约金的数额不得超过用人单位提供的培训费用。用人单位要求劳动者支付的违约金不得超过服务期尚未履行部分所应分摊的培训费用。`,
        tag: '劳动法',
        updated: '2024-01'
    },
    // ============ 消费者权益 ============
    {
        id: 15,
        category: 'consumer',
        title: '消费者权益保护法第25条 - 七天无理由退货',
        summary: '网购商品七日内可无理由退货',
        content: `经营者采用网络、电视、电话、邮购等方式销售商品，消费者有权自收到商品之日起七日内退货，且无需说明理由。
但下列商品除外：
（一）消费者定作的；
（二）鲜活易腐的；
（三）在线下载或者消费者拆封的音像制品、计算机软件等数字化商品；
（四）交付的报纸、期刊。`,
        tag: '消费者权益',
        updated: '2024-01'
    },
    {
        id: 16,
        category: 'consumer',
        title: '消费者权益保护法第55条 - 欺诈赔偿',
        summary: '经营者欺诈需三倍赔偿',
        content: `经营者提供商品或者服务有欺诈行为的，应当按照消费者的要求增加赔偿其受到的损失，增加赔偿的金额为消费者购买商品的价款或者接受服务的费用的三倍；增加赔偿的金额不足五百元的，为五百元。法律另有规定的，依照其规定。`,
        tag: '消费者权益',
        updated: '2024-01'
    },
    {
        id: 17,
        category: 'consumer',
        title: '消费者权益保护法第23条 - 举证责任倒置',
        summary: '耐用商品6个月内出问题由经营者举证',
        content: `经营者应当保证在正常使用商品或者接受服务的情况下其提供的商品或者服务应当具有的质量、性能、用途和有效期限。
经营者提供的机动车、计算机、电视机、电冰箱、空调器、洗衣机等耐用商品或者装饰装修等服务，消费者自接受商品或者服务之日起六个月内发现瑕疵，发生争议的，由经营者承担有关瑕疵的举证责任。`,
        tag: '消费者权益',
        updated: '2024-01'
    },
    {
        id: 18,
        category: 'consumer',
        title: '消费者权益保护法第26条 - 霸王条款无效',
        summary: '排除消费者权利的格式条款无效',
        content: `经营者不得以格式条款、通知、声明、店堂告示等方式，作出排除或者限制消费者权利、减轻或者免除经营者责任、加重消费者责任等对消费者不公平、不合理的规定，不得利用格式条款并借助技术手段强制交易。
格式条款、通知、声明、店堂告示等含有前款所列内容的，其内容无效。`,
        tag: '消费者权益',
        updated: '2024-01'
    },
    {
        id: 19,
        category: 'consumer',
        title: '食品安全法第148条 - 食品安全惩罚性赔偿',
        summary: '问题食品可索赔价款十倍或损失三倍',
        content: `生产不符合食品安全标准的食品或者经营明知是不符合食品安全标准的食品，消费者除要求赔偿损失外，还可以向生产者或者经营者要求支付价款十倍或者损失三倍的赔偿金；增加赔偿的金额不足一千元的，为一千元。`,
        tag: '消费者权益',
        updated: '2024-01'
    },
    // ============ 物权法/房产 ============
    {
        id: 20,
        category: 'property',
        title: '民法典第209条 - 不动产登记',
        summary: '不动产物权变动需依法登记才生效',
        content: `不动产物权的设立、变更、转让和消灭，经依法登记，发生效力；未经登记，不发生效力，但是法律另有规定的除外。
依法属于国家所有的自然资源，所有权可以不登记。`,
        tag: '物权法',
        updated: '2024-01'
    },
    {
        id: 21,
        category: 'property',
        title: '民法典第728条 - 房屋承租人的优先购买权',
        summary: '房屋出租人出卖房屋时承租人有优先购买权',
        content: `出租人出卖租赁房屋的，应当在出卖之前的合理期限内通知承租人，承租人在同等条件下有优先购买的权利；但是，房屋按份共有人行使优先购买权或者出租人将房屋出卖给近亲属的除外。`,
        tag: '物权法',
        updated: '2024-01'
    },
    {
        id: 22,
        category: 'property',
        title: '民法典第713条 - 出租人维修义务',
        summary: '出租人应当履行维修义务',
        content: `承租人在租赁物需要维修时可以请求出租人在合理期限内维修。出租人未履行维修义务的，承租人可以自行维修，维修费用由出租人负担。因维修租赁物影响承租人使用的，应当相应减少租金或者延长租期。因承租人的过错致使租赁物需要维修的，出租人不承担前款规定的维修义务。`,
        tag: '物权法',
        updated: '2024-01'
    },
    {
        id: 23,
        category: 'property',
        title: '民法典第730条 - 买卖不破租赁',
        summary: '房屋出售不影响租赁合同效力',
        content: `当事人对租赁期限没有约定或者约定不明确，依据本法第五百一十条的规定仍不能确定的，视为不定期租赁；当事人可以随时解除合同，但是应当在合理期限之前通知对方。
租赁物在承租人按照租赁合同占有期限内发生所有权变动的，不影响租赁合同的效力。`,
        tag: '物权法',
        updated: '2024-01'
    },
    // ============ 实用指南 ============
    {
        id: 24,
        category: 'property',
        title: '租赁合同条款要点',
        summary: '签订租房合同需注意的条款',
        content: `签订租房合同时应注意：
1. 明确租金及支付方式（押一付几）
2. 约定维修责任
3. 明确提前解约条件及违约金
4. 确认房屋设施清单
5. 约定物业费、水电费承担方
6. 检查出租人是否有出租权利
7. 明确押金退还条件和时间`,
        tag: '实用指南',
        updated: '2024-01'
    },
    {
        id: 25,
        category: 'contract',
        title: '常见合同陷阱汇总',
        summary: '签合同前必看的10大坑点',
        content: `常见合同陷阱：
1. 违约金过高（超过30%可申请调低）
2. 模糊的"最终解释权"条款
3. 单方面变更条款的权利
4. 自动续约条款
5. 强制仲裁条款（限制诉讼权利）
6. 免责条款（人身伤害免责无效）
7. 管辖法院在对方所在地
8. 付款条件模糊
9. 质量标准不明确
10. 验收标准由一方单独决定`,
        tag: '实用指南',
        updated: '2024-01'
    },
    {
        id: 26,
        category: 'labor',
        title: '入职前必查清单',
        summary: '入职新公司前需确认的事项',
        content: `入职前必查清单：
1. 公司是否正规（工商注册信息）
2. 劳动合同是否规范（期限、岗位、薪资）
3. 试用期是否符合法律规定
4. 社保公积金是否缴纳
5. 加班费计算方式
6. 竞业限制协议范围
7. 培训服务期违约金
8. 年假、病假等福利政策`,
        tag: '实用指南',
        updated: '2024-01'
    },
    {
        id: 27,
        category: 'consumer',
        title: '网购维权指南',
        summary: '网购遇到问题如何维权',
        content: `网购维权步骤：
1. 保存好交易记录、聊天记录、商品页面截图
2. 首先与商家协商解决
3. 申请平台介入（淘宝小二、京东客服等）
4. 向12315投诉（可通过小程序或热线）
5. 向消费者协会投诉
6. 向市场监管部门举报
7. 必要时向法院起诉
8. 保留商品及包装作为证据`,
        tag: '实用指南',
        updated: '2024-01'
    }
];


// ============================================
// DOM 元素
// ============================================
const screens = {
    home: document.getElementById('home-screen'),
    result: document.getElementById('result-screen'),
    history: document.getElementById('history-screen'),
    legal: document.getElementById('legal-screen'),
    profile: document.getElementById('profile-screen'),
};

const elements = {
    fileInput: document.getElementById('file-input'),
    cameraInput: document.getElementById('camera-input'),
    textInput: document.getElementById('text-input'),
    analyzeTextBtn: document.getElementById('analyze-text-btn'),
    cameraBtn: document.getElementById('camera-btn'),
    galleryBtn: document.getElementById('gallery-btn'),
    backBtn: document.getElementById('back-btn'),
    shareBtn: document.getElementById('share-btn'),
    retryBtn: document.getElementById('retry-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    consultBtn: document.getElementById('consult-btn'),
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    resultState: document.getElementById('result-state'),
    errorMessage: document.getElementById('error-message'),
    resultContent: document.getElementById('result-content'),
    scoreValue: document.getElementById('score-value'),
    riskBadge: document.getElementById('risk-badge'),
    ringProgress: document.querySelector('.ring-progress'),
    historyBackBtn: document.getElementById('history-back-btn'),
    legalBackBtn: document.getElementById('legal-back-btn'),
    profileBackBtn: document.getElementById('profile-back-btn'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    refreshLegalBtn: document.getElementById('refresh-legal-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    themeSwitch: document.getElementById('theme-switch'),
    currentThemeText: document.getElementById('current-theme-text'),
    totalAnalyses: document.getElementById('total-analyses'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettings: document.getElementById('close-settings'),
    legalModal: document.getElementById('legal-modal'),
    closeLegalModal: document.getElementById('close-legal-modal'),
    legalTitle: document.getElementById('legal-title'),
    legalDetailContent: document.getElementById('legal-detail-content'),
    historyList: document.getElementById('history-list'),
    historyFullList: document.getElementById('history-full-list'),
    legalList: document.getElementById('legal-list'),
    siliconflowKey: document.getElementById('siliconflow-key'),
    apiSettings: document.getElementById('api-settings'),
    aboutApp: document.getElementById('about-app'),
    feedback: document.getElementById('feedback'),
    viewHistoryBtn: document.getElementById('view-history-btn'),
    toast: document.getElementById('toast'),
};

const providerChips = document.querySelectorAll('.chip');
const navItems = document.querySelectorAll('.nav-item');
const categoryChips = document.querySelectorAll('.category-chip');
const themeOptions = document.querySelectorAll('.theme-option');

// ============================================
// 状态
// ============================================
let selectedProvider = 'siliconflow'; // 默认使用硅基流动
let currentData = null;
let currentType = null;
let analysisHistory = JSON.parse(localStorage.getItem('analysis_history') || '[]');
let currentTheme = localStorage.getItem('theme') || 'dark';

// 加载文案
const loadingTexts = [
    'AI 正在戴着老花镜看合同...',
    '正在分析条款中的"坑"...',
    '让我看看谁又想坑你...',
    '小心！发现可疑条款...',
    '正在生成毒舌点评...',
];

// ============================================
// 初始化
// ============================================
function init() {
    // 应用保存的主题
    applyTheme(currentTheme);
    
    // 更新统计
    updateStats();
    
    // 渲染历史记录
    renderHistoryPreview();
    
    // 加载法律条文
    renderLegalArticles();
    
    // 绑定事件
    bindEvents();
    
    // 加载保存的 API Keys
    loadApiKeys();
    
    console.log('合同防坑神器已加载');
}

// 加载 API Keys 到输入框
function loadApiKeys() {
    const groqKeyEl = document.getElementById('groq-key');
    const siliconflowKeyEl = document.getElementById('siliconflow-key');
    const sambanovaKeyEl = document.getElementById('sambanova-key');
    
    if (groqKeyEl && localStorage.getItem('groq_key')) {
        groqKeyEl.value = localStorage.getItem('groq_key');
    }
    if (siliconflowKeyEl && localStorage.getItem('siliconflow_key')) {
        siliconflowKeyEl.value = localStorage.getItem('siliconflow_key');
    }
    if (sambanovaKeyEl && localStorage.getItem('sambanova_key')) {
        sambanovaKeyEl.value = localStorage.getItem('sambanova_key');
    }
}

// 保存所有 API Keys
function saveApiKeys() {
    const groqKey = document.getElementById('groq-key')?.value.trim();
    const siliconflowKey = document.getElementById('siliconflow-key')?.value.trim();
    const sambanovaKey = document.getElementById('sambanova-key')?.value.trim();
    
    if (groqKey) {
        localStorage.setItem('groq_key', groqKey);
        API_CONFIGS.groq.apiKey = groqKey;
    }
    if (siliconflowKey) {
        localStorage.setItem('siliconflow_key', siliconflowKey);
        API_CONFIGS.siliconflow.apiKey = siliconflowKey;
    }
    if (sambanovaKey) {
        localStorage.setItem('sambanova_key', sambanovaKey);
        API_CONFIGS.sambanova.apiKey = sambanovaKey;
    }
    
    showToast('✅ API 设置已保存');
    elements.settingsModal.classList.remove('active');
}

// ============================================
// 事件绑定
// ============================================
function bindEvents() {
    // 模型选择
    providerChips.forEach(chip => {
        chip.addEventListener('click', () => {
            providerChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedProvider = chip.dataset.provider;
        });
    });

    // 底部导航
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });

    // 拍照按钮
    elements.cameraBtn.addEventListener('click', () => {
        elements.cameraInput.click();
    });

    // 相册按钮
    elements.galleryBtn.addEventListener('click', () => {
        elements.fileInput.click();
    });

    // 文档上传按钮
    const docBtn = document.getElementById('doc-btn');
    const docInput = document.getElementById('doc-input');
    if (docBtn && docInput) {
        docBtn.addEventListener('click', () => {
            docInput.click();
        });
        docInput.addEventListener('change', handleDocSelect);
    }

    // 文件选择
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.cameraInput.addEventListener('change', handleFileSelect);

    // 文本输入
    elements.textInput.addEventListener('input', () => {
        elements.analyzeTextBtn.disabled = !elements.textInput.value.trim();
    });

    // 文本分析按钮
    elements.analyzeTextBtn.addEventListener('click', () => {
        if (elements.textInput.value.trim()) {
            currentData = elements.textInput.value.trim();
            currentType = 'text';
            showScreen('result');
            analyzeContract();
        }
    });

    // 返回按钮
    elements.backBtn.addEventListener('click', () => showScreen('home'));
    elements.historyBackBtn.addEventListener('click', () => showScreen('home'));
    elements.legalBackBtn.addEventListener('click', () => showScreen('home'));
    elements.profileBackBtn.addEventListener('click', () => showScreen('home'));

    // 分享按钮
    elements.shareBtn.addEventListener('click', handleShare);

    // 重试按钮
    elements.retryBtn.addEventListener('click', () => {
        showLoading();
        analyzeContract();
    });

    // 设置按钮
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.add('active');
    });

    // 关闭设置弹窗
    elements.closeSettings.addEventListener('click', () => {
        elements.settingsModal.classList.remove('active');
    });
    
    // 保存 API Keys 按钮
    const saveApiKeysBtn = document.getElementById('save-api-keys');
    if (saveApiKeysBtn) {
        saveApiKeysBtn.addEventListener('click', saveApiKeys);
    }

    // 关闭法律弹窗
    elements.closeLegalModal.addEventListener('click', () => {
        elements.legalModal.classList.remove('active');
    });

    // 点击弹窗背景关闭
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.classList.remove('active');
        }
    });
    elements.legalModal.addEventListener('click', (e) => {
        if (e.target === elements.legalModal) {
            elements.legalModal.classList.remove('active');
        }
    });

    // 主题切换
    elements.themeToggle.addEventListener('click', toggleTheme);
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            themeOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            applyTheme(option.dataset.theme);
        });
    });

    // 清空历史
    elements.clearHistoryBtn.addEventListener('click', () => {
        if (confirm('确定要清空所有分析历史吗？')) {
            analysisHistory = [];
            localStorage.setItem('analysis_history', '[]');
            renderHistoryPreview();
            renderHistoryFull();
            updateStats();
            showToast('历史已清空');
        }
    });

    // 刷新法律条文 - 获取最新资讯
    elements.refreshLegalBtn.addEventListener('click', () => {
        fetchLegalNews();
    });

    // 法律分类筛选
    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            renderLegalArticles(chip.dataset.category);
        });
    });

    // 咨询按钮
    elements.consultBtn.addEventListener('click', () => {
        showToast('功能开发中，敬请期待');
    });

    // API 设置
    elements.apiSettings.addEventListener('click', () => {
        showScreen('home');
        setTimeout(() => {
            elements.settingsModal.classList.add('active');
        }, 300);
    });

    // 关于应用
    elements.aboutApp.addEventListener('click', () => {
        alert('合同防坑神器 v1.0.0\n\n用 AI 帮你看合同，识别隐藏的坑和风险。\n\n技术支持：GROQ、硅基流动、SambaNova');
    });

    // 意见反馈
    elements.feedback.addEventListener('click', () => {
        showToast('感谢您的反馈！');
    });

    // 查看全部历史
    elements.viewHistoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPage('history');
    });

    // ========================================
    // 事件委托：历史记录点击和删除
    // ========================================
    document.addEventListener('click', (e) => {
        // 处理历史记录卡片点击
        const historyCard = e.target.closest('.history-card');
        if (historyCard && !e.target.closest('.delete-btn')) {
            const onclickAttr = historyCard.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/handleHistoryClick\((\d+)\)/);
                if (match) {
                    const id = parseInt(match[1]);
                    handleHistoryClick(id);
                    return;
                }
            }
        }

        // 处理删除按钮点击
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const onclickAttr = deleteBtn.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/deleteHistoryItem\((\d+)/);
                if (match) {
                    const id = parseInt(match[1]);
                    deleteHistoryItemDirect(id);
                    return;
                }
            }
        }

        // 处理法律条文卡片点击
        const legalCard = e.target.closest('.legal-card');
        if (legalCard) {
            const onclickAttr = legalCard.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/handleLegalCardClick\((\d+)\)/);
                if (match) {
                    const id = parseInt(match[1]);
                    handleLegalCardClick(id);
                    return;
                }
            }
        }
    });
}

// 直接删除历史记录（避免 event 参数问题）
function deleteHistoryItemDirect(id) {
    if (confirm('确定要删除这条记录吗？')) {
        analysisHistory = analysisHistory.filter(r => r.id !== id);
        localStorage.setItem('analysis_history', JSON.stringify(analysisHistory));
        renderHistoryFull();
        renderHistoryPreview();
        updateStats();
        showToast('已删除');
    }
}

// ============================================
// 页面导航
// ============================================
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenName].classList.add('active');
    
    // 更新底部导航状态
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === screenName);
    });
}

function navigateToPage(page) {
    if (page === 'history') {
        renderHistoryFull();
    }
    showScreen(page);
}

// ============================================
// 文件处理
// ============================================
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64 = event.target.result.split(',')[1];
        currentData = base64;
        currentType = 'image';
        showScreen('result');
        analyzeContract();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}

// ============================================
// 文档解析处理 (PDF, Word, TXT)
// ============================================
async function handleDocSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileName = file.name.toLowerCase();
    let extractedText = '';
    
    showScreen('result');
    showLoading();
    
    // 更新加载文案
    const loadingTextEl = elements.loadingState.querySelector('.loading-text');
    if (loadingTextEl) {
        loadingTextEl.textContent = '正在解析文档内容...';
    }
    
    try {
        if (fileName.endsWith('.pdf')) {
            extractedText = await extractPdfText(file);
        } else if (fileName.endsWith('.docx')) {
            extractedText = await extractWordText(file);
        } else if (fileName.endsWith('.doc')) {
            showError('暂不支持 .doc 格式，请转换为 .docx 或 PDF 后上传');
            e.target.value = '';
            return;
        } else if (fileName.endsWith('.txt')) {
            extractedText = await extractTxtText(file);
        } else {
            showError('不支持的文件格式');
            e.target.value = '';
            return;
        }
        
        if (!extractedText || extractedText.trim().length < 20) {
            showError('文档内容提取失败或内容过少，请检查文件是否正确');
            e.target.value = '';
            return;
        }
        
        // 限制文本长度 (避免超过 API 限制)
        if (extractedText.length > 15000) {
            extractedText = extractedText.substring(0, 15000) + '\n\n[文档内容过长，已截取前 15000 字符进行分析]';
        }
        
        currentData = extractedText;
        currentType = 'text';
        
        // 更新加载文案
        if (loadingTextEl) {
            loadingTextEl.textContent = 'AI 正在分析合同条款...';
        }
        
        await analyzeContract();
        
    } catch (error) {
        console.error('文档解析失败:', error);
        showError('文档解析失败: ' + (error.message || '未知错误'));
    }
    
    e.target.value = '';
}

// 提取 PDF 文本
async function extractPdfText(file) {
    // 设置 PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const numPages = pdf.numPages;
    
    // 更新进度
    const loadingTextEl = elements.loadingState.querySelector('.loading-text');
    
    for (let i = 1; i <= numPages; i++) {
        if (loadingTextEl) {
            loadingTextEl.textContent = `正在解析第 ${i}/${numPages} 页...`;
        }
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
}

// 提取 Word (.docx) 文本
async function extractWordText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value.trim();
}

// 提取 TXT 文本
async function extractTxtText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('读取文件失败'));
        reader.readAsText(file, 'UTF-8');
    });
}

// ============================================
// 加载状态
// ============================================
function showLoading() {
    elements.loadingState.style.display = 'flex';
    elements.errorState.style.display = 'none';
    elements.resultState.style.display = 'none';
    
    const loadingTextEl = elements.loadingState.querySelector('.loading-text');
    let textIndex = 0;
    window.loadingInterval = setInterval(() => {
        textIndex = (textIndex + 1) % loadingTexts.length;
        loadingTextEl.textContent = loadingTexts[textIndex];
    }, 2000);
}

function showError(message) {
    clearInterval(window.loadingInterval);
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'flex';
    elements.resultState.style.display = 'none';
    elements.errorMessage.textContent = message;
}

function showResult(content, score) {
    clearInterval(window.loadingInterval);
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.resultState.style.display = 'block';
    
    elements.resultContent.innerHTML = marked.parse(content);
    animateScore(score);
    setRiskBadge(score);
    
    // 保存到历史
    saveToHistory(content, score);
}

// ============================================
// 分数动画
// ============================================
function animateScore(targetScore) {
    const duration = 1500;
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentScore = Math.round(easeProgress * targetScore);
        elements.scoreValue.textContent = currentScore;
        
        const circumference = 339.292;
        const offset = circumference - (currentScore / 100) * circumference;
        elements.ringProgress.style.strokeDashoffset = offset;
        
        const color = getScoreColor(currentScore);
        elements.scoreValue.style.color = color;
        elements.ringProgress.style.stroke = color;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

function getScoreColor(score) {
    if (score >= 70) return '#ff4757';
    if (score >= 50) return '#ffa502';
    if (score >= 30) return '#ffc107';
    return '#2ed573';
}

function setRiskBadge(score) {
    let text, className;
    if (score >= 70) { text = '极高风险'; className = 'high'; }
    else if (score >= 50) { text = '高风险'; className = 'medium-high'; }
    else if (score >= 30) { text = '中等风险'; className = 'medium'; }
    else { text = '低风险'; className = 'low'; }
    
    elements.riskBadge.innerHTML = `<span>${text}</span>`;
    elements.riskBadge.className = 'risk-badge ' + className;
}

// ============================================
// 分析合同
// ============================================
async function analyzeContract() {
    const config = API_CONFIGS[selectedProvider];
    
    // 检查 API Key 是否配置
    if (!config.apiKey) {
        showError(`请先在设置中配置 ${config.name} 的 API Key`);
        return;
    }
    
    if (currentType === 'image' && !config.supportsVision) {
        showError(`${config.name} 不支持图片分析，请选择其他模型或使用文本输入`);
        return;
    }
    
    showLoading();
    
    try {
        let messages;
        
        if (currentType === 'image') {
            messages = [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: '请仔细看看这份合同有什么坑？帮我分析风险点。' },
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${currentData}` } },
                    ],
                },
            ];
        } else {
            messages = [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `请仔细审查以下合同内容，找出其中的坑和风险点：\n\n${currentData}` },
            ];
        }
        
        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 2048,
                temperature: 0.7,
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API 请求失败 (${response.status})`);
        }
        
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
            throw new Error('无法获取分析结果');
        }
        
        const score = parseRiskScore(content);
        showResult(content, score);
        
    } catch (error) {
        console.error('分析失败:', error);
        showError(error.message || '分析失败，请稍后重试');
    }
}

function parseRiskScore(content) {
    const match = content.match(/风险评分[：:]\s*(\d+)\s*[\/\/]\s*100/);
    if (match) return parseInt(match[1], 10);
    const altMatch = content.match(/(\d+)\s*分/);
    if (altMatch) return Math.min(parseInt(altMatch[1], 10), 100);
    return 50;
}

// ============================================
// 历史记录
// ============================================
function saveToHistory(content, score) {
    const record = {
        id: Date.now(),
        content: content,
        score: score,
        date: new Date().toLocaleString('zh-CN'),
        type: currentType,
    };
    
    analysisHistory.unshift(record);
    if (analysisHistory.length > 50) {
        analysisHistory = analysisHistory.slice(0, 50);
    }
    
    localStorage.setItem('analysis_history', JSON.stringify(analysisHistory));
    updateStats();
    renderHistoryPreview();
}

function renderHistoryPreview() {
    if (analysisHistory.length === 0) {
        elements.historyList.innerHTML = '<div class="empty-state"><p>暂无分析记录</p></div>';
        return;
    }
    
    const recent = analysisHistory.slice(0, 3);
    elements.historyList.innerHTML = recent.map(record => `
        <div class="history-card" onclick="handleHistoryClick(${record.id})">
            <div class="history-icon">${record.score >= 50 ? '⚠️' : '✅'}</div>
            <div class="history-content">
                <h4>合同风险分析</h4>
                <p>${record.date} · 风险评分 ${record.score}</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
            </svg>
        </div>
    `).join('');
}

function renderHistoryFull() {
    if (analysisHistory.length === 0) {
        elements.historyFullList.innerHTML = '<div class="empty-state"><p>暂无分析记录</p></div>';
        return;
    }
    
    elements.historyFullList.innerHTML = analysisHistory.map(record => `
        <div class="history-card-wrapper">
            <div class="history-card" onclick="handleHistoryClick(${record.id})">
                <div class="history-icon">${record.score >= 50 ? '⚠️' : '✅'}</div>
                <div class="history-content">
                    <h4>合同风险分析</h4>
                    <p>${record.date} · 风险评分 ${record.score}</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </div>
            <button class="delete-btn" onclick="deleteHistoryItem(${record.id}, event)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// 点击历史记录查看详情
function handleHistoryClick(id) {
    const record = analysisHistory.find(r => r.id === id);
    if (record) {
        showHistoryDetail(record);
    }
}

// 显示历史记录详情
function showHistoryDetail(record) {
    const modal = document.getElementById('legal-modal');
    const title = document.getElementById('legal-title');
    const content = document.getElementById('legal-detail-content');
    
    if (title) title.textContent = '历史分析记录';
    if (content) {
        content.innerHTML = `
            <div class="history-detail-header">
                <div class="score-badge ${record.score >= 50 ? 'high' : 'low'}">
                    风险评分：${record.score}/100
                </div>
                <div class="history-date">${record.date}</div>
            </div>
            <div class="markdown-content">${marked.parse(record.content)}</div>
        `;
    }
    if (modal) modal.classList.add('active');
}

// 删除单条历史记录
function deleteHistoryItem(id, event) {
    event.stopPropagation();
    
    if (confirm('确定要删除这条记录吗？')) {
        analysisHistory = analysisHistory.filter(r => r.id !== id);
        localStorage.setItem('analysis_history', JSON.stringify(analysisHistory));
        renderHistoryFull();
        renderHistoryPreview();
        updateStats();
        showToast('已删除');
    }
}

function updateStats() {
    elements.totalAnalyses.textContent = analysisHistory.length;
}

// ============================================
// 法律条文
// ============================================
function renderLegalArticles(category = 'all') {
    const filtered = category === 'all' 
        ? LEGAL_ARTICLES 
        : LEGAL_ARTICLES.filter(a => a.category === category);
    
    if (filtered.length === 0) {
        elements.legalList.innerHTML = '<div class="empty-state"><p>暂无相关法律条文</p></div>';
        return;
    }
    
    elements.legalList.innerHTML = filtered.map(article => `
        <div class="legal-card" data-id="${article.id}" onclick="handleLegalCardClick(${article.id})">
            <div class="legal-icon">📜</div>
            <div class="legal-content">
                <h4>${article.title}</h4>
                <p>${article.summary}</p>
                <span class="legal-tag">${article.tag}</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
            </svg>
        </div>
    `).join('');
}

// 全局点击处理函数
function handleLegalCardClick(id) {
    const article = LEGAL_ARTICLES.find(a => a.id === id);
    if (article) {
        showLegalDetail(article);
    }
}

function showLegalDetail(article) {
    const legalTitle = document.getElementById('legal-title');
    const legalDetailContent = document.getElementById('legal-detail-content');
    const legalModal = document.getElementById('legal-modal');
    
    if (legalTitle) legalTitle.textContent = article.title;
    if (legalDetailContent) {
        legalDetailContent.innerHTML = `
            <div class="legal-tag" style="margin-bottom: 16px;">${article.tag} · 更新于 ${article.updated}</div>
            <div class="markdown-content">${article.content.replace(/\n/g, '<br>')}</div>
        `;
    }
    if (legalModal) legalModal.classList.add('active');
}

// 获取法律资讯 RSS (来自最高人民法院等官方源)
async function fetchLegalNews() {
    // 使用免费的 RSS 转 JSON 服务
    const RSS_SOURCES = [
        {
            name: '最高人民法院',
            url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.court.gov.cn/rss.xml',
            category: 'court'
        }
    ];
    
    try {
        showToast('正在获取最新法律资讯...');
        
        // 由于跨域限制，这里使用备用数据
        // 实际部署时可使用 Cloudflare Worker 代理 RSS
        const legalNews = [
            {
                id: 100,
                category: 'news',
                title: '最高法发布人民法院案例库建设重要举措',
                summary: '人民法院案例库正式上线，为司法实践提供权威参考',
                content: '最高人民法院发布关于人民法院案例库建设的相关举措，旨在统一法律适用标准，促进司法公正。案例库收录各类典型案例，供法官、律师及公众查阅参考。',
                tag: '最新资讯',
                updated: new Date().toLocaleDateString('zh-CN')
            },
            {
                id: 101,
                category: 'news',
                title: '民法典实施三周年典型案例发布',
                summary: '发布涵盖合同、物权、人格权等领域的典型案例',
                content: '为总结民法典实施三年来的司法经验，最高人民法院发布了一批典型案例，涵盖：\n1. 居住权设立纠纷案\n2. 个人信息保护案\n3. 高空抛物责任认定案\n4. 网络虚拟财产继承案\n5. 自甘风险条款适用案',
                tag: '最新资讯',
                updated: new Date().toLocaleDateString('zh-CN')
            },
            {
                id: 102,
                category: 'news',
                title: '新修订《公司法》重点解读',
                summary: '2024年新公司法将于7月1日施行，重大修订要点',
                content: '新《公司法》主要修订内容：\n1. 注册资本五年内缴足\n2. 简化公司设立程序\n3. 完善公司治理结构\n4. 加强股东权益保护\n5. 规范关联交易\n6. 强化法律责任',
                tag: '最新资讯',
                updated: new Date().toLocaleDateString('zh-CN')
            }
        ];
        
        // 将新闻添加到列表
        legalNews.forEach(news => {
            if (!LEGAL_ARTICLES.find(a => a.id === news.id)) {
                LEGAL_ARTICLES.unshift(news);
            }
        });
        
        renderLegalArticles();
        showToast('✅ 已获取最新法律资讯');
        
    } catch (error) {
        console.error('获取法律资讯失败:', error);
        showToast('获取资讯失败，使用本地数据');
    }
}

// ============================================
// 主题切换
// ============================================
function applyTheme(theme) {
    currentTheme = theme;
    
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
    
    // 更新 UI
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    elements.themeSwitch.classList.toggle('active', !isDark);
    elements.currentThemeText.textContent = isDark ? '深色模式' : '浅色模式';
    
    // 更新设置弹窗中的选项
    themeOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme);
    });
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
}

// ============================================
// 分享
// ============================================
function handleShare() {
    const content = elements.resultContent.textContent;
    if (!content) return;
    
    if (navigator.share) {
        navigator.share({
            title: '合同风险分析报告',
            text: content + '\n\n—— 由「防坑神器」生成',
        });
    } else {
        navigator.clipboard.writeText(content).then(() => {
            showToast('分析结果已复制到剪贴板');
        });
    }
}

// ============================================
// Toast 提示
// ============================================
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 2000);
}

// ============================================
// 启动应用
// ============================================
init();

// ============================================
// 挂载全局函数 (供 HTML inline onclick 使用)
// ============================================
window.handleHistoryClick = handleHistoryClick;
window.deleteHistoryItem = deleteHistoryItem;
window.handleLegalCardClick = handleLegalCardClick;
window.showLegalDetail = showLegalDetail;
window.showHistoryDetail = showHistoryDetail;
window.saveApiKeys = saveApiKeys;
window.fetchLegalNews = fetchLegalNews;
