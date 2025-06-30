import '../styles/Agent.css'

export default function Agent({ name, x, y }) {
  return (
    <div
      className={"agent circle"}
      style={{
        left: `${x * 40}px`,
        top: `${y * 40}px`,
      }}
    >
      <div className="name">{name}</div>
    </div>
  )
}