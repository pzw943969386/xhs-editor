"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Upload, Download } from "lucide-react"

interface TextStyle {
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  color: string
}

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 800 // 3:4 ratio

const FONT_OPTIONS = [
  { value: "Inter, sans-serif", label: "默认无衬线" },
  { value: "Georgia, serif", label: "衬线体" },
  { value: "Courier New, monospace", label: "等宽字体" },
  { value: "Comic Sans MS, cursive", label: "手写体" },
  { value: "Impact, fantasy", label: "粗体" },
]

export function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  const [title, setTitle] = useState<TextStyle>({
    text: "",
    x: 50,
    y: 100,
    fontSize: 48,
    fontFamily: "Inter, sans-serif",
    color: "#ffffff",
  })

  const [content, setContent] = useState<TextStyle>({
    text: "",
    x: 50,
    y: 200,
    fontSize: 24,
    fontFamily: "Inter, sans-serif",
    color: "#ffffff",
  })

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw background
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw image if exists
    if (image) {
      const scale = Math.max(CANVAS_WIDTH / image.width, CANVAS_HEIGHT / image.height)
      const x = (CANVAS_WIDTH - image.width * scale) / 2
      const y = (CANVAS_HEIGHT - image.height * scale) / 2
      ctx.drawImage(image, x, y, image.width * scale, image.height * scale)
    }

    // Draw title
    if (title.text) {
      ctx.font = `${title.fontSize}px ${title.fontFamily}`
      ctx.fillStyle = title.color
      ctx.textBaseline = "top"

      // Add text shadow for better visibility
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      ctx.fillText(title.text, title.x, title.y)

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

    // Draw content
    if (content.text) {
      ctx.font = `${content.fontSize}px ${content.fontFamily}`
      ctx.fillStyle = content.color
      ctx.textBaseline = "top"

      // Add text shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      // Handle multi-line text
      const lines = content.text.split("\n")
      lines.forEach((line, index) => {
        ctx.fillText(line, content.x, content.y + index * (content.fontSize + 10))
      })

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
  }, [image, title, content])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleExport = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `edited-image-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, "image/png")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">图文编辑工具</h1>
        <p className="text-muted-foreground">上传图片，添加自定义文字，导出您的作品</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Canvas Preview */}
        <div className="flex flex-col items-center">
          <Card className="p-4 bg-card">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border border-border rounded-lg max-w-full h-auto"
            />
          </Card>

          <div className="mt-4 flex gap-3">
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              上传图片
            </Button>
            <Button onClick={handleExport} disabled={!image} className="gap-2">
              <Download className="w-4 h-4" />
              导出图片
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Right: Control Panel */}
        <div className="space-y-6">
          {/* Title Section */}
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">标题设置</h2>

            <div className="space-y-2">
              <Label htmlFor="title-text">标题文字</Label>
              <Input
                id="title-text"
                value={title.text}
                onChange={(e) => setTitle({ ...title, text: e.target.value })}
                placeholder="输入标题..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title-x">X 坐标: {title.x}px</Label>
                <Slider
                  id="title-x"
                  min={0}
                  max={CANVAS_WIDTH - 100}
                  step={1}
                  value={[title.x]}
                  onValueChange={([value]) => setTitle({ ...title, x: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title-y">Y 坐标: {title.y}px</Label>
                <Slider
                  id="title-y"
                  min={0}
                  max={CANVAS_HEIGHT - 100}
                  step={1}
                  value={[title.y]}
                  onValueChange={([value]) => setTitle({ ...title, y: value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title-size">字体大小: {title.fontSize}px</Label>
                <Slider
                  id="title-size"
                  min={12}
                  max={72}
                  step={1}
                  value={[title.fontSize]}
                  onValueChange={([value]) => setTitle({ ...title, fontSize: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title-color">颜色</Label>
                <Input
                  id="title-color"
                  type="color"
                  value={title.color}
                  onChange={(e) => setTitle({ ...title, color: e.target.value })}
                  className="h-10 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title-font">字体</Label>
              <select
                id="title-font"
                value={title.fontFamily}
                onChange={(e) => setTitle({ ...title, fontFamily: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Content Section */}
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">内容设置</h2>

            <div className="space-y-2">
              <Label htmlFor="content-text">内容文字</Label>
              <Textarea
                id="content-text"
                value={content.text}
                onChange={(e) => setContent({ ...content, text: e.target.value })}
                placeholder="输入内容..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-x">X 坐标: {content.x}px</Label>
                <Slider
                  id="content-x"
                  min={0}
                  max={CANVAS_WIDTH - 100}
                  step={1}
                  value={[content.x]}
                  onValueChange={([value]) => setContent({ ...content, x: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-y">Y 坐标: {content.y}px</Label>
                <Slider
                  id="content-y"
                  min={0}
                  max={CANVAS_HEIGHT - 100}
                  step={1}
                  value={[content.y]}
                  onValueChange={([value]) => setContent({ ...content, y: value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-size">字体大小: {content.fontSize}px</Label>
                <Slider
                  id="content-size"
                  min={12}
                  max={72}
                  step={1}
                  value={[content.fontSize]}
                  onValueChange={([value]) => setContent({ ...content, fontSize: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-color">颜色</Label>
                <Input
                  id="content-color"
                  type="color"
                  value={content.color}
                  onChange={(e) => setContent({ ...content, color: e.target.value })}
                  className="h-10 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-font">字体</Label>
              <select
                id="content-font"
                value={content.fontFamily}
                onChange={(e) => setContent({ ...content, fontFamily: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
