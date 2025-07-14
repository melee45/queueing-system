'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Category = {
  id: number
  name: string
  prefix: string
}

type Queue = {
  id: string
  number: number
  prefix: string
  category: string
  status: string
  created_at: string
}

export default function StudentPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [queue, setQueue] = useState<Queue | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*')
    if (error) {
      console.error('Error fetching categories:', error.message)
    } else {
      setCategories(data || [])
    }
  }

  async function getQueueNumber() {
    if (!selectedCategory) return

    setLoading(true)

    // Get prefix of selected category
    const category = categories.find((c) => c.name === selectedCategory)
    if (!category) {
      console.error('Selected category not found')
      setLoading(false)
      return
    }

    // Get latest queue number for the prefix
    const { data: lastQueue, error: lastError } = await supabase
      .from('queues')
      .select('number')
      .eq('prefix', category.prefix)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let nextNumber = 1
    if (lastQueue && lastQueue.number) {
      nextNumber = lastQueue.number + 1
    }

    // Insert new queue record
    const { data, error } = await supabase.from('queues').insert([
      {
        number: nextNumber,
        prefix: category.prefix,
        category: selectedCategory,
        status: 'waiting',
      },
    ]).select().single()

    if (error) {
      console.error('Error creating queue:', error.message)
    } else {
      setQueue(data)
    }

    setLoading(false)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Student Queueing System</h1>

      {!queue ? (
        <div className="space-y-4">
          <label className="block text-lg font-medium">
            Select your department:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded p-2 w-64"
          >
            <option value="">-- Choose --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            onClick={getQueueNumber}
            disabled={!selectedCategory || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Processing…' : 'Get My Queue Number'}
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-xl">Your Queue Number:</p>
          <div className="text-5xl font-bold">
            {queue.prefix}-{queue.number}
          </div>
          <p className="text-lg text-gray-600">
            Status: <span className="font-semibold">{queue.status}</span>
          </p>
          <button
            onClick={() => setQueue(null)}
            className="mt-4 bg-gray-500 text-white px-3 py-1 rounded"
          >
            Start Over
          </button>
        </div>
      )}
    </main>
  )
}
