import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

function AnimatedWord({ words }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % words.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [words])

  return (
    <span className="overflow-hidden align-bottom h-[1.2em] relative">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[index]}
          className="font-black text-brand-accent inline-block"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function ProcesamosSection() {
  const words = ["emisores", "adquirentes", "ustedes"]

  return (
    <div className=" flex flex-col justify-center gap-2 text-center mt-40 md:mt-20 mx-10">
      <h1 className="text-5xl hover:scale-102 transition text-text-primary font-black tracking-tight">
        Procesadora para <AnimatedWord words={words} />
      </h1>
      <p className="hover:scale-102 transition text-text-primary max-w-200 mx-auto">
        Procesamos cada transacción en tiempo real, aseguramos su validación
        y liquidación, y acompañamos a nuestros clientes en toda la operación:
        emisión de tarjetas, administración, cobranza, monitoreo y prevención
        de fraude. Nuestro proceso se basa principalmente en:
      </p>
    </div>
  )
}