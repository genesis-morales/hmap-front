import { useNavigate } from 'react-router-dom'
import { Button, DatePicker, Form, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { API_DATE_FORMAT } from '@/features/rooms/lib/stay'
import { toSearchParams } from '@/features/rooms/lib/staySearch'
import './SearchBar.scss'

const { RangePicker } = DatePicker

interface SearchForm {
  fechas: [Dayjs, Dayjs]
  personas: number
}

/**
 * Barra de consulta de disponibilidad del hero (HU-008 / RF-006).
 * Lleva a la disponibilidad pública: el visitante ve habitaciones y
 * precios sin sesión, y el login llega recién al dar "Reservar" (RNF-006).
 */
export function SearchBar() {
  const navigate = useNavigate()

  const onFinish = (values: SearchForm) => {
    const [checkIn, checkOut] = values.fechas
    navigate(
      `/disponibilidad?${toSearchParams({
        check_in: checkIn.format(API_DATE_FORMAT),
        check_out: checkOut.format(API_DATE_FORMAT),
        guests: values.personas,
      })}`,
    )
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
          disabledDate={(d) => d.isBefore(dayjs(), 'day')}
        />
      </Form.Item>

      <Form.Item
        name="personas"
        label="Personas"
        className="search-bar__field"
        initialValue={2}
      >
        <Select
          className="search-bar__input"
          options={[1, 2, 3, 4, 5, 6].map((n) => ({
            value: n,
            label: `${n} ${n === 1 ? 'persona' : 'personas'}`,
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
