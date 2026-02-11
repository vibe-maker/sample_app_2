"use client";

import { useState } from "react";

type Token = {
  text: string;
  role: string;
};

type Level = {
  id: number;
  scenario: string;
  tokens: Token[];
};

const levels: Level[] = [
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

export default function Page() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const level = levels[currentIndex];

  function handleClick(idx: number) {
    if (selected.includes(idx)) return;
    setSelected([...selected, idx]);
  }

  function buildSentence(seq: number[]): string {
    return (
      seq.map((i) => level.tokens[i].text).join(" ") + "."
    );
  }

  function checkAnswer() {
    const correctOrder = level.tokens.map((_, i) => i);
    const isCorrect =
      JSON.stringify(selected) === JSON.stringify(correctOrder);

    if (isCorrect) {
      setScore(score + 1);
      setShowResult(true);
    } else {
      alert("❌ Try again!");
    }
  }

  function nextQuestion() {
    if (currentIndex < levels.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelected([]);
      setShowResult(false);
    } else {
      setCurrentIndex(levels.length);
    }
  }

  if (currentIndex >= levels.length) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-4">🎉 Quiz Finished!</h1>
        <p className="text-xl">
          Your Score: {score} / {levels.length}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-md">

        <div className="flex justify-between mb-4 text-sm text-gray-500">
          <span>Question {currentIndex + 1} / {levels.length}</span>
          <span>Score: {score}</span>
        </div>

        <h2 className="text-xl font-semibold mb-2">
          Situation: {level.scenario}
        </h2>

        <div className="min-h-[60px] border rounded-lg p-3 mb-4 bg-gray-100">
          {selected.length > 0 ? buildSentence(selected) : "Make a sentence."}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {level.tokens.map((token, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
            >
              {token.text}
            </button>
          ))}
        </div>

        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={selected.length !== level.tokens.length}
            className="w-full py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="w-full py-2 bg-green-500 text-white rounded"
          >
            Next Question
          </button>
        )}
      </div>
    </main>
  );
}

