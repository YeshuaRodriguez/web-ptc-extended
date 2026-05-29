import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "../ui/input"
import { useAuth0 } from "@auth0/auth0-react"

export default function UserCreateModal({ open, onOpenChange }) {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    const { getAccessTokenSilently } = useAuth0()

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) { setError("El nombre es obligatorio"); return }
    if (!email.trim()) { setError("El correo es obligatorio"); return }
    if (!EMAIL_REGEX.test(email.trim())) { setError("Ingrese un correo válido"); return }
    if (!password) { setError("La contraseña es obligatoria"); return }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); return }

    setLoading(true)

    try {
        const token = await getAccessTokenSilently({
            authorizationParams: {
                audience: import.meta.env.VITE_AUTH0_AUDIENCE
            }
        })

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                email,
                password,
                username: name
            })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Error creando usuario")
        }

        setName("")
        setEmail("")
        setPassword("")
        onOpenChange(false)

    } catch (err) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
}

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                    <p className="text-text-primary">Crear Usuario Nuevo</p>
                    <div className="flex flex-col gap-2 p-2">
                        <p className="font-bold text-text-primary">Name:</p>
                        <Input
                            className="text-text-primary"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <p className="text-xs italic text-text-primary/50">Obligatorio</p>
                    </div>

                    <div className="flex flex-col gap-2 p-2">
                        <p className="font-bold text-text-primary">E-Mail:</p>
                        <Input
                            className="text-text-primary"
                            placeholder="E-Mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <p className="text-xs italic text-text-primary/50">Obligatorio · Formato: correo@ejemplo.com</p>
                    </div>

                    <div className="flex flex-col gap-2 p-2">
                        <p className="font-bold text-text-primary">Contraseña:</p>
                        <Input
                            className="text-text-primary"
                            placeholder="Nueva contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-xs italic text-text-primary/50">Obligatorio · Mín. 8 caracteres</p>
                    </div>


                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 bg-brand-primary cursor-pointer text-text-primary-static py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? "Creando..." : "Crear Usuario"}
                    </button>

                </form>
            </DialogContent>
        </Dialog>
    )
}
