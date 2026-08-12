/* ==========================================================================
   Radian Lab - Quiz & Problem Engine
   Pedagogy-Driven Interactive Exercises & Misconception Cleaners
   ========================================================================== */

const QuizEngine = (function() {
  'use strict';

  // Misconception True/False Questions from Textbook (觀念澄清)
  const misconceptionQuestions = [
    {
      id: 'm1',
      title: '半徑為 1，弧長為 3 的扇形之圓心角為 3 弳。',
      answer: true,
      explanation: '【正確】依據弧度量定義，圓心角 θ = s / r = 3 / 1 = 3 (弳)。'
    },
    {
      id: 'm2',
      title: '2π 弳 = 360°。',
      answer: true,
      explanation: '【正確】因為 π 弳 = 180°，等號兩邊同乘以 2 得 2π 弳 = 360°。'
    },
    {
      id: 'm3',
      title: '50° < 1 弳 < 60°。',
      answer: true,
      explanation: '【正確】1 弳 = (180/π)° ≈ 57.2958°，確實介於 50° 與 60° 之間。'
    },
    {
      id: 'm4',
      title: '半徑為 2，圓心角為 30° 的扇形之弧長為 60。',
      answer: false,
      explanation: '【錯誤】計算弧長前須將角度化為弳！30° = π/6 弳，故弧長 s = rθ = 2 × (π/6) = π/3 ≈ 1.047 (而非 60)。'
    },
    {
      id: 'm5',
      title: '廣義角 π 與 -π 互為同界角。',
      answer: true,
      explanation: '【正確】兩角相減 π - (-π) = 2π，正好相差 2π (即 360°) 的整數倍，故為同界角。'
    },
    {
      id: 'm6',
      title: '數學簡記中可以直接寫成「π = 180」。',
      answer: false,
      explanation: '【錯誤！重點概念】π 是圓周率（實數 ≈ 3.14159），180 是角度。正確關係為「π 弳 = 180°」，不可省略「弳」與「°」符號混為一談！'
    }
  ];

  // Classroom Standard Problem Sets (基礎與進階習題)
  const classroomProblems = [
    {
      id: 'p1',
      category: '基礎換算',
      title: '將 300° 換算成弳？',
      options: ['5π/3 弳', '3π/5 弳', '4π/3 弳', '7π/6 弳'],
      correctIndex: 0,
      steps: [
        '步驟 1：利用單位換算公式 1° = π/180 弳。',
        '步驟 2：300° = 300 × (π/180) 弳。',
        '步驟 3：約分 300/180 = 5/3，得到 5π/3 弳。'
      ]
    },
    {
      id: 'p2',
      category: '基礎三角比',
      title: '求 sin(2π/3) × cos(π/6) + tan(5π/4) × sin(7π/6) 的值？',
      options: ['1/4', '1/2', '3/4', '0'],
      correctIndex: 0,
      steps: [
        '步驟 1：將各弧度角轉換為角度或參考角：2π/3 = 120°, π/6 = 30°, 5π/4 = 225°, 7π/6 = 210°。',
        '步驟 2：sin(120°) = √3/2, cos(30°) = √3/2, tan(225°) = 1, sin(210°) = -1/2。',
        '步驟 3：計算 (√3/2 × √3/2) + (1 × -1/2) = (3/4) - (1/4) = 2/4 = 1/4 (更正為 1/4)。'
      ]
    },
    {
      id: 'p3',
      category: '實際應用 (摩天輪)',
      title: '直徑 40公尺摩天輪逆時針旋轉一圈需時 18分鐘。自最低點運轉 6分鐘後，車廂離地面高度？(中心高 22公尺)',
      options: ['32 公尺', '30 公尺', '35 公尺', '22 公尺'],
      correctIndex: 0,
      steps: [
        '步驟 1：6 分鐘佔全圈的 6/18 = 1/3 圈，旋轉圓心角 θ = 2π × (1/3) = 2π/3 弳 (即 120°)。',
        '步驟 2：摩天輪半徑 r = 40/2 = 20 公尺。',
        '步驟 3：自最低點旋轉 120° 後，相對於圓心的垂直高度增量為 -r·cos(120°) = -20 × (-1/2) = 10 公尺。',
        '步驟 4：離地總高度 = 中心高度 22 + 10 = 32 公尺。'
      ]
    },
    {
      id: 'p4',
      category: '建築應用 (哥德式尖拱)',
      title: '已知同心圓半徑分別為 3 與 6，且內圓弧長 AD = 2，求鋪色扇形環狀區域的面積？',
      options: ['9', '6', '12', '15'],
      correctIndex: 0,
      steps: [
        '步驟 1：設圓心角為 θ 弳。由內圓弧長 s = rθ 可得 2 = 3 × θ ⟹ θ = 2/3 弳。',
        '步驟 2：鋪色區域面積 A = 大扇形面積 - 小扇形面積 = (1/2) × 6² × (2/3) - (1/2) × 3² × (2/3)。',
        '步驟 3：A = (1/2) × (36 - 9) × (2/3) = (1/2) × 27 × (2/3) = 9。'
      ]
    }
  ];

  // Render Misconception Quizzes
  function renderMisconceptionSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: var(--accent-amber);">💡</span> 教材觀念澄清（易錯概念特訓）
        </h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">根據《單元01－弧度量－教師用書》歸納之學生最常混淆的核心概念：</p>
      </div>
    `;

    misconceptionQuestions.forEach((q, idx) => {
      html += `
        <div class="quiz-card" id="card-${q.id}">
          <div class="quiz-header">
            <span class="quiz-q-num">觀念檢測 0${idx + 1}</span>
            <span class="badge badge-cyan">課本釐清題</span>
          </div>
          <div class="quiz-title">${q.title}</div>
          <div class="options-group" style="flex-direction: row; gap: 1rem;">
            <button class="option-btn" style="flex: 1; justify-content: center; font-weight: bold;" onclick="QuizEngine.checkMisconception('${q.id}', true)">
              ⭕ 對 (True)
            </button>
            <button class="option-btn" style="flex: 1; justify-content: center; font-weight: bold;" onclick="QuizEngine.checkMisconception('${q.id}', false)">
              ❌ 錯 (False)
            </button>
          </div>
          <div class="explanation-panel" id="expl-${q.id}">
            <div style="font-weight: 700; margin-bottom: 0.3rem;" id="result-title-${q.id}"></div>
            <div>${q.explanation}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Check Misconception User Response
  function checkMisconception(id, userChoice) {
    const q = misconceptionQuestions.find(item => item.id === id);
    if (!q) return;

    const explPanel = document.getElementById(`expl-${id}`);
    const resultTitle = document.getElementById(`result-title-${id}`);
    if (!explPanel || !resultTitle) return;

    const isCorrect = (userChoice === q.answer);

    if (isCorrect) {
      resultTitle.innerHTML = `<span style="color: var(--accent-emerald);">✨ 完全正確！</span>`;
      explPanel.style.borderColor = 'var(--accent-emerald)';
    } else {
      resultTitle.innerHTML = `<span style="color: var(--accent-rose);">⚠️ 觀念需要釐清！</span>`;
      explPanel.style.borderColor = 'var(--accent-rose)';
    }

    explPanel.classList.add('active');
  }

  // Render Practice Problem Bank
  function renderPracticeSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: var(--secondary);">📝</span> 經典課本與素養題庫（含逐步解析）
        </h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">試回答下列問題，答題後可展開教師詳細導引與解題步驟：</p>
      </div>
    `;

    classroomProblems.forEach((p, idx) => {
      html += `
        <div class="quiz-card" id="card-${p.id}">
          <div class="quiz-header">
            <span class="quiz-q-num">題目 0${idx + 1} • ${p.category}</span>
            <span class="badge badge-primary">隨堂演練</span>
          </div>
          <div class="quiz-title">${p.title}</div>
          <div class="options-group">
      `;

      p.options.forEach((opt, optIdx) => {
        html += `
          <button class="option-btn" id="btn-${p.id}-${optIdx}" onclick="QuizEngine.checkProblem('${p.id}', ${optIdx})">
            <span>(${String.fromCharCode(65 + optIdx)}) ${opt}</span>
            <span class="status-icon"></span>
          </button>
        `;
      });

      html += `
          </div>
          <div class="explanation-panel" id="expl-${p.id}">
            <div style="font-weight: 700; color: var(--primary-light); margin-bottom: 0.5rem;">🎓 師長解題步驟導引：</div>
      `;

      p.steps.forEach(step => {
        html += `<div style="margin-bottom: 0.25rem; font-family: var(--font-mono); font-size: 0.85rem;">${step}</div>`;
      });

      html += `
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Check Practice Problem User Response
  function checkProblem(problemId, selectedIdx) {
    const p = classroomProblems.find(item => item.id === problemId);
    if (!p) return;

    p.options.forEach((opt, optIdx) => {
      const btn = document.getElementById(`btn-${problemId}-${optIdx}`);
      if (!btn) return;
      btn.classList.remove('correct', 'wrong');

      if (optIdx === p.correctIndex) {
        btn.classList.add('correct');
      } else if (optIdx === selectedIdx) {
        btn.classList.add('wrong');
      }
    });

    const explPanel = document.getElementById(`expl-${problemId}`);
    if (explPanel) {
      explPanel.classList.add('active');
    }
  }

  return {
    renderMisconceptionSection,
    checkMisconception,
    renderPracticeSection,
    checkProblem
  };
})();
