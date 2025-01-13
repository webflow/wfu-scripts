import { MultipleChoiceQuiz } from '$components/mc-quiz/mc-quiz';

declare global {
  interface Window {
    __wfuScriptsLoaded?: boolean; // Declare a global flag to ensure the script runs only once
  }
}

if (!window.__wfuScriptsLoaded) {
  window.__wfuScriptsLoaded = true; // Add a global flag to ensure the script runs only once

  window.Webflow ||= [];
  window.Webflow.push(() => {
    // Initialize all quizzes on the page
    MultipleChoiceQuiz.initializeAll();
  });
}
