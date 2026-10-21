import { SectionHeader } from '../../../components/ui'
import { RotaBoard } from '../../../demo/components/RotaBoard'
import { WeekNav } from '../../../demo/components/common'

export function ManagerRota({ onShift }: { onShift: (id: string) => void }) {
  return (
    <div>
      <SectionHeader title="Weekly rota" description="Select a shift to check who is on it or assign someone eligible." action={<WeekNav />} />
      <RotaBoard onSelect={(s) => onShift(s.id)} />
    </div>
  )
}
