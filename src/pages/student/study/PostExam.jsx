import React, { useState } from "react";
import "./PostExam.css";

const PostExam = ({ exam }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [show, setShow] = useState(false);

  if (!exam?.questions?.length) return null;

  const q = exam.questions[index];
  if (!q) return <p className="exam-done">✅ Exam completed</p>;

  const choose = (opt) => {
    setSelected(opt);
    setShow(true);

    setTimeout(() => {
      setSelected(null);
      setShow(false);
      setIndex((i) => i + 1);
    }, 5000);
  };

  return (
    <div className="post-exam">
      <h4>{exam.title}</h4>

      <p className="question">{q.question}</p>

      <div className="options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            disabled={show}
            className={
              show
                ? opt === q.correctAnswer
                  ? "correct"
                  : opt === selected
                  ? "wrong"
                  : ""
                : ""
            }
            onClick={() => choose(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      {show && (
        <div className="rationale">
          <strong>
            {selected === q.correctAnswer ? "Correct ✅" : "Incorrect ❌"}
          </strong>
          <p>{q.rationale}</p>
          <small>Next question in 5 seconds...</small>
        </div>
      )}
    </div>
  );
};

export default PostExam;
