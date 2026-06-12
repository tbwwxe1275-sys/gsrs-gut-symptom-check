import { GSRS_SCHEMA, calculateAssessment } from "./scoring.mjs";

export function createAssessmentController(schema = GSRS_SCHEMA) {
  const state = {
    currentIndex: 0,
    answers: {},
    resultVisible: false,
  };

  function clampIndex(index) {
    return Math.max(0, Math.min(schema.items.length - 1, index));
  }

  function currentItem() {
    return schema.items[state.currentIndex];
  }

  function answeredCount() {
    return schema.items.filter((item) => Number.isFinite(Number(state.answers[item.id]))).length;
  }

  function selectAnswer(value) {
    const numericValue = Number(value);
    if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 7) {
      throw new RangeError("Answer must be an integer from 1 to 7.");
    }

    state.answers[currentItem().id] = numericValue;
    state.resultVisible = false;
  }

  function canGoNext() {
    return Number.isFinite(Number(state.answers[currentItem().id]));
  }

  function goNext() {
    if (!canGoNext()) return false;
    if (state.currentIndex >= schema.items.length - 1) return false;
    state.currentIndex += 1;
    return true;
  }

  function goPrevious() {
    state.currentIndex = clampIndex(state.currentIndex - 1);
    state.resultVisible = false;
  }

  function showResult() {
    const result = calculateAssessment(state.answers);
    state.resultVisible = result.complete;
    return result;
  }

  function jumpTo(index) {
    state.currentIndex = clampIndex(index);
    state.resultVisible = false;
  }

  function snapshot() {
    return {
      currentIndex: state.currentIndex,
      currentItem: currentItem(),
      answers: { ...state.answers },
      answeredCount: answeredCount(),
      resultVisible: state.resultVisible,
    };
  }

  return {
    canGoNext,
    goNext,
    goPrevious,
    jumpTo,
    selectAnswer,
    showResult,
    snapshot,
  };
}
