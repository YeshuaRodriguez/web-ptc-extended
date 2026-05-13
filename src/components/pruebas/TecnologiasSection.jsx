import { motion } from "framer-motion"
import pixelpayImg from "../../assets/img/ecommerce.jpeg";
import tapToPhoneImg from "../../assets/img/taptophone.png";

const fadeUp = (duration = 0.6, delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.4, 0, 0.2, 1] },
  },
})

function TechCard({ img, name, tag, description, align = "left", delay = 0 }) {
  return (
    <motion.div
      className="relative group flex-1 min-h-[520px] rounded-3xl overflow-hidden"
      variants={fadeUp(0.7, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      {/* Background image */}
      <img
        src={img}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
      />

      {/* Dark overlay — stronger at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060d16]/95 via-[#0f1929]/60 to-transparent" />

      {/* Accent line top */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, transparent, #5D8BB5, transparent)" }}
      />

      {/* Tag */}
      <div className="absolute top-6 left-6">
        <span
          className="text-xs font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full border"
          style={{
            color: "#81aed8",
            borderColor: "rgba(255, 255, 255, 0.35)",
            background: "rgba(93,139,181,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          {tag}
        </span>
      </div>

      {/* Content bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h3
          className="text-4xl font-black mb-3"
          style={{ color: "#fff" }}
        >
          {name}
        </h3>

        {/* Divider */}
        <div
          className="mb-4 h-[2px] w-12 rounded-full transition-all duration-500 group-hover:w-24"
          style={{ background: "#5D8BB5" }}
        />

        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default function TecnologiasSection() {
  return (
    <section className="relative py-24 px-6 md:px-20 overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-[120px]"
        style={{ background: "#5D8BB5" }}
      />

      {/* Header */}
      <motion.div
        className="text-center mb-16"
        variants={fadeUp(0.6, 0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <p
          className="text-xs tracking-[0.3em] uppercase mb-4"
          style={{ color: "#5D8BB5" }}
        >
          Innovación en cada transacción
        </p>
        <h2
          className="text-4xl md:text-5xl font-black"
          style={{ color: "var(--text-primary)" }}
        >
          Nuestras
          <br />
          <span style={{ color: "#5D8BB5" }}>soluciones</span>
        </h2>
      </motion.div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
        <TechCard
          img={pixelpayImg}
          name="E-commerce"
          tag="Pagos digitales"
          description="Contamos con plataformas de pagos digitales diseñadas para simplificar cada transacción. Rápida, segura y construida para escalar con tu negocio desde el primer día."
          delay={0.15}
        />
        <TechCard
          img={tapToPhoneImg}
          name="TapToPhone"
          tag="Punto de venta"
          description="Convierte cualquier smartphone en un terminal de pago. Sin hardware adicional, sin complicaciones — solo acerca la tarjeta y listo."
          delay={0.3}
        />
      </div>
    </section>
  )
}
