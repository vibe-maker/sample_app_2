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

type ReviewItem = {
  levelIndex: number;
  incorrectSentence: string;
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
    scenario: "Weekend sports at the park.",
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
    scenario: "Visiting grandma tomorrow.",
    tokens: [
      { text: "I", role: "subject" },
      { text: "will visit", role: "verb" },
      { text: "my grandma", role: "object" },
      { text: "at her house", role: "place" },
      { text: "tomorrow", role: "time" },
    ],
  },
  {
    id: 4,
    scenario: "Daily morning routine.",
    tokens: [
      { text: "He", role: "subject" },
      { text: "eats", role: "verb" },
      { text: "breakfast", role: "object" },
      { text: "in the kitchen", role: "place" },
      { text: "every morning", role: "time" },
    ],
  },
  {
    id: 5,
    scenario: "Online game time tonight.",
    tokens: [
      { text: "We", role: "subject" },
      { text: "will play", role: "verb" },
      { text: "an online game", role: "object" },
      { text: "with friends", role: "place" },
      { text: "tonight", role: "time" },
    ],
  },
  {
    id: 6,
    scenario: "Reading quietly right now.",
    tokens: [
      { text: "The boy", role: "subject" },
      { text: "is reading", role: "verb" },
      { text: "a comic book", role: "object" },
      { text: "in the living room", role: "place" },
      { text: "right now", role: "time" },
    ],
  },
  {
    id: 7,
    scenario: "Fun at the swimming pool last weekend.",
    tokens: [
      { text: "My sister", role: "subject" },
      { text: "swam", role: "verb" },
      // Treat adverb as an "object" tile for simplicity
      { text: "happily", role: "object" },
      { text: "at the swimming pool", role: "place" },
      { text: "last weekend", role: "time" },
    ],
  },
  {
    id: 8,
    scenario: "Saturday morning shopping.",
    tokens: [
      { text: "My parents", role: "subject" },
      { text: "go", role: "verb" },
      { text: "shopping", role: "object" },
      { text: "at the supermarket", role: "place" },
      { text: "on Saturdays", role: "time" },
    ],
  },
  {
    id: 9,
    scenario: "Phone call from a friend later.",
    tokens: [
      { text: "My friend", role: "subject" },
      { text: "will call", role: "verb" },
      { text: "me", role: "object" },
      { text: "after dinner", role: "place" },
      { text: "this evening", role: "time" },
    ],
  },
  {
    id: 10,
    scenario: "Bus to school this morning.",
    tokens: [
      { text: "I", role: "subject" },
      { text: "took", role: "verb" },
      { text: "the bus", role: "object" },
      { text: "to school", role: "place" },
      { text: "this morning", role: "time" },
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

function speakSentence(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export default function Page() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);

  const [validationState, setValidationState] =
    useState<ValidationState>("none");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [hintMessage, setHintMessage] = useState<string>("");

  const [reviewData, setReviewData] = useState<ReviewItem[]>([]);
  const [completedLevels, setCompletedLevels] = useState<boolean[]>(
    () => new Array(levels.length).fill(false)
  );
  const [gameFinished, setGameFinished] = useState(false);
  const [reviewOpened, setReviewOpened] = useState(false);

  const level = levels[currentLevelIndex];

  // Initialize / reinitialize level when currentLevelIndex changes
  useEffect(() => {
    const indices = level.tokens.map((_, i) => i);
    setShuffledOrder(shuffle(indices));
    setCurrentSequence([]);
    setValidationState("none");
    setFeedbackMessage("");
    setHintMessage("");
  }, [currentLevelIndex, level.tokens]);

  const dropTiles = useMemo(
    () => currentSequence.map((idx) => level.tokens[idx]),
    [currentSequence, level.tokens]
  );

  const bankIndices = useMemo(
    () => shuffledOrder.filter((idx) => !currentSequence.includes(idx)),
    [shuffledOrder, currentSequence]
  );

  const isLastLevel = currentLevelIndex === levels.length - 1;
  const undoDisabled = currentSequence.length === 0;
  const checkDisabled = currentSequence.length !== level.tokens.length;

  function buildSentenceFromSequence(seq: number[], lvl: Level): string {
    return seq.map((idx) => lvl.tokens[idx].text).join(" ") + ".";
  }

  function handleClickBankTile(idx: number) {
    if (validationState !== "none") {
      setValidationState("none");
      setFeedbackMessage("");
      setHintMessage("");
    }
    setCurrentSequence((prev) => [...prev, idx]);
  }

  function handleUndo() {
    if (currentSequence.length === 0) return;
    setCurrentSequence((prev) => prev.slice(0, -1));
    if (validationState !== "none") {
      setValidationState("none");
      setFeedbackMessage("");
      setHintMessage("");
    }
  }

  function storeIncorrectAttempt(levelIndex: number, incorrectSentence: string) {
    setReviewData((prev) => {
      const exists = prev.some((item) => item.levelIndex === levelIndex);
      if (exists) return prev;
      return [...prev, { levelIndex, incorrectSentence }];
    });
  }

  function handleCheck() {
    if (currentSequence.length !== level.tokens.length) return;

    const userSentence = buildSentenceFromSequence(currentSequence, level);
    const correctSentence = level.correctSentence;

    if (userSentence === correctSentence) {
      setValidationState("success");
      setFeedbackMessage("Excellent! The sentence is correct.");
      setHintMessage("");
      speakSentence(correctSentence);

      setCompletedLevels((prev) => {
        if (prev[currentLevelIndex]) return prev;
        const copy = [...prev];
        copy[currentLevelIndex] = true;

        const finishedCount = copy.filter(Boolean).length;
        if (finishedCount === levels.length) {
          setGameFinished(true);
        }
        return copy;
      });
    } else {
      setValidationState("error");
      setFeedbackMessage("Not quite. Try again!");
      setHintMessage("Look at the time clue! (시간 힌트를 확인해 보세요!)");
      storeIncorrectAttempt(currentLevelIndex, userSentence);
    }
  }

  function handleNext() {
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
    }
  }

  function handleOpenReview() {
    setReviewOpened(true);
  }

  function tileBaseClasses() {
    return "px-3 py-1.5 text-sm md:text-base rounded-full border shadow-sm transition select-none";
  }

  function tileNeutralClasses() {
    return "border-slate-300 bg-white text-slate-800 hover:bg-slate-100";
  }

  function tileRoleClasses(role: Role) {
    switch (role) {
      case "subject":
        return "bg-blue-100 text-blue-800 border-blue-400";
      case "verb":
        return "bg-red-100 text-red-800 border-red-400";
      case "object":
        return "bg-green-100 text-green-800 border-green-400";
      case "place":
        return "bg-gray-200 text-gray-800 border-gray-400";
      case "time":
        return "bg-purple-100 text-purple-800 border-purple-400";
      default:
        return tileNeutralClasses();
    }
  }

  function tileErrorClasses() {
    return "border-red-500 bg-red-50 text-slate-900";
  }

  function getDropTileClasses(role: Role): string {
    const base = tileBaseClasses();
    if (validationState === "success") {
      return `${base} ${tileRoleClasses(role)}`;
    }
    if (validationState === "error") {
      return `${base} ${tileErrorClasses()}`;
    }
    return `${base} ${tileNeutralClasses()}`;
  }

  function getBankTileClasses(): string {
    return `${tileBaseClasses()} ${tileNeutralClasses()}`;
  }

  const showReviewEntry = gameFinished && reviewData.length > 0;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-8">
        <header className="mb-6 border-b pb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-2">
            Sentence Structure Puzzle Game
          </h2>
          <p className="text-sm md:text-base text-slate-600">
            For EFL 6th graders (CEFR A1) –{" "}
            <span className="font-semibold">
              Focus on verb tenses (past, present, future) using time clues.
            </span>
          </p>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            1) Make a sentence using all the tiles. 2) Use{" "}
            <span className="font-semibold">Undo</span> to fix before checking.
            3) Click <span className="font-semibold">Check Sentence</span> when
            you are ready.
          </p>
        </header>

        <main id="game-area">
          <section className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">
                Level {level.id} of {levels.length}
              </p>
              <p className="text-base md:text-lg font-semibold text-slate-800 mt-1">
                Scenario: {level.scenario}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs md:text-sm border border-purple-300">
                Time Clue = Verb Tense 힌트
              </span>
            </div>
          </section>

          {/* Drop Zone */}
          <section className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Drop Zone (Make your sentence here)
            </h3>
            <div className="min-h-[64px] md:min-h-[80px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-wrap items-center gap-2 p-3">
              {dropTiles.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Click word tiles below to build your sentence in order.
                </p>
              ) : (
                dropTiles.map((token, idx) => (
                  <button
                    key={`${token.text}-${idx}`}
                    type="button"
                    className={getDropTileClasses(token.role)}
                    disabled={validationState === "success"}
                  >
                    {token.text}
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Controls */}
          <section className="mb-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUndo}
              className="px-4 py-2 rounded-full bg-slate-200 text-slate-800 text-sm font-semibold shadow-sm hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
              disabled={undoDisabled || validationState === "success"}
            >
              Undo Last Word
            </button>
            <button
              type="button"
              onClick={handleCheck}
              className="px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow-sm hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              disabled={checkDisabled || validationState === "success"}
            >
              Check Sentence
            </button>
            <button
              type="button"
              onClick={handleNext}
              className={`px-4 py-2 rounded-full bg-indigo-500 text-white text-sm font-semibold shadow-sm hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition ${
                validationState === "success" ? "" : "opacity-40 cursor-not-allowed"
              } ${isLastLevel ? "hidden" : ""}`}
              disabled={validationState !== "success" || isLastLevel}
            >
              Next Level
            </button>
            {isLastLevel && validationState === "success" && (
              <button
                type="button"
                className="px-4 py-2 rounded-full bg-indigo-500 text-white text-sm font-semibold shadow-sm"
                disabled
              >
                All Levels Finished
              </button>
            )}
          </section>

          {/* Messages */}
          <section className="mb-4">
            {feedbackMessage && (
              <p
                className={`text-sm md:text-base font-semibold ${
                  validationState === "success"
                    ? "text-emerald-600"
                    : validationState === "error"
                    ? "text-red-600"
                    : "text-slate-700"
                }`}
              >
                {feedbackMessage}
              </p>
            )}
            {hintMessage && (
              <p className="text-sm text-red-600 mt-1">{hintMessage}</p>
            )}
          </section>

          {/* Word Bank */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Word Tiles (Click to place in the sentence)
            </h3>
            <div className="min-h-[72px] md:min-h-[88px] border border-slate-200 rounded-xl bg-slate-50 flex flex-wrap items-center gap-2 p-3">
              {bankIndices.length === 0 ? (
                <p className="text-xs text-slate-400">
                  All tiles are in the sentence.
                </p>
              ) : (
                bankIndices.map((idx) => {
                  const token = level.tokens[idx];
                  return (
                    <button
                      key={`${token.text}-${idx}`}
                      type="button"
                      className={getBankTileClasses()}
                      onClick={() => handleClickBankTile(idx)}
                      disabled={validationState === "success"}
                    >
                      {token.text}
                    </button>
                  );
                })
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              * Time Clue tiles (예:{" "}
              <span className="font-semibold">
                yesterday, now, tomorrow
              </span>
              ) tell you which verb tense to use.
            </p>
          </section>
        </main>

        {/* Review Entry */}
        {showReviewEntry && (
          <section className="mt-6 pt-4 border-t">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  All levels complete!
                </h3>
                <p className="text-sm text-slate-600">
                  Review the sentences you got wrong and compare them with the
                  correct answers.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenReview}
                className={`px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-semibold shadow-sm hover:bg-amber-600 transition ${
                  reviewOpened ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={reviewOpened}
              >
                Retry Incorrect Sentences (Review Mode)
              </button>
            </div>
          </section>
        )}

        {/* Review Mode */}
        {reviewOpened && (
          <section className="mt-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Review Mode – Compare and Learn
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Here are the sentences you answered incorrectly at least once.
              Compare your attempt with the correct sentence.
            </p>
            <div className="space-y-3">
              {reviewData.length === 0 ? (
                <p className="text-sm text-slate-600">
                  Great job! There are no incorrect sentences to review.
                </p>
              ) : (
                reviewData.map((item) => {
                  const lvl = levels[item.levelIndex];
                  return (
                    <div
                      key={lvl.id}
                      className="p-3 md:p-4 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <p className="text-sm font-semibold text-slate-800 mb-1">
                        Level {lvl.id} – {lvl.scenario}
                      </p>
                      <p className="text-sm text-red-700">
                        <span className="font-semibold">Your sentence:</span>{" "}
                        {item.incorrectSentence}
                      </p>
                      <p className="text-sm text-emerald-700 mt-1">
                        <span className="font-semibold">
                          Correct sentence:
                        </span>{" "}
                        {lvl.correctSentence}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Tip: Compare the time clue and check if the verb tense
                        matches.
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}


