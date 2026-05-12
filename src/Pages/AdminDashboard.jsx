import { ChartSpline, StickyNote, Earth, Undo2, MousePointerClick } from "lucide-react"
import { HashLink } from "react-router-hash-link"
import AdminHeader from "@/components/admin/AdminHeader"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import StatCard from "@/components/admin/StatCard"
import { useState, useEffect } from "react"
import StatList from "@/components/admin/StatList"
import SevenDaysViewsGraph from "@/components/admin/7DaysViewsGraph"
import DeviceViews from "@/components/admin/DeviceViews"
import ViewsPorHora from "@/components/admin/ViewsPorHora"
import { useAuth0 } from "@auth0/auth0-react"


export default function AdminDashboard() {

    const { getAccessTokenSilently } = useAuth0()

    const [analytics, setAnalytics] = useState(null)
    const [historial, setHistorial] = useState([])
    const [paginas, setPaginas] = useState([])
    const [ubicacion, setUbicacion] = useState([])
    const [eventos, setEventos] = useState([])
    const [dispositivos, setDispositivos] = useState([])
    const [horas, setHoras] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const token = await getAccessTokenSilently({
                authorizationParams: {
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE
                }
            })

            console.log("Token:", token)
            console.log("Audience env:", import.meta.env.VITE_AUTH0_AUDIENCE)

            const headers = { Authorization: `Bearer ${token}` }

            const [resumen, historial, paginas, ubicacion, eventos, dispositivos, horas] = await Promise.all([
                fetch("https://web-ptc-extended.onrender.com/api/analytics/resumen", { headers }).then(res => res.json()),
                fetch("https://web-ptc-extended.onrender.com/api/analytics/historial", { headers }).then(res => res.json()),
                fetch("https://web-ptc-extended.onrender.com/api/analytics/paginas", { headers }).then(res => res.json()),
                fetch("https://web-ptc-extended.onrender.com/api/analytics/ubicacion", { headers }).then(res => res.json()),
                fetch("https://web-ptc-extended.onrender.com/api/analytics/eventos", { headers }).then(res => res.json()),
                fetch("https://web-ptc-extended.onrender.com/api/analytics/dispositivos", { headers }).then(res => res.json()),
                fetch("https://web-ptc-extended.onrender.com/api/analytics/horas", { headers }).then(res => res.json()),
            ])

            setAnalytics(resumen)
            setHistorial(historial)
            setPaginas(paginas)
            setUbicacion(ubicacion)
            setEventos(eventos)
            setDispositivos(dispositivos)
            setHoras(horas)
        }

        fetchData().catch(err => console.error("Error fetching analytics:", err))
    }, [getAccessTokenSilently])

    //const reboteHoy = 43
    //const reboteAyer = 46
    //const visitasHoy = 2
    //const visitasAyer = 2
    //const paginaMasVisitadaMock = "Home"
    //const tiempoPromedioMock = 5
    //const tiempoPromedioMockAyer = 3
    //const tasaReboteMock = 63
    //const tasaReboteMockAyer = 50
    //const usuariosNuevosMock = 10
    //const usuariosNuevosMockAyer = 5
    //const top1 = "aaa"
    //const top2 = "aaa"
    //const top3 = "aaa"
    //const stat1 = 123
    //const stat2 = 123
    // const stat3 = 123


    const hoy = historial.length > 0 ? historial[historial.length - 1] : null
    const ayer = historial.length > 1 ? historial[historial.length - 2] : null

    const ubicacionVisitas1 = ubicacion[0]?.pais ?? "_"
    const ubicacionVisitas2 = ubicacion[1]?.pais ?? "_"
    const ubicacionVisitas3 = ubicacion[2]?.pais ?? "_"

    const ubicacionVisitasSes1 = ubicacion[0]?.sesiones ?? "_"
    const ubicacionVisitasSes2 = ubicacion[1]?.sesiones ?? "_"
    const ubicacionVisitasSes3 = ubicacion[2]?.sesiones ?? "_"

    const paginaMasVisitadaTop = paginas[0]?.pagina === "/" ? "Home" : (paginas[0]?.pagina ?? "_");
    const paginaMasVisitada1 = paginaMasVisitadaTop ?? "_"
    const paginaMasVisitada2 = paginas[1]?.pagina ?? "_"
    const paginaMasVisitada3 = paginas[2]?.pagina ?? "_"

    const visitasPaginaTop = paginas[0]?.visitas ?? "_"
    const visitasPagina1 = visitasPaginaTop ?? "_"
    const visitasPagina2 = paginas[1]?.visitas ?? "_"
    const visitasPagina3 = paginas[2]?.visitas ?? "_"

    const eventoTop = eventos[0]?.evento ?? "_"
    const evento2 = eventos[1]?.evento ?? "_"
    const evento3 = eventos[2]?.evento ?? "_"

    const eventoTopCount = eventos[0]?.count ?? "_"
    const evento2Count = eventos[1]?.count ?? "_"
    const evento3Count = eventos[2]?.count ?? "_"

    const diffPageViews = hoy && ayer ? hoy.pageViews - ayer.pageViews : null
    const pctPageViews = diffPageViews && ayer ? Math.round((diffPageViews / ayer.pageViews) * 100) : null

    const tiempoPromedio = analytics?.avgSessionDuration ?? "—"

    const tiempoPromedioHoyString = hoy?.avgSessionDuration?.match(/\d+/g) ?? null
    const tiempoPromedioHoyInt = tiempoPromedioHoyString ? tiempoPromedioHoyString.map(Number) : null

    const tiempoPromedioAyerString = ayer?.avgSessionDuration?.match(/\d+/g) ?? null
    const tiempoPromedioAyerInt = tiempoPromedioAyerString ? tiempoPromedioAyerString.map(Number) : null

    const tasaRebote = analytics?.bounceRate ?? "—"
    const tasaReboteHoy = hoy?.bounceRate ?? null
    const tasaReboteAyer = ayer?.bounceRate ?? null
    const diffTasaRebote = tasaReboteHoy != null && tasaReboteAyer != null ? tasaReboteHoy - tasaReboteAyer : null

    const usuariosNuevos = analytics?.totalUsers ?? "—"
    const usuariosNuevosHoy = hoy?.totalUsers ?? null
    const usuariosNuevosAyer = ayer?.totalUsers ?? null
    const diffUsuarios = usuariosNuevosHoy != null && usuariosNuevosAyer != null ? usuariosNuevosHoy - usuariosNuevosAyer : null




    return (
        <>

            <AdminHeader title="Analíticas" desc="Analíticas" />


            <section className="flex flex-col m-6 gap-6">


                <section className="mx-4 flex flex-col md:flex-row gap-8">
                    <TooltipProvider>
                        <StatCard
                            title="Vistas totales"
                            value={analytics?.pageViews.toLocaleString() ?? "—"}
                            subtitle={pctPageViews != null ? `${pctPageViews > 0 ? "+" : ""}${pctPageViews}% vs ayer` : "—"}
                            compareValue={diffPageViews}
                            tooltip="Total de páginas vistas en los últimos 7 días."
                        />
                    </TooltipProvider>

                    <TooltipProvider>
                        <StatCard
                            title="Página #1"
                            value={paginaMasVisitadaTop}
                            subtitle={`${visitasPaginaTop} visitas`}
                            compareValue={null}
                            tooltip="Página más visitada hoy."
                        />
                    </TooltipProvider>

                    <TooltipProvider>
                        <StatCard
                            title="Tiempo Promedio"
                            value={`${analytics?.avgSessionDuration.toLocaleString() ?? "_"}`}
                            subtitle={`${tiempoPromedioHoyInt > tiempoPromedioAyerInt ? "+" : ""}${Math.round((tiempoPromedioHoyInt - tiempoPromedioAyerInt) / tiempoPromedioAyerInt * 100)}% vs ayer`}
                            compareValue={tiempoPromedioHoyInt - tiempoPromedioAyerInt}
                            tooltip="Promedio de tiempo de los usuarios activos los últimos 7 días."
                        />
                    </TooltipProvider>

                    <TooltipProvider>
                        <StatCard
                            title="Tasa de Rebote"
                            value={`${tasaRebote}%`}
                            subtitle={`${tasaReboteHoy > tasaReboteAyer ? "+" : ""}${Math.round((tasaReboteHoy - tasaReboteAyer) / tasaReboteAyer * 100)}% vs ayer`}
                            compareValue={diffTasaRebote}
                            invertLogic={true}
                            tooltip="Porcentaje de usuarios que no interactúan en la página hoy."
                        />
                    </TooltipProvider>

                    <TooltipProvider>
                        <StatCard
                            title="Usuarios Nuevos"
                            value={`${usuariosNuevos}`}
                            subtitle={`${usuariosNuevosHoy > usuariosNuevosAyer ? "+" : ""}${Math.round((usuariosNuevosHoy - usuariosNuevosAyer) / usuariosNuevosAyer * 100)}% vs ayer`}
                            compareValue={diffUsuarios}
                            tooltip="Total de usuarios que no habáin ingresado anteriormente hoy."
                        />
                    </TooltipProvider>

                </section>


                <section className="flex md:flex-row flex-col mx-5 gap-4">

                    <div className="w-full flex flex-col gap-4">
                        <h1 className="font-bold text-xl text-text-primary">Visitas los últimos 7 días</h1>
                        <div className="text-gray-300 shadow-md bg-white p-10 rounded-lg flex flex-row gap-2 justify-center border-solid border-1 border-bg-110 hover:border-bg-120 hover:scale-102 transition min-h-100">
                            <SevenDaysViewsGraph historial={historial} />
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                        <h1 className="font-bold text-xl text-text-primary">Dispositivos</h1>
                        <div className="text-gray-300 shadow-md bg-white p-10 rounded-lg flex flex-col gap-2 justify-center border-solid border-1 border-bg-110 hover:border-bg-120 hover:scale-102 transition min-h-100">
                            <DeviceViews dispositivos={dispositivos} />
                            <div className="flex md:flex-row flex-col gap-6 px-10">
                                <span className="text-black/50 flex items-center gap-2"><span className="h-3 w-3 bg-[#2e5a8a]"></span> Escritorio</span>
                                <span className="text-black/50 flex items-center gap-2"><span className="h-3 w-3 bg-[#5D8BB5]"></span>Movil</span>
                                <span className="text-black/50 flex items-center gap-2"><span className="h-3 w-3 bg-[#8eacc8]"></span>Tablet</span>
                            </div>
                        </div>

                    </div>


                </section>




                <section className="flex flex-col gap-2 mx-6">
                    <h1 className="font-bold text-xl text-text-primary">Páginas Más Visitadas</h1>
                    <div className="flex gap-6 flex-col md:flex-row">
                        <div className="min-w-60">
                            <div className="text-brand-accent rounded-lg flex flex-row gap-2 justify-center p-6 pb-4">
                                <h1 className="text-lg">Pgs Mas Visitadas</h1>
                                <StickyNote />
                            </div>
                            <hr className="border-solid border-1 border-brand-accent" />
                            <StatList top1={paginaMasVisitada1} top2={paginaMasVisitada2} top3={paginaMasVisitada3} stat1={visitasPagina1} stat2={visitasPagina2} stat3={visitasPagina3} />
                        </div>

                        <div className="min-w-60">
                            <div className="text-brand-accent rounded-lg flex flex-row gap-2 justify-center p-6 pb-4">
                                <h1 className="text-lg">Origen de visitas</h1>
                                <Earth />
                            </div>
                            <hr className="border-solid border-1 border-brand-accent" />
                            <StatList top1={ubicacionVisitas1} top2={ubicacionVisitas2} top3={ubicacionVisitas3} stat1={ubicacionVisitasSes1} stat2={ubicacionVisitasSes2} stat3={ubicacionVisitasSes3} />
                        </div>

                        <div className="min-w-60">
                            <div className="text-brand-accent rounded-lg flex flex-row gap-2 justify-center p-6 pb-4">
                                <h1 className="text-lg">Eventos</h1>
                                <MousePointerClick />
                            </div>
                            <hr className="border-solid border-1 border-brand-accent" />
                            <StatList top1={eventoTop} top2={evento2} top3={evento3} stat1={eventoTopCount} stat2={evento2Count} stat3={evento3Count} />
                        </div>

                    </div>

                </section>

                <section className="flex gap-4 md:flex-row flex-col mx-4">
                    <div className="flex flex-col gap-4 w-full">
                        <h1 className="font-bold text-xl text-text-primary">Trafico por hora del día</h1>
                        <div className="bg-white shadow-md text-gray-300 rounded-lg p-12">

                            <ViewsPorHora horas={horas} />

                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <h1 className="font-bold text-xl text-text-primary">Trafico por hora del día</h1>
                        <div className="bg-white shadow-md text-gray-300 rounded-lg p-12">
                            <h1 className="text-2xl">Placeholder gráfico</h1>
                            <ChartSpline />
                        </div>
                    </div>
                </section>

            </section>
        </>
    )

}
