# Human-AI Trust Calibration Prototype

<img width="960" height="419" alt="Screenshot 2026-02-22 000502" src="https://github.com/user-attachments/assets/0a1e3275-172d-4977-ad0a-892643d9a0e3" />


This repository contains a working prototype for a Human-AI trust calibration study. It presents users with professional decision-making scenarios and asks them to either accept or override an AI-generated recommendation.

## How to Run Locally

Because this prototype is built using plain HTML, CSS, and vanilla JavaScript, there are no build steps, package managers, or backend servers required. 

1. Clone or download this repository to your local machine.
2. Ensure all three files (`index.html`, `style.css`, and `script.js`) are in the same directory.
3. Open `index.html` directly in any modern web browser.
   * *Optional:* You can also serve it via a local development server (like VS Code's "Live Server" extension or Python's `python -m http.server`) for a better development experience.

## Condition Logic

The prototype utilizes an A/B testing structure to observe how different AI personas affect user trust and decision-making. The logic is driven by a central `CONDITIONS` configuration object and a global state manager.

Upon loading the application, a user is randomly assigned to one of two conditions (50/50 probability) via the logic `Math.random() < 0.5 ? "A" : "B"` stored in the state object (`S.cond`). This condition dictates the independent variables applied to the UI:

### Condition A (Formal / Neutral)
<img width="960" height="418" alt="Screenshot 2026-02-22 000437" src="https://github.com/user-attachments/assets/acffe4ac-b103-4d43-8572-d31397aec740" />

* **Persona:** "System AI" (Decision Support Module v2.1).
* **Tone:** It uses formal, highly structured language.
* **Confidence:** It shows a "calibrated" confidence style. I built a dynamic SVG progress arc that shows a precise, mathematically estimated accuracy percentage.

### Condition B (Social / Humanlike)
<img width="958" height="420" alt="Screenshot 2026-02-22 000413" src="https://github.com/user-attachments/assets/3c8593f2-5c3e-4bdf-be43-f156539ee79f" />

* **Persona:** "Alex" (Your AI assistant).
* **Tone:** It uses a friendly, conversational tone.
* **Confidence:** Instead of a statistical arc, it provides a confident, conversational assertion ("I'm quite sure about this one — go for it!").

**Implementation Details:** The rendering function (`rTask`) fetches the active condition's properties from the `CONDITIONS` object and injects them into the template literal. CSS classes (like `${c.tone}`) are dynamically applied to alter the visual presentation, and conditional rendering (using a ternary operator) swaps out the HTML for the confidence widget entirely based on the assigned condition.

---

## Logging Implementation

<img width="960" height="418" alt="Screenshot 2026-02-22 001515" src="https://github.com/user-attachments/assets/66fb7f8d-de7d-436c-80f3-efcf16907e27" />


Data logging is handled entirely on the client side without the need for a backend database. The system captures both the user's explicit choices and implicit behavioral metrics (latency).

1.  **State Management & Initialization:** A global state object (`S`) initializes a unique `participant_id` (a randomized alphanumeric string) and an empty `log` array when the page loads.
2.  **Precise Timing:** At the exact moment a new scenario finishes rendering to the DOM (at the end of the `rTask` function), a timestamp is recorded as `S.ts = Date.now()`.
3.  **Event Capture:** When the user clicks either the "Accept" or "Override" button, the `decide(decision, event)` function is invoked. 
4.  **Data Construction:** The function calculates the `latency_ms` by subtracting the render timestamp (`S.ts`) from the exact moment of the click (`Date.now()`). A payload object is created containing:
    * `participant_id`, `condition`, and `scenario_id`
    * `decision` (accept or override)
    * `timestamp` (a formatted locale string)
    * `latency_ms` (reaction time in milliseconds)
    * `self_confidence` (captured from the range slider)
    * `confidence_frame` and `ai_accuracy` (the independent variables shown to the user)
5.  **Array Storage & Progression:** The payload is pushed to the `S.log` array. The UI then resets the confidence slider and advances to the next scenario after a brief 280ms delay (allowing the button ripple animation to finish).
6.  **Data Export:** On the "Study Complete" screen, the user can export the session data. 
    * **JSON Export:** Stringifies the `S.log` array with 2-space formatting.
    * **CSV Export:** Dynamically extracts the object keys to form the header row, then maps over the array to stringify and join the values with commas and newlines.
    * **Download Trigger:** Both export functions utilize a `dl()` helper that wraps the formatted data in a `Blob`, generates a temporary `URL.createObjectURL()`, creates a hidden `<a>` tag, programmatically triggers a `.click()`, and finally revokes the object URL to prevent memory leaks.
  
## Sample Output

Below is an example of the output generated in the `.json` file after a user completes the scenarios:

```json
[
  {
    "participant_id": "PU2A2YF",
    "condition": "B",
    "scenario_id": "loan",
    "decision": "accept",
    "timestamp": "12/02/2026, 14:32:05",
    "latency_ms": 4251,
    "self_confidence": 75,
    "confidence_frame": "certain",
    "ai_accuracy": 73
  },
  {
    "participant_id": "PU2A2YF",
    "condition": "B",
    "scenario_id": "hire",
    "decision": "override",
    "timestamp": "12/02/2026, 14:32:18",
    "latency_ms": 12840,
    "self_confidence": 90,
    "confidence_frame": "certain",
    "ai_accuracy": 68
  }
]
