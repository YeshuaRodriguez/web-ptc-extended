  import express from "express";
  import cors from "cors";
  import dotenv from "dotenv";
  import { Resend } from "resend";
  import fetch from "node-fetch";
  import { BetaAnalyticsDataClient } from '@google-analytics/data'
  import rateLimit from 'express-rate-limit'
  import { auth } from "express-oauth2-jwt-bearer";
  import { auditLog } from './audit.js'
  import fs from 'fs'
  import path from 'path'

  const PORT = process.env.PORT || 3001;

  dotenv.config();

  //VERIFICACION TOKEN A LAS APIS

  const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  })

  const requirePermission = (permission) => (req, res, next) => {
    const permissions = req.auth?.payload?.permissions ?? []
    if (!permissions.includes(permission)) {
      return res.status(403).json({ error: "No autorizado" })
    }
    next()
  }


  const app = express();

  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://yeshuarodriguez.github.io',
    ...(process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
      : [])
  ]

app.use(cors({
  origin: function(origin, callback) {
    // permitir requests sin origin (Postman, Render health check, etc)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.use(express.json())

  //------CORREOS----------

  const resend = new Resend(process.env.RESEND_API_KEY);

  const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,                    // máximo 5 emails por IP cada 15 minutos
    message: { error: 'Demasiados intentos, esperá 15 minutos.' }
  })


  app.post("/send-email", emailLimiter, async (req, res) => {
    try {
      const { replyEmail, subject, message, name, phone } = req.body;

      // Limpiar espacios
      const cleanReplyEmail = replyEmail?.trim();
      const cleanSubject = subject?.trim();
      const cleanMessage = message?.trim();
      const cleanName = name?.trim();
      const cleanPhone = phone?.trim();

      // Validaciones
      if (!cleanReplyEmail || !cleanSubject || !cleanMessage) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios."
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanReplyEmail)) {
        return res.status(400).json({
          error: "Correo electrónico inválido."
        });
        //console.log(emailRegex.error)
      }

      if (cleanSubject.length < 5 || cleanSubject.length > 120) {
        return res.status(400).json({
          error: "El asunto debe tener entre 5 y 120 caracteres."
        });
      }

      if (cleanMessage.length < 10 || cleanMessage.length > 2000) {
        return res.status(400).json({
          error: "El mensaje debe tener entre 10 y 2000 caracteres."
        });
      }

          if (!cleanName) {
        return res.status(400).json({ error: "El nombre es obligatorio." });
      }
      if (cleanName.length < 2 || cleanName.length > 80) {
        return res.status(400).json({ error: "El nombre debe tener entre 2 y 80 caracteres." });
      }
      if (cleanPhone && !/^\+?[\d\s\-()]{7,20}$/.test(cleanPhone)) {
        return res.status(400).json({ error: "Número de celular inválido." });
      }

      const escapeHTML = (str) =>
        str.replace(/[&<>"']/g, (match) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[match]));

      const safeMessage = escapeHTML(cleanMessage);
      const safeReplyEmail = escapeHTML(cleanReplyEmail);
      const safeSubject = escapeHTML(cleanSubject);
      const safeName = escapeHTML(cleanName);
    const safePhone = cleanPhone ? escapeHTML(cleanPhone) : null;

  const html = `
    <h2>Nuevo mensaje desde el formulario web</h2>
    <p><strong>Nombre:</strong> ${safeName}</p>
    <p><strong>Correo:</strong> ${safeReplyEmail}</p>
    ${safePhone ? `<p><strong>Celular:</strong> ${safePhone}</p>` : ""}
    <p><strong>Mensaje:</strong></p>
    <p>${safeMessage}</p>
  `;

      const data = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "yesj_rodriguezf@unicah.edu",
        subject: cleanSubject,
        html: html,
        reply_to: cleanReplyEmail
      });

      res.status(200).json({ success: true });

    } catch (error) {
      console.error("Error enviando email:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  });

  app.get("/api/mails", checkJwt, async (req, res) => {
  try {
    const limitRaw = Number(req.query.limit)
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50

    const response = await fetch(`https://api.resend.com/emails?limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || "Error obteniendo correos desde Resend"
      })
    }

    res.json(Array.isArray(data?.data) ? data.data : [])
  } catch (error) {
    console.error("Error obteniendo emails de Resend:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

  app.get("/api/mails/:id", checkJwt, async (req, res) => {
  try {
    const response = await fetch(`https://api.resend.com/emails/${req.params.id}`, {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo detalle del correo" })
  }
})

app.get("/api/tickets", checkJwt, requirePermission("read:tickets"), async (req, res) => {
  try {
    const ticketsPath = path.join(process.cwd(), "server", "tickets", "tickets.json")

    if (!fs.existsSync(ticketsPath)) {
      return res.json([])
    }

    const raw = fs.readFileSync(ticketsPath, "utf-8")
    const data = JSON.parse(raw)

    res.json(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error("Error obteniendo tickets:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

app.post("/api/tickets", checkJwt, requirePermission("create:tickets"), async (req, res) => {
  try {
    const { titulo, descripcion } = req.body

    const cleanTitulo = titulo?.trim()
    const cleanDescripcion = descripcion?.trim()

    if (!cleanTitulo || !cleanDescripcion) {
      return res.status(400).json({ error: "titulo y descripcion son obligatorios" })
    }

    const ticketsDir = path.join(process.cwd(), "server", "tickets")
    const ticketsPath = path.join(ticketsDir, "tickets.json")

    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir, { recursive: true })
    }

    let tickets = []
    if (fs.existsSync(ticketsPath)) {
      const raw = fs.readFileSync(ticketsPath, "utf-8")
      const parsed = JSON.parse(raw)
      tickets = Array.isArray(parsed) ? parsed : []
    }

    const maxId = tickets.reduce((max, t) => {
      const match = String(t.id || "").match(/^ticket-(\d+)$/i)
      if (!match) return max
      return Math.max(max, Number(match[1]))
    }, 0)

    const newTicket = {
      id: `ticket-${String(maxId + 1).padStart(3, "0")}`,
      titulo: cleanTitulo,
      descripcion: cleanDescripcion,
      estado: "recibido",
      motivo_rechazo: null,
      creado_en: new Date().toISOString()
    }

    tickets.unshift(newTicket)
    fs.writeFileSync(ticketsPath, JSON.stringify(tickets, null, 2))

    res.status(201).json(newTicket)
  } catch (error) {
    console.error("Error creando ticket:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

app.patch("/api/tickets/:id", checkJwt, requirePermission("update:ticket_status"), async (req, res) => {
  try {
    const { id } = req.params
    const { estado, motivo_rechazo } = req.body

    const estadosValidos = ["recibido", "hecho", "rechazado"]
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "estado invalido" })
    }

    const ticketsPath = path.join(process.cwd(), "server", "tickets", "tickets.json")
    if (!fs.existsSync(ticketsPath)) {
      return res.status(404).json({ error: "No existe el archivo de tickets" })
    }

    const raw = fs.readFileSync(ticketsPath, "utf-8")
    const tickets = JSON.parse(raw)

    if (!Array.isArray(tickets)) {
      return res.status(500).json({ error: "Formato de tickets invalido" })
    }

    const index = tickets.findIndex(t => t.id === id)
    if (index === -1) {
      return res.status(404).json({ error: "Ticket no encontrado" })
    }

    const actual = tickets[index]

    // Si ya fue rechazado, no permitimos cambios posteriores.
    if (actual.estado === "rechazado" && estado !== "rechazado") {
      return res.status(400).json({ error: "No se puede modificar un ticket rechazado" })
    }

    if (estado === "rechazado") {
      const motivo = motivo_rechazo?.trim()
      if (!motivo) {
        return res.status(400).json({ error: "motivo_rechazo es obligatorio para rechazar" })
      }
      tickets[index] = {
        ...actual,
        estado: "rechazado",
        motivo_rechazo: motivo
      }
    } else {
      tickets[index] = {
        ...actual,
        estado,
        motivo_rechazo: null
      }
    }

    fs.writeFileSync(ticketsPath, JSON.stringify(tickets, null, 2))
    res.json(tickets[index])
  } catch (error) {
    console.error("Error actualizando ticket:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

app.delete("/api/tickets/:id", checkJwt, requirePermission("delete:tickets"), async (req, res) => {
  try {
    const { id } = req.params
    const ticketsPath = path.join(process.cwd(), "server", "tickets", "tickets.json")

    if (!fs.existsSync(ticketsPath)) {
      return res.status(404).json({ error: "No existe el archivo de tickets" })
    }

    const raw = fs.readFileSync(ticketsPath, "utf-8")
    const tickets = JSON.parse(raw)

    if (!Array.isArray(tickets)) {
      return res.status(500).json({ error: "Formato de tickets invalido" })
    }

    const filtered = tickets.filter(t => t.id !== id)
    if (filtered.length === tickets.length) {
      return res.status(404).json({ error: "Ticket no encontrado" })
    }

    fs.writeFileSync(ticketsPath, JSON.stringify(filtered, null, 2))
    res.json({ message: "Ticket eliminado correctamente" })
  } catch (error) {
    console.error("Error eliminando ticket:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})


  //-------API BANCO CENTRAL---------

  //TIPO DE CAMBIO

  app.get("/api/tipo-cambio", async (req, res) => {
    try {

      const response = await fetch(
        process.env.BCH_API_URL,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            "clave": process.env.BCH_API_KEY
          }
        }
      );

      const data = await response.json();

      res.json(data[0]); // el más reciente

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error obteniendo tipo de cambio" });
    }
  });

  //COMPRA DOLAR
  app.get("/api/compra-dolar", async (req, res) => {
    try {
      const response = await fetch(
        `${process.env.BCH_API_COMPRA_URL}?formato=Json`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            "clave": process.env.BCH_API_KEY
          }
        }
      );

      const data = await response.json();

      res.json(data[0]); // el más reciente

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error obteniendo compra del dólar" });
    }
  });

  //VENTA DOLAR
  app.get("/api/venta-dolar", async (req, res) => {
    try {
      const response = await fetch(
        `${process.env.BCH_API_VENTA_URL}?formato=Json`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            "clave": process.env.BCH_API_KEY
          }
        }
      );

      const data = await response.json();

      res.json(data[0]); // el más reciente

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error obteniendo venta del dólar" });
    }
  });

  //HISTORIAL DE CAMBIO

  app.get("/api/tipo-cambio-historial", async (req, res) => {
    try {

      const response = await fetch(
        process.env.BCH_API_URL,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            "clave": process.env.BCH_API_KEY
          }
        }
      );

      const data = await response.json();

      const historial = data.slice(0, 7).map(item => ({
        fecha: item.Fecha,
        valor: item.Valor
      }));

      res.json(historial);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error obteniendo historial" });
    }
  });

  //HISTORIAL COMPRA

  app.get("/api/compra-dolar-historial", async (req, res) => {
    try {

      const response = await fetch(
        process.env.BCH_API_COMPRA_URL,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            "clave": process.env.BCH_API_KEY
          }
        }
      );

      const data = await response.json();

      const historialCompra = data.slice(0, 7).map(item => ({
        fecha: item.Fecha,
        valor: item.Valor
      }));

      res.json(historialCompra);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error obteniendo historial" });
    }
  });

  //HISTORIAL VENTA

  app.get("/api/venta-dolar-historial", async (req, res) => {
    try {

      const response = await fetch(
        process.env.BCH_API_VENTA_URL,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            "clave": process.env.BCH_API_KEY
          }
        }
      );

      const data = await response.json();

      const historialVenta = data.slice(0, 7).map(item => ({
        fecha: item.Fecha,
        valor: item.Valor
      }));

      res.json(historialVenta);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error obteniendo historial" });
    }
  });



  //--------API AUTH0---------


  app.get("/api/users", checkJwt, async (req, res) => {
    try {
      const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
          grant_type: "client_credentials"
        })
      });

      const tokenData = await tokenResponse.json();
      //console.log("Token response:", tokenData);  //log que devuelve datos del token para verificar su conexión SOLO ACTIVAR EN DEV

      const { access_token } = tokenData;
      //console.log("Access token:", access_token); //log que devuelve acces token para verificar su conexión SOLO ACTIVAR EN DEV

      const usersResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const users = await usersResponse.json();
      //console.log("Users response:", users); //log que devuelve respuesta de users para verificar su conexión SOLO ACTIVAR EN DEV
      res.json(users);

    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      res.status(500).json({ error: "Error obteniendo usuarios" });
    }
  });

  //CREAR USUARIOS POST

  app.post("/api/users", checkJwt, async (req, res) => {
    try {
      const { email, password, username } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({
          error: "email, password y username son obligatorios"
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          error: "La contraseña debe tener al menos 8 caracteres"
        });
      }

      const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
          grant_type: "client_credentials"
        })
      });

      const tokenData = await tokenResponse.json();
      const { access_token } = tokenData;

      const createResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`
        },
        body: JSON.stringify({
          email,
          password,
          username,
          connection: "Username-Password-Authentication"
        })
      });

      const data = await createResponse.json();

      if (!createResponse.ok) {
        return res.status(createResponse.status).json(data);
      }

      auditLog({
        accion: 'CREAR_USUARIO',
        realizadoPor: req.auth.payload.sub,
        detalle: { email, username }
      })

      res.status(201).json({
        message: "Usuario creado correctamente",
        user: {
          id: data.user_id,
          email: data.email,
          username: data.username
        }
      });

    } catch (error) {
      console.error("Error creando usuario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  //ROLES READ

  app.get("/api/roles", checkJwt, async (req, res) => {
    try {
      const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
          grant_type: "client_credentials"
        })
      });

      const { access_token } = await tokenResponse.json();

      const rolesResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/roles`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const roles = await rolesResponse.json();
      res.json(roles);

    } catch (error) {
      res.status(500).json({ error: "Error obteniendo roles" });
    }
  });

  //POST ROLES

  app.post("/api/roles", checkJwt, async (req, res) => {
    try {
      const { name, description } = req.body

      if (!name) {
        return res.status(400).json({ error: "El nombre del rol es obligatorio" })
      }

      const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
          grant_type: "client_credentials"
        })
      })

      const { access_token } = await tokenResponse.json()

      const createResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`
        },
        body: JSON.stringify({ name, description })
      })

      const data = await createResponse.json()

      if (!createResponse.ok) {
        return res.status(createResponse.status).json({ error: data.message })
      }

      auditLog({
        accion: 'CREAR_ROL',
        realizadoPor: req.auth.payload.sub,
        detalle: { name, description }
      })

      res.status(201).json({
        message: "Rol creado correctamente",
        role: { id: data.id, name: data.name, description: data.description }
      })

    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" })
    }
  })

  //--------GOOGLE ANALYTICS--------

  //DATOS GENERALES

  const analyticsClient = new BetaAnalyticsDataClient({
    credentials: JSON.parse(process.env.GA_SERVICE_ACCOUNT)

  })

  const PROPERTY_ID = process.env.GA_PROPERTY_ID


  const CACHE_TTL_SHORT = 10 * 60 * 1000       // 10 min — rango que incluye hoy
  const CACHE_TTL_LONG = 24 * 60 * 60 * 1000  // 24h   — rango completamente pasado
  const PAGE_SIZE = 15
  const analyticsCache = new Map()

app.get('/api/analytics/resumen', checkJwt, async (req, res) => {
  try {
    const analyticsClient = new BetaAnalyticsDataClient({
      credentials: JSON.parse(process.env.GA_SERVICE_ACCOUNT)
    })
    
    const [response] = await analyticsClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'newUsers' },
          { name: 'totalUsers' },
        ],
      })

      if (!response.rows || response.rows.length === 0) {
  return res.json({
    pageViews: 0,
    avgSessionDuration: "0m 0s",
    bounceRate: 0,
    newUsers: 0,
    totalUsers: 0
  })
}

      const values = response.rows[0].metricValues

      const totalSeconds = Math.round(parseFloat(values[1].value))
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      const parsed = {
        pageViews: parseInt(values[0].value),
        avgSessionDuration: `${minutes}m ${seconds}s`,
        bounceRate: Math.round(parseFloat(values[2].value) * 100), // 0.258 → 26
        newUsers: parseInt(values[3].value),
        totalUsers: parseInt(values[4].value),
      }

      res.json(parsed)

    } catch (error) {
      res.status(500).json({ error: error.message })
      console.error(error)
    }
  })

app.get('/api/analytics/test', async (req, res) => {
  try {
    const creds = JSON.parse(process.env.GA_SERVICE_ACCOUNT)
    
    res.json({ 
      client_email: creds.client_email,
      property_id: process.env.GA_PROPERTY_ID,
      private_key_start: creds.private_key?.substring(0, 60),
      private_key_end: creds.private_key?.slice(-60),
      has_newlines: creds.private_key?.includes('\n'),
      key_length: creds.private_key?.length
    })
  } catch (e) {
    res.json({ parse_error: e.message })
  }
})


  //DATOS HISTORICOS FILTRADOS POR LOS ULTIMOS 7 DÍAS

  app.get('/api/analytics/historial', checkJwt, async (req, res) => {
    try {
      console.log(req.auth)
      const [response] = await analyticsClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'totalUsers' },
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      })

      const parsed = (response.rows ?? []).map(row => {
        const raw = row.dimensionValues[0].value
        const fecha = `${raw.slice(6, 8)}/${raw.slice(4, 6)}`

        const totalSeconds = Math.round(parseFloat(row.metricValues[1].value))
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60

        return {
          fecha,
          pageViews: parseInt(row.metricValues[0].value),
          avgSessionDuration: `${minutes}m ${seconds}s`,
          bounceRate: Math.round(parseFloat(row.metricValues[2].value) * 100),
          totalUsers: parseInt(row.metricValues[3].value),
        }
      })

      res.json(parsed)

    } catch (error) {
      res.status(500).json({ error: error.message })
      console.error(error)
    }
  })

  //DATOS DE PAGINAS ESPECIFICAS
  app.get('/api/analytics/paginas', checkJwt, async (req, res) => {
    try {
      console.log(req.auth)
      const [response] = await analyticsClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        dimensionFilter: {
          notExpression: {
            filter: {
              fieldName: 'pagePath',
              stringFilter: {
                matchType: 'BEGINS_WITH',
                value: '/admin'
              }
            }
          }
        },
        limit: 5
      })

      const parsed = (response.rows ?? []).map(row => ({
        pagina: row.dimensionValues[0].value,
        visitas: parseInt(row.metricValues[0].value)
      }))

      const unificado = parsed.map(item => ({
        ...item,
        pagina: item.pagina === '/web-ptc/' ? '/' : item.pagina
      }))

      const agrupado = Object.values(
        unificado.reduce((acc, item) => {
          if (acc[item.pagina]) {
            acc[item.pagina].visitas += item.visitas
          } else {
            acc[item.pagina] = { ...item }
          }
          return acc
        }, {})
      ).sort((a, b) => b.visitas - a.visitas)

      res.json(agrupado)

    } catch (error) {
      res.status(500).json({ error: error.message })
      console.error(error)
    }
  })

  //POR DONDE ENTRARON LAS VISITAS (URL MANUAL, REDIRECCION, UNASIGNED)

  app.get('/api/analytics/origen', checkJwt, async (req, res) => {
    try {
      console.log(req.auth)
      const [response] = await analyticsClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      })

      const parsed = (response.rows ?? []).map(row => ({
        origen: row.dimensionValues[0].value,
        sesiones: parseInt(row.metricValues[0].value)
      }))

      res.json(parsed)

    } catch (error) {
      res.status(500).json({ error: error.message })
      console.error(error)
    }
  })

  //LUGAR DE ORIGEN DE LAS VISITAS

  app.get('/api/analytics/ubicacion', checkJwt, async (req, res) => {
    try {
      console.log(req.auth)
      const [response] = await analyticsClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 5
      })

      const parsed = (response.rows ?? []).map(row => ({
        pais: row.dimensionValues[0].value,
        sesiones: parseInt(row.metricValues[0].value)
      }))

      res.json(parsed)


    } catch (error) {
      res.status(500).json({ error: error.message })
      console.error(error)
    }
  })

  //DISPOSITIVOS

  app.get('/api/analytics/dispositivos', checkJwt, async (req, res) => {
    try {
      console.log(req.auth)
      const [response] = await analyticsClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      })

      const parsed = (response.rows ?? []).map(row => ({
        name: row.dimensionValues[0].value,  // "mobile", "desktop", "tablet"
        value: parseInt(row.metricValues[0].value)
      }))

      res.json(parsed)

    } catch (error) {
      res.status(500).json({ error: error.message })
      console.error(error)
    }
  })

  app.get('/api/analytics/horas', checkJwt, async (req, res) => {
    try {
      console.log(req.auth)
      const [response] = await analyticsClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'hour' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'hour' } }]
      })

      const parsed = (response.rows ?? []).map(row => ({
        hora: `${row.dimensionValues[0].value}:00`,
        sesiones: parseInt(row.metricValues[0].value)
      }))

      res.json(parsed)

    } catch (error) {
      res.status(500).json({ error: error.message })
      console.error(error)
    }
  })

  //ENDPOINT DE EVENTOS

  app.get('/api/analytics/eventos', checkJwt, async (req, res) => {
    try {
      console.log(req.auth)
      const [response] = await analyticsClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: ['click_cta_contacto', 'click_ver_mas', 'formulario_enviado']
            }
          }
        },
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }]
      })

      const parsed = (response.rows ?? []).map(row => ({
        evento: row.dimensionValues[0].value,
        count: parseInt(row.metricValues[0].value)
      })) ?? []

      res.json(parsed)

    } catch (error) {
      res.status(500).json({ error: error.message })
      console.error(error)
    }
  })


  // HELPER: M2M Token reutilizable


  async function getManagementToken() {
    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: "client_credentials"
      })
    });

    const data = await response.json();

    if (!data.access_token) {
      throw new Error("No se pudo obtener el token de gestión de Auth0");
    }

    return data.access_token;
  }


  // PATCH /api/users/:id — Editar usuario (nombre, email, blocked)
  app.patch("/api/users/:id", checkJwt, async (req, res) => {
    try {
      const userId = decodeURIComponent(req.params.id)
      const { blocked, name, email } = req.body

      // Que venga al menos un campo
      if (blocked === undefined && name === undefined && email === undefined) {
        return res.status(400).json({ error: "Debe enviar al menos un campo para actualizar" })
      }

      if (blocked !== undefined && typeof blocked !== "boolean") {
        return res.status(400).json({ error: "'blocked' debe ser true o false" })
      }

      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Correo electrónico inválido" })
        }
      }

      if (name !== undefined && name.trim().length < 2) {
        return res.status(400).json({ error: "El nombre debe tener al menos 2 caracteres" })
      }

      const access_token = await getManagementToken()

      // Armamos solo los campos que vienen
      const payload = {}
      if (blocked !== undefined) payload.blocked = blocked
      if (name !== undefined) payload.name = name.trim()
      if (email !== undefined) payload.email = email.trim()

      const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message })
      }

      auditLog({
        accion: 'EDITAR_USUARIO',
        realizadoPor: req.auth.payload.sub,
        detalle: { userId, cambios: payload }
      })

      res.json({
        message: "Usuario actualizado correctamente",
        user: {
          id: data.user_id,
          name: data.name,
          email: data.email,
          blocked: data.blocked
        }
      })

    } catch (error) {
      console.error("Error actualizando usuario:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  })



  // PATCH /api/users/:id/password — Cambiar contraseña


  app.patch("/api/users/:id/password", checkJwt, async (req, res) => {
    try {
      const userId = decodeURIComponent(req.params.id);
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "La contraseña es obligatoria" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
      }

      const access_token = await getManagementToken();

      const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`
        },
        body: JSON.stringify({ password, connection: "Username-Password-Authentication" })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message });
      }

      auditLog({
        accion: 'CAMBIAR_CONTRASEÑA',
        realizadoPor: req.auth.payload.sub,
        detalle: { userId }
      })

      res.json({ message: "Contraseña actualizada correctamente" });

    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });


  // GET /api/users/:id/roles — Roles de un usuario


  app.get("/api/users/:id/roles", checkJwt, async (req, res) => {
    try {
      const userId = decodeURIComponent(req.params.id);
      const access_token = await getManagementToken();

      const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}/roles`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message });
      }

      res.json(data);

    } catch (error) {
      console.error("Error obteniendo roles del usuario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });



  // POST /api/users/:id/roles — Asignar rol a usuario


  app.post("/api/users/:id/roles", checkJwt, async (req, res) => {
    try {
      const userId = decodeURIComponent(req.params.id);
      const { roles } = req.body; // array de role IDs: ["rol_abc123"]

      if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ error: "'roles' debe ser un array con al menos un ID de rol" });
      }

      const access_token = await getManagementToken();

      const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`
        },
        body: JSON.stringify({ roles })
      });

      auditLog({
        accion: 'ASIGNAR_ROL',
        realizadoPor: req.auth.payload.sub,
        detalle: { userId, roles }
      })

      if (response.status === 204) {
        return res.json({ message: "Rol(es) asignado(s) correctamente" });
      }

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message });
      }

      res.json({ message: "Rol(es) asignado(s) correctamente" });

    } catch (error) {
      console.error("Error asignando roles:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });



  // PATCH /api/roles/:id — Activar/desactivar rol


  app.patch("/api/roles/:id", checkJwt, async (req, res) => {
    try {
      const roleId = req.params.id;
      const { active } = req.body;

      if (typeof active !== "boolean") {
        return res.status(400).json({ error: "'active' debe ser true o false" });
      }

      const access_token = await getManagementToken();

      // Auth0 no tiene campo nativo de estado en roles,
      // lo guardamos en la descripción con un prefijo controlado
      // Primero traemos el rol actual para no pisar la descripción real
      const getRol = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const rolActual = await getRol.json();

      if (!getRol.ok) {
        return res.status(getRol.status).json({ error: rolActual.message });
      }

      // Limpiamos el prefijo anterior si lo hubiera, y ponemos el nuevo
      const descripcionLimpia = (rolActual.description || "")
        .replace(/^\[INACTIVO\] /, "");

      const nuevaDescripcion = active
        ? descripcionLimpia
        : `[INACTIVO] ${descripcionLimpia}`;

      const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/roles/${roleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`
        },
        body: JSON.stringify({ description: nuevaDescripcion })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message });
      }

      auditLog({
        accion: active ? 'ACTIVAR_ROL' : 'DESACTIVAR_ROL',
        realizadoPor: req.auth.payload.sub,
        detalle: { roleId }
      })

      res.json({
        message: `Rol ${active ? "activado" : "desactivado"} correctamente`,
        role: {
          id: data.id,
          name: data.name,
          description: data.description,
          active
        }
      });

    } catch (error) {
      console.error("Error actualizando rol:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // PUT /api/users/:id/roles — Reemplazar rol de usuario
  app.put("/api/users/:id/roles", checkJwt, async (req, res) => {
    try {
      const userId = decodeURIComponent(req.params.id)
      const { roleId } = req.body

      if (!roleId) {
        return res.status(400).json({ error: "roleId es obligatorio" })
      }

      const access_token = await getManagementToken()
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      }
      const userEncoded = encodeURIComponent(userId)

      // Paso 1 — traer roles actuales del usuario
      const getCurrentRoles = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userEncoded}/roles`, { headers })
      const currentRoles = await getCurrentRoles.json()

      // Paso 2 — si tiene roles, eliminarlos
      if (Array.isArray(currentRoles) && currentRoles.length > 0) {
        const deleteRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userEncoded}/roles`, {
          method: "DELETE",
          headers,
          body: JSON.stringify({ roles: currentRoles.map(r => r.id) })
        })

        if (!deleteRes.ok) {
          const err = await deleteRes.json()
          return res.status(deleteRes.status).json({ error: err.message })
        }
      }

      // Paso 3 — asignar nuevo rol
      const assignRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userEncoded}/roles`, {
        method: "POST",
        headers,
        body: JSON.stringify({ roles: [roleId] })
      })

      auditLog({
        accion: 'REEMPLAZAR_ROL',
        realizadoPor: req.auth.payload.sub,
        detalle: { userId, roleId }
      })

      if (assignRes.status === 204 || assignRes.ok) {
        return res.json({ message: "Rol actualizado correctamente" })
      }

      const err = await assignRes.json()
      return res.status(assignRes.status).json({ error: err.message })

    } catch (error) {
      console.error("Error actualizando rol:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  })


  //TABLA HISTORICA DE ANALÍTICAS

  app.get('/api/analytics/historico', checkJwt, async (req, res) => {
    try {
      const { startDate, endDate, page = '1' } = req.query

      // Requeridos
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate y endDate son obligatorios' })
      }

      // Formato YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ error: 'Formato de fecha inválido. Usá YYYY-MM-DD' })
      }

      const start = new Date(startDate)
      const end = new Date(endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (start > end) {
        return res.status(400).json({ error: 'startDate no puede ser mayor que endDate' })
      }

      if (end > today) {
        return res.status(400).json({ error: 'endDate no puede ser una fecha futura' })
      }

      const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24))
      if (diffDays > 365) {
        return res.status(400).json({ error: 'El rango máximo permitido es de 365 días' })
      }

      const pageNum = parseInt(page)
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ error: 'El número de página debe ser un entero positivo' })
      }

      // Caché inteligente — clave sin página (cacheamos todo el rango)
      const cacheKey = `historico_${startDate}_${endDate}`
      const cached = analyticsCache.get(cacheKey)
      const endIsToday = end.getTime() === today.getTime()
      const ttl = endIsToday ? CACHE_TTL_SHORT : CACHE_TTL_LONG

      let allData

      if (cached && Date.now() - cached.timestamp < ttl) {
        allData = cached.data
      } else {
        const [response] = await analyticsClient.runReport({
          property: `properties/${PROPERTY_ID}`,
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
            { name: 'totalUsers' },
          ],
          orderBys: [{ dimension: { dimensionName: 'date' } }]
        })

        allData = response.rows.map(row => {
          const raw = row.dimensionValues[0].value
          const fecha = `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}`

          const totalSeconds = Math.round(parseFloat(row.metricValues[1].value))
          const minutes = Math.floor(totalSeconds / 60)
          const seconds = totalSeconds % 60

          return {
            fecha,
            pageViews: parseInt(row.metricValues[0].value),
            avgSessionDuration: `${minutes}m ${seconds}s`,
            bounceRate: Math.round(parseFloat(row.metricValues[2].value) * 100),
            totalUsers: parseInt(row.metricValues[3].value),
          }
        })

        analyticsCache.set(cacheKey, { data: allData, timestamp: Date.now() })
      }

      // Paginación desde memoria
      if (req.query.export === 'true') {
        return res.json({ data: allData, pagination: null })
      }
      const total = allData.length
      const totalPages = Math.ceil(total / PAGE_SIZE)

      if (pageNum > totalPages) {
        return res.status(400).json({ error: `La página ${pageNum} no existe. Total de páginas: ${totalPages}` })
      }

      const startIdx = (pageNum - 1) * PAGE_SIZE
      const data = allData.slice(startIdx, startIdx + PAGE_SIZE)

      res.json({
        data,
        pagination: {
          total,
          page: pageNum,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        }
      })

    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Helper para obtener el resource server ID de PTC Backend dinámicamente
  async function getResourceServerId(access_token) {
    const res = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/resource-servers?identifier=${encodeURIComponent(process.env.AUTH0_AUDIENCE)}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const data = await res.json();
    if (!data[0]?.id) throw new Error("No se encontró el resource server");
    return data[0].id;
  }

  //GET Permissions
  app.get("/api/permissions", checkJwt, async (req, res) => {
    try {
      const access_token = await getManagementToken();

      const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/resource-servers?identifier=${encodeURIComponent(process.env.AUTH0_AUDIENCE)}`

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message });
      }

      const resourceServer = data.find(rs => rs.identifier === process.env.AUTH0_AUDIENCE);

      if (!resourceServer) {
        return res.status(404).json({ error: "Resource server no encontrado" });
      }

      res.json(resourceServer.scopes ?? []);

    } catch (error) {
      console.error("Error obteniendo permisos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // GET /api/roles/:id/permissions — Permisos de un rol
  app.get("/api/roles/:id/permissions", checkJwt, async (req, res) => {
    try {
      const roleId = req.params.id
      const access_token = await getManagementToken()

      const response = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/roles/${roleId}/permissions`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      )

      const data = await response.json()

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message })
      }

      res.json(data)

    } catch (error) {
      console.error("Error obteniendo permisos del rol:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  })

  // POST /api/roles/:id/permissions — Asignar permisos a un rol
  app.post("/api/roles/:id/permissions", checkJwt, async (req, res) => {
    try {
      const roleId = req.params.id;
      const { permissions } = req.body; // ["read:analytics", "export:analytics"]

      if (!Array.isArray(permissions) || permissions.length === 0) {
        return res.status(400).json({ error: "'permissions' debe ser un array con al menos un permiso" });
      }

      const access_token = await getManagementToken();
      const resourceServerId = await getResourceServerId(access_token);

      // Auth0 requiere que cada permiso venga con el resource_server_identifier
      const payload = {
        permissions: permissions.map(p => ({
          resource_server_identifier: process.env.AUTH0_AUDIENCE,
          permission_name: p
        }))
      };

      const response = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/roles/${roleId}/permissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (response.status === 201 || response.ok) {

        auditLog({
          accion: 'ASIGNAR_PERMISOS_ROL',
          realizadoPor: req.auth.payload.sub,
          detalle: { roleId, permissions }
        })
        return res.json({ message: "Permisos asignados correctamente" });
      }

      const data = await response.json();
      res.status(response.status).json({ error: data.message });

    } catch (error) {
      console.error("Error asignando permisos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // DELETE /api/roles/:id/permissions — Quitar permisos de un rol
  app.delete("/api/roles/:id/permissions", checkJwt, async (req, res) => {
    try {
      const roleId = req.params.id;
      const { permissions } = req.body; // ["read:analytics"]

      if (!Array.isArray(permissions) || permissions.length === 0) {
        return res.status(400).json({ error: "'permissions' debe ser un array con al menos un permiso" });
      }

      const access_token = await getManagementToken();

      const payload = {
        permissions: permissions.map(p => ({
          resource_server_identifier: process.env.AUTH0_AUDIENCE,
          permission_name: p
        }))
      };

      const response = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/roles/${roleId}/permissions`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`
          },
          body: JSON.stringify(payload)
        }
      );


      if (response.status === 204 || response.ok) {
        auditLog({
          accion: 'QUITAR_PERMISOS_ROL',
          realizadoPor: req.auth.payload.sub,
          detalle: { roleId, permissions }
        })
        return res.json({ message: "Permisos eliminados correctamente" });
        console.log("Permisos eliminados correctamente")
      }

      const data = await response.json();
      res.status(response.status).json({ error: data.message });

    } catch (error) {
      console.error("Error eliminando permisos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // POST /api/permissions — Crear nuevo permiso en PTC Backend
  app.post("/api/permissions", checkJwt, async (req, res) => {
    try {
      const { value, description } = req.body

      if (!value || !description) {
        return res.status(400).json({ error: "value y description son obligatorios" })
      }

      const access_token = await getManagementToken()

      // Traer scopes actuales
      const getRes = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/resource-servers?identifier=${encodeURIComponent(process.env.AUTH0_AUDIENCE)}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      const getData = await getRes.json()
      const resourceServer = getData.find(rs => rs.identifier === process.env.AUTH0_AUDIENCE)

      if (!resourceServer) {
        return res.status(404).json({ error: "Resource server no encontrado" })
      }

      const scopesActuales = resourceServer.scopes ?? []

      // Verificar que no exista ya
      if (scopesActuales.some(s => s.value === value)) {
        return res.status(409).json({ error: "Ya existe un permiso con ese nombre" })
      }

      const nuevosScopos = [...scopesActuales, { value, description }]

      const patchRes = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/resource-servers/${resourceServer.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`
          },
          body: JSON.stringify({ scopes: nuevosScopos })
        }
      )

      const patchData = await patchRes.json()

      if (!patchRes.ok) {
        return res.status(patchRes.status).json({ error: patchData.message })
      }

      auditLog({
        accion: 'CREAR_PERMISO',
        realizadoPor: req.auth.payload.sub,
        detalle: { value, description }
      })

      res.status(201).json({ message: "Permiso creado correctamente", permission: { value, description } })

    } catch (error) {
      console.error("Error creando permiso:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  })

  // DELETE /api/permissions — Eliminar permiso de PTC Backend
  app.delete("/api/permissions", checkJwt, async (req, res) => {
    try { 
      const { value } = req.body

      if (!value) {
        return res.status(400).json({ error: "value es obligatorio" })
      }

      const access_token = await getManagementToken()

      const getRes = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/resource-servers?identifier=${encodeURIComponent(process.env.AUTH0_AUDIENCE)}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      const getData = await getRes.json()
      const resourceServer = getData.find(rs => rs.identifier === process.env.AUTH0_AUDIENCE)

      if (!resourceServer) {
        return res.status(404).json({ error: "Resource server no encontrado" })
      }

      const scopesFiltrados = (resourceServer.scopes ?? []).filter(s => s.value !== value)

      const patchRes = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/resource-servers/${resourceServer.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`
          },
          body: JSON.stringify({ scopes: scopesFiltrados })
        }
      )

      const patchData = await patchRes.json()

      if (!patchRes.ok) {
        return res.status(patchRes.status).json({ error: patchData.message })
      }

      auditLog({
        accion: 'ELIMINAR_PERMISO',
        realizadoPor: req.auth.payload.sub,
        detalle: { value }
      })

      res.json({ message: "Permiso eliminado correctamente" })

    } catch (error) {
      console.error("Error eliminando permiso:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  })

  // PATCH /api/permissions — Editar nombre y descripción de un permiso
  app.patch("/api/permissions", checkJwt, async (req, res) => {
    try {
      const { oldValue, newValue, description } = req.body

      if (!oldValue) {
        return res.status(400).json({ error: "oldValue es obligatorio" })
      }

      const access_token = await getManagementToken()

      const getRes = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/resource-servers?identifier=${encodeURIComponent(process.env.AUTH0_AUDIENCE)}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      const getData = await getRes.json()
      const resourceServer = getData.find(rs => rs.identifier === process.env.AUTH0_AUDIENCE)

      if (!resourceServer) {
        return res.status(404).json({ error: "Resource server no encontrado" })
      }

      const scopesActuales = resourceServer.scopes ?? []
      const existePermiso = scopesActuales.some(s => s.value === oldValue)

      if (!existePermiso) {
        return res.status(404).json({ error: "Permiso no encontrado" })
      }

      // Si cambia el nombre, verificar que el nuevo no exista ya
      if (newValue && newValue !== oldValue && scopesActuales.some(s => s.value === newValue)) {
        return res.status(409).json({ error: "Ya existe un permiso con ese nombre" })
      }

      const scopesActualizados = scopesActuales.map(s =>
        s.value === oldValue
          ? {
            value: newValue?.trim() ?? s.value,
            description: description?.trim() ?? s.description
          }
          : s
      )

      const patchRes = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/resource-servers/${resourceServer.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`
          },
          body: JSON.stringify({ scopes: scopesActualizados })
        }
      )

      const patchData = await patchRes.json()

      if (!patchRes.ok) {
        return res.status(patchRes.status).json({ error: patchData.message })
      }

      auditLog({
        accion: 'EDITAR_PERMISO',
        realizadoPor: req.auth.payload.sub,
        detalle: { oldValue, newValue, description }
      })

      res.json({ message: "Permiso actualizado correctamente" })

    } catch (error) {
      console.error("Error editando permiso:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  })

  app.get('/api/auditoria', checkJwt, async (req, res) => {
    try {
      if (!fs.existsSync('./logs/auditoria.json')) return res.json([])
      const logs = JSON.parse(fs.readFileSync('./logs/auditoria.json', 'utf-8'))
      res.json(logs)
    } catch (error) {
      res.status(500).json({ error: 'Error leyendo logs' })
    }
  })

  //CHECK DE BACKEND CORRIENDO

  

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
