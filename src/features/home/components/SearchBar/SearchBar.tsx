import { App, Button, DatePicker, Form, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import './SearchBar.scss'

const { RangePicker } = DatePicker

/**
 * Barra de consulta de disponibilidad del hero (HU-008 — punto de entrada).
 * La búsqueda real vive en el portal del cliente; aquí guía a la sección de habitaciones.
 */
export function SearchBar() {
  const { message } = App.useApp()

  const onFinish = () => {
    message.info('Elige una habitación para continuar con tu reserva.')
    document.getElementById('habitaciones')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Form className="search-bar" layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="fechas"
        label="Llegada — Salida"
        className="search-bar__field search-bar__field--dates"
        rules={[{ required: true, message: 'Selecciona las fechas.' }]}
      >
        <RangePicker
          className="search-bar__input"
          format="DD/MM/YYYY"
          placeholder={['Llegada', 'Salida']}
        />
      </Form.Item>

      <Form.Item
        name="huespedes"
        label="Huéspedes"
        className="search-bar__field"
        initialValue={2}
      >
        <Select
          className="search-bar__input"
          options={[1, 2, 3, 4, 5, 6].map((n) => ({
            value: n,
            label: `${n} ${n === 1 ? 'huésped' : 'huéspedes'}`,
          }))}
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        className="btn-cta search-bar__submit"
        icon={<SearchOutlined />}
      >
        Consultar
      </Button>
    </Form>
  )
}
