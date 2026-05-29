import { useState } from "react"
import { Download, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useAuth0 } from "@auth0/auth0-react"
import * as XLSX from "xlsx"

export default function ExportarExcelModal({ setExportarModal }) {

    const { getAccessTokenSilently } = useAuth0()

    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate]     = useState(null)
    const [loading, setLoading]     = useState(false)
    const [error, setError]         = useState(null)

    const today = new Date()

    const handleExportar = async () => {
        if (!startDate || !endDate) return

        try {
            setLoading(true)
            setError(null)

            const token = await getAccessTokenSilently()
            const start = format(startDate, "yyyy-MM-dd")
            const end   = format(endDate,   "yyyy-MM-dd")

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/analytics/historico?startDate=${start}&endDate=${end}&export=true`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            const json = await res.json()

            if (!res.ok) {
                setError(json.error)
                return
            }

            const rows = json.data.map(row => ({
                "Fecha":             row.fecha,
                "Visitas":           row.pageViews,
                "Tiempo Promedio":   row.avgSessionDuration,
                "Tasa de Rebote":    `${row.bounceRate}%`,
                "Usuarios Totales":  row.totalUsers,
            }))

            const ws = XLSX.utils.json_to_sheet(rows)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Historial")

            ws["!cols"] = [
                { wch: 14 }, // Fecha
                { wch: 10 }, // Visitas
                { wch: 18 }, // Tiempo Promedio
                { wch: 16 }, // Tasa de Rebote
                { wch: 18 }, // Usuarios Totales
            ]

            XLSX.writeFile(wb, `historial-analiticas-${start}-al-${end}.xlsx`)
            setExportarModal(false)

        } catch (err) {
            setError("Error al exportar el historial")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
            <div className="p-10 bg-bg drop-shadow-md rounded-md w-[380px]">

                <h1 className="text-text-primary/60 mb-6">Exportar Reporte de Analíticas</h1>

                <div className="flex gap-4 mb-6">

                    {/* Fecha inicio */}
                    <div className="flex flex-col gap-2 flex-1">
                        <p className="text-text-primary text-sm">Inicio</p>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    <span className="text-text-primary text-sm">
                                        {startDate ? format(startDate, "dd/MM/yyyy") : "Seleccionar"}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-bg text-text-primary">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    disabled={(date) => date > today || (endDate && date > endDate)}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Fecha fin */}
                    <div className="flex flex-col gap-2 flex-1">
                        <p className="text-text-primary text-sm">Final</p>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    <span className="text-text-primary text-sm">
                                        {endDate ? format(endDate, "dd/MM/yyyy") : "Seleccionar"}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-bg text-text-primary">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    disabled={(date) => date > today || (startDate && date < startDate)}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                )}

                <div className="flex justify-center gap-3">
                    <button
                        onClick={handleExportar}
                        disabled={!startDate || !endDate || loading}
                        className="text-text-primary p-2 border border-bg-110 rounded-md flex gap-2 items-center cursor-pointer hover:bg-bg-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="h-5 w-5" />
                        {loading ? "Exportando..." : "Exportar"}
                    </button>
                    <button
                        onClick={() => setExportarModal(false)}
                        className="p-2 bg-rose-500 cursor-pointer rounded-md text-text-primary-static hover:bg-rose-600 transition"
                    >
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    )
}