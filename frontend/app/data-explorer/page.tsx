"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import NavBar from "@/components/nav-bar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart,
  Download,
  Upload,
  FileText,
  Table,
  Filter,
  Trash2,
  BarChart2,
  PieChartIcon,
  LineChartIcon,
  ScatterChartIcon as ScatterPlot,
  AlertTriangle,
  Info,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

// Import libraries for data processing and visualization
import Papa from "papaparse"
import { Chart, registerables } from "chart.js"
Chart.register(...registerables)

export default function DataExplorerPage() {
  // State for file upload and data
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [cleanedData, setCleanedData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [dataStats, setDataStats] = useState<any>(null)
  const [chartType, setChartType] = useState<string>("bar")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [outliers, setOutliers] = useState<any[]>([])
  const [outlierMethod, setOutlierMethod] = useState<string>("zscore")
  const [outlierThreshold, setOutlierThreshold] = useState<number>(2.0)
  const [duplicateCount, setDuplicateCount] = useState<number>(0)
  const [naCount, setNaCount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingMessage, setProcessingMessage] = useState<string>("")
  const [chartOptions, setChartOptions] = useState<any>({
    xAxis: "",
    yAxis: "",
    groupBy: "",
    aggregation: "sum",
  })

  // Add these new state variables at the top with the other state declarations
  const [naFillMethod, setNaFillMethod] = useState<string>("remove")
  const [selectedDuplicateColumns, setSelectedDuplicateColumns] = useState<string[]>([])

  // Refs for chart canvases
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const lineChartRef = useRef<HTMLCanvasElement>(null)
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const scatterChartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  // Sample datasets
  const sampleDatasets = [
    { name: "Bank Marketing Campaign", file: "bank_marketing_campaign.csv" },
    { name: "Online Retail Data", file: "online_retail_data.csv" },
    { name: "Health Data", file: "tb_illness_data.csv" },
  ]

  // Function to handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const uploadedFile = files[0]
      setFile(uploadedFile)
      setFileName(uploadedFile.name)
      parseFile(uploadedFile)
    }
  }

  // Function to handle sample dataset selection
  const handleSampleDataset = (datasetFile: string) => {
    setFileName(datasetFile)
    setProcessingMessage(`Loading sample dataset: ${datasetFile}...`)
    setIsProcessing(true)

    // Simulate loading sample data
    setTimeout(() => {
      // Generate sample data based on the selected dataset
      const sampleData: any[] = []

      if (datasetFile === "bank_marketing_campaign.csv") {
        // Generate bank marketing campaign sample data
        const educationLevels = ["primary", "secondary", "tertiary", "unknown"]
        const jobs = [
          "admin.",
          "blue-collar",
          "entrepreneur",
          "housemaid",
          "management",
          "retired",
          "self-employed",
          "services",
          "student",
          "technician",
          "unemployed",
          "unknown",
        ]
        const maritalStatus = ["married", "single", "divorced"]
        const outcomes = ["yes", "no"]

        for (let i = 0; i < 100; i++) {
          sampleData.push({
            age: Math.floor(Math.random() * 60) + 18,
            job: jobs[Math.floor(Math.random() * jobs.length)],
            marital: maritalStatus[Math.floor(Math.random() * maritalStatus.length)],
            education: educationLevels[Math.floor(Math.random() * educationLevels.length)],
            default: Math.random() > 0.9 ? "yes" : "no",
            balance: Math.floor(Math.random() * 50000),
            housing: Math.random() > 0.5 ? "yes" : "no",
            loan: Math.random() > 0.7 ? "yes" : "no",
            contact: Math.random() > 0.5 ? "cellular" : "telephone",
            duration: Math.floor(Math.random() * 1000) + 10,
            campaign: Math.floor(Math.random() * 10) + 1,
            pdays: Math.floor(Math.random() * 999),
            previous: Math.floor(Math.random() * 5),
            poutcome: Math.random() > 0.7 ? "success" : "failure",
            y: outcomes[Math.floor(Math.random() * outcomes.length)],
          })
        }
      } else if (datasetFile === "online_retail_data.csv") {
        // Generate online retail sample data
        const countries = [
          "United Kingdom",
          "Germany",
          "France",
          "Spain",
          "Netherlands",
          "Belgium",
          "Switzerland",
          "Portugal",
          "Australia",
          "USA",
        ]
        const products = [
          { id: "85123A", desc: "WHITE HANGING HEART T-LIGHT HOLDER", price: 2.55 },
          { id: "71053", desc: "WHITE METAL LANTERN", price: 3.39 },
          { id: "84406B", desc: "CREAM CUPID HEARTS COAT HANGER", price: 2.75 },
          { id: "84029G", desc: "KNITTED UNION FLAG HOT WATER BOTTLE", price: 3.39 },
          { id: "84029E", desc: "RED WOOLLY HOTTIE WHITE HEART", price: 3.39 },
          { id: "22752", desc: "SET 7 BABUSHKA NESTING BOXES", price: 7.65 },
          { id: "21730", desc: "GLASS STAR FROSTED T-LIGHT HOLDER", price: 4.25 },
        ]

        for (let i = 0; i < 100; i++) {
          const product = products[Math.floor(Math.random() * products.length)]
          const quantity = Math.floor(Math.random() * 10) + 1
          const date = new Date(2021, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
          const hour = Math.floor(Math.random() * 12) + 8 // 8 AM to 8 PM

          sampleData.push({
            InvoiceNo: `INV${Math.floor(Math.random() * 100000)}`,
            StockCode: product.id,
            Description: product.desc,
            Quantity: quantity,
            InvoiceDate: date.toISOString().split("T")[0],
            InvoiceTime: `${hour}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")}`,
            UnitPrice: product.price,
            CustomerID: Math.floor(Math.random() * 10000) + 10000,
            Country: countries[Math.floor(Math.random() * countries.length)],
            TotalValue: (quantity * product.price).toFixed(2),
          })
        }
      } else {
        // Generate health data sample
        const countries = ["Ghana", "Nigeria", "Kenya", "South Africa", "Ethiopia", "Tanzania", "Uganda", "Zambia"]
        const years = [2018, 2019, 2020, 2021, 2022]

        for (let i = 0; i < 100; i++) {
          const country = countries[Math.floor(Math.random() * countries.length)]
          const year = years[Math.floor(Math.random() * years.length)]

          sampleData.push({
            country: country,
            year: year,
            population: Math.floor(Math.random() * 50000000) + 1000000,
            cases: Math.floor(Math.random() * 50000),
            deaths: Math.floor(Math.random() * 5000),
            recovery_rate: (Math.random() * 0.3 + 0.6).toFixed(2),
            vaccination_rate: (Math.random() * 0.7).toFixed(2),
            healthcare_spending: Math.floor(Math.random() * 500) + 100,
            hospital_beds_per_1000: (Math.random() * 3 + 0.5).toFixed(1),
          })
        }
      }

      setData(sampleData)
      setCleanedData(sampleData)
      setColumns(Object.keys(sampleData[0] || {}))
      calculateStats(sampleData)
      setIsProcessing(false)
      setActiveTab("clean")
    }, 1000)
  }

  // Function to parse CSV file
  const parseFile = (file: File) => {
    setProcessingMessage("Parsing file...")
    setIsProcessing(true)

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsedData = results.data as any[]
        // Filter out empty rows
        const filteredData = parsedData.filter((row) =>
          Object.values(row).some((value) => value !== null && value !== ""),
        )

        setData(filteredData)
        setCleanedData(filteredData)
        setColumns(Object.keys(filteredData[0] || {}))
        calculateStats(filteredData)
        setIsProcessing(false)
        setActiveTab("clean")
      },
      error: (error) => {
        console.error("Error parsing CSV:", error)
        setIsProcessing(false)
        alert("Error parsing file. Please check the file format.")
      },
    })
  }

  // Function to calculate data statistics
  const calculateStats = (data: any[]) => {
    if (!data.length) return

    const stats: any = {}
    const columnsToAnalyze = Object.keys(data[0])

    // Track missing values per column
    const missingByColumn: { [key: string]: number } = {}

    columnsToAnalyze.forEach((column) => {
      const values = data.map((row) => row[column]).filter((val) => val !== null && val !== undefined && val !== "")

      // Count missing values for this column
      missingByColumn[column] = data.length - values.length

      // Check if values are numeric
      const isNumeric = values.every((val) => typeof val === "number")

      if (isNumeric && values.length) {
        // Calculate numeric statistics
        const numValues = values as number[]
        stats[column] = {
          type: "numeric",
          count: numValues.length,
          min: Math.min(...numValues),
          max: Math.max(...numValues),
          mean: numValues.reduce((sum, val) => sum + val, 0) / numValues.length,
          median: calculateMedian(numValues),
          missing: data.length - numValues.length,
        }
      } else {
        // Calculate categorical statistics
        const frequencies: { [key: string]: number } = {}
        values.forEach((val) => {
          const strVal = String(val)
          frequencies[strVal] = (frequencies[strVal] || 0) + 1
        })

        // Find mode (most common value)
        let mode = ""
        let maxFreq = 0
        Object.entries(frequencies).forEach(([val, freq]) => {
          if (freq > maxFreq) {
            maxFreq = freq
            mode = val
          }
        })

        stats[column] = {
          type: "categorical",
          count: values.length,
          unique: Object.keys(frequencies).length,
          mostCommon: Object.entries(frequencies).sort((a, b) => b[1] - a[1])[0]?.[0] || "",
          mode: mode,
          frequencies: frequencies,
          missing: data.length - values.length,
        }
      }
    })

    setDataStats(stats)

    // Count rows with at least one NA value
    let rowsWithNA = 0
    data.forEach((row) => {
      if (Object.values(row).some((val) => val === null || val === undefined || val === "")) {
        rowsWithNA++
      }
    })
    setNaCount(rowsWithNA)

    // Count potential duplicates
    const stringifiedRows = data.map((row) => JSON.stringify(row))
    const uniqueRows = new Set(stringifiedRows)
    setDuplicateCount(data.length - uniqueRows.size)
  }

  // Helper function to calculate median
  const calculateMedian = (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2
    }

    return sorted[middle]
  }

  // Function to remove NA values
  const removeNAValues = () => {
    setProcessingMessage("Handling missing values...")
    setIsProcessing(true)

    setTimeout(() => {
      const fillMethod = naFillMethod
      const cleaned = [...cleanedData]

      // For each column with missing values
      columns.forEach((column) => {
        if (!dataStats[column]) return

        // Skip if no missing values in this column
        if (dataStats[column].missing === 0) return

        // Get fill value based on method and column type
        let fillValue = null

        if (fillMethod === "remove") {
          // We'll handle row removal separately
        } else if (dataStats[column].type === "numeric") {
          if (fillMethod === "mean") {
            fillValue = dataStats[column].mean
          } else if (fillMethod === "median") {
            fillValue = dataStats[column].median
          } else if (fillMethod === "zero") {
            fillValue = 0
          }
        } else {
          // For categorical data
          if (fillMethod === "mode") {
            fillValue = dataStats[column].mode
          } else if (fillMethod === "empty") {
            fillValue = ""
          }
        }

        // Apply fill value to each row if not removing
        if (fillMethod !== "remove" && fillValue !== null) {
          cleaned.forEach((row, index) => {
            if (row[column] === null || row[column] === undefined || row[column] === "") {
              cleaned[index] = { ...row, [column]: fillValue }
            }
          })
        }
      })

      // If method is remove, filter out rows with any NA values
      if (fillMethod === "remove") {
        const filteredData = cleaned.filter(
          (row) => !Object.values(row).some((val) => val === null || val === undefined || val === ""),
        )
        setCleanedData(filteredData)
      } else {
        setCleanedData(cleaned)
      }

      calculateStats(cleanedData)
      setIsProcessing(false)
    }, 500)
  }

  // Function to remove duplicate rows
  const removeDuplicates = () => {
    if (!selectedDuplicateColumns.length) {
      alert("Please select at least one column to check for duplicates")
      return
    }

    setProcessingMessage("Removing duplicate rows...")
    setIsProcessing(true)

    setTimeout(() => {
      // If we're checking all columns, use the original method
      if (selectedDuplicateColumns.length === columns.length) {
        const stringifiedRows = cleanedData.map((row) => JSON.stringify(row))
        const uniqueIndices = new Set<number>()

        stringifiedRows.forEach((str, index) => {
          if (stringifiedRows.indexOf(str) === index) {
            uniqueIndices.add(index)
          }
        })

        const uniqueData = Array.from(uniqueIndices).map((index) => cleanedData[index])
        setCleanedData(uniqueData)
      } else {
        // If we're checking specific columns, create a key based on those columns
        const seen = new Map<string, number>()
        const uniqueData: any[] = []

        cleanedData.forEach((row, index) => {
          // Create a key from the selected columns
          const key = selectedDuplicateColumns
            .map((col) => (row[col] !== undefined && row[col] !== null ? String(row[col]) : ""))
            .join("||")

          // If we haven't seen this key before, add it to our unique data
          if (!seen.has(key)) {
            seen.set(key, index)
            uniqueData.push(row)
          }
        })

        setCleanedData(uniqueData)
      }

      calculateStats(cleanedData)
      setIsProcessing(false)
    }, 500)
  }

  // Function to detect outliers
  const detectOutliers = () => {
    setProcessingMessage("Detecting outliers...")
    setIsProcessing(true)

    setTimeout(() => {
      const outlierResults: any[] = []

      columns.forEach((column) => {
        if (dataStats[column]?.type === "numeric") {
          const values = cleanedData.map((row) => row[column]).filter((val) => typeof val === "number")

          if (outlierMethod === "zscore") {
            // Z-score method
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length
            const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)

            cleanedData.forEach((row, index) => {
              const value = row[column]
              if (typeof value === "number") {
                const zScore = Math.abs((value - mean) / stdDev)
                if (zScore > outlierThreshold) {
                  outlierResults.push({
                    rowIndex: index,
                    column,
                    value,
                    zScore,
                    method: "zscore",
                  })
                }
              }
            })
          } else {
            // IQR method
            const sorted = [...values].sort((a, b) => a - b)
            const q1Index = Math.floor(sorted.length * 0.25)
            const q3Index = Math.floor(sorted.length * 0.75)
            const q1 = sorted[q1Index]
            const q3 = sorted[q3Index]
            const iqr = q3 - q1
            const lowerBound = q1 - outlierThreshold * iqr
            const upperBound = q3 + outlierThreshold * iqr

            cleanedData.forEach((row, index) => {
              const value = row[column]
              if (typeof value === "number" && (value < lowerBound || value > upperBound)) {
                outlierResults.push({
                  rowIndex: index,
                  column,
                  value,
                  lowerBound,
                  upperBound,
                  method: "iqr",
                })
              }
            })
          }
        }
      })

      setOutliers(outlierResults)
      setIsProcessing(false)
    }, 500)
  }

  // Function to remove outliers
  const removeOutliers = () => {
    if (!outliers.length) return

    setProcessingMessage("Removing outliers...")
    setIsProcessing(true)

    setTimeout(() => {
      // Get unique row indices to remove
      const rowsToRemove = new Set(outliers.map((o) => o.rowIndex))

      // Filter out those rows
      const filteredData = cleanedData.filter((_, index) => !rowsToRemove.has(index))

      setCleanedData(filteredData)
      calculateStats(filteredData)
      setOutliers([])
      setIsProcessing(false)
    }, 500)
  }

  // Function to generate chart
  const generateChart = () => {
    if (!chartOptions.xAxis || !chartOptions.yAxis) {
      alert("Please select both X and Y axes for the chart")
      return
    }

    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    // Prepare data for chart
    const chartData: any = {}
    let labels: string[] = []
    let datasets: any[] = []

    if (chartOptions.groupBy) {
      // Group data by the selected column
      const groupedData: { [key: string]: any[] } = {}

      cleanedData.forEach((row) => {
        const groupValue = String(row[chartOptions.groupBy])
        if (!groupedData[groupValue]) {
          groupedData[groupValue] = []
        }
        groupedData[groupValue].push(row)
      })

      // Get unique x-axis values
      labels = Array.from(new Set(cleanedData.map((row) => String(row[chartOptions.xAxis]))))

      // Create datasets for each group
      Object.entries(groupedData).forEach(([groupName, groupRows], index) => {
        const dataByX: { [key: string]: number[] } = {}

        // Initialize data structure
        labels.forEach((label) => {
          dataByX[label] = []
        })

        // Populate data
        groupRows.forEach((row) => {
          const xValue = String(row[chartOptions.xAxis])
          const yValue = Number(row[chartOptions.yAxis])

          if (!isNaN(yValue)) {
            dataByX[xValue].push(yValue)
          }
        })

        // Aggregate data based on selected method
        const aggregatedData = labels.map((label) => {
          const values = dataByX[label]
          if (!values.length) return 0

          switch (chartOptions.aggregation) {
            case "sum":
              return values.reduce((sum, val) => sum + val, 0)
            case "avg":
              return values.reduce((sum, val) => sum + val, 0) / values.length
            case "max":
              return Math.max(...values)
            case "min":
              return Math.min(...values)
            default:
              return values.reduce((sum, val) => sum + val, 0)
          }
        })

        // Generate a color based on index
        const hue = (index * 137) % 360
        const color = `hsl(${hue}, 70%, 60%)`

        datasets.push({
          label: groupName,
          data: aggregatedData,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
        })
      })
    } else {
      // Simple chart without grouping
      const dataMap = new Map<string, number>()

      cleanedData.forEach((row) => {
        const xValue = String(row[chartOptions.xAxis])
        const yValue = Number(row[chartOptions.yAxis])

        if (!isNaN(yValue)) {
          if (!dataMap.has(xValue)) {
            dataMap.set(xValue, 0)
          }

          const currentValue = dataMap.get(xValue) || 0

          switch (chartOptions.aggregation) {
            case "sum":
              dataMap.set(xValue, currentValue + yValue)
              break
            case "avg":
              // For average, we'll need to track count separately
              // This is simplified for now
              dataMap.set(xValue, currentValue + yValue)
              break
            case "max":
              dataMap.set(xValue, Math.max(currentValue, yValue))
              break
            case "min":
              if (currentValue === 0) {
                dataMap.set(xValue, yValue)
              } else {
                dataMap.set(xValue, Math.min(currentValue, yValue))
              }
              break
            default:
              dataMap.set(xValue, currentValue + yValue)
          }
        }
      })

      labels = Array.from(dataMap.keys())
      const data = Array.from(dataMap.values())

      // Generate colors for pie chart
      const backgroundColors = labels.map((_, index) => {
        const hue = (index * 137) % 360
        return `hsl(${hue}, 70%, 60%)`
      })

      datasets = [
        {
          label: chartOptions.yAxis,
          data: data,
          backgroundColor: chartType === "pie" ? backgroundColors : "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ]
    }

    // Get the appropriate canvas
    let canvas: HTMLCanvasElement | null = null

    switch (chartType) {
      case "bar":
        canvas = barChartRef.current
        break
      case "line":
        canvas = lineChartRef.current
        break
      case "pie":
        canvas = pieChartRef.current
        break
      case "scatter":
        canvas = scatterChartRef.current
        break
      default:
        canvas = barChartRef.current
    }

    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create chart
    chartInstanceRef.current = new Chart(ctx, {
      type: chartType === "scatter" ? "scatter" : (chartType as any),
      data: {
        labels: chartType === "scatter" ? null : labels,
        datasets:
          chartType === "scatter"
            ? [
                {
                  label: "Data Points",
                  data: cleanedData.map((row) => ({
                    x: row[chartOptions.xAxis],
                    y: row[chartOptions.yAxis],
                  })),
                  backgroundColor: "rgba(54, 162, 235, 0.5)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
                },
              ]
            : datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales:
          chartType !== "pie"
            ? {
                x: {
                  title: {
                    display: true,
                    text: chartOptions.xAxis,
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: chartOptions.yAxis,
                  },
                },
              }
            : undefined,
        plugins: {
          title: {
            display: true,
            text: `${chartOptions.yAxis} by ${chartOptions.xAxis}${chartOptions.groupBy ? ` grouped by ${chartOptions.groupBy}` : ""}`,
          },
          legend: {
            display: true,
          },
        },
      },
    })
  }

  // Function to download cleaned data as CSV
  const downloadCSV = () => {
    if (!cleanedData.length) return

    const csv = Papa.unparse(cleanedData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `cleaned_${fileName || "data"}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reset chart when changing chart type
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
      chartInstanceRef.current = null
    }
  }, [chartType])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="mt-8">
        <h1 className="text-3xl font-bold mb-6">Data Explorer</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="upload" className="text-lg py-3">
              <Upload className="mr-2 h-5 w-5" />
              Upload Data
            </TabsTrigger>
            <TabsTrigger value="clean" className="text-lg py-3" disabled={!data.length}>
              <FileText className="mr-2 h-5 w-5" />
              Clean Data
            </TabsTrigger>
            <TabsTrigger value="visualize" className="text-lg py-3" disabled={!data.length}>
              <BarChart className="mr-2 h-5 w-5" />
              Visualize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0">
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Upload Your Data</h2>
                  <p className="text-gray-600 mb-6">
                    Upload a CSV file to analyze, clean, and visualize your data. The tool supports various data
                    operations to help you prepare your data for analysis.
                  </p>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <Input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500 mt-1">CSV files supported</p>
                      </div>
                    </Label>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Try Sample Datasets</h2>
                  <p className="text-gray-600 mb-6">
                    Don't have a dataset? Try one of our sample datasets to explore the features of the Data Explorer.
                  </p>

                  <div className="space-y-4">
                    {sampleDatasets.map((dataset, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => handleSampleDataset(dataset.file)}
                      >
                        <div className="flex items-center">
                          <Table className="h-8 w-8 text-blue-500 mr-3" />
                          <div>
                            <h3 className="font-medium">{dataset.name}</h3>
                            <p className="text-sm text-gray-500">{dataset.file}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="clean" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 col-span-1">
                <h2 className="text-xl font-semibold mb-4">Data Cleaning Tools</h2>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="data-summary">
                    <AccordionTrigger className="text-base font-medium">
                      <Info className="h-5 w-5 mr-2" />
                      Data Summary
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rows:</span>
                          <span className="font-medium">{cleanedData.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Columns:</span>
                          <span className="font-medium">{columns.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Missing Values:</span>
                          <span className="font-medium">{naCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duplicate Rows:</span>
                          <span className="font-medium">{duplicateCount}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="missing-values">
                    <AccordionTrigger className="text-base font-medium">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Handle Missing Values
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 mt-2">
                        <p className="text-sm text-gray-600">
                          {naCount} rows with missing values found in the dataset.
                        </p>

                        <div className="space-y-2">
                          <Label htmlFor="na-fill-method">Fill Method</Label>
                          <Select value={naFillMethod} onValueChange={(value) => setNaFillMethod(value)}>
                            <SelectTrigger id="na-fill-method">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remove">Remove Rows</SelectItem>
                              <SelectItem value="mean">Fill Numeric with Mean</SelectItem>
                              <SelectItem value="median">Fill Numeric with Median</SelectItem>
                              <SelectItem value="mode">Fill Categorical with Mode</SelectItem>
                              <SelectItem value="zero">Fill Numeric with Zero</SelectItem>
                              <SelectItem value="empty">Fill Categorical with Empty String</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button onClick={removeNAValues} disabled={naCount === 0} className="w-full">
                          Apply Missing Value Handling
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="duplicates">
                    <AccordionTrigger className="text-base font-medium">
                      <Filter className="h-5 w-5 mr-2" />
                      Remove Duplicates
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 mt-2">
                        <p className="text-sm text-gray-600">{duplicateCount} duplicate rows found in the dataset.</p>

                        <div className="space-y-2">
                          <Label>Select Columns to Check for Duplicates</Label>
                          <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                            {columns.map((column, index) => (
                              <div key={index} className="flex items-center space-x-2 py-1">
                                <input
                                  type="checkbox"
                                  id={`dup-col-${index}`}
                                  checked={selectedDuplicateColumns.includes(column)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDuplicateColumns([...selectedDuplicateColumns, column])
                                    } else {
                                      setSelectedDuplicateColumns(
                                        selectedDuplicateColumns.filter((col) => col !== column),
                                      )
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor={`dup-col-${index}`} className="text-sm cursor-pointer">
                                  {column}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <div className="flex space-x-2 mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDuplicateColumns(columns)}
                              className="text-xs"
                            >
                              Select All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDuplicateColumns([])}
                              className="text-xs"
                            >
                              Clear All
                            </Button>
                          </div>
                        </div>

                        <Button
                          onClick={removeDuplicates}
                          disabled={duplicateCount === 0 || selectedDuplicateColumns.length === 0}
                          className="w-full"
                        >
                          Remove Duplicate Rows
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="outliers">
                    <AccordionTrigger className="text-base font-medium">
                      <Trash2 className="h-5 w-5 mr-2" />
                      Detect Outliers
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                          <Label htmlFor="outlier-method">Detection Method</Label>
                          <Select value={outlierMethod} onValueChange={(value) => setOutlierMethod(value)}>
                            <SelectTrigger id="outlier-method">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="zscore">Z-Score</SelectItem>
                              <SelectItem value="iqr">IQR (Interquartile Range)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="threshold">Threshold: {outlierThreshold}</Label>
                          </div>
                          <Slider
                            id="threshold"
                            min={1}
                            max={5}
                            step={0.1}
                            value={[outlierThreshold]}
                            onValueChange={(value) => setOutlierThreshold(value[0])}
                          />
                          <p className="text-xs text-gray-500">
                            {outlierMethod === "zscore"
                              ? "Z-score threshold (typically 2-3)"
                              : "IQR multiplier (typically 1.5)"}
                          </p>
                        </div>

                        <Button onClick={detectOutliers} className="w-full">
                          Detect Outliers
                        </Button>

                        {outliers.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">{outliers.length} outliers detected</p>
                            <Button onClick={removeOutliers} variant="destructive" className="w-full">
                              Remove All Outliers
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-6">
                  <Button onClick={downloadCSV} className="w-full" disabled={!cleanedData.length}>
                    <Download className="mr-2 h-5 w-5" />
                    Download Cleaned Data
                  </Button>
                </div>
              </Card>

              <Card className="p-6 col-span-1 lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Data Preview</h2>
                  <Badge variant="outline" className="px-3 py-1">
                    {cleanedData.length} rows × {columns.length} columns
                  </Badge>
                </div>

                <ScrollArea className="h-[500px] rounded-md border">
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left font-medium text-gray-600 w-16">#</th>
                          {columns.map((column, index) => (
                            <th key={index} className="p-2 text-left font-medium text-gray-600">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cleanedData.slice(0, 100).map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-2 text-gray-500">{rowIndex + 1}</td>
                            {columns.map((column, colIndex) => (
                              <td key={colIndex} className="p-2">
                                {row[column] !== null && row[column] !== undefined ? String(row[column]) : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visualize" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 col-span-1">
                <h2 className="text-xl font-semibold mb-4">Visualization Options</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="chart-type">Chart Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={chartType === "bar" ? "default" : "outline"}
                              className="w-full justify-start"
                              onClick={() => setChartType("bar")}
                            >
                              <BarChart2 className="h-5 w-5 mr-2" />
                              Bar Chart
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Compare values across categories</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={chartType === "line" ? "default" : "outline"}
                              className="w-full justify-start"
                              onClick={() => setChartType("line")}
                            >
                              <LineChartIcon className="h-5 w-5 mr-2" />
                              Line Chart
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Show trends over a continuous axis</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={chartType === "pie" ? "default" : "outline"}
                              className="w-full justify-start"
                              onClick={() => setChartType("pie")}
                            >
                              <PieChartIcon className="h-5 w-5 mr-2" />
                              Pie Chart
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Show proportion of categories</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={chartType === "scatter" ? "default" : "outline"}
                              className="w-full justify-start"
                              onClick={() => setChartType("scatter")}
                            >
                              <ScatterPlot className="h-5 w-5 mr-2" />
                              Scatter Plot
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Show relationship between two variables</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="x-axis">X-Axis</Label>
                      <Select
                        value={chartOptions.xAxis}
                        onValueChange={(value) => setChartOptions({ ...chartOptions, xAxis: value })}
                      >
                        <SelectTrigger id="x-axis">
                          <SelectValue placeholder="Select X-Axis" />
                        </SelectTrigger>
                        <SelectContent>
                          {columns.map((column, index) => (
                            <SelectItem key={index} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="y-axis">Y-Axis</Label>
                      <Select
                        value={chartOptions.yAxis}
                        onValueChange={(value) => setChartOptions({ ...chartOptions, yAxis: value })}
                      >
                        <SelectTrigger id="y-axis">
                          <SelectValue placeholder="Select Y-Axis" />
                        </SelectTrigger>
                        <SelectContent>
                          {columns.map((column, index) => (
                            <SelectItem key={index} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="group-by">Group By (Optional)</Label>
                      <Select
                        value={chartOptions.groupBy}
                        onValueChange={(value) => setChartOptions({ ...chartOptions, groupBy: value })}
                      >
                        <SelectTrigger id="group-by">
                          <SelectValue placeholder="Select Group By" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {columns.map((column, index) => (
                            <SelectItem key={index} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aggregation">Aggregation Method</Label>
                      <Select
                        value={chartOptions.aggregation}
                        onValueChange={(value) => setChartOptions({ ...chartOptions, aggregation: value })}
                      >
                        <SelectTrigger id="aggregation">
                          <SelectValue placeholder="Select Aggregation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sum">Sum</SelectItem>
                          <SelectItem value="avg">Average</SelectItem>
                          <SelectItem value="max">Maximum</SelectItem>
                          <SelectItem value="min">Minimum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={generateChart}
                    className="w-full"
                    disabled={!chartOptions.xAxis || !chartOptions.yAxis}
                  >
                    Generate Chart
                  </Button>
                </div>
              </Card>

              <Card className="p-6 col-span-1 lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Chart Visualization</h2>

                <div className="h-[500px] relative">
                  <canvas
                    ref={barChartRef}
                    className={`w-full h-full ${chartType === "bar" ? "block" : "hidden"}`}
                  ></canvas>
                  <canvas
                    ref={lineChartRef}
                    className={`w-full h-full ${chartType === "line" ? "block" : "hidden"}`}
                  ></canvas>
                  <canvas
                    ref={pieChartRef}
                    className={`w-full h-full ${chartType === "pie" ? "block" : "hidden"}`}
                  ></canvas>
                  <canvas
                    ref={scatterChartRef}
                    className={`w-full h-full ${chartType === "scatter" ? "block" : "hidden"}`}
                  ></canvas>

                  {!chartInstanceRef.current && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <BarChart2 className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-lg">Select chart options and click "Generate Chart"</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-medium">{processingMessage}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
