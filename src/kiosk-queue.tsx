"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Users, Clock } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

// Placeholder Supabase functions
const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  return data
}


const postQueueEntry = async (categoryId: number) => {
  const { data, error } = await supabase
    .from('queues')
    .insert([{ category_id: categoryId }])
    .single()

  if (error) {
    console.error("Error creating queue entry:", error)
    return { success: false }
  }

  return { success: true, queueNumber: data.id }
}


const getCurrentNumber = async () => {
  const { data, error } = await supabase
    .from('queues')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    console.error("Error fetching current number:", error)
    return 0
  }

  return data.id
}


export default function Component() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "confirmation">("welcome")
  const [categories, setCategories] = useState<any[]>([])
  const [currentNumber, setCurrentNumber] = useState<number>(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [queueNumber, setQueueNumber] = useState<number>(0)

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      const categoriesData = await fetchCategories()
      const currentNum = await getCurrentNumber()
      setCategories(categoriesData)
      setCurrentNumber(currentNum)
    }
    loadData()

    // Update current number every 30 seconds
    const interval = setInterval(async () => {
      const currentNum = await getCurrentNumber()
      setCurrentNumber(currentNum)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleCategorySelect = async (category: any) => {
    setSelectedCategory(category.name)
    const result = await postQueueEntry(category.id)
    if (result.success) {
      setQueueNumber(result.queueNumber)
      setCurrentScreen("confirmation")

      // Auto return to welcome screen after 8 seconds
      setTimeout(() => {
        setCurrentScreen("welcome")
      }, 8000)
    }
  }

  if (currentScreen === "confirmation") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-4xl mx-auto shadow-lg border-0">
          <CardContent className="p-16 text-center">
            <div className="mb-8">
              <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
            </div>
            <h1 className="text-5xl font-light text-gray-800 mb-8">Queue Number Assigned</h1>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-8">
              <div className="text-2xl text-gray-600 mb-4">Service Category</div>
              <div className="text-3xl font-medium text-gray-800 mb-6">{selectedCategory}</div>
              <div className="text-2xl text-gray-600 mb-4">Your Queue Number</div>
              <div className="text-7xl font-light text-blue-600 mb-4">{queueNumber}</div>
            </div>
            <p className="text-2xl text-gray-600 mb-8">Please wait for your number to be called</p>
            <div className="flex items-center justify-center text-lg text-gray-500">
              <Clock className="w-5 h-5 mr-2" />
              Returning to main screen shortly...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <h1 className="text-6xl font-light text-gray-800 mb-4">Queue Management System</h1>
            <p className="text-2xl text-gray-600">Please select your service category</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Category Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-blue-300 text-left p-8 h-auto min-h-[180px] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-start justify-center"
              variant="outline"
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <div className="text-2xl font-medium mb-2">{category.name}</div>
              <div className="text-lg text-gray-600">{category.description}</div>
            </Button>
          ))}
        </div>

        {/* Current Number Display */}
        <Card className="bg-white shadow-sm border-2 border-gray-200">
          <CardContent className="p-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-12 h-12 text-blue-600 mr-6" />
                <div>
                  <h3 className="text-3xl font-medium text-gray-800 mb-2">Now Serving</h3>
                  <p className="text-xl text-gray-600">Current queue number</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-8xl font-light text-blue-600 leading-none">{currentNumber}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Instructions */}
        <div className="text-center mt-12">
          <p className="text-xl text-gray-600">Touch a service category above to receive your queue number</p>
        </div>
      </div>
    </div>
  )
}
