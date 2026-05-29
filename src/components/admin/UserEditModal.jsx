import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useAuth0 } from "@auth0/auth0-react"
import { Switch } from "../ui/switch"
import { useState, useEffect } from "react"
import { Eye, EyeClosed, TriangleAlert } from "lucide-react"

export default function UserEditModal({ open, onOpenChange, user, onUserUpdated, userRoles }) {

  const { user: currentUser, getAccessTokenSilently } = useAuth0()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [blocked, setBlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const isSelf = currentUser?.sub === user?.user_id

  const [inputType, setInputType] = useState('password');

  const [password, setPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [availableRoles, setAvailableRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState("")
  const [roleLoading, setRoleLoading] = useState(false)
  const [roleError, setRoleError] = useState(null)
  const [roleSuccess, setRoleSuccess] = useState(false)

  const togglePassword = () => {
    setInputType(prev => (prev === 'password' ? 'text' : 'password'));
  };

  // Fetch de roles disponibles al abrir el modal
  useEffect(() => {
    if (!open) return
    const fetchRoles = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
        })
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setAvailableRoles(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchRoles()
  }, [open])

  useEffect(() => {
    if (user) {
      setName(user.name ?? "")
      setEmail(user.email ?? "")
      setBlocked(!!user.blocked)
      setError(null)
      setSuccess(false)
      setPassword("")
      setPasswordError(null)
      setPasswordSuccess(false)
      setSelectedRole(userRoles?.[0]?.id ?? "")  // ← precarga el rol actual
      setRoleError(null)
      setRoleSuccess(false)
    }
  }, [user, userRoles])

  const handleRoleChange = async () => {
    const rolActual = userRoles?.[0]?.id ?? ""

    if (selectedRole === rolActual) {
      setRoleError("No hay cambios en el rol")
      return
    }

    setRoleLoading(true)
    setRoleError(null)
    setRoleSuccess(false)

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
      })

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${encodeURIComponent(user.user_id)}/roles`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ roleId: selectedRole })
      })

      const data = await res.json()

      if (!res.ok) {
        setRoleError(data.error || "Error actualizando rol")
        return
      }

      setRoleSuccess(true)
      onUserUpdated?.()

    } catch (err) {
      console.error(err)
      setRoleError("Error de conexión con el servidor")
    } finally {
      setRoleLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!password) {
      setPasswordError("Ingrese una contraseña")
      return
    }
    if (password.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
      })

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${encodeURIComponent(user.user_id)}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      })

      const data = await res.json()

      if (!res.ok) {
        setPasswordError(data.error || "Error actualizando contraseña")
        return
      }

      setPassword("")
      setPasswordSuccess(true)

    } catch (err) {
      console.error(err)
      setPasswordError("Error de conexión con el servidor")
    } finally {
      setPasswordLoading(false)
    }
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleSubmit = async () => {
    setError(null)
    setSuccess(false)

    if (email.trim() !== (user.email ?? "") && !EMAIL_REGEX.test(email.trim())) {
      setError("Ingrese un correo válido")
      return
    }

    setLoading(true)

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      })

      // Solo mandamos los campos que cambiaron
      const payload = {}
      if (name.trim() !== (user.name ?? "")) payload.name = name.trim()
      if (email.trim() !== (user.email ?? "")) payload.email = email.trim()
      if (!isSelf && blocked !== !!user.blocked) payload.blocked = blocked

      if (Object.keys(payload).length === 0) {
        setError("No hay cambios para guardar")
        setLoading(false)
        return
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${encodeURIComponent(user.user_id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error actualizando usuario")
        return
      }

      setSuccess(true)
      onUserUpdated?.()

    } catch (err) {
      console.error(err)
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
            Editar usuario
          </DialogTitle>
          <p className="text-text-primary">{user?.name}</p>
        </DialogHeader>

        <div className="flex flex-col gap-2">

          <div className="flex flex-col gap-2 p-2">
            <p className="font-bold text-text-primary">Nombre:</p>
            <Input
              className="text-text-primary"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 p-2">
            <p className="font-bold text-text-primary">E-Mail:</p>
            <Input
              className="text-text-primary"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs italic text-text-primary/50">Formato: correo@ejemplo.com</p>
          </div>

          <div className="flex flex-col gap-2 p-2">
            <p className="font-bold text-text-primary">Contraseña:</p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Input
                  className="text-text-primary"
                  placeholder="Nueva contraseña"
                  type={inputType}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  onClick={togglePassword}
                  className="border p-2 rounded-sm text-text-primary hover:bg-bg-110 cursor-pointer"
                >
                  {inputType === "password" ? <Eye className="h-5 w-5" /> : <EyeClosed className="h-5 w-5" />}
                </div>
              </div>

              <p className="text-xs italic text-text-primary/50">Mín. 8 caracteres</p>
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              {passwordSuccess && <p className="text-sm text-green-500">Contraseña actualizada correctamente</p>}  {/* ← */}

              <button
                onClick={handlePasswordChange}
                disabled={passwordLoading}
                className="text-text-primary-static flex bg-brand-primary p-2 w-40 justify-center rounded-sm border-2 border-brand-primary-80 hover:bg-brand-primary-90 transition cursor-pointer"
              >
                {passwordLoading ? "Guardando..." : "Cambiar contraseña"}   {/* ← */}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-2">
            <p className="font-bold text-text-primary">Rol:</p>
            {isSelf ? (
              <p className="flex gap-1 items-center text-sm text-yellow-500"><TriangleAlert className="h-5" /> No puede modificar el rol de su usuario</p>
            ) : (

              <div className="flex flex-col gap-4">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border rounded-sm p-2 text-text-dark-static bg-surface-light cursor-pointer"
                >
                  <option value="">Sin rol</option>
                  {availableRoles
                    .filter(r => !r.description?.startsWith("[INACTIVO]"))
                    .map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))
                  }
                </select>

                {roleError && <p className="text-sm text-red-500">{roleError}</p>}
                {roleSuccess && <p className="text-sm text-green-500">Rol actualizado correctamente</p>}

                <button
                  onClick={handleRoleChange}
                  disabled={roleLoading}
                  className="text-text-primary-static flex bg-brand-primary p-2 w-40 justify-center rounded-sm border-2 border-brand-primary-80 hover:bg-brand-primary-90 transition cursor-pointer"
                >
                  {roleLoading ? "Guardando..." : "Cambiar rol"}
                </button>
              </div>
            )}
          </div>


          <div className="p-2 flex flex-col gap-2">
            <p className="font-bold text-text-primary">Estado:</p>
            {isSelf ? (
              <p className="flex gap-1 items-center text-sm text-yellow-500"><TriangleAlert className="h-5" /> No puede modificar su propio usuario</p>
            ) : (
              <div className="flex items-center gap-2">
                <Switch
                  className="cursor-pointer"
                  checked={!blocked}
                  onCheckedChange={(val) => {
                    setBlocked(!val)
                  }}
                />
                <span className={blocked ? "text-red-500" : "text-green-500"}>
                  {blocked ? "Inactivo" : "Activo"}
                </span>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500 px-2">{error}</p>}
          {success && <p className="text-sm text-green-500 px-2">Usuario actualizado correctamente. Recargue la tabla para ver el cambio</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button className="bg-brand-primary cursor-pointer hover:bg-brand-primary-90 border-2 border-solid border-brand-primary-80" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button className="bg-brand-accent cursor-pointer hover:bg-brand-accent-80" onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>

  )
}
