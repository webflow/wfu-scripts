import { MultipleChoiceQuiz } from '$components/mc-quiz/mc-quiz';

window.Webflow ||= [];
window.Webflow.push(() => {
  // Initialize all quizzes on the page
  MultipleChoiceQuiz.initializeAll();
});
