import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function StatCard({ title, value, subtitle, subtitleType, compareValue, invertLogic = false, tooltip }) {

    const getSubtitleType = () => {
    if (compareValue === undefined || compareValue === null) return "neutral"
    if (compareValue === 0) return "neutral"
    
    const isPositiveChange = compareValue > 0
    return (isPositiveChange !== invertLogic) ? "positive" : "negative"
  }

  const subtitleColor = {
    neutral: "text-text-inverse",
    positive: "text-emerald-500",
    negative: "text-red-700",
  }[getSubtitleType()]


  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col shadow-md gap-2 bg-white rounded-lg p-10 md:min-w-50 border-solid border-1 border-bg-110 hover:border-bg-120 hover:scale-102 transition">
            <h1 className="text-brand-primary font-bold md:text-md">{title}</h1>
            <hr className="h-0 w-15 border-solid border-1 border-gray-300" />
            <h1 className="text-brand-accent font-bold md:text-2xl text-3xl">{value}</h1>
            <p className={subtitleColor}>{subtitle}</p>
        </div>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}
