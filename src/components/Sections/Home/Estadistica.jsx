import NumberCounter from "./Components/NumberCounter"

export default function Estadistica(){

    return(

        <>
        
<section className="text-text-primary flex flex-col md:flex-row items-center justify-center gap-16 md:gap-20 my-24 md:my-40 px-6">

  {/* Estadistica 1 */}
  <div className="text-center">
    <div className="text-3xl md:text-5xl font-bold flex justify-center">
      <NumberCounter value={40000000} duration={1} />
      <p>+</p>
    </div>
    <p className="py-2 text-base md:text-lg bg-clip-text text-transparent bg-gradient-to-t from-brand-secondary to-brand-accent-70">
      Lempiras procesados diario
    </p>
  </div>

  {/* Separador */}
  <div className="hidden md:block h-24 w-px bg-text-primary/40" />
  <div className="block md:hidden w-24 h-px bg-text-primary/40" />

  {/* Estadistica 2 */}
  <div className="text-center">
    <div className="text-3xl md:text-5xl font-bold flex justify-center">
      <NumberCounter value={100000} duration={1} />
      <p>+</p>
    </div>
    <p className="py-2 text-base md:text-lg bg-clip-text text-transparent bg-gradient-to-r from-brand-secondary to-brand-accent">
      Lorem ipsu dolor sit
    </p>
  </div>

</section>
        
        </>

    )

}