import './ambient-background.css'

const ORBS = [
  ['7%', '4%', '280px', '42s', '-11s', 'ambient-drift-a'],
  ['66%', '1%', '180px', '64s', '-39s', 'ambient-drift-b'],
  ['84%', '13%', '360px', '78s', '-18s', 'ambient-drift-c'],
  ['24%', '20%', '110px', '51s', '-31s', 'ambient-drift-d'],
  ['52%', '27%', '420px', '88s', '-54s', 'ambient-drift-a'],
  ['-5%', '34%', '230px', '69s', '-22s', 'ambient-drift-c'],
  ['76%', '40%', '125px', '37s', '-9s', 'ambient-drift-b'],
  ['35%', '47%', '310px', '73s', '-47s', 'ambient-drift-d'],
  ['92%', '53%', '210px', '58s', '-26s', 'ambient-drift-a'],
  ['12%', '59%', '390px', '83s', '-61s', 'ambient-drift-b'],
  ['61%', '65%', '95px', '34s', '-16s', 'ambient-drift-c'],
  ['79%', '71%', '330px', '76s', '-44s', 'ambient-drift-d'],
  ['29%', '77%', '165px', '49s', '-35s', 'ambient-drift-a'],
  ['-4%', '84%', '300px', '81s', '-57s', 'ambient-drift-b'],
  ['49%', '89%', '400px', '86s', '-24s', 'ambient-drift-c'],
  ['88%', '95%', '140px', '45s', '-29s', 'ambient-drift-d'],
]

export default function AmbientBackground() {
  return (
    <div className="ambient-background" aria-hidden="true">
      <div className="ambient-mesh" />
      <div className="ambient-lines" />
      <div className="ambient-orbs">
        {ORBS.map(([left, top, size, duration, delay, animation], index) => (
          <i className={`ambient-orb ambient-orb-${index + 1}`} key={index} style={{ '--ambient-left': left, '--ambient-top': top, '--ambient-size': size, '--ambient-duration': duration, '--ambient-delay': delay, '--ambient-animation': animation }} />
        ))}
      </div>
      <div className="ambient-noise" />
    </div>
  )
}
