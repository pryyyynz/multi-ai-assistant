"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import NavBar from "@/components/nav-bar"
import { ChevronLeft, ChevronRight, Download, FileText, Plus, Trash2, Eye } from "lucide-react"
import { jsPDF } from "jspdf"

type ResumeData = {
  personalInfo: {
    name: string
    email: string
    phone: string
    address: string
    linkedin: string
    website: string
    summary: string
  }
  education: Array<{
    id: string
    institution: string
    degree: string
    year: string
  }>
  experience: Array<{
    id: string
    company: string
    position: string
    duration: string
    description: string
  }>
  skills: string[]
  achievements: Array<{
    id: string
    title: string
    description: string
  }>
  projects: Array<{
    id: string
    title: string
    description: string
    technologies: string
    link: string
  }>
  certifications: Array<{
    id: string
    name: string
    issuer: string
    date: string
    url: string
  }>
}

const initialResumeData: ResumeData = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    website: "",
    summary: "",
  },
  education: [
    {
      id: "edu1",
      institution: "",
      degree: "",
      year: "",
    },
  ],
  experience: [
    {
      id: "exp1",
      company: "",
      position: "",
      duration: "",
      description: "",
    },
  ],
  skills: [""],
  achievements: [
    {
      id: "ach1",
      title: "",
      description: "",
    },
  ],
  projects: [
    {
      id: "proj1",
      title: "",
      description: "",
      technologies: "",
      link: "",
    },
  ],
  certifications: [
    {
      id: "cert1",
      name: "",
      issuer: "",
      date: "",
      url: "",
    },
  ],
}

// Update the templates array with more distinctive styling properties
const templates = [
  {
    id: "classic",
    name: "Classic",
    description: "A traditional resume layout with a clean, professional look",
    color: "bg-blue-500",
    primaryColor: "#2563eb", // blue-600
    secondaryColor: "#dbeafe", // blue-100
    fontFamily: "helvetica",
    layout: "standard",
    headerStyle: "simple",
    sectionTitleStyle: "underline",
    skillStyle: "inline",
  },
  {
    id: "modern",
    name: "Modern",
    description: "A contemporary design with a sleek, minimalist aesthetic",
    color: "bg-green-500",
    primaryColor: "#10b981", // green-500
    secondaryColor: "#d1fae5", // green-100
    fontFamily: "helvetica",
    layout: "sidebar",
    headerStyle: "centered",
    sectionTitleStyle: "background",
    skillStyle: "pill",
  },
  {
    id: "creative",
    name: "Creative",
    description: "A bold, eye-catching layout for creative professionals",
    color: "bg-purple-500",
    primaryColor: "#8b5cf6", // purple-500
    secondaryColor: "#ede9fe", // purple-100
    fontFamily: "helvetica",
    layout: "timeline",
    headerStyle: "banner",
    sectionTitleStyle: "icon",
    skillStyle: "boxed",
  },
  {
    id: "executive",
    name: "Executive",
    description: "A sophisticated design for senior professionals and executives",
    color: "bg-gray-700",
    primaryColor: "#374151", // gray-700
    secondaryColor: "#f3f4f6", // gray-100
    fontFamily: "times",
    layout: "standard",
    headerStyle: "elegant",
    sectionTitleStyle: "uppercase",
    skillStyle: "rating",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "A clean, minimalist design with ample white space",
    color: "bg-teal-500",
    primaryColor: "#14b8a6", // teal-500
    secondaryColor: "#ccfbf1", // teal-100
    fontFamily: "helvetica",
    layout: "compact",
    headerStyle: "simple",
    sectionTitleStyle: "minimal",
    skillStyle: "simple",
  },
  {
    id: "professional",
    name: "Professional",
    description: "A structured, business-oriented layout for corporate roles",
    color: "bg-red-600",
    primaryColor: "#dc2626", // red-600
    secondaryColor: "#fee2e2", // red-100
    fontFamily: "helvetica",
    layout: "columns",
    headerStyle: "professional",
    sectionTitleStyle: "boxed",
    skillStyle: "grouped",
  },
]

