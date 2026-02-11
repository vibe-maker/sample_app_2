"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "subject" | "verb" | "object" | "place" | "time";

type Token = {
  text: string;
  role: Role;
};

type Level = {
  id: number;
  scenario: string;
  tokens: Token[];
  correctSentence: string;
};

type ValidationState = "none" | "success" | "error";

const baseLevels: Omit<Level, "correctSentence">[] = [
{
    id: 1,
    scenario: "After-school study time.",
    tokens: [
      { text: "She", role: "subject" },
      { text: "is doing", role: "verb" },
      { text: "her homework", role: "object" },
      { text: "in her room", role: "place" },
      { text: "now", role: "time" },
    ],
  },
  {
    id: 2,
    scenario: "Yesterday at the park.",
    tokens: [
      { text: "They", role: "subject" },
      { text: "played", role: "verb" },
      { text: "soccer", role: "object" },
      { text: "at the park", role: "place" },
      { text: "yesterday", role: "time" },
    ],
  },
  {
    id: 3,
    scenario: "Tomorrow’s plan.",
    tokens: [
      { text: "I", role: "subject" },
      { text: "will visit", role: "verb" },
      { text: "my grandmother", role: "object" },
      { text: "at her house", role: "place" },
      { text: "tomorrow", role: "time" },
    ],
  },
  {
    id: 4,
    scenario: "Morning routine.",
    tokens: [
      { text: "He", role: "subject" },
      { text: "brushes", role: "verb" },
      { text: "his teeth", role: "object" },
      { text: "in the bathroom", role: "place" },
      { text: "every morning", role: "time" },
    ],
  },
  {
    id: 5,
    scenario: "Last weekend trip.",
    tokens: [
      { text: "We", role: "subject" },
      { text: "went", role: "verb" },
      { text: "camping", role: "object" },
      { text: "by the river", role: "place" },
      { text: "last weekend", role: "time" },
    ],
  },
  {
    id: 6,
    scenario: "Future dream.",
    tokens: [
      { text: "She", role: "subject" },
      { text: "will become", role: "verb" },
      { text: "a doctor", role: "object" },
      { text: "in the future", role: "place" },
      { text: "one day", role: "time" },
    ],
  },
  {
    id: 7,
    scenario: "Lunch time.",
    tokens: [
      { text: "The students", role: "subject" },
      { text: "are eating", role: "verb" },
      { text: "their lunch", role: "object" },
      { text: "in the cafeteria", role: "place" },
      { text: "right now", role: "time" },
    ],
  },
  {
    id: 8,
    scenario: "Last night.",
    tokens: [
      { text: "My father", role: "subject" },
      { text: "cooked", role: "verb" },
      { text: "dinner", role: "object" },
      { text: "in the kitchen", role: "place" },
      { text: "last night", role: "time" },
    ],
  },
  {
    id: 9,
    scenario: "Weekend plan.",
    tokens: [
      { text: "We", role: "subject" },
      { text: "are going to watch", role: "verb" },
      { text: "a movie", role: "object" },
      { text: "at the theater", role: "place" },
      { text: "this weekend", role: "time" },
    ],
  },
  {
    id: 10,
    scenario: "School day.",
    tokens: [
      { text: "The teacher", role: "subject" },
      { text: "explains", role: "verb" },
      { text: "the lesson", role: "object" },
      { text: "in the classroom", role: "place" },
      { text: "every day", role: "time" },
    ],
  },
];

function goToNext() {
  if (currentIndex < levels.length - 1) {
    setCurrentIndex((prev) => prev + 1);
  } else {
    alert("🎉 All questions completed!");
  }
}
<button
  onClick={goToNext}
  className="next"
>
  Next Question
</button>


const levels: Level[] = baseLevels.map((level) => ({
  ...level,
  correctSentence: level.tokens.map((t) => t.text).join(" ") + ".",
}));

function shuffle<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Page() {
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [validationState, setValidationState] =
    useState<ValidationState>("none");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const level = levels[0];

  useEffect(() => {
    const indices = level.tokens.map((_, i) => i);
    setShuffledOrder(shuffle(indices));
    setCurrentSequence([]);
  }, [level.tokens]);

  const dropTiles = useMemo(
    () => currentSequence.map((idx) => level.tokens[idx]),
    [currentSequence, level.tokens]
  );

  const bankIndices = useMemo(
    () => shuffledOrder.filter((idx) => !currentSequence.includes(idx)),
    [shuffledOrder, currentSequence]
  );

  function buildSentence(seq: number[]): string {
    return seq.map((idx => level.tokens[idx].text)).join(" ") + ".";
  }

  function handleClickBankTile(idx: number) {
    setCurrentSequence((prev) => [...prev, idx]);
    setValidationState("none");
    setFeedbackMessage("");
  }

  function handleUndo() {
    setCurrentSequence((prev) => prev.slice(0, -1));
    setValidationState("none");
    setFeedbackMessage("");
  }

  function handleCheck() {
    if (currentSequence.length !== level.tokens.length) return;

    const userSentence =
      currentSequence.map((i) => level.tokens[i].text).join(" ") + ".";
    const correctSentence = level.correctSentence;

    if (userSentence === correctSentence) {
      setValidationState("success");
      setFeedbackMessage("Excellent! The sentence is correct.");
    } else {
      setValidationState("error");
      setFeedbackMessage("Not quite. Try again!");
    }
  }

  return (
    <div className="container">
      <div className="section">
        <h1 className="title">Sentence Structure Puzzle</h1>
        <p className="subtitle">Build the correct sentence using all tiles.</p>
      </div>

      <div className="section">
        <strong>Scenario:</strong> {level.scenario}
      </div>

      {/* Drop Zone */}
      <div className="section">
        <div className="zone">
          {dropTiles.length === 0 ? (
            <p>Click tiles below to build your sentence.</p>
          ) : (
            dropTiles.map((token, idx) => (
              <button key={idx} className="tile">
                {token.text}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="section">
        <button
          className="button button-secondary"
          onClick={handleUndo}
        >
          Undo
        </button>{" "}
        <button
          className="button button-primary"
          onClick={handleCheck}
        >
          Check Sentence
        </button>
      </div>

      {/* Feedback */}
      {feedbackMessage && (
        <div className="section">
          <strong>{feedbackMessage}</strong>
        </div>
      )}

      {/* Word Bank */}
      <div className="section">
        <div className="zone">
          {bankIndices.map((idx) => (
            <button
              key={idx}
              className="tile"
              onClick={() => handleClickBankTile(idx)}
            >
              {level.tokens[idx].text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}




