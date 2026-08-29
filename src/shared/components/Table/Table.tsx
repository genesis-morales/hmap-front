import type { ReactNode } from 'react'
import { Skeleton } from 'antd'
import './Table.scss'

export interface Column<T> {
  /** Clave única de la columna. */
  key: string
  /** Encabezado (texto o nodo). */
  header: ReactNode
  /** Render de la celda para una fila. */
  render: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  /** Ancho CSS opcional (p. ej. '120px', '20%'). */
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  /** Clave estable por fila. */
  rowKey: (row: T) => string | number
  /** Muestra filas esqueleto mientras carga. */
  loading?: boolean
  /** Contenido cuando no hay filas. */
  emptyText?: ReactNode
  /** Número de filas esqueleto (default 5). */
  skeletonRows?: number
  onRowClick?: (row: T) => void
}

/**
 * Tabla de datos reutilizable del panel interno: configuración por columnas,
 * estados de carga y vacío. Mantiene la estética de tarjeta del sistema de diseño.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyText = 'No hay datos para mostrar.',
  skeletonRows = 5,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align ?? 'left' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="data-table__skeleton-row">
                {columns.map((col) => (
                  <td key={col.key}>
                    <Skeleton.Input active size="small" block />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && rows.length === 0 && (
            <tr className="data-table__empty-row">
              <td colSpan={columns.length}>{emptyText}</td>
            </tr>
          )}

          {!loading &&
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={onRowClick ? 'data-table__row--clickable' : ''}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ textAlign: col.align ?? 'left' }}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