export default function ResumeBuilderPage() {
  const [step, setStep] = useState(1)
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData)
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
  const [previewMode, setPreviewMode] = useState(false)

  const totalSteps = 9

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [name]: value,
      },
    })
  }

  const handleEducationChange = (id: string, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    })
  }

  const handleExperienceChange = (id: string, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...resumeData.skills]
    newSkills[index] = value
    setResumeData({
      ...resumeData,
      skills: newSkills,
    })
  }

  const handleAchievementChange = (id: string, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      achievements: resumeData.achievements.map((ach) => (ach.id === id ? { ...ach, [field]: value } : ach)),
    })
  }

  const handleProjectChange = (id: string, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    })
  }

  const handleCertificationChange = (id: string, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)),
    })
  }

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          id: `edu${resumeData.education.length + 1}`,
          institution: "",
          degree: "",
          year: "",
        },
      ],
    })
  }

  const removeEducation = (id: string) => {
    if (resumeData.education.length > 1) {
      setResumeData({
        ...resumeData,
        education: resumeData.education.filter((edu) => edu.id !== id),
      })
    }
  }

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          id: `exp${resumeData.experience.length + 1}`,
          company: "",
          position: "",
          duration: "",
          description: "",
        },
      ],
    })
  }

  const removeExperience = (id: string) => {
    if (resumeData.experience.length > 1) {
      setResumeData({
        ...resumeData,
        experience: resumeData.experience.filter((exp) => exp.id !== id),
      })
    }
  }

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, ""],
    })
  }

  const removeSkill = (index: number) => {
    if (resumeData.skills.length > 1) {
      const newSkills = [...resumeData.skills]
      newSkills.splice(index, 1)
      setResumeData({
        ...resumeData,
        skills: newSkills,
      })
    }
  }

  const addAchievement = () => {
    setResumeData({
      ...resumeData,
      achievements: [
        ...resumeData.achievements,
        {
          id: `ach${resumeData.achievements.length + 1}`,
          title: "",
          description: "",
        },
      ],
    })
  }

  const removeAchievement = (id: string) => {
    if (resumeData.achievements.length > 1) {
      setResumeData({
        ...resumeData,
        achievements: resumeData.achievements.filter((ach) => ach.id !== id),
      })
    }
  }

  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        {
          id: `proj${resumeData.projects.length + 1}`,
          title: "",
          description: "",
          technologies: "",
          link: "",
        },
      ],
    })
  }

  const removeProject = (id: string) => {
    if (resumeData.projects.length > 1) {
      setResumeData({
        ...resumeData,
        projects: resumeData.projects.filter((proj) => proj.id !== id),
      })
    }
  }

  const addCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [
        ...resumeData.certifications,
        {
          id: `cert${resumeData.certifications.length + 1}`,
          name: "",
          issuer: "",
          date: "",
          url: "",
        },
      ],
    })
  }

  const removeCertification = (id: string) => {
    if (resumeData.certifications.length > 1) {
      setResumeData({
        ...resumeData,
        certifications: resumeData.certifications.filter((cert) => cert.id !== id),
      })
    }
  }

  const nextStep = () => {
    setStep(step + 1)
    setPreviewMode(false)
  }

  const prevStep = () => {
    setStep(step - 1)
    setPreviewMode(false)
  }

  const togglePreview = () => {
    setPreviewMode(!previewMode)
  }

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    // Remove the # if present
    hex = hex.replace(/^#/, "")

    // Parse the hex values
    const bigint = Number.parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return { r, g, b }
  }

  // Update the generatePDF function to apply different styles based on template
  const generatePDF = () => {
    const doc = new jsPDF()
    const margin = 20
    let y = margin

    // Get the selected template
    const template = templates.find((t) => t.id === selectedTemplate) || templates[0]

    // Apply different layouts based on template type
    if (template.layout === "sidebar") {
      // Set up the document with template styles
      doc.setFont(template.fontFamily, "bold")
      doc.setFontSize(22)

      // Create sidebar
      doc.setFillColor(
        hexToRgb(template.primaryColor).r,
        hexToRgb(template.primaryColor).g,
        hexToRgb(template.primaryColor).b,
      )
      doc.rect(0, 0, 60, 297, "F")

      // Add header with name in sidebar
      doc.setTextColor(255, 255, 255)
      doc.text(resumeData.personalInfo.name.toUpperCase() || "YOUR NAME", 10, y)
      y += 10

      // Contact info in sidebar
      doc.setFont(template.fontFamily, "normal")
      doc.setFontSize(9)
      doc.setTextColor(255, 255, 255)

      doc.text("CONTACT", 10, y)
      y += 5

      if (resumeData.personalInfo.email) {
        doc.text(resumeData.personalInfo.email, 10, y)
        y += 4
      }
      if (resumeData.personalInfo.phone) {
        doc.text(resumeData.personalInfo.phone, 10, y)
        y += 4
      }
      if (resumeData.personalInfo.address) {
        const addressLines = doc.splitTextToSize(resumeData.personalInfo.address, 45)
        doc.text(addressLines, 10, y)
        y += addressLines.length * 4 + 2
      }
      if (resumeData.personalInfo.linkedin) {
        doc.text(resumeData.personalInfo.linkedin, 10, y)
        y += 4
      }
      if (resumeData.personalInfo.website) {
        doc.text(resumeData.personalInfo.website, 10, y)
        y += 4
      }

      // Skills in sidebar
      if (resumeData.skills.length > 0 && resumeData.skills.some((skill) => skill.trim() !== "")) {
        y += 5
        doc.text("SKILLS", 10, y)
        y += 5

        const filteredSkills = resumeData.skills.filter((skill) => skill.trim() !== "")
        filteredSkills.forEach((skill) => {
          doc.text("• " + skill, 10, y)
          y += 4
        })
      }

      // Education in sidebar
      if (resumeData.education.length > 0 && resumeData.education.some((edu) => edu.institution)) {
        y += 5
        doc.text("EDUCATION", 10, y)
        y += 5

        resumeData.education.forEach((edu) => {
          if (!edu.institution) return

          doc.setFont(template.fontFamily, "bold")
          doc.text(edu.institution, 10, y)
          y += 4

          doc.setFont(template.fontFamily, "normal")
          if (edu.degree) {
            const degreeLines = doc.splitTextToSize(edu.degree, 45)
            doc.text(degreeLines, 10, y)
            y += degreeLines.length * 4
          }

          if (edu.year) {
            doc.text(edu.year, 10, y)
            y += 6
          }
        })
      }

      // Main content area
      y = margin

      // Summary
      if (resumeData.personalInfo.summary) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("PROFILE", 70, y)
        y += 6

        doc.setFont(template.fontFamily, "normal")
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)

        const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, 130)
        doc.text(summaryLines, 70, y)
        y += summaryLines.length * 5 + 8
      }

      // Experience
      if (resumeData.experience.length > 0 && resumeData.experience.some((exp) => exp.company)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("EXPERIENCE", 70, y)
        y += 6

        resumeData.experience.forEach((exp) => {
          if (!exp.company) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(exp.position || "Position", 70, y)
          y += 5

          doc.setFont(template.fontFamily, "italic")
          doc.setFontSize(10)
          doc.text(`${exp.company}${exp.duration ? ` | ${exp.duration}` : ""}`, 70, y)
          y += 5

          if (exp.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(10)
            const descLines = doc.splitTextToSize(exp.description, 130)
            doc.text(descLines, 70, y)
            y += descLines.length * 5 + 5
          } else {
            y += 5
          }
        })
      }

      // Projects section
      if (resumeData.projects.length > 0 && resumeData.projects.some((proj) => proj.title)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("PROJECTS", 70, y)
        y += 6

        resumeData.projects.forEach((proj) => {
          if (!proj.title) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(proj.title, 70, y)
          y += 5

          if (proj.technologies) {
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(10)
            doc.text(`Technologies: ${proj.technologies}`, 70, y)
            y += 5
          }

          if (proj.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(10)
            const descLines = doc.splitTextToSize(proj.description, 130)
            doc.text(descLines, 70, y)
            y += descLines.length * 5
          }

          if (proj.link) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(9)
            doc.setTextColor(0, 0, 255)
            doc.text(proj.link, 70, y)
            doc.setTextColor(0, 0, 0)
            y += 5
          }

          y += 3
        })
      }

      // Achievements section
      if (resumeData.achievements.length > 0 && resumeData.achievements.some((ach) => ach.title)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("ACHIEVEMENTS", 70, y)
        y += 6

        resumeData.achievements.forEach((ach) => {
          if (!ach.title) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(ach.title, 70, y)
          y += 5

          if (ach.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(10)
            const descLines = doc.splitTextToSize(ach.description, 130)
            doc.text(descLines, 70, y)
            y += descLines.length * 5 + 3
          } else {
            y += 3
          }
        })
      }

      // Certifications section
      if (resumeData.certifications.length > 0 && resumeData.certifications.some((cert) => cert.name)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("CERTIFICATIONS", 70, y)
        y += 6

        resumeData.certifications.forEach((cert) => {
          if (!cert.name) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(11)
          doc.setTextColor(0, 0, 0)
          doc.text(cert.name, 70, y)
          y += 4

          doc.setFont(template.fontFamily, "normal")
          doc.setFontSize(10)
          if (cert.issuer) {
            doc.text(`Issued by: ${cert.issuer}${cert.date ? ` (${cert.date})` : ""}`, 70, y)
            y += 4
          } else if (cert.date) {
            doc.text(`Date: ${cert.date}`, 70, y)
            y += 4
          }

          if (cert.url) {
            doc.setTextColor(0, 0, 255)
            doc.text(cert.url, 70, y)
            doc.setTextColor(0, 0, 0)
            y += 5
          }

          y += 2
        })
      }
    } else if (template.layout === "timeline") {
      // Set up the document with template styles
      doc.setFont(template.fontFamily, "bold")
      doc.setFontSize(22)
      doc.setTextColor(
        hexToRgb(template.primaryColor).r,
        hexToRgb(template.primaryColor).g,
        hexToRgb(template.primaryColor).b,
      )

      // Add header with name centered
      const nameWidth =
        (doc.getStringUnitWidth(resumeData.personalInfo.name.toUpperCase() || "YOUR NAME") * 22) /
        doc.internal.scaleFactor
      doc.text(resumeData.personalInfo.name.toUpperCase() || "YOUR NAME", (210 - nameWidth) / 2, y)
      y += 8

      // Contact info centered
      doc.setFont(template.fontFamily, "normal")
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)

      const contactInfo = []
      if (resumeData.personalInfo.email) contactInfo.push(resumeData.personalInfo.email)
      if (resumeData.personalInfo.phone) contactInfo.push(resumeData.personalInfo.phone)
      if (resumeData.personalInfo.linkedin) contactInfo.push(resumeData.personalInfo.linkedin)
      if (resumeData.personalInfo.website) contactInfo.push(resumeData.personalInfo.website)

      if (contactInfo.length > 0) {
        const contactText = contactInfo.join(" • ")
        const contactWidth = (doc.getStringUnitWidth(contactText) * 10) / doc.internal.scaleFactor
        doc.text(contactText, (210 - contactWidth) / 2, y)
        y += 5
      }

      // Decorative line
      doc.setDrawColor(
        hexToRgb(template.primaryColor).r,
        hexToRgb(template.primaryColor).g,
        hexToRgb(template.primaryColor).b,
      )
      doc.setLineWidth(1)
      doc.line(margin, y, 190, y)
      y += 8

      // Summary
      if (resumeData.personalInfo.summary) {
        doc.setFillColor(245, 245, 245)
        doc.roundedRect(margin, y, 170, 15, 2, 2, "F")

        doc.setFont(template.fontFamily, "italic")
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)

        const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, 160)
        doc.text(summaryLines, margin + 5, y + 5)
        y += summaryLines.length * 5 + 10
      }

      // Skills with decorative boxes
      if (resumeData.skills.length > 0 && resumeData.skills.some((skill) => skill.trim() !== "")) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("✦ SKILLS", margin, y)
        y += 6

        doc.setFont(template.fontFamily, "normal")
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)

        const filteredSkills = resumeData.skills.filter((skill) => skill.trim() !== "")
        let xPos = margin

        filteredSkills.forEach((skill) => {
          const skillWidth = (doc.getStringUnitWidth(skill) * 10) / doc.internal.scaleFactor + 10

          if (xPos + skillWidth > 190) {
            xPos = margin
            y += 8
          }

          // Draw box around skill
          doc.setDrawColor(
            hexToRgb(template.primaryColor).r,
            hexToRgb(template.primaryColor).g,
            hexToRgb(template.primaryColor).b,
          )
          doc.setLineWidth(0.5)
          doc.roundedRect(xPos, y - 4, skillWidth, 6, 1, 1, "S")

          doc.text(skill, xPos + 5, y)
          xPos += skillWidth + 5
        })

        y += 12
      }

      // Experience with timeline
      if (resumeData.experience.length > 0 && resumeData.experience.some((exp) => exp.company)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("✦ EXPERIENCE", margin, y)
        y += 6

        // Draw timeline line
        const timelineX = margin + 5
        const startY = y
        let endY = y

        resumeData.experience.forEach((exp) => {
          if (!exp.company) return

          // Draw timeline dot
          doc.setFillColor(
            hexToRgb(template.primaryColor).r,
            hexToRgb(template.primaryColor).g,
            hexToRgb(template.primaryColor).b,
          )
          doc.circle(timelineX, y + 2, 2, "F")

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(exp.position || "Position", timelineX + 10, y)

          // Duration right-aligned
          if (exp.duration) {
            const durationWidth = (doc.getStringUnitWidth(exp.duration) * 10) / doc.internal.scaleFactor
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(10)
            doc.text(exp.duration, 190 - durationWidth, y)
          }
          y += 5

          doc.setFont(template.fontFamily, "normal")
          doc.text(exp.company, timelineX + 10, y)
          y += 5

          if (exp.description) {
            const descLines = doc.splitTextToSize(exp.description, 150)
            doc.text(descLines, timelineX + 10, y)
            y += descLines.length * 5 + 5
          } else {
            y += 5
          }

          endY = y
        })

        // Draw the timeline line after calculating all positions
        doc.setDrawColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.setLineWidth(0.5)
        doc.line(timelineX, startY - 3, timelineX, endY - 8)
        y += 5
      }

      // Education with timeline
      if (resumeData.education.length > 0 && resumeData.education.some((edu) => edu.institution)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("✦ EDUCATION", margin, y)
        y += 6

        // Draw timeline line
        const timelineX = margin + 5
        const startY = y
        let endY = y

        resumeData.education.forEach((edu) => {
          if (!edu.institution) return

          // Draw timeline dot
          doc.setFillColor(
            hexToRgb(template.primaryColor).r,
            hexToRgb(template.primaryColor).g,
            hexToRgb(template.primaryColor).b,
          )
          doc.circle(timelineX, y + 2, 2, "F")

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(edu.institution, timelineX + 10, y)

          // Year right-aligned
          if (edu.year) {
            const yearWidth = (doc.getStringUnitWidth(edu.year) * 10) / doc.internal.scaleFactor
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(10)
            doc.text(edu.year, 190 - yearWidth, y)
          }
          y += 5

          if (edu.degree) {
            doc.setFont(template.fontFamily, "normal")
            const degreeLines = doc.splitTextToSize(edu.degree, 150)
            doc.text(degreeLines, timelineX + 10, y)
            y += degreeLines.length * 5 + 5
          } else {
            y += 5
          }

          endY = y
        })

        // Draw the timeline line
        doc.setDrawColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.setLineWidth(0.5)
        doc.line(timelineX, startY - 3, timelineX, endY - 8)
        y += 5
      }

      // Projects section with timeline
      if (resumeData.projects.length > 0 && resumeData.projects.some((proj) => proj.title)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("✦ PROJECTS", margin, y)
        y += 6

        // Draw timeline line
        const timelineX = margin + 5
        const startY = y
        let endY = y

        resumeData.projects.forEach((proj) => {
          if (!proj.title) return

          // Draw timeline dot
          doc.setFillColor(
            hexToRgb(template.primaryColor).r,
            hexToRgb(template.primaryColor).g,
            hexToRgb(template.primaryColor).b,
          )
          doc.circle(timelineX, y + 2, 2, "F")

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(proj.title, timelineX + 10, y)
          y += 5

          if (proj.technologies) {
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(10)
            doc.text(`Technologies: ${proj.technologies}`, timelineX + 10, y)
            y += 5
          }

          if (proj.description) {
            doc.setFont(template.fontFamily, "normal")
            const descLines = doc.splitTextToSize(proj.description, 150)
            doc.text(descLines, timelineX + 10, y)
            y += descLines.length * 5 + 3
          } else {
            y += 3
          }

          endY = y
        })

        // Draw the timeline line
        doc.setDrawColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.setLineWidth(0.5)
        doc.line(timelineX, startY - 3, timelineX, endY - 8)
      }
    } else if (template.layout === "columns") {
      // Set up the document with template styles
      doc.setFont(template.fontFamily, "bold")
      doc.setFontSize(18)

      // Create header
      doc.setFillColor(
        hexToRgb(template.primaryColor).r,
        hexToRgb(template.primaryColor).g,
        hexToRgb(template.primaryColor).b,
      )
      doc.rect(0, 0, 210, 20, "F")

      // Add name to header
      doc.setTextColor(255, 255, 255)
      doc.text(resumeData.personalInfo.name.toUpperCase() || "YOUR NAME", margin, 12)

      // Position for content
      y = 25

      // Left column (1/3 width)
      const leftColumnX = margin
      const leftColumnWidth = 50
      const rightColumnX = margin + leftColumnWidth + 5
      const rightColumnWidth = 125

      // Left column background
      doc.setFillColor(245, 245, 245)
      doc.rect(0, 20, leftColumnWidth + margin, 277, "F")

      // Contact section
      doc.setFont(template.fontFamily, "bold")
      doc.setFontSize(10)
      doc.setTextColor(
        hexToRgb(template.primaryColor).r,
        hexToRgb(template.primaryColor).g,
        hexToRgb(template.primaryColor).b,
      )

      doc.setFillColor(
        hexToRgb(template.secondaryColor).r,
        hexToRgb(template.secondaryColor).g,
        hexToRgb(template.secondaryColor).b,
      )
      doc.rect(leftColumnX, y, leftColumnWidth, 5, "F")
      doc.text("CONTACT", leftColumnX, y + 3.5)
      y += 8

      doc.setFont(template.fontFamily, "normal")
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)

      if (resumeData.personalInfo.email) {
        doc.text(resumeData.personalInfo.email, leftColumnX, y)
        y += 4
      }
      if (resumeData.personalInfo.phone) {
        doc.text(resumeData.personalInfo.phone, leftColumnX, y)
        y += 4
      }
      if (resumeData.personalInfo.address) {
        const addressLines = doc.splitTextToSize(resumeData.personalInfo.address, leftColumnWidth)
        doc.text(addressLines, leftColumnX, y)
        y += addressLines.length * 4 + 2
      }
      if (resumeData.personalInfo.linkedin) {
        doc.text(resumeData.personalInfo.linkedin, leftColumnX, y)
        y += 4
      }
      if (resumeData.personalInfo.website) {
        doc.text(resumeData.personalInfo.website, leftColumnX, y)
        y += 4
      }

      // Skills section
      if (resumeData.skills.length > 0 && resumeData.skills.some((skill) => skill.trim() !== "")) {
        y += 5
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )

        doc.setFillColor(
          hexToRgb(template.secondaryColor).r,
          hexToRgb(template.secondaryColor).g,
          hexToRgb(template.secondaryColor).b,
        )
        doc.rect(leftColumnX, y, leftColumnWidth, 5, "F")
        doc.text("SKILLS", leftColumnX, y + 3.5)
        y += 8

        doc.setFont(template.fontFamily, "normal")
        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)

        const filteredSkills = resumeData.skills.filter((skill) => skill.trim() !== "")
        filteredSkills.forEach((skill) => {
          doc.text(skill, leftColumnX, y)
          y += 4
        })
      }

      // Education section
      if (resumeData.education.length > 0 && resumeData.education.some((edu) => edu.institution)) {
        y += 5
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )

        doc.setFillColor(
          hexToRgb(template.secondaryColor).r,
          hexToRgb(template.secondaryColor).g,
          hexToRgb(template.secondaryColor).b,
        )
        doc.rect(leftColumnX, y, leftColumnWidth, 5, "F")
        doc.text("EDUCATION", leftColumnX, y + 3.5)
        y += 8

        doc.setFont(template.fontFamily, "normal")
        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)

        resumeData.education.forEach((edu) => {
          if (!edu.institution) return

          doc.setFont(template.fontFamily, "bold")
          doc.text(edu.institution, leftColumnX, y)
          y += 4

          doc.setFont(template.fontFamily, "normal")
          if (edu.degree) {
            const degreeLines = doc.splitTextToSize(edu.degree, leftColumnWidth)
            doc.text(degreeLines, leftColumnX, y)
            y += degreeLines.length * 4
          }

          if (edu.year) {
            doc.text(edu.year, leftColumnX, y)
            y += 6
          } else {
            y += 2
          }
        })
      }

      // Right column content
      y = 25

      // Summary
      if (resumeData.personalInfo.summary) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )

        doc.setFillColor(
          hexToRgb(template.secondaryColor).r,
          hexToRgb(template.secondaryColor).g,
          hexToRgb(template.secondaryColor).b,
        )
        doc.rect(rightColumnX, y, rightColumnWidth, 5, "F")
        doc.text("PROFESSIONAL SUMMARY", rightColumnX, y + 3.5)
        y += 8

        doc.setFont(template.fontFamily, "normal")
        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)

        const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, rightColumnWidth)
        doc.text(summaryLines, rightColumnX, y)
        y += summaryLines.length * 4 + 8
      }

      // Experience
      if (resumeData.experience.length > 0 && resumeData.experience.some((exp) => exp.company)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )

        doc.setFillColor(
          hexToRgb(template.secondaryColor).r,
          hexToRgb(template.secondaryColor).g,
          hexToRgb(template.secondaryColor).b,
        )
        doc.rect(rightColumnX, y, rightColumnWidth, 5, "F")
        doc.text("PROFESSIONAL EXPERIENCE", rightColumnX, y + 3.5)
        y += 8

        resumeData.experience.forEach((exp) => {
          if (!exp.company) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)
          doc.text(exp.position || "Position", rightColumnX, y)

          // Duration right-aligned
          if (exp.duration) {
            const durationWidth = (doc.getStringUnitWidth(exp.duration) * 10) / doc.internal.scaleFactor
            doc.setFont(template.fontFamily, "italic")
            doc.text(exp.duration, rightColumnX + rightColumnWidth - durationWidth, y)
          }
          y += 4

          doc.setFont(template.fontFamily, "italic")
          doc.text(exp.company, rightColumnX, y)
          y += 4

          if (exp.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(9)
            const descLines = doc.splitTextToSize(exp.description, rightColumnWidth)
            doc.text(descLines, rightColumnX, y)
            y += descLines.length * 4 + 4
          } else {
            y += 4
          }
        })
      }

      // Projects section
      if (resumeData.projects.length > 0 && resumeData.projects.some((proj) => proj.title)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )

        doc.setFillColor(
          hexToRgb(template.secondaryColor).r,
          hexToRgb(template.secondaryColor).g,
          hexToRgb(template.secondaryColor).b,
        )
        doc.rect(rightColumnX, y, rightColumnWidth, 5, "F")
        doc.text("PROJECTS", rightColumnX, y + 3.5)
        y += 8

        resumeData.projects.forEach((proj) => {
          if (!proj.title) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)
          doc.text(proj.title, rightColumnX, y)
          y += 4

          if (proj.technologies) {
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(9)
            doc.text(`Technologies: ${proj.technologies}`, rightColumnX, y)
            y += 4
          }

          if (proj.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(9)
            const descLines = doc.splitTextToSize(proj.description, rightColumnWidth)
            doc.text(descLines, rightColumnX, y)
            y += descLines.length * 4 + 2
          }

          if (proj.link) {
            doc.setTextColor(0, 0, 255)
            doc.text(proj.link, rightColumnX, y)
            doc.setTextColor(0, 0, 0)
            y += 4
          }

          y += 2
        })
      }

      // Achievements section
      if (resumeData.achievements.length > 0 && resumeData.achievements.some((ach) => ach.title)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )

        doc.setFillColor(
          hexToRgb(template.secondaryColor).r,
          hexToRgb(template.secondaryColor).g,
          hexToRgb(template.secondaryColor).b,
        )
        doc.rect(rightColumnX, y, rightColumnWidth, 5, "F")
        doc.text("ACHIEVEMENTS", rightColumnX, y + 3.5)
        y += 8

        resumeData.achievements.forEach((ach) => {
          if (!ach.title) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)
          doc.text(ach.title, rightColumnX, y)
          y += 4

          if (ach.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(9)
            const descLines = doc.splitTextToSize(ach.description, rightColumnWidth)
            doc.text(descLines, rightColumnX, y)
            y += descLines.length * 4 + 2
          }

          y += 2
        })
      }

      // Certifications section
      if (resumeData.certifications.length > 0 && resumeData.certifications.some((cert) => cert.name)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )

        doc.setFillColor(
          hexToRgb(template.secondaryColor).r,
          hexToRgb(template.secondaryColor).g,
          hexToRgb(template.secondaryColor).b,
        )
        doc.rect(rightColumnX, y, rightColumnWidth, 5, "F")
        doc.text("CERTIFICATIONS", rightColumnX, y + 3.5)
        y += 8

        resumeData.certifications.forEach((cert) => {
          if (!cert.name) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)
          doc.text(cert.name, rightColumnX, y)
          y += 4

          doc.setFont(template.fontFamily, "normal")
          doc.setFontSize(9)
          if (cert.issuer) {
            doc.text(`Issued by: ${cert.issuer}${cert.date ? ` (${cert.date})` : ""}`, rightColumnX, y)
            y += 4
          } else if (cert.date) {
            doc.text(`Date: ${cert.date}`, rightColumnX, y)
            y += 4
          }

          if (cert.url) {
            doc.setTextColor(0, 0, 255)
            doc.text(cert.url, rightColumnX, y)
            doc.setTextColor(0, 0, 0)
            y += 4
          }

          y += 2
        })
      }
    } else if (template.layout === "compact") {
      // Set up the document with template styles
      doc.setFont(template.fontFamily, "bold")
      doc.setFontSize(18)
      doc.setTextColor(
        hexToRgb(template.primaryColor).r,
        hexToRgb(template.primaryColor).g,
        hexToRgb(template.primaryColor).b,
      )

      // Add header with name
      doc.text(resumeData.personalInfo.name.toUpperCase() || "YOUR NAME", margin, y)
      y += 6

      // Contact info in a single line
      doc.setFont(template.fontFamily, "normal")
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)

      const contactInfo = []
      if (resumeData.personalInfo.email) contactInfo.push(resumeData.personalInfo.email)
      if (resumeData.personalInfo.phone) contactInfo.push(resumeData.personalInfo.phone)
      if (resumeData.personalInfo.linkedin) contactInfo.push(resumeData.personalInfo.linkedin)
      if (resumeData.personalInfo.website) contactInfo.push(resumeData.personalInfo.website)

      if (contactInfo.length > 0) {
        doc.text(contactInfo.join(" | "), margin, y)
        y += 8
      }

      // Summary
      if (resumeData.personalInfo.summary) {
        const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, 170)
        doc.text(summaryLines, margin, y)
        y += summaryLines.length * 4 + 6
      }

      // Thin divider
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.1)
      doc.line(margin, y - 3, 190, y - 3)

      // Experience
      if (resumeData.experience.length > 0 && resumeData.experience.some((exp) => exp.company)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("EXPERIENCE", margin, y)
        y += 5

        doc.setTextColor(0, 0, 0)

        resumeData.experience.forEach((exp) => {
          if (!exp.company) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(10)
          doc.text(`${exp.position || "Position"} @ ${exp.company}`, margin, y)

          // Duration right-aligned
          if (exp.duration) {
            const durationWidth = (doc.getStringUnitWidth(exp.duration) * 9) / doc.internal.scaleFactor
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(9)
            doc.text(exp.duration, 190 - durationWidth, y)
          }
          y += 4

          if (exp.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(9)
            const descLines = doc.splitTextToSize(exp.description, 170)
            doc.text(descLines, margin, y)
            y += descLines.length * 4 + 2
          }

          y += 3
        })
      }

      // Thin divider
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.1)
      doc.line(margin, y - 1, 190, y - 1)
      y += 3

      // Education
      if (resumeData.education.length > 0 && resumeData.education.some((edu) => edu.institution)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("EDUCATION", margin, y)
        y += 5

        doc.setTextColor(0, 0, 0)

        resumeData.education.forEach((edu) => {
          if (!edu.institution) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(10)
          doc.text(edu.institution, margin, y)

          // Year right-aligned
          if (edu.year) {
            const yearWidth = (doc.getStringUnitWidth(edu.year) * 9) / doc.internal.scaleFactor
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(9)
            doc.text(edu.year, 190 - yearWidth, y)
          }
          y += 4

          if (edu.degree) {
            doc.text(edu.degree, margin, y)
            y += 6
          } else {
            y += 2
          }
        })
      }

      // Thin divider
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.1)
      doc.line(margin, y - 1, 190, y - 1)
      y += 3

      // Skills
      if (resumeData.skills.length > 0 && resumeData.skills.some((skill) => skill.trim() !== "")) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("SKILLS", margin, y)
        y += 5

        doc.setFont(template.fontFamily, "normal")
        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)

        const filteredSkills = resumeData.skills.filter((skill) => skill.trim() !== "")
        const skillsText = filteredSkills.join(" • ")
        const skillsLines = doc.splitTextToSize(skillsText, 170)
        doc.text(skillsLines, margin, y)
        y += skillsLines.length * 4 + 3
      }

      // Projects
      if (resumeData.projects.length > 0 && resumeData.projects.some((proj) => proj.title)) {
        // Thin divider
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.1)
        doc.line(margin, y - 1, 190, y - 1)
        y += 3

        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("PROJECTS", margin, y)
        y += 5

        doc.setTextColor(0, 0, 0)

        resumeData.projects.forEach((proj) => {
          if (!proj.title) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(10)
          doc.text(proj.title, margin, y)
          y += 4

          if (proj.technologies) {
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(9)
            doc.text(`Technologies: ${proj.technologies}`, margin, y)
            y += 4
          }

          if (proj.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(9)
            const descLines = doc.splitTextToSize(proj.description, 170)
            doc.text(descLines, margin, y)
            y += descLines.length * 4 + 2
          }

          y += 2
        })
      }

      // Achievements
      if (resumeData.achievements.length > 0 && resumeData.achievements.some((ach) => ach.title)) {
        // Thin divider
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.1)
        doc.line(margin, y - 1, 190, y - 1)
        y += 3

        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(10)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("ACHIEVEMENTS", margin, y)
        y += 5

        doc.setTextColor(0, 0, 0)

        resumeData.achievements.forEach((ach) => {
          if (!ach.title) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(10)
          doc.text(ach.title, margin, y)
          y += 4

          if (ach.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(9)
            const descLines = doc.splitTextToSize(ach.description, 170)
            doc.text(descLines, margin, y)
            y += descLines.length * 4 + 2
          }

          y += 2
        })
      }
    } else {
      // Default standard layout
      // Set up the document with template styles
      doc.setFont(template.fontFamily, "bold")
      doc.setFontSize(22)
      doc.setTextColor(
        hexToRgb(template.primaryColor).r,
        hexToRgb(template.primaryColor).g,
        hexToRgb(template.primaryColor).b,
      )

      // Add header with name
      doc.text(resumeData.personalInfo.name.toUpperCase() || "YOUR NAME", margin, y)
      y += 10

      // Add contact information
      doc.setFont(template.fontFamily, "normal")
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)

      let contactY = y
      if (resumeData.personalInfo.email) {
        doc.text(`Email: ${resumeData.personalInfo.email}`, margin, contactY)
        contactY += 6
      }
      if (resumeData.personalInfo.phone) {
        doc.text(`Phone: ${resumeData.personalInfo.phone}`, margin, contactY)
        contactY += 6
      }
      if (resumeData.personalInfo.address) {
        doc.text(`Address: ${resumeData.personalInfo.address}`, margin, contactY)
        contactY += 6
      }
      if (resumeData.personalInfo.linkedin) {
        doc.text(`LinkedIn: ${resumeData.personalInfo.linkedin}`, margin, contactY)
        contactY += 6
      }
      if (resumeData.personalInfo.website) {
        doc.text(`Website: ${resumeData.personalInfo.website}`, margin, contactY)
        contactY += 6
      }

      y = contactY + 4

      // Create a horizontal line
      doc.setDrawColor(
        hexToRgb(template.primaryColor).r,
        hexToRgb(template.primaryColor).g,
        hexToRgb(template.primaryColor).b,
      )
      doc.setLineWidth(0.5)
      doc.line(margin, y, 190, y)
      y += 8

      // Summary
      if (resumeData.personalInfo.summary) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("PROFESSIONAL SUMMARY", margin, y)
        y += 6
        doc.setFont(template.fontFamily, "normal")
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)

        const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, 170)
        doc.text(summaryLines, margin, y)
        y += summaryLines.length * 5 + 8

        // Add a section divider
        doc.setDrawColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.setLineWidth(0.5)
        doc.line(margin, y, 190, y)
        y += 8
      }

      // Experience
      if (resumeData.experience.length > 0 && resumeData.experience.some((exp) => exp.company)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("PROFESSIONAL EXPERIENCE", margin, y)
        y += 6

        resumeData.experience.forEach((exp) => {
          if (!exp.company) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(`${exp.position || "Position"}`, margin, y)

          // Company and duration on the same line, right-aligned
          if (exp.duration) {
            const companyText = `${exp.company} | ${exp.duration}`
            const companyTextWidth = (doc.getStringUnitWidth(companyText) * 12) / doc.internal.scaleFactor
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(10)
            doc.text(companyText, 190 - companyTextWidth, y)
          } else {
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(10)
            doc.text(exp.company, 190 - (doc.getStringUnitWidth(exp.company) * 10) / doc.internal.scaleFactor, y)
          }

          y += 5

          if (exp.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(10)
            const descLines = doc.splitTextToSize(exp.description, 170)
            doc.text(descLines, margin, y)
            y += descLines.length * 5 + 3
          }

          y += 3
        })

        y += 5
        // Add a section divider
        doc.setDrawColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.setLineWidth(0.5)
        doc.line(margin, y, 190, y)
        y += 8
      }

      // Education
      if (resumeData.education.length > 0 && resumeData.education.some((edu) => edu.institution)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("EDUCATION", margin, y)
        y += 6

        resumeData.education.forEach((edu) => {
          if (!edu.institution) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(edu.institution, margin, y)

          if (edu.year) {
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(10)
            doc.text(edu.year, 190 - (doc.getStringUnitWidth(edu.year) * 10) / doc.internal.scaleFactor, y)
          }
          y += 5

          if (edu.degree) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(10)
            doc.text(edu.degree, margin, y)
            y += 5
          }

          y += 3
        })

        y += 5
        // Add a section divider
        doc.setDrawColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.setLineWidth(0.5)
        doc.line(margin, y, 190, y)
        y += 8
      }

      // Skills
      if (resumeData.skills.length > 0 && resumeData.skills.some((skill) => skill.trim() !== "")) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("SKILLS", margin, y)
        y += 6

        doc.setFont(template.fontFamily, "normal")
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)

        const filteredSkills = resumeData.skills.filter((skill) => skill.trim() !== "")
        const skillsText = filteredSkills.join(" • ")
        const skillsLines = doc.splitTextToSize(skillsText, 170)
        doc.text(skillsLines, margin, y)
        y += skillsLines.length * 5 + 8

        // Add a section divider
        doc.setDrawColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.setLineWidth(0.5)
        doc.line(margin, y, 190, y)
        y += 8
      }

      // Projects
      if (resumeData.projects.length > 0 && resumeData.projects.some((proj) => proj.title)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("PROJECTS", margin, y)
        y += 6

        resumeData.projects.forEach((proj) => {
          if (!proj.title) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(proj.title, margin, y)
          y += 5

          if (proj.technologies) {
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(10)
            doc.text(`Technologies: ${proj.technologies}`, margin, y)
            y += 5
          }

          if (proj.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(10)
            const descLines = doc.splitTextToSize(proj.description, 170)
            doc.text(descLines, margin, y)
            y += descLines.length * 5
          }

          if (proj.link) {
            doc.setTextColor(0, 0, 255)
            doc.text(proj.link, margin, y)
            doc.setTextColor(0, 0, 0)
            y += 5
          }

          y += 3
        })

        y += 5
        // Add a section divider
        doc.setDrawColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.setLineWidth(0.5)
        doc.line(margin, y, 190, y)
        y += 8
      }

      // Achievements
      if (resumeData.achievements.length > 0 && resumeData.achievements.some((ach) => ach.title)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("ACHIEVEMENTS", margin, y)
        y += 6

        resumeData.achievements.forEach((ach) => {
          if (!ach.title) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(ach.title, margin, y)
          y += 5

          if (ach.description) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(10)
            const descLines = doc.splitTextToSize(ach.description, 170)
            doc.text(descLines, margin, y)
            y += descLines.length * 5 + 3
          } else {
            y += 3
          }
        })

        y += 5
        // Add a section divider
        doc.setDrawColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.setLineWidth(0.5)
        doc.line(margin, y, 190, y)
        y += 8
      }

      // Certifications
      if (resumeData.certifications.length > 0 && resumeData.certifications.some((cert) => cert.name)) {
        doc.setFont(template.fontFamily, "bold")
        doc.setFontSize(14)
        doc.setTextColor(
          hexToRgb(template.primaryColor).r,
          hexToRgb(template.primaryColor).g,
          hexToRgb(template.primaryColor).b,
        )
        doc.text("CERTIFICATIONS", margin, y)
        y += 6

        resumeData.certifications.forEach((cert) => {
          if (!cert.name) return

          doc.setFont(template.fontFamily, "bold")
          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(cert.name, margin, y)

          if (cert.date) {
            doc.setFont(template.fontFamily, "italic")
            doc.setFontSize(10)
            doc.text(cert.date, 190 - (doc.getStringUnitWidth(cert.date) * 10) / doc.internal.scaleFactor, y)
          }
          y += 5

          if (cert.issuer) {
            doc.setFont(template.fontFamily, "normal")
            doc.setFontSize(10)
            doc.text(`Issued by: ${cert.issuer}`, margin, y)
            y += 5
          }

          if (cert.url) {
            doc.setTextColor(0, 0, 255)
            doc.text(cert.url, margin, y)
            doc.setTextColor(0, 0, 0)
            y += 5
          }

          y += 3
        })
      }
    }

    // Save the PDF
    doc.save(`${resumeData.personalInfo.name.replace(/\s+/g, "_") || "resume"}_resume.pdf`)
  }

  // Update the renderResumePreview function to apply different styles based on template
  const renderResumePreview = () => {
    const template = templates.find((t) => t.id === selectedTemplate) || templates[0]

    // Apply different layouts based on template type
    if (template.layout === "sidebar") {
      return (
        <div className="border rounded-md overflow-hidden" style={{ backgroundColor: "white" }}>
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 p-6" style={{ backgroundColor: template.primaryColor, color: "white" }}>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{resumeData.personalInfo.name || "Your Name"}</h3>
                <p className="text-white opacity-90">
                  {resumeData.personalInfo.position || resumeData.experience[0]?.position || "Your Position"}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="uppercase text-sm tracking-wider mb-3 border-b border-white pb-1">Contact</h4>
                <div className="space-y-2 text-sm">
                  {resumeData.personalInfo.email && <p>{resumeData.personalInfo.email}</p>}
                  {resumeData.personalInfo.phone && <p>{resumeData.personalInfo.phone}</p>}
                  {resumeData.personalInfo.address && <p>{resumeData.personalInfo.address}</p>}
                  {resumeData.personalInfo.linkedin && <p>{resumeData.personalInfo.linkedin}</p>}
                  {resumeData.personalInfo.website && <p>{resumeData.personalInfo.website}</p>}
                </div>
              </div>

              {resumeData.skills.length > 0 && resumeData.skills.some((skill) => skill.trim() !== "") && (
                <div className="mb-6">
                  <h4 className="uppercase text-sm tracking-wider mb-3 border-b border-white pb-1">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills
                      .filter((skill) => skill.trim() !== "")
                      .map((skill, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded-full">
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {resumeData.education.length > 0 && resumeData.education.some((edu) => edu.institution) && (
                <div>
                  <h4 className="uppercase text-sm tracking-wider mb-3 border-b border-white pb-1">Education</h4>
                  {resumeData.education.map(
                    (edu) =>
                      edu.institution && (
                        <div key={edu.id} className="mb-3 text-sm">
                          <p className="font-medium">{edu.institution}</p>
                          <p>{edu.degree}</p>
                          <p className="text-xs opacity-80">{edu.year}</p>
                        </div>
                      ),
                  )}
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3 p-6">
              {resumeData.personalInfo.summary && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold mb-2" style={{ color: template.primaryColor }}>
                    PROFILE
                  </h4>
                  <p className="text-sm">{resumeData.personalInfo.summary}</p>
                </div>
              )}

              {resumeData.experience.length > 0 && resumeData.experience.some((exp) => exp.company) && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold mb-3" style={{ color: template.primaryColor }}>
                    EXPERIENCE
                  </h4>
                  {resumeData.experience.map(
                    (exp) =>
                      exp.company && (
                        <div key={exp.id} className="mb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold">{exp.position || "Position"}</p>
                              <p className="text-sm">{exp.company}</p>
                            </div>
                            <p className="text-xs bg-gray-100 px-2 py-1 rounded">{exp.duration}</p>
                          </div>
                          <p className="text-sm mt-1">{exp.description}</p>
                        </div>
                      ),
                  )}
                </div>
              )}

              {resumeData.projects.length > 0 && resumeData.projects.some((proj) => proj.title) && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold mb-3" style={{ color: template.primaryColor }}>
                    PROJECTS
                  </h4>
                  {resumeData.projects.map(
                    (proj) =>
                      proj.title && (
                        <div key={proj.id} className="mb-3">
                          <p className="font-bold">{proj.title}</p>
                          {proj.technologies && <p className="text-xs italic">Technologies: {proj.technologies}</p>}
                          <p className="text-sm">{proj.description}</p>
                          {proj.link && (
                            <a href={proj.link} className="text-xs text-blue-500 hover:underline">
                              {proj.link}
                            </a>
                          )}
                        </div>
                      ),
                  )}
                </div>
              )}

              {resumeData.achievements.length > 0 && resumeData.achievements.some((ach) => ach.title) && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold mb-3" style={{ color: template.primaryColor }}>
                    ACHIEVEMENTS
                  </h4>
                  {resumeData.achievements.map(
                    (ach) =>
                      ach.title && (
                        <div key={ach.id} className="mb-3">
                          <p className="font-bold">{ach.title}</p>
                          <p className="text-sm">{ach.description}</p>
                        </div>
                      ),
                  )}
                </div>
              )}

              {resumeData.certifications.length > 0 && resumeData.certifications.some((cert) => cert.name) && (
                <div>
                  <h4 className="text-lg font-bold mb-3" style={{ color: template.primaryColor }}>
                    CERTIFICATIONS
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {resumeData.certifications.map(
                      (cert) =>
                        cert.name && (
                          <div
                            key={cert.id}
                            className="text-sm border-l-2 pl-2"
                            style={{ borderColor: template.primaryColor }}
                          >
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-xs">
                              {cert.issuer} {cert.date && `• ${cert.date}`}
                            </p>
                            {cert.url && (
                              <a href={cert.url} className="text-xs text-blue-500 hover:underline">
                                View Certificate
                              </a>
                            )}
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    } else if (template.layout === "timeline") {
      return (
        <div className="border rounded-md p-6 max-h-[600px] overflow-y-auto" style={{ backgroundColor: "white" }}>
          {/* Header with banner style */}
          <div className="mb-6 pb-4 text-center" style={{ borderBottom: `3px solid ${template.primaryColor}` }}>
            <h3 className="text-3xl font-bold mb-1" style={{ color: template.primaryColor }}>
              {resumeData.personalInfo.name || "Your Name"}
            </h3>
            <p className="text-lg mb-3">
              {resumeData.personalInfo.position || resumeData.experience[0]?.position || "Your Position"}
            </p>

            <div className="flex justify-center gap-3 text-sm flex-wrap">
              {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
              {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
              {resumeData.personalInfo.linkedin && <span>• {resumeData.personalInfo.linkedin}</span>}
              {resumeData.personalInfo.website && <span>• {resumeData.personalInfo.website}</span>}
            </div>
          </div>

          {resumeData.personalInfo.summary && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: template.primaryColor }}>
              <p className="text-sm italic">{resumeData.personalInfo.summary}</p>
            </div>
          )}

          {resumeData.skills.length > 0 && resumeData.skills.some((skill) => skill.trim() !== "") && (
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3 flex items-center" style={{ color: template.primaryColor }}>
                <span className="mr-2">✦</span> SKILLS
              </h4>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills
                  .filter((skill) => skill.trim() !== "")
                  .map((skill, index) => (
                    <span
                      key={index}
                      className="text-sm px-3 py-1 border-2 rounded"
                      style={{ borderColor: template.primaryColor, color: template.primaryColor }}
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {resumeData.experience.length > 0 && resumeData.experience.some((exp) => exp.company) && (
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3 flex items-center" style={{ color: template.primaryColor }}>
                <span className="mr-2">✦</span> EXPERIENCE
              </h4>
              <div className="relative border-l-2 pl-6 ml-3" style={{ borderColor: template.primaryColor }}>
                {resumeData.experience.map(
                  (exp, index) =>
                    exp.company && (
                      <div key={exp.id} className="mb-6 relative">
                        <div
                          className="absolute w-4 h-4 rounded-full -left-[30px] top-1"
                          style={{ backgroundColor: template.primaryColor }}
                        ></div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{exp.position || "Position"}</p>
                            <p className="text-sm">{exp.company}</p>
                          </div>
                          {exp.duration && (
                            <p
                              className="text-xs px-2 py-1 rounded"
                              style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}
                            >
                              {exp.duration}
                            </p>
                          )}
                        </div>
                        <p className="text-sm mt-1">{exp.description}</p>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumeData.education.length > 0 && resumeData.education.some((edu) => edu.institution) && (
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center" style={{ color: template.primaryColor }}>
                  <span className="mr-2">✦</span> EDUCATION
                </h4>
                {resumeData.education.map(
                  (edu) =>
                    edu.institution && (
                      <div
                        key={edu.id}
                        className="mb-3 p-3 rounded"
                        style={{ backgroundColor: template.secondaryColor }}
                      >
                        <p className="font-bold">{edu.institution}</p>
                        <p className="text-sm">{edu.degree}</p>
                        <p className="text-xs">{edu.year}</p>
                      </div>
                    ),
                )}
              </div>
            )}

            {resumeData.projects.length > 0 && resumeData.projects.some((proj) => proj.title) && (
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center" style={{ color: template.primaryColor }}>
                  <span className="mr-2">✦</span> PROJECTS
                </h4>
                {resumeData.projects.map(
                  (proj) =>
                    proj.title && (
                      <div
                        key={proj.id}
                        className="mb-3 p-3 rounded"
                        style={{ backgroundColor: template.secondaryColor }}
                      >
                        <p className="font-bold">{proj.title}</p>
                        {proj.technologies && <p className="text-xs italic">Technologies: {proj.technologies}</p>}
                        <p className="text-sm">{proj.description}</p>
                        {proj.link && (
                          <a href={proj.link} className="text-xs text-blue-500 hover:underline">
                            {proj.link}
                          </a>
                        )}
                      </div>
                    ),
                )}
              </div>
            )}

            {resumeData.achievements.length > 0 && resumeData.achievements.some((ach) => ach.title) && (
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center" style={{ color: template.primaryColor }}>
                  <span className="mr-2">✦</span> ACHIEVEMENTS
                </h4>
                {resumeData.achievements.map(
                  (ach) =>
                    ach.title && (
                      <div
                        key={ach.id}
                        className="mb-3 p-3 rounded"
                        style={{ backgroundColor: template.secondaryColor }}
                      >
                        <p className="font-bold">{ach.title}</p>
                        <p className="text-sm">{ach.description}</p>
                      </div>
                    ),
                )}
              </div>
            )}

            {resumeData.certifications.length > 0 && resumeData.certifications.some((cert) => cert.name) && (
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center" style={{ color: template.primaryColor }}>
                  <span className="mr-2">✦</span> CERTIFICATIONS
                </h4>
                {resumeData.certifications.map(
                  (cert) =>
                    cert.name && (
                      <div
                        key={cert.id}
                        className="mb-3 p-3 rounded"
                        style={{ backgroundColor: template.secondaryColor }}
                      >
                        <p className="font-bold">{cert.name}</p>
                        <p className="text-sm">{cert.issuer}</p>
                        <p className="text-xs">{cert.date}</p>
                        {cert.url && (
                          <a href={cert.url} className="text-xs text-blue-500 hover:underline">
                            View Certificate
                          </a>
                        )}
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
        </div>
      )
    } else if (template.layout === "columns") {
      return (
        <div className="border rounded-md overflow-hidden" style={{ backgroundColor: "white" }}>
          {/* Header */}
          <div className="p-6 text-white" style={{ backgroundColor: template.primaryColor }}>
            <h3 className="text-2xl font-bold">{resumeData.personalInfo.name || "Your Name"}</h3>
            <p>{resumeData.personalInfo.position || resumeData.experience[0]?.position || "Your Position"}</p>
          </div>

          <div className="grid grid-cols-3 gap-0">
            {/* Left column */}
            <div className="col-span-1 p-4 bg-gray-50">
              <div className="mb-6">
                <h4
                  className="text-sm font-bold uppercase mb-2 p-1"
                  style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}
                >
                  Contact
                </h4>
                <div className="text-sm space-y-1">
                  {resumeData.personalInfo.email && <p>{resumeData.personalInfo.email}</p>}
                  {resumeData.personalInfo.phone && <p>{resumeData.personalInfo.phone}</p>}
                  {resumeData.personalInfo.address && <p>{resumeData.personalInfo.address}</p>}
                  {resumeData.personalInfo.linkedin && <p>{resumeData.personalInfo.linkedin}</p>}
                  {resumeData.personalInfo.website && <p>{resumeData.personalInfo.website}</p>}
                </div>
              </div>

              {resumeData.skills.length > 0 && resumeData.skills.some((skill) => skill.trim() !== "") && (
                <div className="mb-6">
                  <h4
                    className="text-sm font-bold uppercase mb-2 p-1"
                    style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}
                  >
                    Skills
                  </h4>
                  <div className="text-sm">
                    {resumeData.skills
                      .filter((skill) => skill.trim() !== "")
                      .map((skill, index) => (
                        <div key={index} className="mb-1">
                          <p>{skill}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {resumeData.education.length > 0 && resumeData.education.some((edu) => edu.institution) && (
                <div>
                  <h4
                    className="text-sm font-bold uppercase mb-2 p-1"
                    style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}
                  >
                    Education
                  </h4>
                  {resumeData.education.map(
                    (edu) =>
                      edu.institution && (
                        <div key={edu.id} className="mb-3 text-sm">
                          <p className="font-medium">{edu.institution}</p>
                          <p>{edu.degree}</p>
                          <p className="text-xs text-gray-600">{edu.year}</p>
                        </div>
                      ),
                  )}
                </div>
              )}
            </div>

            {/* Right column - 2/3 width */}
            <div className="col-span-2 p-4">
              {resumeData.personalInfo.summary && (
                <div className="mb-6">
                  <h4
                    className="text-sm font-bold uppercase mb-2 p-1"
                    style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}
                  >
                    Professional Summary
                  </h4>
                  <p className="text-sm">{resumeData.personalInfo.summary}</p>
                </div>
              )}

              {resumeData.experience.length > 0 && resumeData.experience.some((exp) => exp.company) && (
                <div className="mb-6">
                  <h4
                    className="text-sm font-bold uppercase mb-2 p-1"
                    style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}
                  >
                    Professional Experience
                  </h4>
                  {resumeData.experience.map(
                    (exp) =>
                      exp.company && (
                        <div key={exp.id} className="mb-4 text-sm">
                          <div className="flex justify-between">
                            <p className="font-bold">{exp.position || "Position"}</p>
                            <p>{exp.duration}</p>
                          </div>
                          <p className="italic">{exp.company}</p>
                          <p className="mt-1">{exp.description}</p>
                        </div>
                      ),
                  )}
                </div>
              )}

              {resumeData.projects.length > 0 && resumeData.projects.some((proj) => proj.title) && (
                <div className="mb-6">
                  <h4
                    className="text-sm font-bold uppercase mb-2 p-1"
                    style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}
                  >
                    Projects
                  </h4>
                  {resumeData.projects.map(
                    (proj) =>
                      proj.title && (
                        <div key={proj.id} className="mb-3 text-sm">
                          <p className="font-bold">{proj.title}</p>
                          {proj.technologies && <p className="italic text-xs">Technologies: {proj.technologies}</p>}
                          <p>{proj.description}</p>
                          {proj.link && (
                            <a href={proj.link} className="text-xs text-blue-500 hover:underline">
                              {proj.link}
                            </a>
                          )}
                        </div>
                      ),
                  )}
                </div>
              )}

              {resumeData.achievements.length > 0 && resumeData.achievements.some((ach) => ach.title) && (
                <div className="mb-6">
                  <h4
                    className="text-sm font-bold uppercase mb-2 p-1"
                    style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}
                  >
                    Achievements
                  </h4>
                  {resumeData.achievements.map(
                    (ach) =>
                      ach.title && (
                        <div key={ach.id} className="mb-3 text-sm">
                          <p className="font-bold">{ach.title}</p>
                          <p>{ach.description}</p>
                        </div>
                      ),
                  )}
                </div>
              )}

              {resumeData.certifications.length > 0 && resumeData.certifications.some((cert) => cert.name) && (
                <div>
                  <h4
                    className="text-sm font-bold uppercase mb-2 p-1"
                    style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}
                  >
                    Certifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {resumeData.certifications.map(
                      (cert) =>
                        cert.name && (
                          <div key={cert.id}>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-xs">
                              {cert.issuer} {cert.date && `• ${cert.date}`}
                            </p>
                            {cert.url && (
                              <a href={cert.url} className="text-xs text-blue-500 hover:underline">
                                View Certificate
                              </a>
                            )}
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    } else if (template.layout === "compact") {
      return (
        <div className="border rounded-md p-6 max-h-[600px] overflow-y-auto" style={{ backgroundColor: "white" }}>
          {/* Minimal header */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold" style={{ color: template.primaryColor }}>
              {resumeData.personalInfo.name || "Your Name"}
            </h3>
            <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
              {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
              {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
              {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
              {resumeData.personalInfo.website && <span>{resumeData.personalInfo.website}</span>}
            </div>
          </div>

          {resumeData.personalInfo.summary && (
            <div className="mb-6">
              <p className="text-sm">{resumeData.personalInfo.summary}</p>
            </div>
          )}

          <div className="space-y-4">
            {resumeData.experience.length > 0 && resumeData.experience.some((exp) => exp.company) && (
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-2" style={{ color: template.primaryColor }}>
                  Experience
                </h4>
                <div className="space-y-3">
                  {resumeData.experience.map(
                    (exp) =>
                      exp.company && (
                        <div key={exp.id} className="text-sm">
                          <div className="flex justify-between">
                            <p className="font-medium">
                              {exp.position || "Position"} @ {exp.company}
                            </p>
                            <p className="text-gray-500">{exp.duration}</p>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{exp.description}</p>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            {resumeData.education.length > 0 && resumeData.education.some((edu) => edu.institution) && (
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-2" style={{ color: template.primaryColor }}>
                  Education
                </h4>
                <div className="space-y-2">
                  {resumeData.education.map(
                    (edu) =>
                      edu.institution && (
                        <div key={edu.id} className="text-sm flex justify-between">
                          <div>
                            <p className="font-medium">{edu.institution}</p>
                            <p className="text-xs">{edu.degree}</p>
                          </div>
                          <p className="text-gray-500">{edu.year}</p>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            {resumeData.skills.length > 0 && resumeData.skills.some((skill) => skill.trim() !== "") && (
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-2" style={{ color: template.primaryColor }}>
                  Skills
                </h4>
                <p className="text-sm">{resumeData.skills.filter((skill) => skill.trim() !== "").join(" • ")}</p>
              </div>
            )}

            {resumeData.projects.length > 0 && resumeData.projects.some((proj) => proj.title) && (
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-2" style={{ color: template.primaryColor }}>
                  Projects
                </h4>
                <div className="space-y-2">
                  {resumeData.projects.map(
                    (proj) =>
                      proj.title && (
                        <div key={proj.id} className="text-sm">
                          <p className="font-medium">{proj.title}</p>
                          <p className="text-xs">{proj.description}</p>
                          {proj.technologies && <p className="text-xs text-gray-500">Tech: {proj.technologies}</p>}
                          {proj.link && (
                            <a href={proj.link} className="text-xs text-blue-500 hover:underline">
                              {proj.link}
                            </a>
                          )}
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            {resumeData.achievements.length > 0 && resumeData.achievements.some((ach) => ach.title) && (
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-2" style={{ color: template.primaryColor }}>
                  Achievements
                </h4>
                <div className="space-y-2">
                  {resumeData.achievements.map(
                    (ach) =>
                      ach.title && (
                        <div key={ach.id} className="text-sm">
                          <p className="font-medium">{ach.title}</p>
                          <p className="text-xs">{ach.description}</p>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            {resumeData.certifications.length > 0 && resumeData.certifications.some((cert) => cert.name) && (
              <div>
                <h4 className="text-sm uppercase tracking-wider mb-2" style={{ color: template.primaryColor }}>
                  Certifications
                </h4>
                <div className="space-y-1">
                  {resumeData.certifications.map(
                    (cert) =>
                      cert.name && (
                        <div key={cert.id} className="text-sm">
                          <p>
                            {cert.name} ({cert.issuer}
                            {cert.date && `, ${cert.date}`})
                          </p>
                          {cert.url && (
                            <a href={cert.url} className="text-xs text-blue-500 hover:underline">
                              View Certificate
                            </a>
                          )}
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    } else {
      // Default standard layout
      return (
        <div
          className="border rounded-md p-6 space-y-4 max-h-[600px] overflow-y-auto"
          style={{ backgroundColor: "white" }}
        >
          <div style={{ borderBottom: `2px solid ${template.primaryColor}`, paddingBottom: "10px" }}>
            <h3 className="text-2xl font-bold" style={{ color: template.primaryColor }}>
              {resumeData.personalInfo.name || "Your Name"}
            </h3>
            <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-1">
              {resumeData.personalInfo.email && <p>Email: {resumeData.personalInfo.email}</p>}
              {resumeData.personalInfo.phone && <p>Phone: {resumeData.personalInfo.phone}</p>}
              {resumeData.personalInfo.address && <p>Address: {resumeData.personalInfo.address}</p>}
              {resumeData.personalInfo.linkedin && <p>LinkedIn: {resumeData.personalInfo.linkedin}</p>}
              {resumeData.personalInfo.website && <p>Website: {resumeData.personalInfo.website}</p>}
            </div>
          </div>

          {resumeData.personalInfo.summary && (
            <div>
              <h4 className="font-bold mt-4" style={{ color: template.primaryColor, borderBottom: "1px solid #ddd" }}>
                PROFESSIONAL SUMMARY
              </h4>
              <p className="text-sm">{resumeData.personalInfo.summary}</p>
            </div>
          )}

          {resumeData.experience.length > 0 && resumeData.experience.some((exp) => exp.company) && (
            <div>
              <h4 className="font-bold mt-4" style={{ color: template.primaryColor, borderBottom: "1px solid #ddd" }}>
                EXPERIENCE
              </h4>
              {resumeData.experience.map(
                (exp) =>
                  exp.company && (
                    <div key={exp.id} className="text-sm mt-2">
                      <div className="flex justify-between">
                        <p className="font-medium">{exp.position || "Position"}</p>
                        <p className="italic">{exp.duration}</p>
                      </div>
                      <p className="font-medium">{exp.company}</p>
                      <p>{exp.description}</p>
                    </div>
                  ),
              )}
            </div>
          )}

          {resumeData.education.length > 0 && resumeData.education.some((edu) => edu.institution) && (
            <div>
              <h4 className="font-bold mt-4" style={{ color: template.primaryColor, borderBottom: "1px solid #ddd" }}>
                EDUCATION
              </h4>
              {resumeData.education.map(
                (edu) =>
                  edu.institution && (
                    <div key={edu.id} className="text-sm mt-2">
                      <div className="flex justify-between">
                        <p className="font-medium">{edu.institution}</p>
                        <p>{edu.year}</p>
                      </div>
                      <p>{edu.degree}</p>
                    </div>
                  ),
              )}
            </div>
          )}

          {resumeData.skills.length > 0 && resumeData.skills.some((skill) => skill.trim() !== "") && (
            <div>
              <h4 className="font-bold mt-4" style={{ color: template.primaryColor, borderBottom: "1px solid #ddd" }}>
                SKILLS
              </h4>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills
                  .filter((skill) => skill.trim() !== "")
                  .map((skill, index) => (
                    <span
                      key={index}
                      className="text-sm px-2 py-1 rounded"
                      style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {resumeData.achievements.length > 0 && resumeData.achievements.some((ach) => ach.title) && (
            <div>
              <h4 className="font-bold mt-4" style={{ color: template.primaryColor, borderBottom: "1px solid #ddd" }}>
                ACHIEVEMENTS
              </h4>
              {resumeData.achievements.map(
                (ach) =>
                  ach.title && (
                    <div key={ach.id} className="text-sm mt-2">
                      <p className="font-medium">{ach.title}</p>
                      <p>{ach.description}</p>
                    </div>
                  ),
              )}
            </div>
          )}

          {resumeData.projects.length > 0 && resumeData.projects.some((proj) => proj.title) && (
            <div>
              <h4 className="font-bold mt-4" style={{ color: template.primaryColor, borderBottom: "1px solid #ddd" }}>
                PROJECTS
              </h4>
              {resumeData.projects.map(
                (proj) =>
                  proj.title && (
                    <div key={proj.id} className="text-sm mt-2">
                      <p className="font-bold">{proj.title}</p>
                      {proj.technologies && <p className="italic text-xs">Technologies: {proj.technologies}</p>}
                      <p>{proj.description}</p>
                      {proj.link && (
                        <p>
                          <a
                            href={proj.link}
                            className="text-blue-500 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {proj.link}
                          </a>
                        </p>
                      )}
                    </div>
                  ),
              )}
            </div>
          )}

          {resumeData.certifications.length > 0 && resumeData.certifications.some((cert) => cert.name) && (
            <div>
              <h4 className="font-bold mt-4" style={{ color: template.primaryColor, borderBottom: "1px solid #ddd" }}>
                CERTIFICATIONS
              </h4>
              {resumeData.certifications.map(
                (cert) =>
                  cert.name && (
                    <div key={cert.id} className="text-sm mt-2">
                      <div className="flex justify-between">
                        <p className="font-medium">{cert.name}</p>
                        <p>{cert.date}</p>
                      </div>
                      <p>Issued by: {cert.issuer}</p>
                      {cert.url && (
                        <p>
                          <a
                            href={cert.url}
                            className="text-blue-500 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Certificate
                          </a>
                        </p>
                      )}
                    </div>
                  ),
              )}
            </div>
          )}
        </div>
      )
    }
  }

  const renderStep = () => {
    if (previewMode && step !== 9) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Preview</h2>
            <Button type="button" onClick={togglePreview} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" /> Back to Edit
            </Button>
          </div>
          {renderResumePreview()}
        </div>
      )
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <Button type="button" onClick={togglePreview} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={resumeData.personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={resumeData.personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={resumeData.personalInfo.address}
                  onChange={handlePersonalInfoChange}
                  placeholder="Accra, Ghana"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={resumeData.personalInfo.linkedin}
                  onChange={handlePersonalInfoChange}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Personal Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={resumeData.personalInfo.website}
                  onChange={handlePersonalInfoChange}
                  placeholder="johndoe.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                name="summary"
                value={resumeData.personalInfo.summary}
                onChange={handlePersonalInfoChange}
                placeholder="A brief summary of your professional background and career goals"
                rows={4}
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Education</h2>
              <div className="flex gap-2">
                <Button type="button" onClick={togglePreview} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button type="button" onClick={addEducation} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Education
                </Button>
              </div>
            </div>
            {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="p-4 border rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Education #{index + 1}</h3>
                  <Button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    variant="ghost"
                    size="sm"
                    disabled={resumeData.education.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                    <Input
                      id={`institution-${edu.id}`}
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(edu.id, "institution", e.target.value)}
                      placeholder="University of Ghana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`degree-${edu.id}`}>Degree/Certificate</Label>
                    <Input
                      id={`degree-${edu.id}`}
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`year-${edu.id}`}>Year</Label>
                    <Input
                      id={`year-${edu.id}`}
                      value={edu.year}
                      onChange={(e) => handleEducationChange(edu.id, "year", e.target.value)}
                      placeholder="2018 - 2022"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Work Experience</h2>
              <div className="flex gap-2">
                <Button type="button" onClick={togglePreview} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button type="button" onClick={addExperience} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Experience
                </Button>
              </div>
            </div>
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id} className="p-4 border rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Experience #{index + 1}</h3>
                  <Button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    variant="ghost"
                    size="sm"
                    disabled={resumeData.experience.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`company-${exp.id}`}>Company</Label>
                    <Input
                      id={`company-${exp.id}`}
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                      placeholder="ABC Tech"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`position-${exp.id}`}>Position</Label>
                    <Input
                      id={`position-${exp.id}`}
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(exp.id, "position", e.target.value)}
                      placeholder="Software Developer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`duration-${exp.id}`}>Duration</Label>
                    <Input
                      id={`duration-${exp.id}`}
                      value={exp.duration}
                      onChange={(e) => handleExperienceChange(exp.id, "duration", e.target.value)}
                      placeholder="Jan 2020 - Present"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`description-${exp.id}`}>Description</Label>
                  <Textarea
                    id={`description-${exp.id}`}
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                    placeholder="Describe your responsibilities and achievements"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Skills</h2>
              <div className="flex gap-2">
                <Button type="button" onClick={togglePreview} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button type="button" onClick={addSkill} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Skill
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {resumeData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="e.g., JavaScript, Project Management, Communication"
                  />
                  <Button
                    type="button"
                    onClick={() => removeSkill(index)}
                    variant="ghost"
                    size="sm"
                    disabled={resumeData.skills.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Achievements</h2>
              <div className="flex gap-2">
                <Button type="button" onClick={togglePreview} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button type="button" onClick={addAchievement} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Achievement
                </Button>
              </div>
            </div>
            {resumeData.achievements.map((ach, index) => (
              <div key={ach.id} className="p-4 border rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Achievement #{index + 1}</h3>
                  <Button
                    type="button"
                    onClick={() => removeAchievement(ach.id)}
                    variant="ghost"
                    size="sm"
                    disabled={resumeData.achievements.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`title-${ach.id}`}>Title</Label>
                  <Input
                    id={`title-${ach.id}`}
                    value={ach.title}
                    onChange={(e) => handleAchievementChange(ach.id, "title", e.target.value)}
                    placeholder="Employee of the Year"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`description-${ach.id}`}>Description</Label>
                  <Textarea
                    id={`description-${ach.id}`}
                    value={ach.description}
                    onChange={(e) => handleAchievementChange(ach.id, "description", e.target.value)}
                    placeholder="Describe your achievement and its impact"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        )
      case 6:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Projects</h2>
              <div className="flex gap-2">
                <Button type="button" onClick={togglePreview} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button type="button" onClick={addProject} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Project
                </Button>
              </div>
            </div>
            {resumeData.projects.map((proj, index) => (
              <div key={proj.id} className="p-4 border rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Project #{index + 1}</h3>
                  <Button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    variant="ghost"
                    size="sm"
                    disabled={resumeData.projects.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${proj.id}`}>Project Title</Label>
                    <Input
                      id={`title-${proj.id}`}
                      value={proj.title}
                      onChange={(e) => handleProjectChange(proj.id, "title", e.target.value)}
                      placeholder="E-commerce Website"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`technologies-${proj.id}`}>Technologies Used</Label>
                    <Input
                      id={`technologies-${proj.id}`}
                      value={proj.technologies}
                      onChange={(e) => handleProjectChange(proj.id, "technologies", e.target.value)}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`description-${proj.id}`}>Description</Label>
                  <Textarea
                    id={`description-${proj.id}`}
                    value={proj.description}
                    onChange={(e) => handleProjectChange(proj.id, "description", e.target.value)}
                    placeholder="Describe the project, your role, and its impact"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`link-${proj.id}`}>Project Link</Label>
                  <Input
                    id={`link-${proj.id}`}
                    value={proj.link}
                    onChange={(e) => handleProjectChange(proj.id, "link", e.target.value)}
                    placeholder="https://github.com/username/project"
                  />
                </div>
              </div>
            ))}
          </div>
        )
      case 7:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Certifications</h2>
              <div className="flex gap-2">
                <Button type="button" onClick={togglePreview} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button type="button" onClick={addCertification} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Certification
                </Button>
              </div>
            </div>
            {resumeData.certifications.map((cert, index) => (
              <div key={cert.id} className="p-4 border rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Certification #{index + 1}</h3>
                  <Button
                    type="button"
                    onClick={() => removeCertification(cert.id)}
                    variant="ghost"
                    size="sm"
                    disabled={resumeData.certifications.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${cert.id}`}>Certification Name</Label>
                    <Input
                      id={`name-${cert.id}`}
                      value={cert.name}
                      onChange={(e) => handleCertificationChange(cert.id, "name", e.target.value)}
                      placeholder="AWS Certified Solutions Architect"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`issuer-${cert.id}`}>Issuing Organization</Label>
                    <Input
                      id={`issuer-${cert.id}`}
                      value={cert.issuer}
                      onChange={(e) => handleCertificationChange(cert.id, "issuer", e.target.value)}
                      placeholder="Amazon Web Services"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`date-${cert.id}`}>Date</Label>
                    <Input
                      id={`date-${cert.id}`}
                      value={cert.date}
                      onChange={(e) => handleCertificationChange(cert.id, "date", e.target.value)}
                      placeholder="June 2022"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`url-${cert.id}`}>Certificate URL</Label>
                    <Input
                      id={`url-${cert.id}`}
                      value={cert.url}
                      onChange={(e) => handleCertificationChange(cert.id, "url", e.target.value)}
                      placeholder="https://www.credential.net/credential-id"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 8:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Choose a Template</h2>
              <Button type="button" onClick={togglePreview} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-md p-4 cursor-pointer transition-all ${
                    selectedTemplate === template.id ? "ring-2 ring-offset-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div
                    className={`h-32 ${template.color} rounded-md mb-4 flex items-center justify-center`}
                    style={{ backgroundColor: template.primaryColor }}
                  >
                    <FileText className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              ))}
            </div>

            {/* Template Preview */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Template Preview</h3>
              {renderResumePreview()}
            </div>
          </div>
        )
      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Preview & Download</h2>
            {renderResumePreview()}

            <div className="flex justify-center">
              <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
                <Download className="h-5 w-5 mr-2" /> Download PDF
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-8">
          <div className="flex items-center mb-8">
            <FileText className="h-12 w-12 mr-4 text-blue-500" />
            <h1 className="text-3xl font-bold">Resume Builder</h1>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex flex-col items-center ${
                    stepNumber < step ? "text-blue-500" : stepNumber === step ? "text-blue-700" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      stepNumber < step
                        ? "bg-blue-500 text-white"
                        : stepNumber === step
                          ? "bg-blue-700 text-white"
                          : "bg-gray-200"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <span className="text-xs hidden md:block">
                    {stepNumber === 1
                      ? "Personal"
                      : stepNumber === 2
                        ? "Education"
                        : stepNumber === 3
                          ? "Experience"
                          : stepNumber === 4
                            ? "Skills"
                            : stepNumber === 5
                              ? "Achievements"
                              : stepNumber === 6
                                ? "Projects"
                                : stepNumber === 7
                                  ? "Certifications"
                                  : stepNumber === 8
                                    ? "Template"
                                    : "Preview"}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <div
                className="absolute top-0 left-0 h-1 bg-blue-500"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
              <div className="h-1 bg-gray-200 w-full"></div>
            </div>
          </div>

          <form className="space-y-8">
            {renderStep()}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button type="button" onClick={prevStep} variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              )}
              {step < totalSteps && (
                <Button type="button" onClick={nextStep} className="ml-auto">
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
