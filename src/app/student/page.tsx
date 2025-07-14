"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Category = {
  id: number
  name: string
}

export default function Kiosk() {
  const [categories, setCategories] = useState<Category[]>([])
  const [queueTaken, setQueueTaken] = useState(false)
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select()
      if (!error) setCategories(data)
    }

    const fetchCurrentQueue = async () => {
      const { data, error } = await supabase
        .from("queues")
        .select("number")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!error && data) setCurrentNumber(data.number)
    }

    fetchCategories()
    fetchCurrentQueue()
  }, [])

  const handleTakeQueue = async (categoryId: number) => {
    const { error } = await supabase.from("queues").insert([
      {
        category_id: categoryId,
        status: "waiting",
      },
    ])
    if (!error) setQueueTaken(true)
  }

  if (queueTaken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-green-800">
        <h1 className="text-5xl font-bold mb-6">🎉 Queue Taken!</h1>
        <p className="text-2xl">Please wait for your number to be called.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      <h1 className="text-4xl font-bold mb-8 text-blue-900">Welcome! Take Your Queue</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            className="bg-blue-600 text-white text-2xl px-6 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition"
            onClick={() => handleTakeQueue(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {currentNumber !== null && (
        <div className="mt-10 text-2xl text-blue-800">
          Current Number: <span className="font-bold">{currentNumber}</span>
        </div>
      )}
    </div>
  )
}
