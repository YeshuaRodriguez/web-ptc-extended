import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth0 } from "@auth0/auth0-react"
import { useState, useEffect } from "react"

export default function PermissionsEditModal({ open, onOpenChange, permission, onUpdated }) {
  const { getAccessTokenSilently } = useAuth0()

  const [value, setValue] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!open || !permission) return
    setValue(permission.value ?? "")
    setDescription(permission.description ?? "")
    setError(null)
    setSuccess(false)
  }, [open, permission])

  const handleSubmit = async () => {
    setError(null)
    setSuccess(false)

    if (!value.trim()) {
      setError("El nombre del permiso es obligatorio")
      return
    }

    if (
      value.trim() === permission.value &&
      description.trim() === permission.description
    ) {
      setError("No hay cambios para guardar")
      return
    }

    try {
      setLoading(true)
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
      })

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/permissions`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldValue: permission.value,
          newValue: value.trim(),
          description: description.trim()
        })
      })

        const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error actualizando permiso")
        return
      }

      setSuccess(true)
      onUpdated?.()

    } catch(err) {
        setError("Error de conexión con el servidor")
    } finally {
        setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg text-text-primary font-bold">
            Editar permiso
          </DialogTitle>
          <p className="text-text-primary/60 text-sm">{permission?.value}</p>
        </DialogHeader>

        <div className="flex flex-col gap-2">

          <div className="flex flex-col gap-2 p-2">
            <p className="font-bold text-text-primary">Nombre:</p>
            <Input
              className="text-text-primary"
              placeholder="ej: read:reportes"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2 p-2">
            <p className="font-bold text-text-primary">Descripción:</p>
            <Input
              className="text-text-primary"
              placeholder="ej: Leer reportes del sistema"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-500 px-2">{error}</p>}
          {success && <p className="text-sm text-green-500 px-2">Permiso actualizado correctamente</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              className="bg-brand-primary cursor-pointer hover:bg-brand-primary-90 border-2 border-solid border-brand-primary-80"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              className="bg-brand-accent cursor-pointer hover:bg-brand-accent-80"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}