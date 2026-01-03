
import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-context"
import { DepartmentService } from "@/components/api/department.service"

interface CreateDepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateDepartmentDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: CreateDepartmentDialogProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    image: null as File | null 
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Department name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const department = await DepartmentService.create({
        name: formData.name,
        description: formData.description,
      })

      if (formData.image) {
        await DepartmentService.updateImage(department.id, formData.image)
      }

      toast.success("Department created successfully")
      setFormData({ name: "", description: "", image: null })
      setImagePreview(null)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create department"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: "", description: "", image: null })
      setImagePreview(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-md ${isDark ? "border-white/10 bg-slate-950/95 backdrop-blur" : "border-slate-200 bg-white/95 backdrop-blur"}`}>
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : "text-slate-900"}>
            ➕ Create New Department
          </DialogTitle>
          <DialogDescription className={isDark ? "text-slate-200/70" : "text-slate-600"}>
            Add a new department to your organization with basic information and an optional image.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className={isDark ? "text-slate-200" : "text-slate-700"}>
              Department Name <span className="text-amber-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Fleet Operations"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`${
                isDark
                  ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/30"
                  : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500/20"
              }`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className={isDark ? "text-slate-200" : "text-slate-700"}>
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the purpose and responsibilities of this department..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={3}
              className={`${
                isDark
                  ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/30"
                  : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500/20"
              }`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className={isDark ? "text-slate-200" : "text-slate-700"}>
              Department Image
            </Label>
            {imagePreview && (
              <div className={`relative rounded-lg border-2 border-dashed p-3 ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-400 bg-amber-50"}`}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-full rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, image: null }))
                    setImagePreview(null)
                  }}
                  className={`absolute right-2 top-2 rounded-full p-1 ${isDark ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"} text-white`}
                >
                  ✕
                </button>
              </div>
            )}
            {!imagePreview && (
              <label className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDark
                  ? "border-white/20 bg-white/5 hover:border-amber-500/50 hover:bg-amber-500/5"
                  : "border-slate-300 bg-slate-50 hover:border-amber-500 hover:bg-amber-50"
              }`}>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <div className="text-center">
                  <span className="text-2xl">🖼️</span>
                  <p className={`mt-2 text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    Click to upload image
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className={isDark ? "border-white/20 bg-white/5 text-slate-100 hover:bg-white/10" : "border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200"}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ${isDark ? "bg-linear-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600" : "bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"}`}
            >
              {isSubmitting ? "Creating..." : "✓ Create Department"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateDepartmentDialog