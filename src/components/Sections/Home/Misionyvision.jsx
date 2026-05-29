import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import CreditCard3D from "./Components/CreditCard3D"

export default function Misionyvision() {
  const sectionRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // El img se mueve lento (parallax suave al fondo)
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])

  // El contenido se mueve más rápido (parece estar al frente)
  const contentY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"])

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col md:flex-row gap-12 my-24 md:my-40 py-24 md:py-40 px-6 md:px-0 overflow-hidden"
      id="misionYVision"
    >
      <motion.img
        style={{ y: imgY }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        viewport={{ once: true }}
        src="https://i.imgur.com/9LNA1Il.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
      />

      {/* Contenido — se mueve MÁS */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mx-auto gap-12"
      >
        {/* Card */}
        <div className="flex justify-center">
          <CreditCard3D />
        </div>

        {/* Texto */}
        <div className="flex flex-col gap-10 text-text-white max-w-2xl text-center md:text-left">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="hover:scale-105 transition duration-500"
          >
            <h1 className="font-black text-2xl md:text-4xl mb-2 text-text-primary-static drop-shadow-xs drop-shadow-brand-primary tracking-tight">Misión</h1>
            <p className="md:text-lg leading-relaxed text-text-primary-static drop-shadow-xs drop-shadow-brand-primary">
              Somos un aliado estratégico de empresas financieras, enfocados en
              satisfacer las necesidades de los clientes de medios de pago con
              transparencia y responsabilidad social.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="hover:scale-105 transition duration-500"
          >
            <h1 className="font-black text-2xl md:text-4xl mb-2 text-text-primary-static drop-shadow-xs drop-shadow-brand-primary tracking-tight">Visión</h1>
            <p className="text-text-primary-static drop-shadow-xs drop-shadow-brand-primary md:text-lg leading-relaxed">
              Ocupar una posición de liderazgo en medios de pagos electrónicos,
              contribuyendo al desarrollo con responsabilidad social en el
              mercado donde operen nuestros clientes.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}