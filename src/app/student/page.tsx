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
}

export default function StudentPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [queue, setQueue] = useState<Queue | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*')
      if (error) {
        console.error('Error fetching categories:', error)
      } else {
        setCategories(data)
      }
    }

    fetchCategories()
  }, [])

  // Handle student taking a number
  const takeNumber = async (category: Category) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('take_queue_number', {
      category_prefix: category.prefix,
    })

    if (error) {
      console.error('Error taking queue number:', error)
    } else {
      setQueue(data)
    }

    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Student Queue System</h1>

      {queue ? (
        <div className="p-4 rounded-lg bg-green-100">
          <h2 className="text-xl font-semibold mb-2">Your Queue</h2>
          <p className="mb-1">
            <strong>Number:</strong> {queue.prefix}-{queue.number}
          </p>
          <p>
            <strong>Status:</strong> {queue.status}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4">Select a category to take your queue number:</p>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="p-4 rounded-lg shadow bg-white flex justify-between items-center"
              >
                <span>{cat.name}</span>
                <button
                  onClick={() => takeNumber(cat)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  disabled={loading}
                >
                  {loading ? 'Please wait…' : 'Take Number'}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
