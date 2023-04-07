# Quick Learn Chrome Extension

Quick Learn is a Chrome extension that helps you learn faster by summarizing a selected text and generating a quiz based on that text using OpenAI's large language models.

<video width="640" height="480" controls>
  <source src="quicklearn.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


## Features

- Summarize selected text from any webpage
- Generate a quiz to test your understanding of the summarized content
- Utilizes OpenAI's powerful large language models for high-quality summaries and quizzes

## Installation

1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Turn on the "Developer mode" toggle in the top right corner.
4. Click the "Load unpacked" button that appears on the top left corner.
5. Navigate to the `dist` folder inside the downloaded repository and select it.

The Quick Learn Chrome extension should now appear in your list of extensions and be available for use.

## OpenAI API Key Setup

To use Quick Learn, you need to have an OpenAI API key. If you don't have one already, you can sign up for one at [https://beta.openai.com/signup/](https://beta.openai.com/signup/).

After obtaining your API key, the extension will prompt you to enter it when you first use Quick Learn. Your API key will be saved in your browser's local storage, so you won't need to enter it again unless you clear your local storage.

## Usage

1. Select a text passage on any webpage that you'd like to learn from.
2. Right-click the selected text and choose "Quick Learn" from the context menu.
3. The extension will open a popup window with a summary of the selected text.
4. Read the summary, then click the "Start Quiz" button at the bottom of the window to generate a quiz based on the summarized text.
5. Answer the quiz questions to test your understanding of the content.

Enjoy learning with Quick Learn!