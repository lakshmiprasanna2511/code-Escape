import { useState } from 'react';
import { useStore } from '../store/useStore.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizPanel({ cat, lvlIdx, levels, onFinish }) {
  const toast = useStore((s) => s.toast);
  const addScore = useStore((s) => s.addScore);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const setGame = useStore((s) => s.setGame);
  const game = useStore((s) => s.game);

  const lv = levels[lvlIdx];
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const q = lv.questions[qIdx];
  const total = lv.questions.length;

  function select(idx) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = q.ans === idx;
    recordAttempt(correct);
    if (correct) {
      setCorrectCount((c) => c + 1);
      addScore(100);
      const key = cat === 'apt' ? 'aptScore' : 'engScore';
      setGame({ [key]: (game[key] || 0) + 100 });
      toast('✓ Correct! +100 XP');
    } else {
      addScore(-25);
      toast('✗ Wrong! -25 pts');
    }
  }

  function next() {
    if (qIdx + 1 >= total) {
      setDone(true);
      onFinish(correctCount, total);
    } else {
      setQIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  if (done) {
    const pct = Math.round((correctCount / total) * 100);
    return (
      <div className="quiz-result">
        <div className="quiz-score-big">{pct}%</div>
        <div className="quiz-score-label">{correctCount}/{total} correct answers</div>
        <div className="quiz-stat-row">
          <div>
            <div className="quiz-stat-val">+{correctCount * 100}</div>
            <div className="quiz-stat-lbl">XP EARNED</div>
          </div>
          <div>
            <div className="quiz-stat-val">{pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '🔄'}</div>
            <div className="quiz-stat-lbl">{pct >= 80 ? 'EXCELLENT' : pct >= 50 ? 'PASS' : 'TRY AGAIN'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-panel">
      <div className="quiz-header">
        <span className={`quiz-badge ${cat === 'apt' ? 'aptitude' : 'english'}`}>{cat === 'apt' ? '🧠 APTITUDE' : '📖 ENGLISH'}</span>
        <div className="quiz-progress"><div className="quiz-progress-fill" style={{ width: `${(qIdx / total) * 100}%` }} /></div>
        <span className="quiz-qnum">{qIdx + 1}/{total}</span>
      </div>
      <div className="quiz-body">
        <div className="quiz-question">{q.q}</div>
        <div className="quiz-options">
          {q.opts.map((opt, i) => {
            let cls = 'quiz-opt';
            if (answered) {
              if (i === q.ans) cls += ' correct';
              else if (i === selected) cls += ' wrong';
            } else if (i === selected) cls += ' selected';
            return (
              <div key={i} className={cls} onClick={() => select(i)}>
                <span className="quiz-opt-letter">{LETTERS[i]}</span>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
        {answered && (
          <div className="quiz-explanation show">
            <b>💡 Explanation:</b> <span dangerouslySetInnerHTML={{ __html: ' ' + q.exp }} />
          </div>
        )}
      </div>
      <div className="quiz-actions">
        <button className="quiz-next-btn" disabled={!answered} onClick={next}>NEXT →</button>
      </div>
    </div>
  );
}
