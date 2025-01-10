"use strict";(()=>{var o=Object.defineProperty;var c=(i,e,r)=>e in i?o(i,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):i[e]=r;var t=(i,e,r)=>c(i,typeof e!="symbol"?e+"":e,r);var n=class n{constructor(e){t(this,"quizElement");t(this,"answer");t(this,"inputElements");t(this,"submitButton");t(this,"questionWrapperElement");t(this,"correctWrapperElement");t(this,"incorrectWrapperElement");t(this,"quizParentElement");this.quizElement=e;let r=e.getAttribute(n.ANSWER_ATTRIBUTE_NAME);this.answer=r?parseInt(r,10):NaN,this.inputElements=e.querySelectorAll("input"),this.submitButton=e.querySelector("button"),this.questionWrapperElement=e.children[0],this.correctWrapperElement=e.children[1],this.incorrectWrapperElement=e.children[2],this.quizParentElement=e.parentElement,this.setup()}setup(){if(!this.isValidQuiz()){console.error(`Quiz ${this.quizElement.getAttribute(n.ATTRIBUTE_NAME)} is invalid.`);return}this.correctWrapperElement.style.display="none",this.incorrectWrapperElement.style.display="none",this.submitButton?.addEventListener("click",()=>this.checkAnswer())}isValidQuiz(){return!(isNaN(this.answer)||this.inputElements.length===0||!this.submitButton||!this.correctWrapperElement||!this.incorrectWrapperElement)}checkAnswer(){let e=-1;this.inputElements.forEach((l,a)=>{l.checked&&(e=a)}),e+1===this.answer?this.showFeedback(!0):this.showFeedback(!1)}showFeedback(e){this.questionWrapperElement.style.display="none",this.correctWrapperElement.style.display=e?"block":"none",this.incorrectWrapperElement.style.display=e?"none":"block",this.quizParentElement&&(e?this.quizParentElement.classList.add(n.CORRECT_ANSWER_CLASS_COMBO):this.quizParentElement.classList.add(n.INCORRECT_ANSWER_CLASS_COMBO))}static initializeAll(){document.querySelectorAll(`[${n.ATTRIBUTE_NAME}]`).forEach(r=>new n(r))}};t(n,"ATTRIBUTE_NAME","wf-quiz-mc"),t(n,"ANSWER_ATTRIBUTE_NAME","wf-quiz-mc-answer"),t(n,"CORRECT_ANSWER_CLASS_COMBO","is-correct"),t(n,"INCORRECT_ANSWER_CLASS_COMBO","is-wrong");var s=n;window.Webflow||(window.Webflow=[]);window.Webflow.push(()=>{s.initializeAll()});})();