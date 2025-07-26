import { useState } from 'react'
import { Calendar, Clock, MoreHorizontal, Trash2, Edit3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { JobApplication } from '@/lib/supabase'

interface JobCardProps {
  job: JobApplication
  onEdit: (job: JobApplication) => void
  onDelete: (id: string) => void
}

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'hsl(var(--applied))'
      case 'interviewing':
        return 'hsl(var(--interviewing))'
      case 'offer':
        return 'hsl(var(--offer))'
      case 'rejected':
        return 'hsl(var(--rejected))'
      default:
        return 'hsl(var(--muted))'
    }
  }

  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return null
    
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { status: 'overdue', color: 'hsl(var(--destructive))', text: 'Overdue' }
    } else if (diffDays <= 3) {
      return { status: 'due-soon', color: 'hsl(var(--interviewing))', text: `${diffDays} days left` }
    } else {
      return { status: 'future', color: 'hsl(var(--muted-foreground))', text: `${diffDays} days left` }
    }
  }

  const deadlineStatus = getDeadlineStatus(job.deadline)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(job.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const getCompanyInitials = (companyName: string) => {
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Company Logo Placeholder */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: getStatusColor(job.status) }}
            >
              {getCompanyInitials(job.company_name)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {job.role_title}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {job.company_name}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(job)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Application Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Calendar className="h-3 w-3" />
          Applied {new Date(job.application_date).toLocaleDateString()}
        </div>

        {/* Deadline */}
        {job.deadline && deadlineStatus && (
          <div className="flex items-center gap-2 text-xs mb-3">
            <Clock className="h-3 w-3" style={{ color: deadlineStatus.color }} />
            <span style={{ color: deadlineStatus.color }}>
              {deadlineStatus.text}
            </span>
          </div>
        )}

        {/* Notes Preview */}
        {job.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
            {job.notes}
          </p>
        )}

        {/* Status Badge */}
        <div className="mt-3 flex justify-end">
          <Badge 
            variant="secondary" 
            className="text-xs capitalize"
            style={{ 
              backgroundColor: `${getStatusColor(job.status)}20`,
              color: getStatusColor(job.status),
              border: `1px solid ${getStatusColor(job.status)}40`
            }}
          >
            {job.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}