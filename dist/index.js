"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/components/mc-quiz/mc-quiz.ts
  var MultipleChoiceQuiz = class _MultipleChoiceQuiz {
    static ATTRIBUTE_NAME = "wf-quiz-mc";
    static ANSWER_ATTRIBUTE_NAME = "wf-quiz-mc-answer";
    static CORRECT_ANSWER_CLASS_COMBO = "is-correct";
    static INCORRECT_ANSWER_CLASS_COMBO = "is-wrong";
    quizElement;
    answer;
    inputElements;
    submitButton;
    questionWrapperElement;
    correctWrapperElement;
    incorrectWrapperElement;
    quizParentElement;
    constructor(quizElement) {
      this.quizElement = quizElement;
      const answerAttribute = quizElement.getAttribute(_MultipleChoiceQuiz.ANSWER_ATTRIBUTE_NAME);
      this.answer = answerAttribute ? parseInt(answerAttribute, 10) : NaN;
      this.inputElements = quizElement.querySelectorAll("input");
      this.submitButton = quizElement.querySelector("button");
      this.questionWrapperElement = quizElement.children[0];
      this.correctWrapperElement = quizElement.children[1];
      this.incorrectWrapperElement = quizElement.children[2];
      this.quizParentElement = quizElement.parentElement;
      this.setup();
    }
    setup() {
      if (!this.isValidQuiz()) {
        console.error(
          `Quiz ${this.quizElement.getAttribute(_MultipleChoiceQuiz.ATTRIBUTE_NAME)} is invalid.`
        );
        return;
      }
      this.submitButton?.addEventListener("click", () => this.checkAnswer());
    }
    isValidQuiz() {
      if (isNaN(this.answer) || this.inputElements.length === 0 || !this.submitButton || !this.correctWrapperElement || !this.incorrectWrapperElement) {
        return false;
      }
      return true;
    }
    checkAnswer() {
      let selectedAnswerIndex = -1;
      this.inputElements.forEach((input, index) => {
        if (input.checked) {
          selectedAnswerIndex = index;
        }
      });
      const oneIndexedSelectedAnswer = selectedAnswerIndex + 1;
      if (oneIndexedSelectedAnswer === this.answer) {
        this.showFeedback(true);
      } else {
        this.showFeedback(false);
      }
    }
    showFeedback(isCorrect) {
      this.questionWrapperElement.setAttribute("wf-cloak", "1");
      if (this.quizParentElement) {
        if (isCorrect) {
          this.correctWrapperElement.removeAttribute("wf-cloak");
          this.quizParentElement.classList.add(_MultipleChoiceQuiz.CORRECT_ANSWER_CLASS_COMBO);
        } else {
          this.incorrectWrapperElement.removeAttribute("wf-cloak");
          this.quizParentElement.classList.add(_MultipleChoiceQuiz.INCORRECT_ANSWER_CLASS_COMBO);
        }
      }
    }
    static initializeAll() {
      const quizzes = document.querySelectorAll(
        `[${_MultipleChoiceQuiz.ATTRIBUTE_NAME}]`
      );
      quizzes.forEach((quizElement) => new _MultipleChoiceQuiz(quizElement));
    }
  };

  // src/index.ts
  window.Webflow ||= [];
  window.Webflow.push(() => {
    MultipleChoiceQuiz.initializeAll();
  });
})();
//# sourceMappingURL=index.js.map
