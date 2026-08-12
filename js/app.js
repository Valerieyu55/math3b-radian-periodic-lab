/* ==========================================================================
   Radian Lab - Main Application Controller
   App Router, State Management, Calculator Engine & Classroom Mode
   ========================================================================== */

(function() {
  'use strict';

  // Application State
  const AppState = {
    currentTab: 'tab-definition',
    classroomMode: false,
    
    // Tab 1 state
    defRadius: 100,
    defThetaRad: 1.0,
    defUnrollProgress: 0,
    
    // Tab 2 state
    convThetaDeg: 60,
    convThetaRad: Math.PI / 3,

    // Tab 3 state
    sectorRadius: 10,
    sectorThetaRad: Math.PI / 3,

    // Tab 4 state
    gothicMode: 'gothic',
    gothicR: 150,
    gothicSpan: 150,

    // Tab 5 state
    trigThetaRad: Math.PI / 4,
    calcMode: 'RAD', // 'RAD' or 'DEG'
    calcExpression: '',
    calcDisplay: '0'
  };

  // Initialize App on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initControls();
    initCalculator();
    
    // Render initial quizzes
    QuizEngine.renderMisconceptionSection('misconception-container');
    QuizEngine.renderPracticeSection('practice-container');

    // Trigger initial canvas rendering
    renderAllActiveCanvases();

    window.addEventListener('resize', () => {
      renderAllActiveCanvases();
    });
  });

  // Navigation Controller
  function initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = tab.getAttribute('data-tab');
        if (!targetTab) return;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.section-content').forEach(sec => {
          sec.classList.remove('active');
        });

        const activeSec = document.getElementById(targetTab);
        if (activeSec) {
          activeSec.classList.add('active');
          AppState.currentTab = targetTab;
          setTimeout(renderAllActiveCanvases, 50);
        }
      });
    });

    // Classroom Mode Toggle
    const btnClassroom = document.getElementById('btn-classroom-toggle');
    if (btnClassroom) {
      btnClassroom.addEventListener('click', () => {
        AppState.classroomMode = !AppState.classroomMode;
        document.body.classList.toggle('classroom-mode', AppState.classroomMode);
        btnClassroom.innerHTML = AppState.classroomMode ? '☀️ 退出課堂模式' : '🖥️ 課堂簡報模式';
        renderAllActiveCanvases();
      });
    }
  }

  // Interactive Sliders & Controls Setup
  function initControls() {
    // --- TAB 1: DEFINITION ---
    const sliderDefTheta = document.getElementById('slider-def-theta');
    const valDefThetaRad = document.getElementById('val-def-theta-rad');
    const valDefThetaDeg = document.getElementById('val-def-theta-deg');
    const sliderUnroll = document.getElementById('slider-unroll');
    const valUnrollPercent = document.getElementById('val-unroll-percent');

    if (sliderDefTheta) {
      sliderDefTheta.addEventListener('input', (e) => {
        const rad = parseFloat(e.target.value);
        AppState.defThetaRad = rad;
        if (valDefThetaRad) valDefThetaRad.textContent = rad.toFixed(2);
        if (valDefThetaDeg) valDefThetaDeg.textContent = (rad * 180 / Math.PI).toFixed(1) + '°';
        MathCanvas.renderDefinition('canvas-definition', AppState);
      });
    }

    if (sliderUnroll) {
      sliderUnroll.addEventListener('input', (e) => {
        const progress = parseFloat(e.target.value) / 100;
        AppState.defUnrollProgress = progress;
        if (valUnrollPercent) valUnrollPercent.textContent = Math.round(progress * 100) + '%';
        MathCanvas.renderDefinition('canvas-definition', AppState);
      });
    }

    // --- TAB 2: QUADRANT & CONVERTER ---
    const sliderDeg = document.getElementById('slider-deg');
    const valDeg = document.getElementById('val-deg');
    const valRadExpr = document.getElementById('val-rad-expr');

    if (sliderDeg) {
      sliderDeg.addEventListener('input', (e) => {
        const deg = parseFloat(e.target.value);
        AppState.convThetaDeg = deg;
        AppState.convThetaRad = deg * Math.PI / 180;
        if (valDeg) valDeg.textContent = deg + '°';
        if (valRadExpr) valRadExpr.textContent = (deg / 180).toFixed(3) + ' π 弳';
        MathCanvas.renderQuadrant('canvas-quadrant', AppState);
      });
    }

    // --- TAB 3: SECTOR LAB ---
    const sliderSectorR = document.getElementById('slider-sector-r');
    const valSectorR = document.getElementById('val-sector-r');
    const sliderSectorTheta = document.getElementById('slider-sector-theta');
    const valSectorThetaRad = document.getElementById('val-sector-theta-rad');

    if (sliderSectorR) {
      sliderSectorR.addEventListener('input', (e) => {
        const r = parseFloat(e.target.value);
        AppState.sectorRadius = r;
        if (valSectorR) valSectorR.textContent = r;
        MathCanvas.renderSectorLab('canvas-sector', AppState);
      });
    }

    if (sliderSectorTheta) {
      sliderSectorTheta.addEventListener('input', (e) => {
        const rad = parseFloat(e.target.value);
        AppState.sectorThetaRad = rad;
        if (valSectorThetaRad) valSectorThetaRad.textContent = rad.toFixed(2) + ' rad';
        MathCanvas.renderSectorLab('canvas-sector', AppState);
      });
    }

    // --- TAB 4: GOTHIC ARCH & ERATOSTHENES ---
    const btnModeGothic = document.getElementById('btn-mode-gothic');
    const btnModeErato = document.getElementById('btn-mode-erato');

    if (btnModeGothic && btnModeErato) {
      btnModeGothic.addEventListener('click', () => {
        AppState.gothicMode = 'gothic';
        btnModeGothic.classList.add('active');
        btnModeErato.classList.remove('active');
        MathCanvas.renderGothicArch('canvas-gothic', AppState);
      });

      btnModeErato.addEventListener('click', () => {
        AppState.gothicMode = 'eratosthenes';
        btnModeErato.classList.add('active');
        btnModeGothic.classList.remove('active');
        MathCanvas.renderGothicArch('canvas-gothic', AppState);
      });
    }

    const sliderGothicR = document.getElementById('slider-gothic-r');
    const valGothicR = document.getElementById('val-gothic-r');
    if (sliderGothicR) {
      sliderGothicR.addEventListener('input', (e) => {
        const r = parseFloat(e.target.value);
        AppState.gothicR = r;
        if (valGothicR) valGothicR.textContent = r;
        MathCanvas.renderGothicArch('canvas-gothic', AppState);
      });
    }

    // --- TAB 5: TRIG RATIOS ---
    const sliderTrigTheta = document.getElementById('slider-trig-theta');
    const valTrigThetaRad = document.getElementById('val-trig-theta-rad');
    if (sliderTrigTheta) {
      sliderTrigTheta.addEventListener('input', (e) => {
        const rad = parseFloat(e.target.value);
        AppState.trigThetaRad = rad;
        if (valTrigThetaRad) valTrigThetaRad.textContent = rad.toFixed(2) + ' rad';
        MathCanvas.renderTrig('canvas-trig', AppState);
      });
    }
  }

  // Calculator Simulator Controller (Textbook page 13-14 simulator)
  function initCalculator() {
    const displayVal = document.getElementById('calc-display-val');
    const modeVal = document.getElementById('calc-mode-val');
    const btnToggleMode = document.getElementById('calc-btn-mode');

    if (btnToggleMode) {
      btnToggleMode.addEventListener('click', () => {
        AppState.calcMode = AppState.calcMode === 'RAD' ? 'DEG' : 'RAD';
        if (modeVal) modeVal.textContent = AppState.calcMode;
        btnToggleMode.textContent = `模式: ${AppState.calcMode}`;
      });
    }

    const calcKeys = document.querySelectorAll('.calc-key');
    calcKeys.forEach(key => {
      key.addEventListener('click', () => {
        const val = key.getAttribute('data-val');
        const action = key.getAttribute('data-action');

        if (action === 'clear') {
          AppState.calcExpression = '';
          AppState.calcDisplay = '0';
        } else if (action === 'equals') {
          evaluateCalculator();
        } else if (val) {
          AppState.calcExpression += val;
          AppState.calcDisplay = AppState.calcExpression;
        }

        if (displayVal) displayVal.textContent = AppState.calcDisplay || '0';
      });
    });
  }

  // Safe Math Expression Evaluation for Calculator
  function evaluateCalculator() {
    try {
      let expr = AppState.calcExpression;
      if (!expr) return;

      // Handle trigonometric functions in RAD vs DEG
      expr = expr.replace(/sin\(([^)]+)\)/g, (match, p1) => {
        const angle = eval(p1.replace(/π/g, 'Math.PI'));
        const rad = AppState.calcMode === 'DEG' ? (angle * Math.PI / 180) : angle;
        return Math.sin(rad);
      });

      expr = expr.replace(/cos\(([^)]+)\)/g, (match, p1) => {
        const angle = eval(p1.replace(/π/g, 'Math.PI'));
        const rad = AppState.calcMode === 'DEG' ? (angle * Math.PI / 180) : angle;
        return Math.cos(rad);
      });

      expr = expr.replace(/tan\(([^)]+)\)/g, (match, p1) => {
        const angle = eval(p1.replace(/π/g, 'Math.PI'));
        const rad = AppState.calcMode === 'DEG' ? (angle * Math.PI / 180) : angle;
        return Math.tan(rad);
      });

      expr = expr.replace(/π/g, 'Math.PI');

      const result = eval(expr);
      AppState.calcDisplay = Number.isInteger(result) ? result.toString() : result.toFixed(5);
    } catch (err) {
      AppState.calcDisplay = 'Error';
    }
  }

  // Render all canvases corresponding to currently visible section
  function renderAllActiveCanvases() {
    MathCanvas.renderDefinition('canvas-definition', AppState);
    MathCanvas.renderQuadrant('canvas-quadrant', AppState);
    MathCanvas.renderSectorLab('canvas-sector', AppState);
    MathCanvas.renderGothicArch('canvas-gothic', AppState);
    MathCanvas.renderTrig('canvas-trig', AppState);
  }

})();
