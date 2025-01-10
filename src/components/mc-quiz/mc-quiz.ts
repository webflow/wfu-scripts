export class MultipleChoiceQuiz {
  static ATTRIBUTE_NAME: string = 'wf-quiz-mc';
  static ANSWER_ATTRIBUTE_NAME: string = 'wf-quiz-mc-answer';
  static CORRECT_ANSWER_CLASS_COMBO: string = 'is-correct';
  static INCORRECT_ANSWER_CLASS_COMBO: string = 'is-wrong';

  private quizElement: HTMLElement;
  private answer: number;
  private inputElements: NodeListOf<HTMLInputElement>;
  private submitButton: HTMLButtonElement | null;
  private questionWrapperElement: HTMLElement;
  private correctWrapperElement: HTMLElement;
  private incorrectWrapperElement: HTMLElement;
  private quizParentElement: HTMLElement | null;

  constructor(quizElement: HTMLElement) {
    this.quizElement = quizElement;

    const answerAttribute = quizElement.getAttribute(MultipleChoiceQuiz.ANSWER_ATTRIBUTE_NAME);
    this.answer = answerAttribute ? parseInt(answerAttribute, 10) : NaN;

    this.inputElements = quizElement.querySelectorAll<HTMLInputElement>('input');
    this.submitButton = quizElement.querySelector<HTMLButtonElement>('button');
    this.questionWrapperElement = quizElement.children[0] as HTMLElement;
    this.correctWrapperElement = quizElement.children[1] as HTMLElement;
    this.incorrectWrapperElement = quizElement.children[2] as HTMLElement;
    this.quizParentElement = quizElement.parentElement;

    console.log(this.quizElement);

    // Initialize the quiz
    this.setup();
  }

  private setup(): void {
    if (!this.isValidQuiz()) {
      console.error(
        `Quiz ${this.quizElement.getAttribute(MultipleChoiceQuiz.ATTRIBUTE_NAME)} is invalid.`
      );
      return;
    }

    // Hide feedback elements initially
    this.correctWrapperElement.style.display = 'none';
    this.incorrectWrapperElement.style.display = 'none';

    // Attach event listener
    this.submitButton?.addEventListener('click', () => this.checkAnswer());
  }

  private isValidQuiz(): boolean {
    if (
      isNaN(this.answer) ||
      this.inputElements.length === 0 ||
      !this.submitButton ||
      !this.correctWrapperElement ||
      !this.incorrectWrapperElement
    ) {
      return false;
    }
    return true;
  }

  private checkAnswer(): void {
    let selectedAnswerIndex = -1;

    this.inputElements.forEach((input, index) => {
      if (input.checked) {
        selectedAnswerIndex = index;
      }
    });

    const oneIndexedSelectedAnswer = selectedAnswerIndex + 1;

    if (oneIndexedSelectedAnswer === this.answer) {
      console.log('Correct!');
      this.showFeedback(true);
    } else {
      console.log('Incorrect!');
      this.showFeedback(false);
    }
  }

  private showFeedback(isCorrect: boolean): void {
    // Show the correct or incorrect wrapper based on the answer
    this.questionWrapperElement.style.display = 'none';
    this.correctWrapperElement.style.display = isCorrect ? 'block' : 'none';
    this.incorrectWrapperElement.style.display = isCorrect ? 'none' : 'block';

    if (this.quizParentElement) {
      if (isCorrect) {
        this.quizParentElement.classList.add(MultipleChoiceQuiz.CORRECT_ANSWER_CLASS_COMBO);
      } else {
        this.quizParentElement.classList.add(MultipleChoiceQuiz.INCORRECT_ANSWER_CLASS_COMBO);
      }
    }
  }

  static initializeAll(): void {
    const quizzes = document.querySelectorAll<HTMLElement>(
      `[${MultipleChoiceQuiz.ATTRIBUTE_NAME}]`
    );
    quizzes.forEach((quizElement) => new MultipleChoiceQuiz(quizElement));
  }
}
