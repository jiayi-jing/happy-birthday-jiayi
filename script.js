// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
    // 主题配置
    const CURRENT_THEME = {
        musicSrc: "不将就 - 李荣浩.mp3",
        musicName: "不将就",
        gradients: [
            ['#ff758c', '#ff7eb3'],
            ['#a18cd1', '#fbc2eb'],
            ['#f6d365', '#fda085'],
            ['#84fab0', '#8fd3f4'],
            ['#4facfe', '#00f2fe'],
            ['#43e97b', '#38f9d7'],
            ['#fa709a', '#fee140'],
            ['#5ee7df', '#b490ca']
        ],
        tips: [
            '佳怡，你是我心中的光',
            '司佳怡，遇见你是我的幸运',
            '佳怡的微笑让我心动',
            '司佳怡，喜欢你的一切',
            '佳怡，想和你一直在一起',
            '司佳怡，你是我最珍贵的礼物',
            '佳怡，我的目光只追随你',
            '司佳怡，你让世界变得美好',
            '豆豆，你是我最甜的梦',
            '豆豆的笑温暖我心',
            '豆豆，想一直守护你',
            '豆豆是我最爱的小名',
            '豆豆，你的可爱无法抗拒',
            '豆豆，每天都想见到你',
            '豆豆，你是我心中最特别的存在',
            '豆豆，遇见你真好',
            '心动就在一瞬间',
            '你的温柔让我沉醉',
            '想和你分享每一天',
            '有你的世界很美好',
            '你是我最想靠近的人',
            '喜欢你没道理',
            '你让平凡的日子发光',
            '想和你一起看星星',
            '你的存在让我幸福',
            '每次想起你都会笑',
            '你是我心中最柔软的角落',
            '愿时光温柔待你',
            '想牵着你的手不放开',
            '你是我最美的意外'
        ]
    };

    // 配置
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const C = {
        TOTAL: isMobile ? 100 : 180,
        MSG_DELAY: 0.15,
        MSG_RAND: 0.4,
        HEART: isMobile ? 10 : 14,
    };

    // 获取DOM元素
    const stage = document.getElementById('stage');
    const replay = document.getElementById('replay');
    const musicControl = document.getElementById('musicControl');
    const musicName = document.getElementById('musicName');
    const memoriesBtn = document.getElementById('memoriesBtn');

    let animationPlaying = true;
    let musicPlaying = false;
    let lastMsg = null;

    // 创建音乐元素
    const music = document.createElement('audio');
    music.loop = true;
    music.innerHTML = `<source src="${CURRENT_THEME.musicSrc}" type="audio/mpeg">`;
    music.preload = 'metadata';
    document.body.appendChild(music);

    // 飞行方向
    const baseDistance = isMobile ? '50vw' : '70vw';
    const dirs = [
        { dx: '0vw', dy: `-${baseDistance}` },
        { dx: '0vw', dy: baseDistance },
        { dx: `-${baseDistance}`, dy: '0vh' },
        { dx: baseDistance, dy: '0vh' },
        { dx: `-${isMobile ? '40vw' : '60vw'}`, dy: `-${isMobile ? '40vw' : '60vw'}` },
        { dx: `${isMobile ? '40vw' : '60vw'}`, dy: `-${isMobile ? '40vw' : '60vw'}` }
    ];

    // 工具函数
    const rand = (min, max) => Math.random() * (max - min) + min;

    const randGrad = () => {
        const g = CURRENT_THEME.gradients;
        return `linear-gradient(135deg,${g[Math.floor(Math.random() * g.length)]})`;
    };

    const heart = (t) => ({
        x: C.HEART * (16 * Math.sin(t) ** 3) + 'px',
        y: -C.HEART * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) + 'px'
    });

    // 创建消息元素
    function createMsg(i, t) {
        const e = document.createElement('div');
        e.className = 'msg';
        
        if (i === t - 1) {
            e.classList.add('last-one');
            lastMsg = e;
        }

        const d = dirs[Math.floor(Math.random() * dirs.length)];
        const duration = rand(isMobile ? 5 : 5.5, isMobile ? 6.5 : 7) + 's';

        e.style.setProperty('--dx', d.dx);
        e.style.setProperty('--dy', d.dy);
        e.style.setProperty('--rot', rand(-45, 45) + 'deg');
        e.style.setProperty('--dur', duration);
        e.style.setProperty('--delay', (i * C.MSG_DELAY + rand(0, C.MSG_RAND)) + 's');
        e.style.setProperty('--bg', randGrad());

        const h = heart(i / t * Math.PI * 2);
        e.style.setProperty('--heart-x', h.x);
        e.style.setProperty('--heart-y', h.y);
        e.style.setProperty('--heart-rot', rand(-15, 15) + 'deg');

        const s = document.createElement('span');
        s.className = 'text';
        s.textContent = CURRENT_THEME.tips[Math.floor(Math.random() * CURRENT_THEME.tips.length)];
        e.appendChild(s);

        const timer = setTimeout(() => {
            if (animationPlaying && !e.classList.contains('last-one')) {
                e.classList.add('heart-mode');
            }
        }, 1000 * (
            parseFloat(e.style.getPropertyValue('--delay')) +
            parseFloat(e.style.getPropertyValue('--dur')) * 0.85
        ));

        e.addEventListener('animationend', () => {
            clearTimeout(timer);
            if (animationPlaying) {
                e.classList.add('locked', 'pulse');
                if (!e.classList.contains('last-one')) e.classList.add('heart-mode');
            }
        }, { once: true });

        return e;
    }

    // 清除所有消息
    function clearAllMessages() {
        stage.querySelectorAll('.msg').forEach(n => n.remove());
        lastMsg = null;
    }

    // 重新播放动画
    function replayAll() {
        clearAllMessages();
        animationPlaying = true;

        const batchSize = isMobile ? 25 : 50;
        let currentBatch = 0;

        function createBatch() {
            const fragment = document.createDocumentFragment();
            const start = currentBatch * batchSize;
            const end = Math.min(start + batchSize, C.TOTAL);

            for (let i = start; i < end; i++) {
                fragment.appendChild(createMsg(i, C.TOTAL));
            }
            stage.appendChild(fragment);

            currentBatch++;
            if (currentBatch * batchSize < C.TOTAL) {
                setTimeout(createBatch, 50);
            }
        }

        createBatch();

        if (musicPlaying) {
            music.currentTime = 0;
            music.play().catch(e => console.log("重新播放音乐:", e));
        }
    }

    // 更新音乐显示
    function updateMusic() {
        musicName.textContent = `${musicPlaying ? '当前播放' : '已暂停'}：《${CURRENT_THEME.musicName}》`;
    }

    // 切换音乐播放状态
    function toggleMusic() {
        if (musicPlaying) {
            music.pause();
            musicControl.textContent = '播放音乐';
        } else {
            music.play().catch(e => {
                console.log("音乐播放错误:", e);
                alert('请先点击页面任意位置，然后点击播放音乐按钮');
            });
            musicControl.textContent = '暂停音乐';
        }
        musicPlaying = !musicPlaying;
        updateMusic();
    }

    // 初始化
    function init() {
        // 隐藏回忆按钮（根据需求可改为显示）
        memoriesBtn.classList.add('hidden');
        
        // 启动动画
        replayAll();
        
        // 初始化音乐状态
        musicPlaying = false;
        musicControl.textContent = '播放音乐';
        updateMusic();

        // 绑定事件
        replay.addEventListener('click', replayAll);
        musicControl.addEventListener('click', toggleMusic);

        // 移动端触摸事件
        replay.addEventListener('touchend', (e) => {
            e.preventDefault();
            replayAll();
        });
        
        musicControl.addEventListener('touchend', (e) => {
            e.preventDefault();
            toggleMusic();
        });

        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    // 启动初始化
    init();
});