import type { IProduct } from "@/models/Product"

interface PDFHelpers {
  doc: any
  colors: {
    primary: number[]
    secondary: number[]
    accent: number[]
    text: number[]
    muted: number[]
    background: number[]
  }
  pageWidth: number
  pageHeight: number
  margin: number
}

type PageLayoutType = "two-column" | "three-column" | "featured" | "mixed"

interface ProductLayout {
  product: IProduct
  contentWeight: number
  cardHeight: number
  imageAspectRatio: number
  layoutType: "vertical" | "horizontal-left" | "horizontal-right"
}

function addPageHeader(helpers: PDFHelpers, title: string, pageNumber: number) {
  const { doc, colors, pageWidth, margin } = helpers

  doc.setFontSize(7)
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
  doc.setFont("times", "normal")
  doc.text("Thai Tribal Crafts | 2025", margin, 10)

  doc.setFontSize(11)
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.setFont("times", "bold")
  doc.text(title, pageWidth / 2, 10, { align: "center" })

  doc.setFontSize(7)
  doc.text(pageNumber.toString(), pageWidth - margin, 10, { align: "right" })

  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2])
  doc.setLineWidth(0.3)
  doc.line(margin, 13, pageWidth - margin, 13)
}

function determinePageLayout(
  products: IProduct[],
  startIndex: number,
): {
  layoutType: PageLayoutType
  productsOnPage: number
} {
  const remaining = products.length - startIndex

  if (remaining === 1) {
    return { layoutType: "featured", productsOnPage: 1 }
  }

  // Analyze content weight of next few products
  const nextProducts = products.slice(startIndex, startIndex + 6)
  const avgContentWeight = nextProducts.reduce((sum, p) => sum + calculateContentWeight(p), 0) / nextProducts.length

  // Heavy content (long stories) → fewer products per page
  if (avgContentWeight > 600) {
    return { layoutType: "two-column", productsOnPage: Math.min(4, remaining) }
  }

  // Medium content → 4-6 products
  if (avgContentWeight > 400) {
    return {
      layoutType: remaining >= 6 ? "three-column" : "two-column",
      productsOnPage: Math.min(remaining >= 6 ? 6 : 4, remaining),
    }
  }

  // Light content → can fit more
  return { layoutType: "three-column", productsOnPage: Math.min(6, remaining) }
}

function calculateContentWeight(product: IProduct): number {
  const nameWeight = product.name.length * 1.5
  const tribeWeight = product.tribe.length * 1.2
  const materialsWeight = product.materials.join(", ").length * 1.0
  const storyWeight = product.story.length * 1.0

  return nameWeight + tribeWeight + materialsWeight + storyWeight
}

async function getImageAspectRatio(imageUrl: string): Promise<number> {
  try {
    // For Cloudinary images, we can estimate or use a default
    // In a real implementation, you might want to fetch image metadata
    return 1.0 // Default square aspect ratio
  } catch {
    return 1.0
  }
}

async function renderTwoColumnLayout(
  helpers: PDFHelpers,
  products: IProduct[],
  startY: number,
  availableHeight: number,
) {
  const { margin, pageWidth } = helpers
  const gap = 8
  const availableWidth = pageWidth - 2 * margin
  const cardWidth = (availableWidth - gap) / 2
  const cardHeight = (availableHeight - gap) / 2

  const positions = [
    { x: margin, y: startY },
    { x: margin + cardWidth + gap, y: startY },
    { x: margin, y: startY + cardHeight + gap },
    { x: margin + cardWidth + gap, y: startY + cardHeight + gap },
  ]

  for (let i = 0; i < Math.min(4, products.length); i++) {
    const pos = positions[i]
    await addProductCard(helpers, products[i], pos.x, pos.y, cardWidth, cardHeight, i)
  }
}

async function renderThreeColumnLayout(
  helpers: PDFHelpers,
  products: IProduct[],
  startY: number,
  availableHeight: number,
) {
  const { margin, pageWidth } = helpers
  const gap = 6
  const availableWidth = pageWidth - 2 * margin
  const cardWidth = (availableWidth - gap * 2) / 3
  const cardHeight = (availableHeight - gap) / 2

  const positions = [
    { x: margin, y: startY },
    { x: margin + cardWidth + gap, y: startY },
    { x: margin + (cardWidth + gap) * 2, y: startY },
    { x: margin, y: startY + cardHeight + gap },
    { x: margin + cardWidth + gap, y: startY + cardHeight + gap },
    { x: margin + (cardWidth + gap) * 2, y: startY + cardHeight + gap },
  ]

  for (let i = 0; i < Math.min(6, products.length); i++) {
    const pos = positions[i]
    await addProductCard(helpers, products[i], pos.x, pos.y, cardWidth, cardHeight, i)
  }
}

async function renderFeaturedLayout(helpers: PDFHelpers, product: IProduct, startY: number, availableHeight: number) {
  const { margin, pageWidth } = helpers
  const availableWidth = pageWidth - 2 * margin

  // Large featured card takes most of the page
  await addProductCard(helpers, product, margin, startY, availableWidth, availableHeight * 0.85, 0)
}

