"use client"

import { useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSales } from "@/hooks/useData"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Store, 
  UserCheck,
  BarChart2,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react"
import { BarChart } from "@/components/charts/bar-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { AreaChart } from "@/components/charts/area-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SalesAnalytics() {
  const { data: salesData, isLoading, isError, refetch } = useSales()

  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [refetch])

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {isError instanceof Error ? isError.message : "An unknown error occurred"}
            {isError instanceof Error && isError.message.includes("Authentication failed") && (
              <div className="mt-2">
                <a href="/login" className="text-blue-500 hover:underline">
                  Please log in again
                </a>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount)

  const formatPercent = (value: number) =>
    new Intl.NumberFormat("de-DE", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="mr-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/earth">Earth</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Sales Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4 md:px-6">
          <div className="grid gap-6">
            {/* Key Performance Indicators */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {isLoading ? (
                Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          <Skeleton className="h-4 w-[100px]" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-[100px]" />
                        <Skeleton className="mt-1 h-4 w-[60px]" />
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(salesData?.totalSales || 0)}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        <span>+20.1% from last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatPercent(salesData?.grossMargin || 0)}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        <span>+2.5% from last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatPercent(salesData?.returnRate || 0)}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        <span>+1.2% from last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Items/Order</CardTitle>
                      <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {salesData?.averageItemsPerOrder?.toFixed(1) || "0"}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        <span>+0.3 from last month</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Analysis Tabs */}
            <Tabs defaultValue="sales" className="space-y-4">
              <TabsList>
                <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              {/* Sales Analysis Tab */}
              <TabsContent value="sales" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Sales Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {salesData && (
                        <AreaChart
                          data={salesData.salesByDate}
                          xField="date"
                          yField="amount"
                          categories={["amount"]}
                        />
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales by Hour</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {salesData && (
                        <BarChart
                          data={salesData.salesByHour}
                          xField="hour"
                          yField="amount"
                          categories={["amount"]}
                        />
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales by Weekday</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {salesData && (
                        <BarChart
                          data={salesData.salesByWeekday}
                          xField="day"
                          yField="amount"
                          categories={["amount"]}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {salesData?.topProducts.map((product) => (
                          <div key={product.articleNumber} className="flex items-center">
                            <div className="flex-1">
                              <div className="text-sm font-medium">#{product.articleNumber}</div>
                              <div className="text-xs text-muted-foreground">
                                Quantity: {product.quantity}
                              </div>
                            </div>
                            <div className="font-medium">
                              {formatCurrency(product.totalSales)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {salesData && (
                        <PieChart
                          data={salesData.salesByCategory}
                          category="category"
                          value="amount"
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Customers Tab */}
              <TabsContent value="customers" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Segments</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {salesData && (
                        <PieChart
                          data={salesData.customerSegments}
                          category="segment"
                          value="totalSales"
                        />
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Regional Sales</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {salesData && (
                        <BarChart
                          data={salesData.regionalSales}
                          xField="region"
                          yField="amount"
                          categories={["amount"]}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {salesData?.topEmployees.map((employee) => (
                          <div key={employee.employeeId} className="flex items-center">
                            <div className="flex-1">
                              <div className="text-sm font-medium">Employee #{employee.employeeId}</div>
                              <div className="text-xs text-muted-foreground">
                                Transactions: {employee.transactionCount}
                              </div>
                            </div>
                            <div className="font-medium">
                              {formatCurrency(employee.totalSales)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Store Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {salesData?.storePerformance.map((store) => (
                          <div key={store.storeId} className="flex items-center">
                            <div className="flex-1">
                              <div className="text-sm font-medium">Store #{store.storeId}</div>
                              <div className="text-xs text-muted-foreground">
                                Customers: {store.customerCount}
                              </div>
                            </div>
                            <div className="font-medium">
                              {formatCurrency(store.totalSales)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  )
}
