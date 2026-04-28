import React, { useState } from "react";
import "./QuestionList.css";

const normalizeQuestion = (q = {}) => ({
  question: q.question || "",
  options: Array.isArray(q.options) ? q.options : [],
  correctAnswer:
    typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
  rationale: q.rationale || "",
});

const QuestionList = ({ questions = [], setQuestions }) => {
  const safeQuestions = Array.isArray(questions)
    ? questions.map(normalizeQuestion)
    : [];

  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState(normalizeQuestion());

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditData(normalizeQuestion(safeQuestions[index]));
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData(normalizeQuestion());
  };

  const saveEdit = () => {
    const updated = [...safeQuestions];
    updated[editingIndex] = normalizeQuestion(editData);
    setQuestions(updated);
    cancelEdit();
  };

  const remove = (index) => {
    setQuestions(safeQuestions.filter((_, i) => i !== index));
    if (editingIndex === index) cancelEdit();
  };

  const updateOption = (idx, value) => {
    const opts = [...editData.options];
    opts[idx] = value;
    setEditData({ ...editData, options: opts });
  };

  const addOption = () => {
    setEditData({ ...editData, options: [...editData.options, ""] });
  };

  const removeOption = (idx) => {
    const opts = editData.options.filter((_, i) => i !== idx);
    setEditData({
      ...editData,
      options: opts,
      correctAnswer: Math.min(editData.correctAnswer, opts.length - 1),
    });
  };

  return (
    <div className="question-list">
      <h3>Questions ({safeQuestions.length})</h3>

      {safeQuestions.length === 0 ? (
        <p>No questions added yet.</p>
      ) : (
        safeQuestions.map((q, i) => (
          <div key={i} className="question-card">
            {editingIndex === i ? (
              <>
                <input
                  value={editData.question}
                  onChange={e =>
                    setEditData({ ...editData, question: e.target.value })
                  }
                />

                {editData.options.map((opt, idx) => (
                  <div key={idx}>
                    <input
                      value={opt}
                      onChange={e => updateOption(idx, e.target.value)}
                    />
                    <button onClick={() => removeOption(idx)}>✖</button>
                  </div>
                ))}

                <button onClick={addOption}>+ Add Option</button>

                <select
                  value={editData.correctAnswer}
                  onChange={e =>
                    setEditData({
                      ...editData,
                      correctAnswer: Number(e.target.value),
                    })
                  }
                >
                  {editData.options.map((_, idx) => (
                    <option key={idx} value={idx}>
                      Option {idx + 1}
                    </option>
                  ))}
                </select>

                <textarea
                  value={editData.rationale}
                  onChange={e =>
                    setEditData({ ...editData, rationale: e.target.value })
                  }
                />

                <button onClick={saveEdit}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <strong>{i + 1}. {q.question}</strong>
                <ul>
                  {q.options.map((o, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontWeight:
                          idx === q.correctAnswer ? "bold" : "normal",
                      }}
                    >
                      {o} {idx === q.correctAnswer && "✔"}
                    </li>
                  ))}
                </ul>
                <p><b>Rationale:</b> {q.rationale}</p>
                <button onClick={() => startEdit(i)}>Edit</button>
                <button onClick={() => remove(i)}>Delete</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default QuestionList;
