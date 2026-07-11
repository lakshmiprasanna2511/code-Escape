export default function SuccessOverlay({ title, sub, xp, onNext, onStay, onStats }) {
  return (
    <div className="success-overlay open">
      <div className="success-title">{title}</div>
      <div className="success-sub">{sub}</div>
      <div className="success-xp">+{xp} XP</div>
      <div className="success-btns">
        <button className="snxt p" onClick={onNext}>NEXT LEVEL →</button>
        <button className="snxt s" onClick={onStay}>STAY</button>
        <button className="snxt s" onClick={onStats}>STATS</button>
      </div>
    </div>
  );
}
