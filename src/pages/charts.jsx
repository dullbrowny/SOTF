import { Line as LineChart } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

export function Line({ labels, values }) {
  const data = { labels, datasets: [{ label: 'Mastery %', data: values }] }
  const options = { responsive: true, scales: { y: { min: 0, max: 100 } } }
  return <LineChart data={data} options={options} />
}

// Simple heatmap placeholder using table cells (no external deps)
export function Heatmap({ labels, matrix }) {
  const max = Math.max(...matrix.flat())
  return (
    <table className="table mono">
      <thead><tr><th>Topic</th>{labels.map((l,i)=><th key={i}>{l}</th>)}</tr></thead>
      <tbody>
        {matrix.map((row, rIdx) => (
          <tr key={rIdx}>
            <td>Topic {rIdx+1}</td>
            {row.map((v, cIdx) => {
              const intensity = Math.round((v/max)*255)
              const bg = `rgb(${255-intensity}, ${40+intensity/2}, ${40})`
              return <td key={cIdx} style={{background:bg}}>{v}</td>
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
