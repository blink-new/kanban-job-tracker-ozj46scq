import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Briefcase, TrendingUp, Users, Award } from 'lucide-react'
import toast from 'react-hot-toast'

import { supabase, JobApplication } from '@/lib/supabase'
import { KanbanColumn } from '@/components/KanbanColumn'
import { JobCard } from '@/components/JobCard'
import { AddJobDialog } from '@/components/AddJobDialog'
import { Card, CardContent } from '@/components/ui/card'

const COLUMNS = [
  { id: 'applied', title: 'Applied', color: 'hsl(var(--applied))' },
  { id: 'interviewing', title: 'Interviewing', color: 'hsl(var(--interviewing))' },
  { id: 'offer', title: 'Offer', color: 'hsl(var(--offer))' },
]

function App() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null)

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
      toast.error('Failed to load job applications')
    } finally {
      setLoading(false)
    }
  }

  // Load jobs
  useEffect(() => {
    loadJobs()
  }, [])

  const handleAddJob = async (jobData: Partial<JobApplication>) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert([jobData])
        .select()
        .single()

      if (error) throw error

      setJobs(prev => [data, ...prev])
      toast.success('Job application added successfully!')
    } catch (error) {
      console.error('Error adding job:', error)
      toast.error('Failed to add job application')
    }
  }

  const handleEditJob = async (jobData: Partial<JobApplication>) => {
    if (!jobData.id) return

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .update(jobData)
        .eq('id', jobData.id)
        .select()
        .single()

      if (error) throw error

      setJobs(prev => prev.map(job => job.id === data.id ? data : job))
      setEditingJob(null)
      toast.success('Job application updated successfully!')
    } catch (error) {
      console.error('Error updating job:', error)
      toast.error('Failed to update job application')
    }
  }

  const handleDeleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id)

      if (error) throw error

      setJobs(prev => prev.filter(job => job.id !== id))
      toast.success('Job application deleted successfully!')
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job application')
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find(j => j.id === event.active.id)
    setActiveJob(job || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveJob(null)

    if (!over) return

    const activeJob = jobs.find(job => job.id === active.id)
    if (!activeJob) return

    const newStatus = over.id as string
    if (activeJob.status === newStatus) return

    // Optimistically update UI
    setJobs(prev => prev.map(job => 
      job.id === activeJob.id 
        ? { ...job, status: newStatus as JobApplication['status'] }
        : job
    ))

    // Update in database
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', activeJob.id)

      if (error) throw error
      toast.success(`Moved to ${newStatus}!`)
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('Failed to update job status')
      // Revert optimistic update
      setJobs(prev => prev.map(job => 
        job.id === activeJob.id 
          ? { ...job, status: activeJob.status }
          : job
      ))
    }
  }

  const openEditDialog = (job: JobApplication) => {
    setEditingJob(job)
    setIsAddDialogOpen(true)
  }

  const closeDialog = () => {
    setIsAddDialogOpen(false)
    setEditingJob(null)
  }

  const getJobsByStatus = (status: string) => {
    return jobs.filter(job => job.status === status)
  }

  const getStats = () => {
    const total = jobs.length
    const applied = jobs.filter(job => job.status === 'applied').length
    const interviewing = jobs.filter(job => job.status === 'interviewing').length
    const offers = jobs.filter(job => job.status === 'offer').length
    
    return { total, applied, interviewing, offers }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your job applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Momentum</h1>
                <p className="text-xs text-muted-foreground">Job Tracker</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <AddJobDialog
                isOpen={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSubmit={editingJob ? handleEditJob : handleAddJob}
                editingJob={editingJob}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" style={{ color: 'hsl(var(--applied))' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.applied}</p>
                  <p className="text-xs text-muted-foreground">Applied</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5" style={{ color: 'hsl(var(--interviewing))' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.interviewing}</p>
                  <p className="text-xs text-muted-foreground">Interviewing</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5" style={{ color: 'hsl(var(--offer))' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.offers}</p>
                  <p className="text-xs text-muted-foreground">Offers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                jobs={getJobsByStatus(column.id)}
                color={column.color}
                onEditJob={openEditDialog}
                onDeleteJob={handleDeleteJob}
              />
            ))}
          </div>

          <DragOverlay>
            {activeJob ? (
              <JobCard
                job={activeJob}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No job applications yet</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking your job search momentum by adding your first application.
            </p>
            <AddJobDialog
              isOpen={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              onSubmit={handleAddJob}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App