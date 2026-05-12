import { useState, useEffect } from "react";
import TipoCambio from "@/api/bchapi";
import MiniHero from "@/components/Layout/MiniHero";

export default function HistorialTipoCambio() {

  const [historial, setHistorial] = useState([]);
  const [historialVenta, setHistorialVenta] = useState([])
  const [fecha] = useState(new Date().toLocaleDateString());

  useEffect(() => {

    const obtenerHistorial = async () => {

      const response = await fetch("https://web-ptc-extended.onrender.com/api/compra-dolar-historial");
      const data = await response.json();

      setHistorial(data);

    };

    obtenerHistorial();

  }, []);

  useEffect(() => {

    const obtenerHistorialVenta = async () => {

      const response = await fetch("https://web-ptc-extended.onrender.com/api/venta-dolar-historial");
      const data = await response.json();

      setHistorialVenta(data);

    };

    obtenerHistorialVenta();

  }, []);

  return (

    <>

      <MiniHero titulo="Historial de valor del dolar" descripcion="Archivo histórico (7 días) del tipo de cambio de referencia. Consulta valores pasados, datos oficiales actualizados." imgsrc="src/assets/img/hero/acercahero.jpg" id="titulo" />

      <p className="text-text-primary flex justify-center font-thin text-2xl m-20">{fecha}</p>

      <TipoCambio/>

      <div className="flex md:flex-row flex-col justify-center gap-10 my-40">

        <div className="flex flex-col items-center gap-10">
        <h1 className="text-lg md:text-3xl text-text-primary">Historial Compra de los últimos 7 días</h1>
        <table className="table-auto md:table-extended w-100 my-20 mt-0">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">Tipo</th>
              <th className="p-2">Fecha</th>
            </tr>
          </thead>
          <       tbody className="bg-gray-700">

            {historial.map((item, index) => (

              <tr key={index}>
                <td className="p-2">L {item.valor}</td>
                <td className="p-2">
                  {new Date(item.fecha).toLocaleDateString("es-HN")}
                </td>
              </tr>

            ))}

          </tbody>



        </table>
      </div>

      <div className="flex flex-col items-center gap-5">
        <h1 className="text-lg md:text-3xl text-text-primary">Historial Venta de los últimos 7 días</h1>
        <table className="table-auto md:table-extended w-100 my-20 mt-0">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">Tipo</th>
              <th className="p-2">Fecha</th>
            </tr>
          </thead>
          <       tbody className="bg-gray-700">

            {historialVenta.map((item, index) => (

              <tr key={index}>
                <td className="p-2">L {item.valor}</td>
                <td className="p-2">
                  {new Date(item.fecha).toLocaleDateString("es-HN")}
                </td>
              </tr>

            ))}

          </tbody>



        </table>
      </div>


      </div>
      

    </>

  )


}
