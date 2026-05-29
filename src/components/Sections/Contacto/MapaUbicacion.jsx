import ContactanosSeccion from "@/components/Sections/Home/ContactanosSeccion";
import MiniHero from "@/components/Layout/MiniHero";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import { ExternalLink } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

export default function MapaUbicacion() {

  return (

    <>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* MAPA */}
          <div className="h-[350px] md:h-[450px] lg:h-[500px]">
            <MapContainer className="w-full h-full rounded-3xl shadow-2xl" center={[14.101618715499235, -87.18704378869]} zoom={7}>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[14.10169991695398, -87.18727403105068]}>
                <Popup>
                  <a target="blank_" href="https://maps.app.goo.gl/JGZPHrFMcZmc7Zh9A" className="flex flex-row gap-1 items-center hover:scale-105 transition-all duration-200">
                    <h2>TGU - Procesadora de Tarjetas de Crédito</h2>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Popup>
              </Marker>
              <Marker position={[15.499364426712484, -88.03588537910699]}>
                <Popup>
                  <a target="blank_" href="https://maps.app.goo.gl/vqVQnR52QVp4ChZTA" className="flex flex-row gap-1 items-center hover:scale-105 transition-all duration-200">
                    <h2>SPS - Procesadora de Tarjetas de Crédito</h2>
                  </a>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          {/* TEXTO */}
          <div className="flex flex-col gap-6 text-text-primary justify-center items-center">

            <h2 className="text-2xl md:text-3xl font-semibold">
              Tegucigalpa
            </h2>
            <p className="text-base md:text-lg leading-relaxed">
              Procesadora de Tarjetas de Crédito,<br />
              Centro Comercial Novacentro, 2do y 3er Piso,<br />
              Entre Bulevar Morazán y Avenida La Paz,<br />
              Tegucigalpa 11101, Francisco Morazán, Honduras.
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold">
              San Pedro Sula
            </h2>
            <p className="text-base md:text-lg leading-relaxed">
              Procesadora de Tarjetas de Crédito,<br />
              Regional SPS Banrural,<br />
              15 Avenida S, 21104,<br />
              San Pedro Sula 21101, Cortés, Honduras.
            </p>
            <a
              href="https://www.google.com/maps/d/u/0/edit?mid=168gMpTaz0zIBqxu5yRFUJ74V7q4gYVc&usp=sharing"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-accent text-white hover:scale-105 transition-all duration-300 w-fit"
            >
              Ver en Google Maps
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>



    </>

  )

}