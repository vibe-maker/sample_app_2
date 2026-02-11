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
];

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
    return seq.map((idx) => level.tokens[idx].text).join(" ") + ".";
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