async function addProductCard(
  helpers: PDFHelpers,
  product: IProduct,
  x: number,
  y: number,
  width: number,
  height: number,
  index: number,
) {
  const { doc, colors } = helpers

  // Elegant card with subtle shadow effect
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2])
  doc.setLineWidth(0.3)
  doc.rect(x, y, width, height, "FD")

  const padding = 6
  const imageHeight = height * 0.5
  const textStartY = y + imageHeight + padding * 1.5

  // Product image at top
  await addProductImage(helpers, product, x + padding, y + padding, width - padding * 2, imageHeight - padding)

  let currentY = textStartY

  // Product name - bold and elegant
  doc.setFontSize(width < 60 ? 9 : 11)
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.setFont("times", "bold")
  const nameLines = doc.splitTextToSize(product.name.toUpperCase(), width - padding * 2)
  doc.text(nameLines.slice(0, 2), x + padding, currentY)
  currentY += nameLines.slice(0, 2).length * 4 + 2

  // Tribe name - italic
  doc.setFontSize(width < 60 ? 7 : 8)
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
  doc.setFont("times", "italic")
  doc.text(product.tribe, x + padding, currentY)
  currentY += 4

  // Materials
  doc.setFontSize(6)
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
  doc.setFont("helvetica", "bold")
  doc.text("MATERIALS:", x + padding, currentY)
  currentY += 2.5

  doc.setFont("helvetica", "normal")
  const materialsText = product.materials.join(", ").toUpperCase()
  const materialLines = doc.splitTextToSize(materialsText, width - padding * 2)
  doc.text(materialLines.slice(0, 1), x + padding, currentY)
  currentY += 3.5

  // Story
  doc.setFont("helvetica", "bold")
  doc.text("STORY:", x + padding, currentY)
  currentY += 2.5

  doc.setFont("helvetica", "normal")
  const storyLines = doc.splitTextToSize(product.story, width - padding * 2)
  const remainingHeight = y + height - currentY - 12
  const maxStoryLines = Math.floor(remainingHeight / 2.5)
  doc.text(storyLines.slice(0, Math.max(2, maxStoryLines)), x + padding, currentY)
  currentY += Math.max(2, maxStoryLines) * 2.5 + 3

  // Size and price at bottom
  doc.setFontSize(5.5)
  doc.setFont("helvetica", "bold")
  doc.text("SIZES & RETAIL PRICE", x + padding, currentY)
  currentY += 2.5

  doc.setFontSize(6)
  doc.setFont("helvetica", "normal")
  const dimensions = product.dimensions
  const sizeText = dimensions
    ? `${dimensions.length}×${dimensions.width}×${dimensions.height} ${dimensions.unit}`
    : "Standard"
  doc.text(`Size: ${sizeText}`, x + padding, currentY)
  currentY += 3

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.text(`${product.price.currency} ${product.price.amount.toLocaleString()}`, x + padding, currentY)
}

// Helper: Load and display product image with preserved aspect ratio
async function addProductImage(
  helpers: PDFHelpers,
  product: IProduct,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) {
  const { doc, colors } = helpers

  try {
    if (product.images && product.images.length > 0) {
      // If multiple images, show main image + thumbnails
      if (product.images.length > 1) {
        const mainImageHeight = maxHeight * 0.75
        const thumbnailHeight = maxHeight * 0.2
        const thumbnailGap = 2

        // Main image (first image)
        await loadAndDisplayImage(helpers, product.images[0], x, y, maxWidth, mainImageHeight)

        // Thumbnails (remaining images, max 3)
        const thumbnailsToShow = Math.min(3, product.images.length - 1)
        const thumbnailWidth = (maxWidth - thumbnailGap * (thumbnailsToShow - 1)) / thumbnailsToShow

        for (let i = 0; i < thumbnailsToShow; i++) {
          const thumbX = x + i * (thumbnailWidth + thumbnailGap)
          const thumbY = y + mainImageHeight + thumbnailGap * 2
          await loadAndDisplayImage(helpers, product.images[i + 1], thumbX, thumbY, thumbnailWidth, thumbnailHeight)
        }
      } else {
        // Single image - use full space
        await loadAndDisplayImage(helpers, product.images[0], x, y, maxWidth, maxHeight)
      }
    } else {
      throw new Error("No image available")
    }
  } catch (error) {
    // Elegant placeholder
    doc.setFillColor(245, 242, 238)
    doc.setDrawColor(colors.muted[0], colors.muted[1], colors.muted[2])
    doc.setLineWidth(0.2)
    doc.rect(x, y, maxWidth, maxHeight, "FD")

    doc.setFontSize(7)
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
    doc.setFont("times", "italic")
    doc.text("Image Unavailable", x + maxWidth / 2, y + maxHeight / 2, { align: "center" })
  }
}

