import { ChartArea, User, LogOut, TableProperties, ChevronDown, ChevronUp, Shield, FileText, Menu, Ticket } from "lucide-react"
import { Outlet, useLocation } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import ThemeToggle from "../ui/Buttons/ThemeToggle";
import { HashLink } from "react-router-hash-link";
import { useState } from "react";
import { IconUserKey } from "@tabler/icons-react";
import { usePermissions } from "@/hooks/usePermissions";
import { Mail } from "lucide-react";

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuth0();
  const { pathname } = useLocation();
  const [usuariosOpen, setUsuariosOpen] = useState(false)
  const { hasPermission, loading } = usePermissions();

  const canViewAnalytics = hasPermission("read:analytics");
  const canViewUsers = hasPermission("read:users");
  const canViewRoles = hasPermission("read:roles");
  const canViewPermissions = hasPermission("read:permissions");
  const canViewLogs = hasPermission("read:logs");
  const canViewMails = hasPermission("read:mails");
  const canViewTickets = hasPermission("read:tickets");
  const canViewUsersMenu = canViewUsers || canViewRoles || canViewPermissions;
  const canViewMoreMenu = canViewUsersMenu || canViewAnalytics || canViewLogs || canViewMails || canViewTickets;
  const usersSectionActive =
    pathname === "/admin/users" ||
    pathname === "/admin/roles" ||
    pathname === "/admin/permissions";

  const getDesktopNavClass = (isActive) =>
    `flex flex-row gap-2 p-2 rounded-lg cursor-pointer transition ${
      isActive
        ? "bg-brand-secondary text-brand-accent-80"
        : "hover:bg-brand-primary-120 hover:text-brand-accent-110"
    }`;

  const getMobileNavClass = (isActive) =>
    `flex items-center gap-2 px-3 py-2 text-sm transition ${
      isActive
        ? "bg-brand-secondary text-brand-accent-80"
        : "text-text-primary-static hover:bg-brand-primary-120"
    }`;

  return (
    <div className="flex flex-row h-screen overflow-hidden w-full">

      <section className="hidden md:flex flex-col bg-brand-primary h-full w-70 z-10">
        <div className="p-4">
          <img src="https://i.imgur.com/r1sB3MS.png" alt="logo procesadora de tarjetas de credito" className="h-13 static" />
        </div>
        <hr className="flex border-solid border-1 border-brand-accent items-center justify-center w-50 mx-auto" />
        <nav className="text-text-primary-static">
          <ul className="flex flex-col gap-1 py-6 px-2">
            {!loading && canViewAnalytics && (
              <HashLink to="/admin">
                <li className={getDesktopNavClass(pathname === "/admin")}>
                  <ChartArea className="h-6 w-4"/> Dashboard
                </li>
              </HashLink>
            )}

            {!loading && canViewUsersMenu && (
              <li>
                <button
                  onClick={() => setUsuariosOpen(!usuariosOpen)}
                  className={`w-full flex flex-row items-center justify-between gap-2 p-2 rounded-lg cursor-pointer transition ${
                    usersSectionActive
                      ? "bg-brand-secondary text-brand-accent-80"
                      : "hover:bg-brand-primary-120 hover:text-brand-accent-110"
                  }`}>
                  <span className="flex items-center gap-2"><User className="h-6 w-4"/> Admin Usuarios</span>
                  {usuariosOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {usuariosOpen && (
                  <ul className="flex flex-col gap-1 pl-4 mt-1">
                    {canViewUsers && (
                      <HashLink to="/admin/users">
                        <li className={`${getDesktopNavClass(pathname === "/admin/users")} text-sm`}>
                          <User className="h-4 w-4" /> Usuarios
                        </li>
                      </HashLink>
                    )}
                    {canViewRoles && (
                      <HashLink to="/admin/roles">
                        <li className={`${getDesktopNavClass(pathname === "/admin/roles")} text-sm`}>
                          <IconUserKey className="h-4 w-4" /> Roles
                        </li>
                      </HashLink>
                    )}
                    {canViewPermissions && (
                      <HashLink to="/admin/permissions">
                        <li className={`${getDesktopNavClass(pathname === "/admin/permissions")} text-sm`}>
                          <Shield className="h-4 w-4" /> Permisos
                        </li>
                      </HashLink>
                    )}
                  </ul>
                )}
              </li>
            )}

            {!loading && canViewAnalytics && (
              <HashLink to="/admin/historial">
                <li className={getDesktopNavClass(pathname === "/admin/historial")}>
                  <TableProperties className="h-6 w-4" /> Historial
                </li>
              </HashLink>
            )}
            {!loading && canViewLogs && (
              <HashLink to="/admin/logs">
                <li className={getDesktopNavClass(pathname === "/admin/logs")}>
                  <FileText className="h-6 w-4"/> Logs
                </li>
              </HashLink>
            )}
            {!loading && canViewMails && (
              <HashLink to="/admin/mails">
                <li className={getDesktopNavClass(pathname === "/admin/mails")}>
                  <Mail className="h-6 w-4"/> Mails
                </li>
              </HashLink>
            )}
            {!loading && canViewTickets && (
              <HashLink to="/admin/tickets">
                <li className={getDesktopNavClass(pathname === "/admin/tickets")}>
                  <Ticket className="h-6 w-4" /> Tickets
                </li>
              </HashLink>
            )}
          </ul>
        </nav>
        <div className="flex flex-col justify-end mt-auto text-text-primary-static">
          <div className="flex flex-col gap-2 bg-brand-secondary rounded-md mx-4">
            <div className="flex justify-between items-center p-2 px-4">
              <p>Modo:</p>
              <ThemeToggle />
            </div>
            <hr className="mx-2 border-solid border-1 border-brand-secondary-80" />
            <div className="flex justify-between items-center p-2 px-4">
              <div>{isAuthenticated && <p>{user.nickname}</p>}</div>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/web-ptc-extended' } })}
                className="p-1 bg-warning-primary rounded-md hover:scale-110 hover:bg-rose-800 transition cursor-pointer border-solid border-2 border-red-900">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-400 p-2 text-xs">© 2026 Procesadora de Tarjetas de Crédito | Todos los derechos reservados</p>
        </div>
      </section>

      <div className="m-0 p-0 bg-bg w-full overflow-y-auto h-full pb-16 md:pb-0">
        <main>
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-primary border-t border-brand-accent z-50 py-2 m-2 rounded-xl">
        <ul className="flex flex-row justify-around items-center h-16">
          {!loading && canViewAnalytics && (
            <HashLink to="/admin" className="flex-1">
              <li className={`flex flex-col items-center justify-center gap-1 py-2 transition ${
                pathname === "/admin" ? "text-brand-accent-80" : "text-text-primary-static hover:text-brand-accent"
              }`}>
                <ChartArea className="h-5 w-5" />
                <span className="text-xs">Dashboard</span>
              </li>
            </HashLink>
          )}

          {!loading && canViewMoreMenu && (
            <li className="flex-1 relative">
              <button
                onClick={() => setUsuariosOpen(!usuariosOpen)}
                className="w-full flex flex-col items-center justify-center gap-1 py-2 text-text-primary-static hover:text-brand-accent transition">
                <Menu className="h-5 w-5" />
                <span className="text-xs">Mas</span>
              </button>
              {usuariosOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-brand-primary border border-brand-accent rounded-lg overflow-hidden w-40 shadow-lg">
                  {canViewUsers && (
                    <HashLink to="/admin/users" onClick={() => setUsuariosOpen(false)}>
                      <div className={getMobileNavClass(pathname === "/admin/users")}>
                        <User className="h-4 w-4" /> Usuarios
                      </div>
                    </HashLink>
                  )}

                  {canViewRoles && (
                    <HashLink to="/admin/roles" onClick={() => setUsuariosOpen(false)}>
                      <div className={getMobileNavClass(pathname === "/admin/roles")}>
                        <IconUserKey className="h-4 w-4" /> Roles
                      </div>
                    </HashLink>
                  )}

                  {canViewPermissions && (
                    <HashLink to="/admin/permissions" onClick={() => setUsuariosOpen(false)}>
                      <div className={getMobileNavClass(pathname === "/admin/permissions")}>
                        <Shield className="h-4 w-4" /> Permisos
                      </div>
                    </HashLink>
                  )}

                  {canViewAnalytics && (
                    <HashLink to="/admin/historial" onClick={() => setUsuariosOpen(false)}>
                      <div className={getMobileNavClass(pathname === "/admin/historial")}>
                        <TableProperties className="h-4 w-4" /> Historial
                      </div>
                    </HashLink>
                  )}

                  {canViewLogs && (
                    <HashLink to="/admin/logs" onClick={() => setUsuariosOpen(false)}>
                      <div className={getMobileNavClass(pathname === "/admin/logs")}>
                        <FileText className="h-4 w-4" /> Logs
                      </div>
                    </HashLink>
                  )}
                  {canViewMails && (
                    <HashLink to="/admin/mails" onClick={() => setUsuariosOpen(false)}>
                      <div className={getMobileNavClass(pathname === "/admin/mails")}>
                        <Mail className="h-4 w-4" /> Mails
                      </div>
                    </HashLink>
                  )}
                  {canViewTickets && (
                    <HashLink to="/admin/tickets" onClick={() => setUsuariosOpen(false)}>
                      <div className={getMobileNavClass(pathname === "/admin/tickets")}>
                        <Ticket className="h-4 w-4" /> Tickets
                      </div>
                    </HashLink>
                  )}
                </div>
              )}
            </li>
          )}

          <li className="flex flex-col items-center justify-center gap-1 py-2 flex-1">
            <ThemeToggle />
          </li>
          <li
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="flex flex-col items-center justify-center gap-1 py-2 flex-1 cursor-pointer text-red-400 hover:text-red-300 transition">
            <LogOut className="h-5 w-5" />
            <span className="text-xs">Salir</span>
          </li>
        </ul>
      </nav>

    </div>
  )
}
