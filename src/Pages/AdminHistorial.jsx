import { useEffect, useState } from "react"
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table"
import AdminHeader from "@/components/admin/AdminHeader"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useAuth0 } from "@auth0/auth0-react"

export default function AdminHistorial() {

    const { getAccessTokenSilently } = useAuth0()

    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate]     = useState(null)
    const [data, setData]           = useState([])
    const [pagination, setPagination] = useState(null)
    const [page, setPage]           = useState(1)
    const [loading, setLoading]     = useState(false)
    const [error, setError]         = useState(null)

    const fetchHistorial = async (currentPage = 1) => {
        if (!startDate || !endDate) return

        try {
            setLoading(true)
            setError(null)

            const token = await getAccessTokenSilently()
            const start = format(startDate, 'yyyy-MM-dd')
            const end   = format(endDate,   'yyyy-MM-dd')

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/analytics/historico?startDate=${start}&endDate=${end}&page=${currentPage}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            const json = await res.json()

            if (!res.ok) {
                setError(json.error)
                return
            }

            setData(json.data)
            setPagination(json.pagination)

        } catch (err) {
            setError('Error al obtener el historial')
        } finally {
            setLoading(false)
        }
    }

    const handleAplicar = () => {
        setPage(1)
        fetchHistorial(1)
    }

    const handlePage = (newPage) => {
        setPage(newPage)
        fetchHistorial(newPage)
    }

    const today = new Date()

    return (
        <>
            <AdminHeader title="Historial" desc="Historial" />

            <div className="flex flex-col md:flex-row m-4 gap-4 items-start md:items-end">

                <div className="flex flex-col gap-2">
                    <p className="text-text-primary">Inicio</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span className="text-text-primary">
                                    {startDate ? format(startDate, 'dd/MM/yyyy') : 'Seleccionar'}
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

                <div className="flex flex-col gap-2">
                    <p className="text-text-primary">Final</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span className="text-text-primary">
                                    {endDate ? format(endDate, 'dd/MM/yyyy') : 'Seleccionar'}
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

                <button
                    onClick={handleAplicar}
                    disabled={!startDate || !endDate || loading}
                    className="flex items-center px-4 py-2 justify-center bg-brand-accent rounded-md cursor-pointer hover:bg-brand-accent-120 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Cargando...' : 'Aplicar'}
                </button>

            </div>

            {error && (
                <p className="text-red-500 mx-4 mb-2 text-sm">{error}</p>
            )}

            <Table className="m-4">
                <TableHeader>
                    <TableRow className="bg-bg-90 font-extrabold">
                        <TableHead>Fecha</TableHead>
                        <TableHead>Visitas</TableHead>
                        <TableHead>Tiempo Promedio</TableHead>
                        <TableHead>Tasa de Rebote</TableHead>
                        <TableHead>Usuarios Totales</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                Cargando...
                            </TableCell>
                        </TableRow>
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-text-primary py-8">
                                Seleccione un rango de fechas para ver el historial
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row, i) => (
                            <TableRow key={i}>
                                <TableCell>{row.fecha}</TableCell>
                                <TableCell>{row.pageViews}</TableCell>
                                <TableCell>{row.avgSessionDuration}</TableCell>
                                <TableCell>{row.bounceRate}%</TableCell>
                                <TableCell>{row.totalUsers}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mx-4 mb-4">
                    <p className="text-sm text-text-primary">
                        Página {pagination.page} de {pagination.totalPages} — {pagination.total} registros
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePage(page - 1)}
                            disabled={!pagination.hasPrev || loading}
                            className="cursor-pointer text-text-primary"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePage(page + 1)}
                            disabled={!pagination.hasNext || loading}
                            className="cursor-pointer text-text-primary"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}