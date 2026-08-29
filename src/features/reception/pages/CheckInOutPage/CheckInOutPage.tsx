import { useCallback, useEffect, useMemo, useState } from 'react'
import { App, Button } from 'antd'
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import { receptionApi } from '@/features/reception/api/reception.api'
import { getErrorMessage } from '@/shared/api/client'
import { Table, type Column } from '@/shared/components/Table/Table'
import { UserAvatar } from '@/shared/components/UserAvatar/UserAvatar'
import { CheckInOutModal } from '@/features/reception/components/CheckInOutModal/CheckInOutModal'
import { PageHeader } from '@/shared/components/PageHeader/PageHeader'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { formatLongDate } from '@/features/reception/lib/date'
import { formatStayDate } from '@/features/rooms/lib/stay'
import {
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_TONE,
} from '@/features/reception/lib/reservationStatus'
import type { Reservation } from '@/features/client/types'
import type { TodayReservations } from '@/features/reception/types'
import './CheckInOutPage.scss'

type Tab = 'check-ins' | 'check-outs'

/** HU-018/019 — Check-ins y check-outs del día y su registro. */
export function CheckInOutPage() {
  const { message } = App.useApp()
  const [data, setData] = useState<TodayReservations | null>(null)
  const [tab, setTab] = useState<Tab>('check-ins')
  const [modal, setModal] = useState<{ reservation: Reservation; mode: Tab } | null>(null)

  const load = useCallback(() => {
    receptionApi
      .today()
      .then(setData)
      .catch((e) => message.error(getErrorMessage(e, 'No se pudieron cargar las operaciones de hoy.')))
  }, [message])

  useEffect(load, [load])

  const checkIns = data?.check_ins ?? []
  const checkOuts = data?.check_outs ?? []

  const pendingCheckIns = checkIns.filter(
    (r) => r.status === 'PENDIENTE' || r.status === 'CONFIRMADA',
  )
  const doneCheckIns = checkIns.filter(
    (r) => r.status === 'CHECK_IN' || r.status === 'CHECK_OUT',
  )
  const pendingCheckOuts = checkOuts.filter((r) => r.status === 'CHECK_IN')
  const doneCheckOuts = checkOuts.filter((r) => r.status === 'CHECK_OUT')

  const guestCol: Column<Reservation> = {
    key: 'guest',
    header: 'Huésped',
    render: (r) => (
      <div className="checkinout__guest">
        <UserAvatar name={r.guest.name} lastName={r.guest.last_name} />
        <span>
          {r.guest.name} {r.guest.last_name}
        </span>
      </div>
    ),
  }

  const roomCol: Column<Reservation> = {
    key: 'room',
    header: 'Habitación',
    render: (r) => (
      <div className="checkinout__room">
        <strong>{r.room.name}</strong>
        <span>{r.room.beds_label}</span>
      </div>
    ),
  }

  const statusCol: Column<Reservation> = {
    key: 'status',
    header: 'Estado',
    render: (r) => (
      <StatusTag tone={RESERVATION_STATUS_TONE[r.status]}>
        {RESERVATION_STATUS_LABEL[r.status]}
      </StatusTag>
    ),
  }

  const columns = useMemo<Column<Reservation>[]>(() => {
    const mode = tab
    return [
      guestCol,
      roomCol,
      {
        key: 'date',
        header: 'Fecha',
        render: (r) =>
          formatStayDate(mode === 'check-ins' ? r.check_in : r.check_out),
      },
      statusCol,
      {
        key: 'action',
        header: 'Acción',
        align: 'right',
        render: (r) => (
          <Button
            type="primary"
            className={mode === 'check-ins' ? 'btn-cta' : 'btn-forest'}
            onClick={() => setModal({ reservation: r, mode })}
          >
            {mode === 'check-ins' ? 'Registrar check-in' : 'Registrar check-out'}
          </Button>
        ),
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const doneColumns = useMemo<Column<Reservation>[]>(
    () => [
      guestCol,
      roomCol,
      {
        key: 'date',
        header: 'Fecha',
        render: (r) =>
          formatStayDate(tab === 'check-ins' ? r.check_in : r.check_out),
      },
      statusCol,
      {
        key: 'action',
        header: 'Acción',
        align: 'right',
        render: () => (
          <Button disabled>Registrado</Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab],
  )

  const pending = tab === 'check-ins' ? pendingCheckIns : pendingCheckOuts
  const done = tab === 'check-ins' ? doneCheckIns : doneCheckOuts

  return (
    <div className="checkinout">
      <PageHeader
        title="Check-in / Check-out"
        breadcrumb={[
          { label: 'Inicio', to: '/panel-reception' },
          { label: 'Check-in / Check-out' },
        ]}
        subtitle={<>Hoy — {formatLongDate()}</>}
        actions={
          <div className="checkinout__summary">
            <span className="checkinout__summary-pill checkinout__summary-pill--in">
              <LoginOutlined /> {pendingCheckIns.length} check-ins pendientes
            </span>
            <span className="checkinout__summary-pill checkinout__summary-pill--out">
              <LogoutOutlined /> {pendingCheckOuts.length} check-outs pendientes
            </span>
          </div>
        }
      />

      <nav className="checkinout__tabs">
        <button
          className={tab === 'check-ins' ? 'checkinout__tab--active' : ''}
          onClick={() => setTab('check-ins')}
        >
          Check-ins de hoy
        </button>
        <button
          className={tab === 'check-outs' ? 'checkinout__tab--active' : ''}
          onClick={() => setTab('check-outs')}
        >
          Check-outs de hoy
        </button>
      </nav>

      <Table
        columns={columns}
        rows={pending}
        rowKey={(r) => r.id}
        loading={data === null}
        emptyText={
          tab === 'check-ins'
            ? 'No hay check-ins pendientes hoy.'
            : 'No hay check-outs pendientes hoy.'
        }
      />

      {done.length > 0 && (
        <>
          <div className="checkinout__divider">Ya registrados</div>
          <Table columns={doneColumns} rows={done} rowKey={(r) => r.id} />
        </>
      )}

      <CheckInOutModal
        reservation={modal?.reservation ?? null}
        mode={modal?.mode === 'check-outs' ? 'check-out' : 'check-in'}
        open={modal !== null}
        onClose={() => setModal(null)}
        onDone={load}
      />
    </div>
  )
}
