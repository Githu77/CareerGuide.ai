"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ProfileFormProps = {
  userId: string
  initialData: any
}

export default function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || "",
    phone: initialData.phone || "",
    education_level: initialData.education_level || "",
    bio: initialData.bio || "",
    current_skills: initialData.current_skills?.join(", ") || "",
    desired_skills: initialData.desired_skills?.join(", ") || "",
    location: initialData.location || "",
    experience_years: initialData.experience_years || "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          education_level: formData.education_level,
          bio: formData.bio,
          current_skills: formData.current_skills
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
          desired_skills: formData.desired_skills
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
          location: formData.location,
          experience_years: formData.experience_years,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) throw updateError

      setSuccess(true)
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred while updating your profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+254 XXX XXX XXX"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="education_level">Education Level</Label>
              <Select
                value={formData.education_level}
                onValueChange={(value) => handleSelectChange("education_level", value)}
              >
                <SelectTrigger id="education_level">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary School</SelectItem>
                  <SelectItem value="secondary">Secondary School</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Select
                value={formData.experience_years}
                onValueChange={(value) => handleSelectChange("experience_years", value)}
              >
                <SelectTrigger id="experience_years">
                  <SelectValue placeholder="Select years of experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No experience</SelectItem>
                  <SelectItem value="1-2">1-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location in Kenya</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Nairobi, Mombasa, Kisumu, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_skills">Current Skills (comma separated)</Label>
            <Textarea
              id="current_skills"
              name="current_skills"
              value={formData.current_skills}
              onChange={handleChange}
              placeholder="HTML, CSS, JavaScript, Communication"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired_skills">Desired Skills (comma separated)</Label>
            <Textarea
              id="desired_skills"
              name="desired_skills"
              value={formData.desired_skills}
              onChange={handleChange}
              placeholder="React, Node.js, Project Management"
              className="min-h-[80px]"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">Profile updated successfully!</p>}
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </CardFooter>
    </Card>
  )
}
