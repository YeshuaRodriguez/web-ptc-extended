export default function NuestrosServiciosOL({ titulo = "", items = [] }) {
  return (
    <div className="p-10">
      <h1 className="font-bold text-2xl mb-4 text-brand-accent-90">{titulo}</h1>

      <ol className="space-y-2 list-disc list-inside">
        {items.map((item, index) => (
          <li key={index}>
            {item}
          </li>
        ))}
      </ol>
    </div>
  )
}
