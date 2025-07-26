import { useState, useEffect } from 'react'
import { Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { JobApplication } from '@/lib/supabase'

interface AddJobDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (jobData: Partial<JobApplication>) => Promise<void>
  editingJob?: JobApplication | null
}

export function AddJobDialog({ isOpen, onOpenChange, onSubmit, editingJob }: AddJobDialogProps) {
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    status: 'applied' as const,
    deadline: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingJob) {
      setFormData({
        company_name: editingJob.company_name,
        role_title: editingJob.role_title,
        status: editingJob.status as 'applied' | 'interviewing' | 'offer' | 'rejected',
        deadline: editingJob.deadline || '',
        notes: editingJob.notes || '',
      })
    } else {
      setFormData({
        company_name: '',
        role_title: '',
        status: 'applied',
        deadline: '',
        notes: '',
      })
    }
  }, [editingJob, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const jobData = {
        ...formData,
        deadline: formData.deadline || null,
        notes: formData.notes || null,
      }

      if (editingJob) {
        await onSubmit({ ...jobData, id: editingJob.id })
      } else {
        await onSubmit(jobData)
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting job:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingJob ? 'Edit Job Application' : 'Add New Job Application'}
          </DialogTitle>
          <DialogDescription>
            {editingJob 
              ? 'Update the details of your job application.'
              : 'Add a new job application to track your progress.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="e.g. Google"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={formData.role_title}
                onChange={(e) => setFormData(prev => ({ ...prev, role_title: e.target.value }))}
                placeholder="e.g. Software Engineer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'applied' | 'interviewing' | 'offer' | 'rejected') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <div className="relative">
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes about this application..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (editingJob ? 'Updating...' : 'Adding...') 
                : (editingJob ? 'Update Job' : 'Add Job')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}