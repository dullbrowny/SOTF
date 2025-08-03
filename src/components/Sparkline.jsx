// src/components/Sparkline.jsx
export default function Sparkline({ values = [], width = 160, height = 40 }) {
  if (!values.length) return <svg width={width} height={height}/>;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const norm = (v, i) => {
    const x = (i / (values.length - 1)) * (width - 2);
    const y = height - 2 - ((v - min) / (max - min || 1)) * (height - 4);
    return [x + 1, y];
  };
  const d = values.map((v,i)=>norm(v,i)).map(([x,y],i)=> (i?'L':'M')+x+','+y ).join(' ');
  const last = norm(values[values.length-1], values.length-1);
  return (
    <svg width={width} height={height}>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={values.map((v,i)=>norm(v,i).join(',')).join(' ')} opacity="0.7"/>
      <circle cx={last[0]} cy={last[1]} r="3" />
    </svg>
  );
}
