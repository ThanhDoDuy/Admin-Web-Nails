'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient, ErrorResponse } from '@/lib/api-client'
import {
  AlertCircle,
  Globe,
  Loader2,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRef } from 'react'

const SECTION_LABELS: Record<string, string> = {
  salonName: 'Salon Name',
  tagline: 'Tagline',
  heroImage: 'Hero Image Path',
  about: 'About Text',
  services: 'Services',
  reviews: 'Reviews',
  contact: 'Contact Info',
}

type ContentData = Record<string, unknown>

export default function ContentPage() {
  const [content, setContent] = useState<ContentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadTarget, setUploadTarget] = useState<
    { type: 'hero' } | { type: 'service'; index: number } | null
  >(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchContent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getContent()
      setContent(data)
    } catch (err) {
      const e = err as ErrorResponse
      setError(
        typeof e.message === 'string'
          ? e.message
          : 'Failed to load website content',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const handleSave = async () => {
    if (!content) return
    setSaving(true)
    try {
      await apiClient.updateContent(content)
      toast.success('Website is deploying. Changes will be live shortly.')
    } catch (err) {
      const e = err as ErrorResponse
      const msg =
        typeof e.message === 'string' ? e.message : 'Failed to save changes'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key: string, value: unknown) => {
    setContent((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const updateNestedField = (
    section: string,
    field: string,
    value: string,
  ) => {
    setContent((prev) => {
      if (!prev) return prev
      const obj = (prev[section] as Record<string, unknown>) || {}
      return { ...prev, [section]: { ...obj, [field]: value } }
    })
  }

  const updateArrayItem = (
    section: string,
    index: number,
    field: string,
    value: string | number,
  ) => {
    setContent((prev) => {
      if (!prev) return prev
      const arr = [...((prev[section] as Record<string, unknown>[]) || [])]
      arr[index] = { ...arr[index], [field]: value }
      return { ...prev, [section]: arr }
    })
  }

  const addArrayItem = (
    section: string,
    template: Record<string, string | number>,
  ) => {
    setContent((prev) => {
      if (!prev) return prev
      const arr = [...((prev[section] as Record<string, unknown>[]) || [])]
      arr.push(template)
      return { ...prev, [section]: arr }
    })
  }

  const removeArrayItem = (section: string, index: number) => {
    setContent((prev) => {
      if (!prev) return prev
      const arr = [...((prev[section] as Record<string, unknown>[]) || [])]
      arr.splice(index, 1)
      return { ...prev, [section]: arr }
    })
  }

  const triggerUpload = (target: { type: 'hero' } | { type: 'service'; index: number }) => {
    setUploadTarget(target)
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadTarget) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WebP, GIF)')
      e.target.value = ''
      return
    }
    setUploading(true)
    try {
      const { url } = await apiClient.uploadImage(file)
      if (uploadTarget.type === 'hero') {
        updateField('heroImage', url)
      }
      if (uploadTarget.type === 'service') {
        updateArrayItem('services', uploadTarget.index, 'image', url)
      }
      toast.success('Image uploaded. Click Save & Deploy to update the site.')
    } catch (err) {
      const e = err as ErrorResponse
      toast.error(
        typeof e.message === 'string' ? e.message : 'Upload failed',
      )
    } finally {
      setUploading(false)
      setUploadTarget(null)
      e.target.value = ''
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Globe className="w-8 h-8" />
                Website Content
              </h1>
              <p className="text-muted-foreground mt-1">
                Edit your website content. Changes auto-deploy via Vercel.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchContent}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || loading || !content}
                className="bg-foreground hover:bg-foreground/90 text-white gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save & Deploy'}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Loading website content...
                </p>
              </div>
            </div>
          )}

          {!loading && content && (
            <div className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Salon name, tagline, and hero image
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {typeof content.salonName === 'string' && (
                    <div className="space-y-2">
                      <Label>Salon Name</Label>
                      <Input
                        value={content.salonName}
                        onChange={(e) =>
                          updateField('salonName', e.target.value)
                        }
                        className="border-border focus-visible:ring-[#E8CFCF]"
                      />
                    </div>
                  )}
                  {typeof content.tagline === 'string' && (
                    <div className="space-y-2">
                      <Label>Tagline</Label>
                      <Input
                        value={content.tagline}
                        onChange={(e) =>
                          updateField('tagline', e.target.value)
                        }
                        className="border-border focus-visible:ring-[#E8CFCF]"
                      />
                    </div>
                  )}
                  {typeof content.heroImage === 'string' && (
                    <div className="space-y-2">
                      <Label>Hero Image</Label>
                      <div className="flex gap-2">
                        <Input
                          value={content.heroImage}
                          onChange={(e) =>
                            updateField('heroImage', e.target.value)
                          }
                          placeholder="https://... or paste URL after upload"
                          className="border-border focus-visible:ring-[#E8CFCF] flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => triggerUpload({ type: 'hero' })}
                          disabled={uploading}
                          title="Upload image to Cloudinary"
                        >
                          {uploading && uploadTarget?.type === 'hero' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {typeof content.about === 'string' && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                    <CardDescription>Describe your salon</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={content.about}
                      onChange={(e) =>
                        updateField('about', e.target.value)
                      }
                      rows={5}
                      className="border-border focus-visible:ring-[#E8CFCF]"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Services: always show card so "Add Service" works even when services is missing */}
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Services</CardTitle>
                    <CardDescription>
                      Manage your service offerings
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addArrayItem('services', {
                        id: '',
                        name: '',
                        price: '',
                        description: '',
                        image: '',
                      })
                    }
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Service
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(Array.isArray(content.services)
                    ? content.services
                    : []
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground py-4">
                      No services yet. Click &quot;Add Service&quot; to add one.
                    </p>
                  )}
                  {(Array.isArray(content.services)
                    ? content.services
                    : []
                  ).map((service, i) => (
                        <div
                          key={i}
                          className="p-4 border border-border rounded-lg space-y-3 relative"
                        >
                          <button
                            onClick={() => removeArrayItem('services', i)}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                            <div className="space-y-1">
                              <Label className="text-xs">Name</Label>
                              <Input
                                value={(service.name as string) || ''}
                                onChange={(e) =>
                                  updateArrayItem(
                                    'services',
                                    i,
                                    'name',
                                    e.target.value,
                                  )
                                }
                                className="border-border focus-visible:ring-[#E8CFCF]"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Price</Label>
                              <Input
                                value={(service.price as string) || ''}
                                onChange={(e) =>
                                  updateArrayItem(
                                    'services',
                                    i,
                                    'price',
                                    e.target.value,
                                  )
                                }
                                className="border-border focus-visible:ring-[#E8CFCF]"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Input
                              value={(service.description as string) || ''}
                              onChange={(e) =>
                                updateArrayItem(
                                  'services',
                                  i,
                                  'description',
                                  e.target.value,
                                )
                              }
                              className="border-border focus-visible:ring-[#E8CFCF]"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Image</Label>
                            <div className="flex gap-2">
                              <Input
                                value={(service.image as string) || ''}
                                onChange={(e) =>
                                  updateArrayItem(
                                    'services',
                                    i,
                                    'image',
                                    e.target.value,
                                  )
                                }
                                placeholder="Upload or paste image URL"
                                className="border-border focus-visible:ring-[#E8CFCF] flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  triggerUpload({ type: 'service', index: i })
                                }
                                disabled={uploading}
                                title="Upload image to Cloudinary"
                              >
                                {uploading &&
                                uploadTarget?.type === 'service' &&
                                uploadTarget.index === i ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                </CardContent>
              </Card>

              {Array.isArray(content.reviews) && (
                <Card className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Reviews</CardTitle>
                      <CardDescription>Customer testimonials</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addArrayItem('reviews', {
                          text: '',
                          author: '',
                          rating: 5,
                        })
                      }
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Review
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(content.reviews as Record<string, unknown>[]).map(
                      (review, i) => (
                        <div
                          key={i}
                          className="p-4 border border-border rounded-lg space-y-3 relative"
                        >
                          <button
                            onClick={() => removeArrayItem('reviews', i)}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                            <div className="space-y-1">
                              <Label className="text-xs">Author</Label>
                              <Input
                                value={(review.author as string) || ''}
                                onChange={(e) =>
                                  updateArrayItem(
                                    'reviews',
                                    i,
                                    'author',
                                    e.target.value,
                                  )
                                }
                                className="border-border focus-visible:ring-[#E8CFCF]"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Rating (1-5)</Label>
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                value={
                                  typeof review.rating === 'number'
                                    ? review.rating
                                    : Number(review.rating) || 5
                                }
                                onChange={(e) =>
                                  updateArrayItem(
                                    'reviews',
                                    i,
                                    'rating',
                                    Math.min(
                                      5,
                                      Math.max(1, Number(e.target.value) || 5),
                                    ),
                                  )
                                }
                                className="border-border focus-visible:ring-[#E8CFCF]"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Review Text</Label>
                            <Textarea
                              value={(review.text as string) || ''}
                              onChange={(e) =>
                                updateArrayItem(
                                  'reviews',
                                  i,
                                  'text',
                                  e.target.value,
                                )
                              }
                              rows={2}
                              className="border-border focus-visible:ring-[#E8CFCF]"
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>
              )}

              {typeof content.contact === 'object' &&
                content.contact !== null &&
                !Array.isArray(content.contact) && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                      <CardDescription>
                        Phone, address, hours, and email
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(
                        content.contact as Record<string, unknown>,
                      ).map(([key, val]) => (
                        <div key={key} className="space-y-2">
                          <Label className="capitalize">{key}</Label>
                          <Input
                            value={(val as string) || ''}
                            onChange={(e) =>
                              updateNestedField(
                                'contact',
                                key,
                                e.target.value,
                              )
                            }
                            className="border-border focus-visible:ring-[#E8CFCF]"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

              {Object.entries(content)
                .filter(
                  ([key]) =>
                    !Object.keys(SECTION_LABELS).includes(key) &&
                    typeof content[key] === 'string',
                )
                .length > 0 && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Other Fields</CardTitle>
                    <CardDescription>Additional content fields</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(content)
                      .filter(
                        ([key]) =>
                          !Object.keys(SECTION_LABELS).includes(key) &&
                          typeof content[key] === 'string',
                      )
                      .map(([key, val]) => (
                        <div key={key} className="space-y-2">
                          <Label className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Input
                            value={val as string}
                            onChange={(e) =>
                              updateField(key, e.target.value)
                            }
                            className="border-border focus-visible:ring-[#E8CFCF]"
                          />
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end pb-8">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-foreground hover:bg-foreground/90 text-white gap-2 px-8"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save & Deploy'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
