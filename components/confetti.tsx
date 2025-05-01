"use client"

import { useEffect, useState } from "react"
import ReactConfetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-window-size"

export default function Confetti() {
  const { width, height } = useWindowSize()
  const [pieces, setPieces] = useState(200)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPieces(0)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <ReactConfetti
      width={width}
      height={height}
      numberOfPieces={pieces}
      recycle={false}
      colors={["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#22c55e"]}
    />
  )
}
