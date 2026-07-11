import { useEffect, useState } from 'react';
import { useStore, CODING_LEVELS } from '../store/useStore.js';
import { getTemplate } from '../data/codingLevels.js';

function simRun(code) {
  if (!code.trim()) return { m: 'No code to run.', c: 'er' };
  if (code.includes('print(') || code.includes('console.log') || code.includes('System.out') || code.includes('SELECT'))
    return { m: 'Execution simulated ✓. Use Submit to validate.', c: 'ok' };
  return { m: 'Code received. Add print() to see output.', c: '' };
}

export default function CodePanel({ lvlIdx, objKey, lang, setLang, onOpenObject, onSolved }) {
  const toast = useStore((s) => s.toast);
  const addScore = useStore((s) => s.addScore);
  const incLangStat = useStore((s) => s.incLangStat);
  const recordAttempt = useStore((s) => s.recordAttempt);

  const lv = CODING_LEVELS[lvlIdx];
  const o = objKey ? lv.objs[objKey] : null;

  const [code, setCode] = useState(objKey ? getTemplate(lang, objKey) : '');
  const [output, setOutput] = useState({ m: 'Awaiting execution...', c: '' });

  useEffect(() => {
    setCode(objKey ? getTemplate(lang, objKey) : '');
    setOutput({ m: 'Awaiting execution...', c: '' });
  }, [objKey, lang]);

  function run() { setOutput(simRun(code)); }

  function submit() {
    if (!objKey) { toast('Select a puzzle first!'); return; }
    const hasPat = o.pats.some((p) => p.test(code));
    const hasStructure = /def |function|return|int |bool|SELECT/i.test(code);
    let pass = false, msg = '';
    if (code.length < 20) msg = 'Solution too short.';
    else if (!hasStructure) msg = 'Missing function definition or return.';
    else if (!hasPat) msg = "Logic doesn't match expected output.";
    else pass = true;

    recordAttempt(pass);

    if (pass) {
      const xp = Math.max(50, o.xp);
      addScore(xp);
      incLangStat(lang);
      setOutput({ m: '✓ CORRECT! +' + xp + ' XP earned!', c: 'ok' });
      setTimeout(() => onSolved(objKey, xp), 400);
    } else {
      addScore(-25);
      setOutput({ m: '✗ WRONG: ' + msg, c: 'er' });
      toast('Wrong answer. -25 pts');
    }
  }

  const lines = (code || '').split('\n').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-hdr">
        <div className="panel-hdr-title">// CHALLENGE EDITOR</div>
        <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="sql">SQL</option>
        </select>
      </div>
      <div className="problem-box">
        <div className="problem-title">{o ? o.ttl : 'SELECT AN OBJECT'}</div>
        <div className="problem-tag">{o ? o.tag : 'CHALLENGE'}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6, fontFamily: 'var(--f-mono)' }}>
          {o ? o.prob : 'Click any glowing object in the room to reveal a coding challenge.'}
        </div>
      </div>
      <div className="editor-area">
        <div className="line-nums">{Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}</div>
        <textarea
          className="code-editor"
          spellCheck={false}
          placeholder="// Write your solution here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="output-panel">
        <div className="output-label">OUTPUT</div>
        <div className={`output-text${output.c === 'ok' ? ' ok' : output.c === 'er' ? ' er' : ''}`}>{output.m}</div>
      </div>
      <div className="code-actions">
        <button className="btn-run" onClick={run}>▶ RUN</button>
        <button className="btn-submit" onClick={submit}>SUBMIT ✓</button>
      </div>
    </div>
  );
}
