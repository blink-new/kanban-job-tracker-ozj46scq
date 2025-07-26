import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { JobApplication } from '@/lib/supabase'
import { JobCard } from './JobCard'
import { SortableJobCard } from './SortableJobCard'

interface KanbanColumnProps {
  id: string
  title: string
  jobs: JobApplication[]
  color: string
  onEditJob: (job: JobApplication) => void
  onDeleteJob: (id: string) => void
}

export function KanbanColumn({ id, title, jobs, color, onEditJob, onDeleteJob }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div 
        className="p-4 rounded-t-lg border-b-2"
        style={{ 
          backgroundColor: `${color}10`,
          borderBottomColor: color
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <div 
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {jobs.length}
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div 
        ref={setNodeRef}
        className="flex-1 p-4 space-y-3 min-h-[400px] bg-card rounded-b-lg border border-t-0"
      >
        <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <SortableJobCard
              key={job.id}
              job={job}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
            />
          ))}
        </SortableContext>
        
        {jobs.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No applications yet
          </div>
        )}
      </div>
    </div>
  )
}