async function loadAndDisplayImage(
  helpers: PDFHelpers,
  imageUrl: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) {
  const { doc } = helpers

  if (imageUrl.includes("cloudinary.com")) {
    const urlParts = imageUrl.split("/upload/")
    if (urlParts.length === 2) {
      imageUrl = `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}`
    }
  }

  const response = await fetch(imageUrl, {
    method: "GET",
    headers: {
      Accept: "image/jpeg,image/png,image/webp,image/*",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`)
  }

  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = `data:${blob.type};base64,${buffer.toString("base64")}`

  let format = "JPEG"
  const mimeType = blob.type.toLowerCase()
  if (mimeType.includes("png")) {
    format = "PNG"
  } else if (mimeType.includes("webp")) {
    format = "WEBP"
  }

  const imgProps = doc.getImageProperties(base64)
  const imgAspectRatio = imgProps.width / imgProps.height

  let finalWidth = maxWidth
  let finalHeight = maxHeight

  if (imgAspectRatio > maxWidth / maxHeight) {
    finalHeight = maxWidth / imgAspectRatio
  } else {
    finalWidth = maxHeight * imgAspectRatio
  }

  const offsetX = (maxWidth - finalWidth) / 2
  const offsetY = (maxHeight - finalHeight) / 2

  doc.addImage(base64, format, x + offsetX, y + offsetY, finalWidth, finalHeight, undefined, "MEDIUM")
}

export async function generateCataloguePDF(products: IProduct[]): Promise<Buffer> {
  const { jsPDF } = await import("jspdf")

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const colors = {
        primary: [74, 52, 40],
        secondary: [139, 90, 60],
        accent: [196, 165, 116],
        text: [60, 60, 60],
        muted: [140, 123, 107],
        background: [252, 250, 247],
      }

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15

      const helpers: PDFHelpers = {
        doc,
        colors,
        pageWidth,
        pageHeight,
        margin,
      }

      doc.setFillColor(colors.background[0], colors.background[1], colors.background[2])
      doc.rect(0, 0, pageWidth, pageHeight, "F")

      doc.setFontSize(38)
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
      doc.setFont("times", "bold")
      doc.text("THAI TRIBAL", pageWidth / 2, 95, { align: "center" })
      doc.text("CRAFTS", pageWidth / 2, 110, { align: "center" })

      doc.setFontSize(13)
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
      doc.setFont("times", "italic")
      doc.text("Handcrafted Heritage Collection", pageWidth / 2, 125, { align: "center" })

      doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2])
      doc.setLineWidth(0.5)
      doc.line(45, 135, pageWidth - 45, 135)
      doc.line(45, 137, pageWidth - 45, 137)

      doc.setFontSize(8)
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
      doc.setFont("helvetica", "normal")
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
      doc.text(dateStr, pageWidth / 2, 150, { align: "center" })

      let pageNumber = 1
      let currentIndex = 0

      while (currentIndex < products.length) {
        doc.addPage()
        doc.setFillColor(colors.background[0], colors.background[1], colors.background[2])
        doc.rect(0, 0, pageWidth, pageHeight, "F")

        addPageHeader(helpers, "PRODUCT COLLECTION", pageNumber)
        pageNumber++

        const startY = 20
        const availableHeight = pageHeight - startY - margin

        const remainingProducts = products.slice(currentIndex)
        const layout = determinePageLayout(products, currentIndex)

        const productsForPage = remainingProducts.slice(0, layout.productsOnPage)

        // Render based on layout type
        if (layout.layoutType === "featured") {
          await renderFeaturedLayout(helpers, productsForPage[0], startY, availableHeight)
        } else if (layout.layoutType === "two-column") {
          await renderTwoColumnLayout(helpers, productsForPage, startY, availableHeight)
        } else if (layout.layoutType === "three-column") {
          await renderThreeColumnLayout(helpers, productsForPage, startY, availableHeight)
        }

        currentIndex += layout.productsOnPage
      }

      doc.addPage()
      doc.setFillColor(colors.background[0], colors.background[1], colors.background[2])
      doc.rect(0, 0, pageWidth, pageHeight, "F")

      doc.setFontSize(32)
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
      doc.setFont("times", "bold")
      doc.text("THANK YOU", pageWidth / 2, pageHeight / 2 - 20, { align: "center" })

      doc.setFontSize(10)
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.setFont("times", "italic")
      doc.text("For supporting traditional craftsmanship", pageWidth / 2, pageHeight / 2, { align: "center" })
      doc.text("and cultural preservation", pageWidth / 2, pageHeight / 2 + 6, { align: "center" })

      doc.setFontSize(7)
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
      doc.setFont("helvetica", "normal")
      doc.text("Thai Tribal Craft Catalogue", pageWidth / 2, pageHeight / 2 + 20, { align: "center" })

      const pdfOutput = doc.output("arraybuffer")
      resolve(Buffer.from(pdfOutput))
    } catch (error) {
      console.log("[v0] PDF generation error:", error)
      reject(error)
    }
  })
}
