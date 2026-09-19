const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

document.getElementById('start-btn').addEventListener('click', async () => {
    // 隐藏开始按钮
    const controls = document.getElementById('controls');
    controls.style.opacity = '0';
    await wait(300);
    controls.style.display = 'none';
    
    // 获取场景元素
    const scene1 = document.getElementById('scene-1');
    const scene2 = document.getElementById('scene-2');
    const scene3 = document.getElementById('scene-3');
    const scene4 = document.getElementById('scene-4');
    const timeline = document.getElementById('timeline');

    // ========== 场景 1: 独白引言 ==========
    scene1.classList.add('active');
    
    const s1Text1 = document.getElementById('s1-text1');
    const s1Text2 = document.getElementById('s1-text2');
    
    await wait(800); // 留出呼吸时间
    s1Text1.classList.add('show');
    await wait(2500); // 保持显示
    s1Text1.classList.remove('show');
    s1Text1.classList.add('hide');
    
    await wait(1200);
    s1Text2.classList.add('show');
    await wait(2500);
    s1Text2.classList.remove('show');
    s1Text2.classList.add('hide');
    
    await wait(1500);
    scene1.classList.remove('active');

    // ========== 场景 2: 快速闪烁 ==========
    scene2.classList.add('active');
    const wordFlash = document.getElementById('word-flash');
    const words = ["V.W.P", "KAF", "RIM", "HARUSARU", "ITE", "COCO", "OBSERVATION", "SYNCHRONIZE", "KAMITSUBAKI"];
    
    // 全局开启画面抖动
    document.body.classList.add('glitch-screen');
    
    for (let word of words) {
        wordFlash.innerText = word;
        await wait(100); // 极快的闪烁，配合鼓点节奏
    }
    
    document.body.classList.remove('glitch-screen');
    wordFlash.innerText = "";
    scene2.classList.remove('active');

    // ========== 场景 3 & 4: 主视觉展示 ==========
    // 触发主标题和背景线框
    timeline.classList.add('scene-active-4'); 
    scene3.classList.add('active');
    scene4.classList.add('active');

    const titleContainer = document.getElementById('title-container');
    titleContainer.classList.add('show');

    // 打字机效果处理
    await wait(2500); // 等待主标题完全稳定
    const twText = document.getElementById('typewriter-text');
    
    async function typeWriter(text, speed) {
        twText.innerHTML = "";
        for (let i = 0; i < text.length; i++) {
            twText.innerHTML += text.charAt(i);
            await wait(speed);
        }
    }

    await typeWriter("INITIALIZING OBSERVATION DATA...", 40);
    await wait(1000);
    await typeWriter("DATA SYNC COMPLETE.", 30);
    await wait(1500);
    await typeWriter("CONNECTING TO KAMITSUBAKI FAN WIKI...", 40);
    
    // 动画序列结束，停留在最后一帧供录屏使用
});
