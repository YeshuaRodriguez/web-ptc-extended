import { useEffect, useState } from "react";
import { LoaderOne } from "@/components/ui/loader";

function TipoCambio() {

  const [compraDolar, setCompraDolar] = useState(null);
  const [ventaDolar, setVentaDolar] = useState(null);

  useEffect(() => {
    const obtenerCompraDolar = async () => {
      const response = await fetch("https://web-ptc-extended.onrender.com/api/compra-dolar");
      const data = await response.json();
      setCompraDolar(data.Valor);
    };

    obtenerCompraDolar();
  }, []);

  useEffect(() => {
    const obtenerVentaDolar = async () => {
      const response = await fetch("https://web-ptc-extended.onrender.com/api/venta-dolar");
      const data = await response.json();
      setVentaDolar(data.Valor);
    };

    obtenerVentaDolar();
  }, []);

  return (
    <>
      <div className="flex md:flex-row flex-col justify-center items-center gap-15 my-20 text-text-primary">

        <div className="flex flex-col justify-center items-center text-lg md:text-3xl">
          <h1 className="pb-5 tracking-tight">Valor <span className="text-brand-accent font-black">Compra</span> USD hoy:</h1>
          <h2 className="font-bold md:text-3xl text-3xl">
            {compraDolar ? `L ${compraDolar}` : <LoaderOne />}
          </h2>
        </div>

        <div className="flex flex-col justify-center items-center text-lg md:text-3xl">
          <h1 className="pb-5 tracking-tight">Valor <span className="text-brand-accent font-black">Venta</span> USD hoy:</h1>
          <h2 className="font-bold md:text-3xl text-3xl">
            {ventaDolar ? `L ${ventaDolar}` : <LoaderOne />}
          </h2>
        </div>

      </div>
    </>
  );

}

export default TipoCambio;
