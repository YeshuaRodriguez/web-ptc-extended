"use client";

import { useState } from "react";
import ContactanosModalMensaje from "../Contacto/ContactanosModalMensaje";
import { Mail, SendHorizonal, ALargeSmall, User, Phone } from "lucide-react";


export default function ContactanosSeccion() {

  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

const [formData, setFormData] = useState({
  name: "",
  phone: "",
  replyEmail: "",
  subject: "",
  message: ""
});


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("https://web-ptc-extended.onrender.com/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error enviando el mensaje");
        return;
      }

      gtag('event', 'formulario_enviado')

      setModal(true);

      setFormData({
        replyEmail: "",
        subject: "",
        message: ""
      });


    } catch (error) {
      console.error("Error enviando el correo:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section
        className="bg-bg-contacto-seccion  py-16 md:py-24 px-6 md:px-10"
        id="contactanosSeccion"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">

          {/* Imagen */}
          <img src="https://i.imgur.com/fBoLOB2.png" alt="Icono de Correo" className="w-48 md:w-64"/>

          {/* Form */}
          <div className="flex flex-col text-center md:text-left w-full max-w-lg">

            <h1 className="text-3xl md:text-4xl text-text-inverse mb-6">
              Contáctanos
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">

              {/* Email */}
              <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="replyEmail"
                  placeholder="Correo"
                  value={formData.replyEmail}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-accent text-black"
                />
              </div>

              {/* Nombre */}
<div className="relative w-full">
  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input
    type="text"
    name="name"
    placeholder="Nombre completo"
    value={formData.name}
    onChange={handleChange}
    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-accent text-black"
  />
</div>

{/* Celular */}
<div className="relative w-full">
  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input
    type="tel"
    name="phone"
    placeholder="Celular (opcional)"
    value={formData.phone}
    onChange={handleChange}
    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-accent text-black"
  />
</div>

              {/* Subject */}
              <div className="relative w-full">
                <ALargeSmall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="subject"
                  placeholder="Asunto"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-accent text-black"
                />
              </div>

              {/* Message */}
              <textarea
                name="message"
                placeholder="Contenido"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="w-full resize-none border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent text-black"
              />

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className={`mt-4 flex justify-center items-center gap-2 py-3 rounded-xl 
                ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-brand-primary hover:bg-brand-accent hover:scale-105"
                  }
                text-white transition-all duration-300 cursor-pointer`}
              >
                {loading ? "Enviando..." : (
                  <>
                    <SendHorizonal className="w-5 h-5" />
                    Enviar
                  </>
                )}
              </button>

            </form>

            {modal && <ContactanosModalMensaje setModal={setModal} />}

          </div>
        </div>
      </section>
    </>
  );
}
