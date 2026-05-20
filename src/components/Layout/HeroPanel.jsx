  import HeroButton from "../ui/Buttons/HeroButton"
import { ChevronsDown, CreditCard, ShieldBan, HandCoins } from "lucide-react"
import { heroImages } from "/src/data/heroImages"
import { fadeInBlur } from "../animations"
import { motion } from "framer-motion";

import heroImg from "../../assets/img/hero/herodisenoptcvisa.webp";
import ptcLogo from "../../assets/img/common/PTC_2-removebg-preview.png";


export default function HeroPanel() {


  const randomIndex = Math.floor(Math.random() * heroImages.length)
  const randomImage = heroImages[randomIndex]

  return (

    <>

      <motion.section variants={fadeInBlur(1, 0.2)} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative w-full min-h-screen overflow-hidden" id="titulo">

        <img src={heroImg} alt="Hero background" className="absolute inset-0 w-full h-full object-cover z-0" />

        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute bottom-0 left-0 right-0 h-24 md:h-36 z-10"
          style={{ background: "linear-gradient(to top, var(--bg) 0%, transparent 100%)" }}
        />

        <div className="relative z-20 flex min-h-screen items-center justify-center md:justify-end text-text-primary px-10">

          <motion.div variants={fadeInBlur(1, 0.6)} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-4xl">

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">

              <img src={ptcLogo} alt="" className="h-16 w-16 md:h-24 md:w-24" />

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-linear-to-br from-slate-50 to-slate-400 bg-clip-text text-transparent leading-tight md:mr-20">
                Procesadora de <br /> Tarjetas de Crédito
              </h1>

            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 items-center justify-center">
              <p className="flex gap-2 text-white/80">
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="gradient" gradientTransform="rotate(45)">
                      <stop offset="0%" stopColor="#0f1929" />
                      <stop offset="100%" stopColor="#5D8BB5" />
                    </linearGradient>
                  </defs>
                </svg>
                <CreditCard stroke="url(#gradient)" />
                 Procesamiento y Gestión Integral</p>
              <p className="flex gap-2 text-white/80"><ShieldBan stroke="url(#gradient)"/> Seguridad en Tiempo Real</p>
              <p className="flex gap-2 text-white/80"><HandCoins stroke="url(#gradient)"/> Inteligencia Financiera</p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-6">
              <HeroButton />
              <ChevronsDown className="w-10 h-10 md:w-12 md:h-12 text-text-primary-static animate-pulse" />
            </div>

          </motion.div>

        </div>
      </motion.section>

    </>

  )

}
