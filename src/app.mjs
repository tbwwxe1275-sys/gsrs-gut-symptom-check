import {
  DIMENSIONS,
  GSRS_SCHEMA,
  getDimensionScores,
} from "./scoring.mjs";
import { createAssessmentController } from "./assessment-controller.mjs";

const controller = createAssessmentController();

const els = {
  progressText: document.querySelector("#progressText"),
  answeredText: document.querySelector("#answeredText"),
  progressFill: document.querySelector("#progressFill"),
  dimensionChip: document.querySelector("#dimensionChip"),
  questionTitle: document.querySelector("#questionTitle"),
  questionPlain: document.querySelector("#questionPlain"),
  dimensionHint: document.querySelector("#dimensionHint"),
  scaleGrid: document.querySelector("#scaleGrid"),
  prevBtn: document.querySelector("#prevBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  mobilePrevBtn: document.querySelector("#mobilePrevBtn"),
  mobileNextBtn: document.querySelector("#mobileNextBtn"),
  toast: document.querySelector("#toast"),
  dimensionList: document.querySelector("#dimensionList"),
  resultPanel: document.querySelector("#resultPanel"),
  resultTitle: document.querySelector("#resultTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  totalMean: document.querySelector("#totalMean"),
  burdenLevel: document.querySelector("#burdenLevel"),
  resultBars: document.querySelector("#resultBars"),
  resultNotes: document.querySelector("#resultNotes"),
  editAnswersBtn: document.querySelector("#editAnswersBtn"),
};

function currentItem() {
  return controller.snapshot().currentItem;
}

function answeredCount() {
  return controller.snapshot().answeredCount;
}

function renderQuestion() {
  const snapshot = controller.snapshot();
  const item = currentItem();
  const dimension = DIMENSIONS[item.dimension];
  const selectedValue = snapshot.answers[item.id];

  els.dimensionChip.style.setProperty("--chip-color", dimension.color);
  els.dimensionChip.querySelector("span").textContent = dimension.label;
  els.questionTitle.textContent = item.title;
  els.questionPlain.textContent = item.plainTitle;
  els.dimensionHint.textContent = `${dimension.shortLabel}：${dimension.description}`;

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

  els.progressText.textContent = `第 ${snapshot.currentIndex + 1} / ${GSRS_SCHEMA.items.length} 题`;
  els.prevBtn.disabled = snapshot.currentIndex === 0;
  els.mobilePrevBtn.disabled = snapshot.currentIndex === 0;
  els.prevBtn.style.visibility = snapshot.currentIndex === 0 ? "hidden" : "visible";
  els.mobilePrevBtn.style.visibility = snapshot.currentIndex === 0 ? "hidden" : "visible";
  els.nextBtn.textContent = snapshot.currentIndex === GSRS_SCHEMA.items.length - 1 ? "查看结果" : "下一题";
  els.mobileNextBtn.textContent = els.nextBtn.textContent;
  els.toast.textContent = "";
  els.resultPanel.classList.toggle("is-visible", snapshot.resultVisible);
  document.body.classList.toggle("has-result", snapshot.resultVisible);
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
  const scores = getDimensionScores(controller.snapshot().answers);

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
  const result = controller.showResult();

  if (!result.complete) {
    els.toast.textContent = `还差 ${result.missingCount} 题，答完后再生成画像。`;
    return;
  }

  const top = result.rankedDimensions[0];
  els.resultPanel.classList.add("is-visible");
  document.body.classList.add("has-result");
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

  controller.selectAnswer(Number(button.dataset.value));
  renderQuestion();
});

els.prevBtn.addEventListener("click", () => {
  controller.goPrevious();
  renderQuestion();
});

els.nextBtn.addEventListener("click", () => {
  handleNext();
});

els.mobileNextBtn.addEventListener("click", () => {
  handleNext();
});

function handleNext() {
  if (!controller.canGoNext()) {
    els.toast.textContent = "先选一个最接近的程度，再继续。";
    return;
  }

  if (controller.snapshot().currentIndex === GSRS_SCHEMA.items.length - 1) {
    renderResult();
    return;
  }

  controller.goNext();
  renderQuestion();
}

els.mobilePrevBtn.addEventListener("click", () => {
  controller.goPrevious();
  renderQuestion();
});

els.editAnswersBtn.addEventListener("click", () => {
  controller.jumpTo(controller.snapshot().currentIndex);
  renderQuestion();
  document.querySelector(".question-zone").scrollIntoView({ behavior: "smooth", block: "start" });
});

renderQuestion();
