import React, { useState } from "react";
import "./QuestionBuilder.css";

const QuestionBuilder = ({ setQuestions }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correct, setCorrect] = useState(0);
  const [rationale, setRationale] = useState("");

  const addQuestion = () => {
    if (!question.trim()) {
      return alert("Question text is required");
    }

    if (!Array.isArray(options) || options.length < 2 || options.some(o => !o.trim())) {
      return alert("Provide at least 2 filled options");
    }

    if (correct < 0 || correct >= options.length) {
      return alert("Select a valid correct option");
    }

    if (!rationale.trim()) {
      return alert("Rationale is required");
    }

    setQuestions(prev => [
      ...(Array.isArray(prev) ? prev : []),
      {
        question: question.trim(),
        options: options.map(o => o.trim()),
        correctAnswer: Number(correct),
        rationale: rationale.trim(),
      },
    ]);

    // Reset
    setQuestion("");
    setOptions(["", ""]);
    setCorrect(0);
    setRationale("");
  };

  return (
    <div className="question-builder">
      <h3>Add Question</h3>

      <textarea
        placeholder="Question"
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />

      {options.map((opt, i) => (
        <input
          key={i}
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChange={e => {
            const copy = [...options];
            copy[i] = e.target.value;
            setOptions(copy);
          }}
        />
      ))}

      <button onClick={() => setOptions([...options, ""])}>+ Add Option</button>

      <select value={correct} onChange={e => setCorrect(Number(e.target.value))}>
        {options.map((_, i) => (
          <option key={i} value={i}>
            Correct Option {i + 1}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Rationale"
        value={rationale}
        onChange={e => setRationale(e.target.value)}
      />

      <button onClick={addQuestion}>Add Question</button>
    </div>
  );
};

export default QuestionBuilder;
