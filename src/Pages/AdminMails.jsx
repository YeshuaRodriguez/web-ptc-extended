import AdminHeader from "@/components/admin/AdminHeader"
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { LoaderOne } from "@/components/ui/loader"
import { usePermissions } from "@/hooks/usePermissions"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

export default function AdminMails() {
    const { getAccessTokenSilently } = useAuth0()
    const { hasPermission } = usePermissions()
    const [mails, setMails] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedMail, setSelectedMail] = useState(null)
    const [selectedMailDetail, setSelectedMailDetail] = useState(null)
    const [mailDetailLoading, setMailDetailLoading] = useState(false)
    const [mailDetailError, setMailDetailError] = useState(null)
    const [estadoOverride, setEstadoOverride] = useState({})

    useEffect(() => {
        const fetchMails = async () => {
            try {
                setLoading(true)
                setError(null)

                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: import.meta.env.VITE_AUTH0_AUDIENCE
                    }
                })

                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mails`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const data = await res.json()

                if (!res.ok) {
                    setError(data?.error || "Error obteniendo correos")
                    setMails([])
                    return
                }

                setMails(Array.isArray(data) ? data : [])
            } catch (e) {
                console.error(e)
                setError("Error de conexion con el servidor")
                setMails([])
            } finally {
                setLoading(false)
            }
        }

        fetchMails()
    }, [getAccessTokenSilently])

    useEffect(() => {
        const fetchMailDetail = async () => {
            if (!selectedMail?.id) {
                setSelectedMailDetail(null)
                setMailDetailError(null)
                return
            }

            try {
                setMailDetailLoading(true)
                setMailDetailError(null)
                setSelectedMailDetail(null)

                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: import.meta.env.VITE_AUTH0_AUDIENCE
                    }
                })

                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mails/${encodeURIComponent(selectedMail.id)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const data = await res.json()

                if (!res.ok) {
                    setMailDetailError(data?.error || "Error obteniendo detalle del correo")
                    return
                }

                setSelectedMailDetail(data)
            } catch (e) {
                console.error(e)
                setMailDetailError("Error de conexion con el servidor")
            } finally {
                setMailDetailLoading(false)
            }
        }

        fetchMailDetail()
    }, [selectedMail, getAccessTokenSilently])

    if (loading) return <LoaderOne />

    const getEstado = (mail) => {
        const override = estadoOverride[mail.id]
        if (override) return override
        if (mail.estado_local) return mail.estado_local

        const estadoRaw = mail.last_event || mail.status || "-"
        if (estadoRaw === "delivered") return "recibido"
        return estadoRaw
    }

    const getEstadoClassName = (estado) => {
        if (estado === "recibido") {
            return "text-warning-secondary-110 bg-warning-secondary-60/20"
        }
        if (estado === "respondido") {
            return "text-warning-tertiary-110 bg-warning-tertiary-60/20"
        }
        return "text-warning-primary-110 bg-warning-primary-70/20"
    }

    const canReplyMails = hasPermission("reply:mails")

    const persistMailStatus = async (mailId, checked) => {
        const token = await getAccessTokenSilently({
            authorizationParams: {
                audience: import.meta.env.VITE_AUTH0_AUDIENCE
            }
        })

        const estado = checked ? "respondido" : "recibido"

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mails/${encodeURIComponent(mailId)}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ estado })
        })

        const data = await res.json()
        if (!res.ok) {
            throw new Error(data?.error || "Error actualizando estado del correo")
        }

        setEstadoOverride((prev) => ({
            ...prev,
            [mailId]: estado
        }))

        setMails((prev) =>
            prev.map((mail) =>
                mail.id === mailId ? { ...mail, estado_local: estado } : mail
            )
        )

        setSelectedMail((prev) =>
            prev?.id === mailId ? { ...prev, estado_local: estado } : prev
        )
    }

    const getReplyToEmail = () => {
        const candidates = [
            selectedMailDetail?.reply_to,
            selectedMail?.reply_to,
            selectedMailDetail?.from,
            selectedMail?.from
        ].filter(Boolean)

        const raw = candidates[0]
        if (!raw) return ""

        const match = String(raw).match(/<([^>]+)>/)
        return match ? match[1].trim() : String(raw).trim()
    }

    const handleReply = () => {
        const to = getReplyToEmail()

        const subject = selectedMail?.subject ? `Re: ${selectedMail.subject}` : "Re:"
        const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}`
        const chooserUrl = `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(gmailComposeUrl)}`
        window.open(chooserUrl, "_blank", "noopener,noreferrer")
    }

    return (
        <>
            <AdminHeader title="Mails" desc="Gestionar mails enviados desde Contactanos"/>

            <div className="m-8">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>De</TableHead>
                            <TableHead>Para</TableHead>
                            <TableHead>Asunto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Respondido</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mails.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-text-primary/40">
                                    No hay correos enviados para mostrar
                                </TableCell>
                            </TableRow>
                        ) : (
                            mails.map((mail) => (
                                <TableRow
                                    key={mail.id}
                                    className="cursor-pointer hover:bg-bg-110/30"
                                    onClick={() => setSelectedMail(mail)}
                                >{(() => {
                                    const estado = getEstado(mail)
                                    return (
                                        <>
                                    <TableCell>
                                        {mail.created_at
                                            ? new Date(mail.created_at).toLocaleString("es-HN")
                                            : "-"}
                                    </TableCell>
                                    <TableCell>{mail.from || "-"}</TableCell>
                                    <TableCell>{Array.isArray(mail.to) ? mail.to.join(", ") : (mail.to || "-")}</TableCell>
                                    <TableCell>{mail.subject || "-"}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getEstadoClassName(estado)}`}>
                                            {estado}
                                        </span>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer accent-brand-primary"
                                            checked={estado === "respondido"}
                                            disabled={!canReplyMails}
                                            onChange={async (e) => {
                                                try {
                                                    await persistMailStatus(mail.id, e.target.checked)
                                                } catch (err) {
                                                    console.error(err)
                                                    setError(err.message || "Error de conexion con el servidor")
                                                }
                                            }}
                                        />
                                    </TableCell>
                                        </>
                                    )
                                })()}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!selectedMail} onOpenChange={(open) => !open && setSelectedMail(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-text-primary">Detalle de correo</DialogTitle>
                    </DialogHeader>
                    <div className="rounded-md border border-bg-110 p-3 bg-bg-110/20">
                        <p className="text-xs text-text-primary/60 mb-1">Mensaje</p>
                        {mailDetailLoading ? (
                            <p className="text-sm text-text-primary/60">Cargando contenido...</p>
                        ) : mailDetailError ? (
                            <p className="text-sm text-red-500">{mailDetailError}</p>
                        ) : (
                            <p className="text-sm text-text-primary whitespace-pre-wrap break-words">
                                {selectedMailDetail?.text || selectedMailDetail?.html || selectedMailDetail?.body || "Sin contenido disponible"}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center gap-2 text-sm text-text-primary">
                            <input
                                type="checkbox"
                                className="cursor-pointer accent-brand-primary"
                                checked={selectedMail ? getEstado(selectedMail) === "respondido" : false}
                                disabled={!canReplyMails}
                                onChange={async (e) => {
                                    if (!selectedMail) return
                                    try {
                                        await persistMailStatus(selectedMail.id, e.target.checked)
                                    } catch (err) {
                                        console.error(err)
                                        setMailDetailError(err.message || "Error de conexion con el servidor")
                                    }
                                }}
                            />
                            Recibido / Respondido
                        </label>
                        <div className="flex items-center gap-2">
                            <Button
                                className="bg-brand-primary cursor-pointer hover:bg-brand-primary-90 border-2 border-solid border-brand-primary-80"
                                variant="outline"
                                onClick={() => setSelectedMail(null)}
                            >
                                Cerrar
                            </Button>
                            <Button
                                className="bg-brand-accent cursor-pointer hover:bg-brand-accent-80"
                                onClick={handleReply}
                                disabled={!canReplyMails}
                            >
                                Responder
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
