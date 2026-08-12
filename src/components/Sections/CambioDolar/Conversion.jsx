import { useState, useEffect } from "react";

export default function Conversion() {
  const [historialVenta, setHistorialVenta] = useState([]);
  const [montoConvertido, stMontoConvertido] = useState([]);

  useEffect(() => {
    const obtenerHistorialVenta = async () => {
      const response = await fetch(
        "https://web-ptc-extended.onrender.com/api/venta-dolar-historial"
      );
      const data = await response.json();
      setHistorialVenta(data);
    };

    obtenerHistorialVenta();
  }, []);

  const ultimaVenta = historialVenta[historialVenta.length - 7];
  const ultimaVentaTxt = ultimaVenta?.valor?.toString() ?? "";

  console.log(ultimaVentaTxt);

  return (
    <>
      <div className="flex justify-center">
        <form action="" className="flex flex-col gap-2">
          <label htmlFor="" className="text-text-primary">
            Conversión Lempira a Dolar
          </label>
          <div className="flex gap-4 items-center">
          <div className="bg-white rounded-md p-1 border-1 border-brand-accent">
            <input
              type="text"
              id="cantidadUsuario"
              className="focus:ring-0 focus:outline-none text-brand-primary"
              placeholder={ultimaVentaTxt}
            />
          </div>
          <label htmlFor="" className="text-text-primary">=</label>
          <label htmlFor="" className="text-text-primary font-bold">USD $00.00</label>
          </div>
        </form>
      </div>
    </>
  );
}
