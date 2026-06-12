import {
  DIMENSIONS,
  GSRS_SCHEMA,
  calculateAssessment,
  getDimensionScores,
} from "./scoring.mjs";

const state = {
  currentIndex: 0,
  answers: {},
};

const els = {
  progressText: document.querySelector("#progressText"),
  answeredText: document.querySelector("#answeredText"),
  progressFill: document.querySelector("#progressFill"),
  dimensionChip: document.querySelector("#dimensionChip"),
  questionTitle: document.querySelector("#questionTitle"),
  questionPlain: document.querySelector("#questionPlain"),
  scaleGrid: document.querySelector("#scaleGrid"),
  prevBtn: document.querySelector("#prevBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  toast: document.querySelector("#toast"),
  dimensionList: document.querySelector("#dimensionList"),
  resultPanel: document.querySelector("#resultPanel"),
  resultTitle: document.querySelector("#resultTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  totalMean: document.querySelector("#totalMean"),
  burdenLevel: document.querySelector("#burdenLevel"),
  resultBars: document.querySelector("#resultBars"),
  resultNotes: document.querySelector("#resultNotes"),
};

function currentItem() {
  return GSRS_SCHEMA.items[state.currentIndex];
}

function answeredCount() {
  return GSRS_SCHEMA.items.filter((item) => Number.isFinite(Number(state.answers[item.id]))).length;
}

function renderQuestion() {
  const item = currentItem();
  const dimension = DIMENSIONS[item.dimension];
  const selectedValue = state.answers[item.id];

  els.dimensionChip.style.setProperty("--chip-color", dimension.color);
  els.dimensionChip.querySelector("span").textContent = dimension.label;
  els.questionTitle.textContent = item.title;
  els.questionPlain.textContent = item.plainTitle;

  els.scaleGrid.innerHTML = GSRS_SCHEMA.scale
    .map(
      (option) => `
        <button
          type="button"
          class="scale-option ${selectedValue === option.value ? "is-selected" : ""}"
          role="radio"
          aria-checked="${selectedValue === option.value}"
          data-value="${option.value}"
        >
          <span class="scale-number">${option.value}</span>
          <span class="scale-label">${option.label}</span>
          <span class="scale-detail">${option.detail}</span>
        </button>
      `,
    )
    .join("");

  els.progressText.textContent = `第 ${state.currentIndex + 1} / ${GSRS_SCHEMA.items.length} 题`;
  els.prevBtn.disabled = state.currentIndex === 0;
  els.prevBtn.style.visibility = state.currentIndex === 0 ? "hidden" : "visible";
  els.nextBtn.textContent = state.currentIndex === GSRS_SCHEMA.items.length - 1 ? "查看结果" : "下一题";
  els.toast.textContent = "";
  renderProgress();
  renderDimensionList();
}

function renderProgress() {
  const count = answeredCount();
  const percent = Math.round((count / GSRS_SCHEMA.items.length) * 100);
  els.answeredText.textContent = `已完成 ${count} 题`;
  els.progressFill.style.width = `${percent}%`;
}

function renderDimensionList() {
  const scores = getDimensionScores(state.answers);

  els.dimensionList.innerHTML = Object.entries(DIMENSIONS)
    .map(([id, dimension]) => {
      const mean = scores[id];
      const percent = mean == null ? 0 : (mean / 7) * 100;
      const valueText = mean == null ? "未答" : mean.toFixed(2);

      return `
        <div class="dimension-row">
          <div class="dimension-head">
            <span>${dimension.shortLabel}</span>
            <span>${valueText}</span>
          </div>
          <div class="mini-bar" aria-hidden="true">
            <span style="--bar-color:${dimension.color}; width:${percent}%"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderResult() {
  const result = calculateAssessment(state.answers);

  if (!result.complete) {
    els.toast.textContent = `还差 ${result.missingCount} 题，答完后再生成画像。`;
    return;
  }

  const top = result.rankedDimensions[0];
  els.resultPanel.classList.add("is-visible");
  els.resultTitle.textContent = `${top.shortLabel}信号最突出`;
  els.resultSummary.textContent = result.summary;
  els.totalMean.textContent = result.totalMean.toFixed(2);
  els.burdenLevel.textContent = `${result.burdenLevel.label} · 7分制均值`;

  els.resultBars.innerHTML = result.rankedDimensions
    .map(
      (dimension) => `
        <div class="score-row">
          <span class="score-name">${dimension.shortLabel}</span>
          <div class="score-track" aria-hidden="true">
            <span style="--bar-color:${dimension.color}; width:${(dimension.mean / 7) * 100}%"></span>
          </div>
          <span class="score-value">${dimension.mean.toFixed(2)}</span>
        </div>
      `,
    )
    .join("");

  els.resultNotes.innerHTML = result.rankedDimensions
    .slice(0, 2)
    .map(
      (dimension) => `
        <article class="note">
          <strong>${dimension.label}</strong>
          <p>${dimension.description}${dimension.suggestion}</p>
        </article>
      `,
    )
    .join("");

  els.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

els.scaleGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".scale-option");
  if (!button) return;

  const item = currentItem();
  state.answers[item.id] = Number(button.dataset.value);
  renderQuestion();

  if (state.currentIndex < GSRS_SCHEMA.items.length - 1) {
    window.setTimeout(() => {
      state.currentIndex += 1;
      renderQuestion();
    }, 130);
  }
});

els.prevBtn.addEventListener("click", () => {
  state.currentIndex = Math.max(0, state.currentIndex - 1);
  renderQuestion();
});

els.nextBtn.addEventListener("click", () => {
  const item = currentItem();

  if (!Number.isFinite(Number(state.answers[item.id]))) {
    els.toast.textContent = "先选一个最接近的程度，再继续。";
    return;
  }

  if (state.currentIndex === GSRS_SCHEMA.items.length - 1) {
    renderResult();
    return;
  }

  state.currentIndex += 1;
  renderQuestion();
});

renderQuestion();
