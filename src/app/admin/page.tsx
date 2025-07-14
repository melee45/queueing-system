'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Queue = {
  id: string
  number: number
  prefix: string
  category: string
  status: string
  created_at: string
}

export default function AdminPage() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQueues = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching queues:', error.message)
      } else {
        setQueues(data)
      }
      setLoading(false)
    }

    fetchQueues()

    const subscription = supabase
      .channel('queues-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queues' },
        () => fetchQueues()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('queues')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      console.error('Error updating status:', error.message)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {loading ? (
        <p>Loading queues…</p>
      ) : (
        <ul className="space-y-2">
          {queues.map((queue) => (
            <li
              key={queue.id}
              className="p-4 rounded-lg shadow bg-white flex justify-between items-center"
            >
              <span>{`${queue.prefix}-${queue.number} (${queue.category})`}</span>
              <div className="space-x-2">
                <button
                  onClick={() => updateStatus(queue.id, 'served')}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Mark Served
                </button>
                <button
                  onClick={() => updateStatus(queue.id, 'skipped')}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Skip
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
