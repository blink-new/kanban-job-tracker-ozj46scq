import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { JobApplication } from '@/lib/supabase'
import { JobCard } from './JobCard'

interface SortableJobCardProps {
  job: JobApplication
  onEdit: (job: JobApplication) => void
  onDelete: (id: string) => void
}

export function SortableJobCard({ job, onEdit, onDelete }: SortableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <JobCard
        job={job}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
}