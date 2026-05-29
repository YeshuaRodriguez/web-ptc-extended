import AdminHeader from "@/components/admin/AdminHeader"
import { useAuth0 } from "@auth0/auth0-react"
import { useCallback, useEffect, useState } from "react"
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
import { Plus, Trash2 } from "lucide-react"

export default function AdminTickets() {
  const { getAccessTokenSilently } = useAuth0()
  const { hasPermission } = usePermissions()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [estadoOverride, setEstadoOverride] = useState({})

  const [createOpen, setCreateOpen] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState(null)

  const [rejectMode, setRejectMode] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  const canCreateTickets = hasPermission("create:tickets")
  const canUpdateTicketStatus = hasPermission("update:ticket_status")
  const canDeleteTickets = hasPermission("delete:tickets")

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      })

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || "Error obteniendo tickets")
        setTickets([])
        return
      }

      setTickets(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setError("Error de conexion con el servidor")
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [getAccessTokenSilently])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    if (!selectedTicket) {
      setRejectMode(false)
      setMotivoRechazo("")
      setActionError(null)
      return
    }
    setRejectMode(false)
    setMotivoRechazo(selectedTicket.motivo_rechazo ?? "")
    setActionError(null)
  }, [selectedTicket])

  const getEstado = (ticket) => estadoOverride[ticket.id] ?? ticket.estado ?? "—"
  const isRejected = (ticket) => getEstado(ticket) === "rechazado"

  const getEstadoClassName = (estado) => {
    if (estado === "recibido") return "text-warning-secondary-110 bg-warning-secondary-60/20"
    if (estado === "hecho") return "text-warning-tertiary-110 bg-warning-tertiary-60/20"
    return "text-warning-primary-110 bg-warning-primary-70/20"
  }

  const handleCreateTicket = async () => {
    const cleanTitulo = titulo.trim()
    const cleanDescripcion = descripcion.trim()

    if (!cleanTitulo || !cleanDescripcion) {
      setCreateError("Titulo y descripcion son obligatorios")
      return
    }

    try {
      setCreateLoading(true)
      setCreateError(null)

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      })

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: cleanTitulo,
          descripcion: cleanDescripcion
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setCreateError(data?.error || "Error creando ticket")
        return
      }

      setTitulo("")
      setDescripcion("")
      setCreateOpen(false)
      await fetchTickets()
    } catch (e) {
      console.error(e)
      setCreateError("Error de conexion con el servidor")
    } finally {
      setCreateLoading(false)
    }
  }

  const patchTicket = async ({ id, estado, motivo_rechazo }) => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE
      }
    })

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ estado, motivo_rechazo })
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.error || "Error actualizando ticket")
    }

    setTickets((prev) => prev.map((t) => (t.id === data.id ? data : t)))
    setEstadoOverride((prev) => ({ ...prev, [id]: data.estado }))
    setSelectedTicket((prev) => (prev?.id === data.id ? data : prev))
  }

  const handleSetHecho = async (ticket) => {
    if (!ticket || isRejected(ticket) || !canUpdateTicketStatus) return
    try {
      setActionLoading(true)
      setActionError(null)
      await patchTicket({ id: ticket.id, estado: "hecho", motivo_rechazo: null })
      setSelectedTicket(null)
    } catch (e) {
      setActionError(e.message || "Error actualizando ticket")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckboxChange = async (ticket, checked) => {
    if (!ticket || isRejected(ticket) || !canUpdateTicketStatus) return
    try {
      await patchTicket({ id: ticket.id, estado: checked ? "hecho" : "recibido", motivo_rechazo: null })
    } catch (e) {
      setError(e.message || "Error actualizando ticket")
    }
  }

  const handleAceptarRechazo = async () => {
    if (!selectedTicket || !canUpdateTicketStatus) return
    const motivo = motivoRechazo.trim()
    if (!motivo) {
      setActionError("Debe ingresar un motivo de rechazo")
      return
    }
    try {
      setActionLoading(true)
      setActionError(null)
      await patchTicket({ id: selectedTicket.id, estado: "rechazado", motivo_rechazo: motivo })
      setRejectMode(false)
      setSelectedTicket(null)
    } catch (e) {
      setActionError(e.message || "Error rechazando ticket")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteTicket = async () => {
    if (!canDeleteTickets || !ticketToDelete) return
    const ticketId = ticketToDelete.id
    try {
      setDeleteError(null)
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      })

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data?.error || "Error eliminando ticket")
        return
      }

      setTickets((prev) => prev.filter((t) => t.id !== ticketId))
      setEstadoOverride((prev) => {
        const next = { ...prev }
        delete next[ticketId]
        return next
      })
      if (selectedTicket?.id === ticketId) setSelectedTicket(null)
      setDeleteConfirmOpen(false)
      setTicketToDelete(null)
    } catch (e) {
      console.error(e)
      setDeleteError("Error de conexion con el servidor")
    }
  }

  if (loading) return <LoaderOne />

  return (
    <>
      <AdminHeader title="Tickets" desc="Gestionar tickets" />

      <div className="m-8">
        {canCreateTickets && (
          <button
            onClick={() => {
              setCreateError(null)
              setCreateOpen(true)
            }}
            className="text-text-primary/70 border border-solid border-bg-120/70 bg-bg hover:bg-bg-110 cursor-pointer transition p-2 rounded-md flex gap-2 items-center my-4"
          >
            <Plus className="h-4 w-4" /> Agregar Ticket
          </button>
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Titulo</TableHead>
              <TableHead>Creado en</TableHead>
              <TableHead>Estado</TableHead>
              {canUpdateTicketStatus && <TableHead>Hecho</TableHead>}
              {canDeleteTickets && <TableHead>Eliminar</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4 + (canUpdateTicketStatus ? 1 : 0) + (canDeleteTickets ? 1 : 0)} className="text-center text-text-primary/40">
                  No hay tickets para mostrar
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => {
                const estado = getEstado(ticket)
                const rejected = isRejected(ticket)
                return (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer hover:bg-bg-110/30"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <TableCell>{ticket.id || "—"}</TableCell>
                    <TableCell>{ticket.titulo || "—"}</TableCell>
                    <TableCell>
                      {ticket.creado_en ? new Date(ticket.creado_en).toLocaleString("es-HN") : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getEstadoClassName(estado)}`}>
                        {estado}
                      </span>
                    </TableCell>
                    {canUpdateTicketStatus && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="cursor-pointer accent-brand-primary"
                          checked={estado === "hecho"}
                          disabled={rejected}
                          onChange={(e) => handleCheckboxChange(ticket, e.target.checked)}
                        />
                      </TableCell>
                    )}
                    {canDeleteTickets && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setDeleteError(null)
                            setTicketToDelete(ticket)
                            setDeleteConfirmOpen(true)
                          }}
                          className="p-1 rounded-sm text-text-primary cursor-pointer hover:text-warning-primary"
                          aria-label={`Eliminar ${ticket.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-text-primary">Detalle de ticket</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 text-text-primary">
            <div className="rounded-md border border-bg-110 p-3 bg-bg-110/20 flex flex-col gap-2">
              <p className="break-words"><span className="font-bold">ID:</span> {selectedTicket?.id || "—"}</p>
              <p className="break-words"><span className="font-bold">Titulo:</span> {selectedTicket?.titulo || "—"}</p>
              <p className="break-words whitespace-pre-wrap"><span className="font-bold">Descripcion:</span> {selectedTicket?.descripcion || "—"}</p>
              <p className="break-words flex items-center gap-2">
                <span className="font-bold">Estado:</span>
                <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${selectedTicket ? getEstadoClassName(getEstado(selectedTicket)) : "text-warning-primary-110 bg-warning-primary-70/20"}`}>
                  {selectedTicket ? getEstado(selectedTicket) : "—"}
                </span>
              </p>
              <p className="break-words"><span className="font-bold">Creado en:</span> {selectedTicket?.creado_en ? new Date(selectedTicket.creado_en).toLocaleString("es-HN") : "—"}</p>
              <p className="break-words whitespace-pre-wrap"><span className="font-bold">Motivo rechazo:</span> {selectedTicket?.motivo_rechazo || "—"}</p>
            </div>
            {rejectMode && canUpdateTicketStatus && (
              <div className="flex flex-col gap-2">
                <p className="font-bold text-text-primary">Motivo de rechazo:</p>
                <textarea
                  className="w-full border rounded-sm p-2 text-text-primary bg-transparent min-h-24"
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Escriba el motivo de rechazo"
                />
              </div>
            )}
            {actionError && <p className="text-sm text-red-500">{actionError}</p>}
          </div>
          <div className="flex items-center justify-between pt-2">
            {canUpdateTicketStatus ? (
              <>
                {rejectMode ? (
                  <div className="flex items-center gap-2">
                    <Button
                      className="bg-warning-tertiary cursor-pointer hover:bg-warning-tertiary-90"
                      onClick={handleAceptarRechazo}
                      disabled={actionLoading}
                    >
                      Aceptar
                    </Button>
                    <Button
                      className="bg-warning-primary cursor-pointer hover:bg-warning-primary-90"
                      onClick={() => {
                        setRejectMode(false)
                        setMotivoRechazo(selectedTicket?.motivo_rechazo ?? "")
                        setActionError(null)
                      }}
                      disabled={actionLoading}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="bg-warning-primary cursor-pointer hover:bg-warning-primary-90"
                    onClick={() => setRejectMode(true)}
                    disabled={!selectedTicket || isRejected(selectedTicket) || actionLoading}
                  >
                    Rechazar
                  </Button>
                )}
              </>
            ) : <div />}

            <div className="flex items-center gap-2">
              {canUpdateTicketStatus && (
                <Button
                  className="bg-warning-tertiary cursor-pointer hover:bg-warning-tertiary-90"
                  onClick={() => handleSetHecho(selectedTicket)}
                  disabled={!selectedTicket || isRejected(selectedTicket) || actionLoading}
                >
                  Hecho
                </Button>
              )}
              <Button
                className="bg-brand-primary cursor-pointer hover:bg-brand-primary-90 border-2 border-solid border-brand-primary-80"
                variant="outline"
                onClick={() => setSelectedTicket(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => { if (!open) { setDeleteConfirmOpen(false); setTicketToDelete(null); setDeleteError(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose-500">¿Quiere eliminar este ticket?</DialogTitle>
          </DialogHeader>
          <p className="text-text-primary">
            Se eliminará el ticket <span className="font-bold">{ticketToDelete?.titulo || ticketToDelete?.id}</span> de forma permanente.
          </p>
          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              className="bg-rose-600 cursor-pointer hover:bg-rose-700 text-white"
              onClick={handleDeleteTicket}
            >
              Aceptar
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => { setDeleteConfirmOpen(false); setTicketToDelete(null); setDeleteError(null) }}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-text-primary">Agregar ticket</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <p className="font-bold text-text-primary">Titulo:</p>
              <input
                className="w-full border rounded-sm p-2 text-text-primary bg-transparent"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Titulo del ticket"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-bold text-text-primary">Descripcion:</p>
              <textarea
                className="w-full border rounded-sm p-2 text-text-primary bg-transparent min-h-24"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripcion del ticket"
              />
            </div>
            {createError && <p className="text-sm text-red-500">{createError}</p>}
            <div className="flex justify-end gap-2">
              <Button
                className="bg-brand-primary cursor-pointer hover:bg-brand-primary-90 border-2 border-solid border-brand-primary-80"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createLoading}
              >
                Cancelar
              </Button>
              <Button
                className="bg-brand-accent cursor-pointer hover:bg-brand-accent-80"
                onClick={handleCreateTicket}
                disabled={createLoading}
              >
                {createLoading ? "Guardando..." : "Crear ticket"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
