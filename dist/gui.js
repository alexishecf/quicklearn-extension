"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class LLMQuery {
    constructor(apiKey) {
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
        this.apiKey = apiKey;
    }
    query(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch chat completion: ${response.statusText}`);
            }
            const data = yield response.json();
            const message = data.choices[0].message.content;
            return message;
        });
    }
}
class TextSummarizer {
    constructor(llmQuery) {
        this.llmQuery = llmQuery;
    }
    essentialize(rawText, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `From the following text, keep only the essential ${!!role && ` for a ${role} `} and minimize use of adjectives: ${rawText}`;
            const essentializedText = yield this.llmQuery.query(prompt);
            return essentializedText;
        });
    }
}
class QuestionGenerator {
    constructor(llmQuery, summary) {
        this.llmQuery = llmQuery;
        this.summary = summary;
    }
    generateQuestions(numQuestions, numChoices) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `Expected Output: JSON in the format of an array of QuizQuestion objects {question: string, choices: string[], correctChoice: string}, without enclosing code blocks, that can be parsed using JSON.parse() method.\n\nGenerate ${numQuestions} questions with ${numChoices} choices each from this text (difficulty 8/10): ${this.summary}\n`;
            const response = yield this.llmQuery.query(prompt);
            const questions = JSON.parse(response);
            return questions;
        });
    }
}
class Quiz {
    get questions() {
        return this._questions;
    }
    constructor(questions) {
        this._questions = questions;
        this.answers = [];
        this.score = 0;
    }
    answerQuestion(questionIndex, answerIndex) {
        this.answers[questionIndex] = answerIndex;
    }
    calculateScore() {
        let numCorrect = 0;
        this.questions.forEach((question, index) => {
            if (question.choices[this.answers[index]] === question.correctChoice) {
                numCorrect++;
            }
        });
        this.score = numCorrect;
    }
    getScore() {
        return this.score;
    }
}
function getAPIKey() {
    const localStorageKey = 'openai_api_key';
    let apiKey = localStorage.getItem(localStorageKey);
    if (!apiKey) {
        apiKey = prompt('Please enter your OpenAI API key:');
        if (apiKey) {
            localStorage.setItem(localStorageKey, apiKey);
        }
        else {
            alert('API key is required to use this application.');
            return null;
        }
    }
    return apiKey;
}
function showReading(summarizedText) {
    const loaderContainer = document.getElementById('loader-container');
    const readingContainer = document.getElementById('reading-container');
    const summarizedTextElement = document.getElementById('summarized-text');
    if (loaderContainer) {
        loaderContainer.classList.add('hidden');
    }
    if (readingContainer) {
        readingContainer.classList.remove('hidden');
    }
    if (summarizedTextElement) {
        summarizedTextElement.innerText = summarizedText;
    }
}
function run(textToLearn) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = getAPIKey();
        if (!apiKey) {
            window.close();
            return;
        }
        const llmQuery = new LLMQuery(apiKey);
        const summarizer = new TextSummarizer(llmQuery);
        const loaderContainer = document.getElementById('loader-container');
        const statusText = document.getElementById('status-text');
        if (loaderContainer && statusText) {
            statusText.textContent = 'Summarizing text...';
        }
        let summary;
        try {
            summary = yield summarizer.essentialize(textToLearn);
        }
        catch (error) {
            console.error('Error while summarizing text:', error);
            alert('Something went wrong, your API key is maybe wrong, please try again.');
            localStorage.clear();
            window.close();
            return;
        }
        const startQuizButton = document.getElementById('start-quiz-button');
        const questionGenerator = new QuestionGenerator(llmQuery, summary);
        showReading(summary);
        function startQuiz(numQuestions, numChoices) {
            return __awaiter(this, void 0, void 0, function* () {
                const questions = yield questionGenerator.generateQuestions(numQuestions, numChoices);
                if (loaderContainer) {
                    loaderContainer.style.display = 'none';
                }
                const quiz = new Quiz(questions);
                let currentQuestionIndex = 0;
                const questionContainer = document.getElementById('question-container');
                const scoreContainer = document.getElementById('score-container');
                function renderQuestion() {
                    const currentQuestion = quiz.questions[currentQuestionIndex];
                    const choicesHtml = currentQuestion.choices
                        .map((choice, index) => {
                        const choiceElement = document.createElement('div');
                        choiceElement.classList.add('choice');
                        choiceElement.textContent = choice;
                        // Return the HTML string
                        return choiceElement.outerHTML;
                    })
                        .join('');
                    const questionHtml = `
        <div class="question">
          <div class="question-title">${currentQuestion.question}</div>
          <div class="choices">${choicesHtml}</div>
        </div>
      `;
                    questionContainer.innerHTML = questionHtml;
                    // Get the choices container element
                    const choicesContainer = document.getElementsByClassName('choices')[0];
                    // Add a click event listener to the choices container
                    choicesContainer.addEventListener('click', function (event) {
                        // Check if the clicked element is a choice element
                        if (event.target.classList.contains('choice')) {
                            // Get the index of the clicked choice element
                            const index = Array.from(choicesContainer.children).indexOf(event.target);
                            // Call the answerQuestion function with the index as parameter
                            answerQuestion(index);
                        }
                    });
                }
                function answerQuestion(answerIndex) {
                    quiz.answerQuestion(currentQuestionIndex, answerIndex);
                    const choices = document.querySelectorAll('.choice');
                    const correctIndex = quiz.questions[currentQuestionIndex].choices.findIndex((c) => c === quiz.questions[currentQuestionIndex].correctChoice);
                    choices.forEach((choice, index) => {
                        if (index === correctIndex) {
                            choice.classList.add('correct');
                        }
                        if (index === answerIndex) {
                            if (index === correctIndex) {
                                choice.classList.add('correct');
                            }
                            else {
                                choice.classList.add('incorrect');
                            }
                        }
                    });
                    setTimeout(() => {
                        currentQuestionIndex++;
                        if (currentQuestionIndex < quiz.questions.length) {
                            renderQuestion();
                        }
                        else {
                            quiz.calculateScore();
                            const scoreHtml = `
            <div class="score">You scored ${quiz.getScore()} out of ${quiz.questions.length}!</div>
          `;
                            scoreContainer.innerHTML = scoreHtml;
                        }
                    }, 500);
                }
                renderQuestion();
            });
        }
        if (startQuizButton) {
            startQuizButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                const readingContainer = document.getElementById('reading-container');
                const questionContainer = document.getElementById('question-container');
                if (readingContainer) {
                    readingContainer.classList.add('hidden');
                }
                if (questionContainer) {
                    questionContainer.classList.remove('hidden');
                }
                if (loaderContainer && statusText) {
                    loaderContainer.style.display = 'flex';
                    statusText.textContent = 'Preparing quiz...';
                }
                try {
                    yield startQuiz(5, 3);
                }
                catch (e) {
                    if (loaderContainer && statusText) {
                        statusText.textContent = 'Uh oh! Something went wrong. Please restart.';
                    }
                    console.error(e);
                }
            }));
        }
    });
}
document.addEventListener('DOMContentLoaded', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const { text } = yield chrome.runtime.sendMessage({ action: 'window_loaded' });
        yield run(text);
    });
});
