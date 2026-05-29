import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShineCard } from "./ShineCard"
import { fadeUp } from "../animations"
import { ShineCardInverse } from "./ShineCardInverse"
import boxesPosImg from "../../assets/img/boxes/boxespos.webp"
import boxesAtmImg from "../../assets/img/boxes/boxesatm.webp"


const MotionImg = motion.img

function AnimatedWord({ words }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % words.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [words])

  return (
    <span className="inline-block overflow-hidden align-bottom h-[1.2em] relative">
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

const statWords = ["Comercios", "Empresas", "Negocios", "Bancos", "Tiendas", "Restaurantes", "Agencias"]

export default function BoxesSection() {
  return (
    <div className="grid md:grid-cols-3 grid-cols-1 md:grid-rows-3 gap-7 md:m-40 m-10 md:h-150 md:mb-10">

      {/* col 1, row 1 */}
      <MotionImg
        src={boxesPosImg}
        alt="img-1"
        className="md:col-start-1 md:row-start-1 rounded-2xl object-cover w-full min-h-48 md:h-full hover:scale-105 transition"
        variants={fadeUp(0.6, 0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      />

      {/* col 2, row 1 */}
      <div className="md:col-start-2 md:row-start-1 md:h-full">
        <ShineCardInverse
          title={<AnimatedWord words={statWords} />}
          subtitle="Servimos a"
          desc=""
          isHrOn={false}
          textSize="5xl"
          delay={0.1}
        />
      </div>

      {/* col 3, rows 1-2 */}
      <div className="md:col-start-3 md:row-start-1 md:row-span-2 md:h-full">
        <ShineCard
          title="POS"
          textSize="3xl"
          subtitle="Retiros y autoservicio"
          desc="Procesamos pagos en puntos de venta de forma rápida y segura. Conectamos comercios con bancos para que cada compra con tarjeta se apruebe en segundos."
          delay={0.2}
        />
      </div>

      {/* col 1, rows 2-3 */}
      <div className="md:col-start-1 md:row-start-2 md:row-span-2 md:h-full">
        <ShineCard
          title="ATM"
          textSize="3xl"
          subtitle="Retiros y autoservicio"
          desc="Gestionamos transacciones en cajeros automáticos, permitiendo retiros, consultas y más. Aseguramos disponibilidad, control y continuidad en cada operación."
          delay={0.3}
        />
      </div>

      {/* col 2, rows 2-3 */}
      <div className="md:col-start-2 md:row-start-2 md:row-span-2 md:h-full">
        <ShineCard
          title="Tarjetas"
          textSize="3xl"
          subtitle="Emisión y gestión"
          desc="Creamos, administramos y damos seguimiento a tarjetas de crédito y débito. Desde la aprobación hasta el uso diario, controlamos todo el ciclo de vida."
          delay={0.4}
        />
      </div>

      {/* col 3, row 3 */}
      <MotionImg
        src={boxesAtmImg}
        alt="img-2"
        className="md:col-start-3 md:row-start-3 rounded-2xl object-cover w-full min-h-48 md:h-full hover:scale-105 transition"
        variants={fadeUp(0.6, 0.5)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      />

    </div>
  )
}
