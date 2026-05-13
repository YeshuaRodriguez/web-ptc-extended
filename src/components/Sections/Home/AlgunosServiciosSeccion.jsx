import { InfiniteMovingCards } from "../../ui/effects/infinite-moving-cards";
import comercialImg from "../../../assets/img/Areaestrategica.jpg";
import mercadeoImg from "../../../assets/img/mercadeo.jpg"
import callcenterImg from "../../../assets/img/callcenter.jpg";
import creditosImg from "../../../assets/img/creditos.jpg";
import cobrosImg from "../../../assets/img/cobros.jpg";


export default function AlgunosServiciosSeccion(){

const servicios = [
  {
  quote: "Gestión integral multicanal enfocada en ventas y experiencia del cliente.",
  name: "Call Center",
  title: "Atención al Cliente",
  imgSrc: callcenterImg,
},
{
  quote: "Impulsamos el crecimiento mediante estrategias de ventas y optimización rentable del portafolio.",
  name: "Colocación de productos",
  title: "Área Estratégica",
  imgSrc: comercialImg,
},
{
  quote: "Administración estratégica del crédito con control y gestión de riesgo.",
  name: "Créditos",
  title: "Gestión Financiera",
  imgSrc: creditosImg,
},
{
  quote: "Recuperación efectiva de cartera con tecnología y comunicación empática.",
  name: "Gestión de Recuperación",
  title: "Gestión de Recuperación",
  imgSrc: cobrosImg,
},
{
  quote: "Diseñamos estrategias promocionales que conectan marcas con clientes.",
  name: "Mercadeo",
  title: "Área de Marketing",
  imgSrc: mercadeoImg,
},
];
    return(
        <>
        <section className="flex flex-col justify-center mb-40 my-40">
            <h1 className="text-text-primary text-center text-4xl p-10">Algunos de <span className="text-brand-accent">nuestros servicios</span></h1>
            <div className="flex flex-row justify-center gap-10">
            
                      <InfiniteMovingCards
                        items={servicios}
                        direction="right"
                        speed="slow"
                    />

            </div>

        </section>
        </>
    )

}