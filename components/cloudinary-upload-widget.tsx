"use client"

import { useEffect, useRef, useState } from "react"
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
  const [uploadCount, setUploadCount] = useState(0)

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
          uploadPreset: "ml_default",
          sources: ["local", "url", "camera"],
          multiple: true,
          maxFiles: 5,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxFileSize: 5000000, // 5MB
          folder: "thai-tribal-crafts",
          resourceType: "image",
          showCompletedButton: true,
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Upload error:", error)
            return
          }

          if (result.event === "success") {
            console.log("Image uploaded successfully:", result.info.secure_url)
            setUploadCount((prev) => prev + 1)
            onUpload(result.info.secure_url)
          }

          if (result.event === "queues-end") {
            console.log("All uploads complete. Total images uploaded:", uploadCount)
          }

          if (result.event === "close") {
            setUploadCount(0)
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
      {uploadCount > 0 && <span className="ml-2 text-xs">({uploadCount} uploaded)</span>}
    </Button>
  )
}
