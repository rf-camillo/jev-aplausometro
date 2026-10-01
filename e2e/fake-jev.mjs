// A stand-in for the Jev API, so the end-to-end tests never spend credits or depend on the network.
import http from "node:http";

const PROFILES = {
  persona_senior_dev: { eyeroll: 0.97, ignore: 0.02, comment: 0.01 },
  persona_mom: { applaud: 0.63, eyeroll: 0.19, like: 0.12, comment: 0.06 },
  persona_investor: { applaud: 0.58, share: 0.22, like: 0.12, disagree: 0.08 },
  persona_uncle: { comment: 0.45, applaud: 0.31, eyeroll: 0.13, like: 0.07, share: 0.04 },
  persona_recruiter: { ignore: 0.45, eyeroll: 0.43, applaud: 0.07, like: 0.05 },
};
const DEFAULT = { like: 0.4, applaud: 0.3, comment: 0.2, eyeroll: 0.1 };

// Clarity hesitates between two levels far apart, which the page calls split.
const SCORES = {
  metric_clarity: {
    score: 2.36,
    confidence: 0.41,
    probabilities: { 0: 0.05, 1: 0.35, 2: 0.1, 3: 0.42, 4: 0.08 },
  },
  default: {
    score: 1.81,
    confidence: 0.26,
    probabilities: { 0: 0.04, 1: 0.51, 2: 0.09, 3: 0.31, 4: 0.05 },
  },
};

function answer(key, question) {
  if (question.type === "choice") {
    const probabilities = PROFILES[key] ?? DEFAULT;
    const [choice] = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0];
    return { type: "choice", choice, confidence: 0.6, probabilities };
  }
  if (question.type === "score") return { type: "score", ...(SCORES[key] ?? SCORES.default) };
  return { type: "noul", noul: 0.3 };
}

const port = Number(process.env.FAKE_JEV_PORT ?? 4599);

http
  .createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      const { state, questions } = JSON.parse(body);
      response.setHeader("Content-Type", "application/json");
      if (String(state?.post).includes("[fora do ar]")) {
        response.statusCode = 529;
        response.end(JSON.stringify({ error: "overloaded" }));
        return;
      }
      const answers = Object.fromEntries(
        Object.entries(questions).map(([key, question]) => [key, answer(key, question)]),
      );
      const reply = () =>
        response.end(
          JSON.stringify({
            model: "jev-fake",
            answers,
            usage: { input_tokens: 2700, output_tokens: 0 },
          }),
        );
      // "[devagar]" in the post holds the answer, for tests that change the draft meanwhile.
      if (String(state?.post).includes("[devagar]")) setTimeout(reply, 3000);
      else reply();
    });
  })
  .listen(port, "127.0.0.1", () => console.log(`fake Jev on ${String(port)}`));
