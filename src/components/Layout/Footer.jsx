import { HashLink } from "react-router-hash-link"
import { Linkedin } from "lucide-react"
import FooterColumn from "./FooterColumn";
import ptcLogo from "../../assets/img/common/PTC_2-removebg-preview.png";


  const footerData = [
    {
      title: "Acerca",
      links: [
        { label: "¿Quiénes Somos?", to: "/acerca#quienesSomos" },
        { label: "Misión y Visión", to: "/#misionYVision" },
        { label: "¿Qué hacemos?", to: "/acerca#queHacemos" },
        { label: "¿Cómo lo hacemos?", to: "/acerca#comoLoHacemos" },
        { label: "Valores", to: "/acerca#valores" },
        { label: "Nuestros Servicios", to: "/servicios#titulo" },
      ],
    },
    {
      title: "Contáctanos",
      links: [
        { label: "Contacto", to: "/contacto#contactanosSeccion" },
        { label: "Ubicación", to: "/contacto#ubicacion" },
      ],
    },
    {
      title: "Redes",
      links: [
        {
          label: "LinkedIn",
          to: "https://www.linkedin.com/company/procesadora-de-tarjetas-de-cr%C3%A9dito-honduras/?originalSubdomain=hn",
          external: true,
          icon: <Linkedin size={16} />,
        },
      ],
    },
  ];


export default function Footer(){

    return(
      
        <>
        
      <footer className="bg-bg-footer py-12 px-6 md:px-20">

  <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12">

    {/* Columnas */}
    <div className="text-text-primary-static flex flex-col sm:flex-row gap-12 text-center md:text-left">
      {footerData.map((column, idx) => (
        <FooterColumn
          key={idx}
          title={column.title}
          links={column.links}
        />
      ))}
    </div>

    {/* Logo */}
    <img
      src={ptcLogo}
      alt=""
      className="w-12 h-12"
    />

  </div>

  {/* Divider */}
  <hr className="border-white/30 my-8" />

  {/* Copyright */}
  <p className="text-text-primary-static text-center text-sm">
    © 2026 Procesadora de Tarjetas de Crédito | Todos los derechos reservados
  </p>

</footer>
        
        </>

    )

}