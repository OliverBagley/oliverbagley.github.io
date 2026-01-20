# Gemini Project: Product Description Generator

## Project Overview

This project is a single-page web application designed to generate formatted HTML for product descriptions.

The application allows users to input a product's title, description, features, and specifications, and it generates a live preview of the corresponding HTML. It also provides the full HTML output, which can be easily copied to the clipboard.

The primary technologies used are:
*   **HTML:** For the structure and user interface.
*   **JavaScript:** For all client-side logic and interactivity.
*   **Handlebars.js:** As the templating engine to generate the HTML output from user data.
*   **Bulma:** For UI styling and layout.

The entire application is self-contained within the `index.html` file.

## Building and Running

This project does not require a build step.

To run the application, simply open the `index.html` file in any modern web browser.

## Development Conventions

*   **Single-File Architecture:** All HTML, CSS, and JavaScript are contained within the `index.html` file for simplicity.
*   **Templating:** The Handlebars.js template is embedded within `index.html` in a `<script type="text/x-handlebars-template">` tag.
*   **Dependencies:** All external libraries (Bulma, Handlebars.js) are loaded from a CDN.
*   **Interactivity:** User input is captured from form elements, and the preview and output are updated in real-time using JavaScript event listeners.

## Key Files

*   `index.html`: The core of the application. It contains the user interface, the JavaScript logic for generating content, and the embedded Handlebars template.
*   `description.html`: A standalone file containing the Handlebars template. Note that this same template is also embedded in `index.html` for the application to function.
*   `example.html`: A static HTML file showing an example of the final rendered output.
*   `readme.md`: The main documentation file for the project.
