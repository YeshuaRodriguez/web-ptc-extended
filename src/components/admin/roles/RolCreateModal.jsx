
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAuth0 } from "@auth0/auth0-react"
import { Input } from "@/components/ui/input"

//web-ptc-extended\src\components\ui\input.jsx
//web-ptc-extended\src\components\admin\roles\RolCreateModal.jsx

export default function RolCreateModal({open, onOpenChange}){

        const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const { getAccessTokenSilently } = useAuth0()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!name.trim()) { setError("El nombre del rol es obligatorio"); return }
        if (!description.trim()) { setError("La descripción es obligatoria"); return }

        setLoading(true)

        try {
            const token = await getAccessTokenSilently({
                authorizationParams: {
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE
                }
            })

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, description })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error creando rol")
            }

            setName("")
            setDescription("")
            onOpenChange(false)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return(

        <>
        
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Rol</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                    <p className="text-text-primary">Crear Rol Nuevo</p>

                    <div className="flex flex-col gap-2 p-2">
                        <p className="font-bold text-text-primary">Nombre:</p>
                        <Input
                            className="text-text-primary"
                            placeholder="Nombre del rol"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <p className="text-xs italic text-text-primary/50">Obligatorio</p>
                    </div>

                    <div className="flex flex-col gap-2 p-2">
                        <p className="font-bold text-text-primary">Descripción:</p>
                        <Input
                            className="text-text-primary"
                            placeholder="Descripción del rol"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-xs italic text-text-primary/50">Obligatorio</p>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 bg-brand-primary cursor-pointer text-text-primary-static py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? "Creando..." : "Crear Rol"}
                    </button>

                </form>
            </DialogContent>
        </Dialog>
        
        </>

    )

}
