"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void
  buttonText?: string
}

declare global {
  interface Window {
    cloudinary: any
  }
}

export function CloudinaryUploadWidget({ onUpload, buttonText = "Upload Image" }: CloudinaryUploadWidgetProps) {
  const widgetRef = useRef<any>(null)

  useEffect(() => {
    // Load Cloudinary widget script
    if (!document.getElementById("cloudinary-upload-widget")) {
      const script = document.createElement("script")
      script.id = "cloudinary-upload-widget"
      script.src = "https://upload-widget.cloudinary.com/global/all.js"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const openWidget = () => {
    if (!window.cloudinary) {
      console.error("Cloudinary widget not loaded")
      return
    }

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: "ml_default", // You'll need to create this in Cloudinary dashboard
          sources: ["local", "url", "camera"],
          multiple: false,
          maxFiles: 1,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxFileSize: 5000000, // 5MB
          folder: "thai-tribal-crafts",
          resourceType: "image",
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Upload error:", error)
            return
          }

          if (result.event === "success") {
            console.log("[v0] Image uploaded successfully:", result.info.secure_url)
            onUpload(result.info.secure_url)
          }
        },
      )
    }

    widgetRef.current.open()
  }

  return (
    <Button type="button" variant="outline" onClick={openWidget} className="w-full bg-transparent">
      <Upload className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  )
}
