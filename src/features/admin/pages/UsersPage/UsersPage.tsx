import { useCallback, useEffect, useState } from 'react'
import { App, Button, Pagination } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons'
import { adminUsersApi } from '@/features/admin/api/adminUsers.api'
import { getErrorMessage } from '@/shared/api/client'
import { Table, type Column } from '@/shared/components/Table/Table'
import { PageHeader } from '@/shared/components/PageHeader/PageHeader'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { UserAvatar } from '@/shared/components/UserAvatar/UserAvatar'
import {
  USER_ROLE_LABEL,
  USER_ROLE_TONE,
  USER_ACTIVE_LABEL,
  USER_ACTIVE_TONE,
} from '@/features/admin/lib/userRole'
import { useAuth } from '@/features/auth/context/AuthContext'
import { CreateUserModal } from '@/features/admin/components/CreateUserModal/CreateUserModal'
import { EditUserModal } from '@/features/admin/components/EditUserModal/EditUserModal'
import { ToggleActiveModal } from '@/features/admin/components/ToggleActiveModal/ToggleActiveModal'
import type { AdminUser } from '@/features/admin/types'
import type { PageResponse } from '@/shared/api/types'
import './UsersPage.scss'

const PAGE_SIZE = 10

const TABS: { key: string; label: string; active?: boolean }[] = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'ACTIVOS', label: 'Activos', active: true },
  { key: 'INACTIVOS', label: 'Inactivos', active: false },
]

/** HU-034 — Listado de usuarios del sistema con paginación y filtros. */
export function UsersPage() {
  const { message } = App.useApp()
  const { user: currentUser } = useAuth()
  const [tab, setTab] = useState('TODOS')
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<PageResponse<AdminUser> | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [toggling, setToggling] = useState<AdminUser | null>(null)

  const activeFilter = TABS.find((t) => t.key === tab)?.active

  const load = useCallback(() => {
    setResult(null)
    adminUsersApi
      .list({
        active: activeFilter ?? undefined,
        page,
        size: PAGE_SIZE,
      })
      .then(setResult)
      .catch((error) => {
        message.error(getErrorMessage(error, 'No se pudo cargar la nómina.'))
        setResult({
          content: [],
          page: 0,
          size: PAGE_SIZE,
          total_elements: 0,
          total_pages: 0,
        })
      })
  }, [activeFilter, page, message])

  useEffect(load, [load])

  const refresh = () => {
    setPage(0)
    load()
  }

  /** Verdadero si la fila es del admin logueado (autoprotección). */
  const isSelf = (u: AdminUser) => Boolean(currentUser && u.id === currentUser.id)

  /** Los clientes no se editan desde aquí (solo activan/desactivan). */
  const canEdit = (u: AdminUser) => u.role !== 'CLIENTE'

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'Usuario',
      render: (u) => (
        <div className="users__user">
          <UserAvatar name={u.name} lastName={u.last_name} />
          <span>
            {u.name} {u.last_name}
          </span>
        </div>
      ),
    },
    { key: 'email', header: 'Correo', render: (u) => u.email },
    {
      key: 'role',
      header: 'Rol',
      render: (u) => (
        <StatusTag tone={USER_ROLE_TONE[u.role]}>
          {USER_ROLE_LABEL[u.role]}
        </StatusTag>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (u) => (
        <StatusTag tone={USER_ACTIVE_TONE[String(u.active)]}>
          {USER_ACTIVE_LABEL[String(u.active)]}
        </StatusTag>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (u) => (
        <div className="users__actions">
          <button
            className="users__icon users__icon--edit"
            disabled={!canEdit(u)}
            title="Editar"
            onClick={() => setEditing(u)}
          >
            <EditOutlined />
          </button>
          <button
            className={`users__icon ${
              u.active ? 'users__icon--deactivate' : 'users__icon--activate'
            }`}
            disabled={isSelf(u)}
            title={u.active ? 'Desactivar usuario' : 'Activar usuario'}
            onClick={() => setToggling(u)}
          >
            {u.active ? <UserDeleteOutlined /> : <UserAddOutlined />}
          </button>
        </div>
      ),
    },
  ]

  const total = result?.total_elements ?? 0

  return (
    <div className="users">
      <PageHeader
        title="Usuarios"
        breadcrumb={[
          { label: 'Inicio', to: '/panel-admin' },
          { label: 'Usuarios' },
        ]}
        actions={
          <Button
            type="primary"
            className="btn-cta"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Nuevo usuario
          </Button>
        }
      />

      <nav className="users__tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'users__tab--active' : ''}
            onClick={() => {
              setTab(t.key)
              setPage(0)
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <Table
        columns={columns}
        rows={result?.content ?? []}
        rowKey={(u) => u.id}
        loading={result === null}
        emptyText="No hay usuarios para este filtro."
      />

      <footer className="users__footer">
        <span>
          Mostrando {result?.content.length ?? 0} de {total}{' '}
          {total === 1 ? 'usuario' : 'usuarios'}
        </span>
        <Pagination
          current={page + 1}
          pageSize={PAGE_SIZE}
          total={total}
          showSizeChanger={false}
          onChange={(p) => setPage(p - 1)}
        />
      </footer>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refresh}
      />

      <EditUserModal
        user={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={refresh}
      />

      <ToggleActiveModal
        user={toggling}
        open={!!toggling}
        onClose={() => setToggling(null)}
        onToggled={refresh}
      />
    </div>
  )
}
