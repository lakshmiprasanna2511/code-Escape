import { useEffect, useState } from 'react';
import { useStore, CODING_LEVELS } from '../store/useStore.js';
import { getTemplate } from '../data/codingLevels.js';

function simRun(code) {
  if (!code.trim()) return { m: 'No code to run.', c: 'er' };
  if (code.includes('print(') || code.includes('console.log') || code.includes('System.out') || code.includes('SELECT'))
    return { m: 'Execution simulated ✓. Use Submit to validate.', c: 'ok' };
  return { m: 'Code received. Add print() to see output.', c: '' };
}

export default function PuzzleModal({ lvlIdx, objKey, lang, onClose, onSolved }) {
  const toast = useStore((s) => s.toast);
  const addScore = useStore((s) => s.addScore);
  const incLangStat = useStore((s) => s.incLangStat);
  const recordAttempt = useStore((s) => s.recordAttempt);

  const lv = CODING_LEVELS[lvlIdx];
  const o = lv.objs[objKey];

  const [code, setCode] = useState(getTemplate(lang, objKey));
  const [output, setOutput] = useState({ m: 'Output will appear here...', c: '' });
  const [state, setState] = useState(''); // '', 'cor', 'wrg'
  const [hintLvl, setHintLvl] = useState(0);
  const [hintText, setHintText] = useState('');

  useEffect(() => { setCode(getTemplate(lang, objKey)); }, [lang, objKey]);

  function run() {
    setOutput(simRun(code));
  }
  function useHint() {
    if (hintLvl >= o.hints.length) { toast('No more hints!'); return; }
    addScore(-50);
    setHintText(o.hints[hintLvl]);
    setHintLvl((h) => h + 1);
    toast('-50 pts for hint');
  }
  function submit() {
    const hasPat = o.pats.some((p) => p.test(code));
    const hasStructure = /def |function|return|int |bool|SELECT/i.test(code);
    let pass = false, msg = '';
    if (code.length < 20) msg = 'Solution too short.';
    else if (!hasStructure) msg = 'Missing function definition or return.';
    else if (!hasPat) msg = "Logic doesn't match expected output.";
    else pass = true;

    recordAttempt(pass);

    if (pass) {
      const xp = Math.max(50, o.xp - hintLvl * 30);
      addScore(xp);
      incLangStat(lang);
      setState('cor');
      setOutput({ m: '✓ ACCESS GRANTED — +' + xp + ' XP earned!', c: 'ok' });
      setTimeout(() => onSolved(xp), 650);
    } else {
      addScore(-25);
      setState('wrg');
      setOutput({ m: '✗ ACCESS DENIED — ' + msg, c: 'fail' });
      toast('Wrong answer. -25 pts');
    }
  }

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hdr">
          <div className="modal-ico">{o.ico}</div>
          <div className="modal-title">{o.ttl}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-scenario">{o.scen}</div>
          <div className="modal-problem">{o.prob}</div>
          <div className="modal-example">
            <div className="modal-example-lbl">EXAMPLE</div>
            <code>{o.exmp}</code>
          </div>
          <textarea
            className={`modal-editor${state === 'cor' ? ' cor' : state === 'wrg' ? ' wrg' : ''}`}
            spellCheck={false}
            value={code}
            onChange={(e) => { setCode(e.target.value); setState(''); }}
          />
          <div className={`modal-output${output.c === 'ok' ? ' ok' : output.c === 'fail' ? ' fail' : ''}`}>{output.m}</div>
          {hintText && <div className="hint-text show">💡 {hintText}</div>}
          <div className="modal-actions">
            <button className="mact run" onClick={run}>▶ RUN</button>
            <button className="mact hint" onClick={useHint}>◆ HINT</button>
            <button className="mact sub" onClick={submit}>SUBMIT</button>
          </div>
        </div>
      </div>
    </div>
  );
}
