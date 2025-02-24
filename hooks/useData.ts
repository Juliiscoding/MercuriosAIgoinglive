import { useQuery } from "@tanstack/react-query"
import {
  fetchSalesData,
  fetchCategories,
  fetchCustomers,
  fetchSuppliers,
  fetchOrders,
  fetchEmployees,
} from "@/services/apiClient"
import { transformSalesData } from "@/utils/data-transformers"
import type { TransformedSalesData } from "@/types/api"

export function useSales() {
  return useQuery<TransformedSalesData, Error>({
    queryKey: ["sales"],
    queryFn: async () => {
      try {
        const data = await fetchSalesData()
        
        if (!data) {
          throw new Error("No data received from the API")
        }

        console.log("Raw sales data:", JSON.stringify(data).substring(0, 200) + "...")
        
        const transformedData = transformSalesData(data)
        console.log("Transformed sales data:", JSON.stringify(transformedData).substring(0, 200) + "...")
        
        return transformedData
      } catch (error: any) {
        console.error("Sales data fetch error:", error)
        throw new Error(`Sales data fetch error: ${error.message || "Unknown error"}`)
      }
    },
    retry: 1,
    refetchInterval: 300000, // Refetch every 5 minutes
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    retry: 1,
    refetchInterval: 300000,
  })
}

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    retry: 1,
    refetchInterval: 300000,
  })
}

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
    retry: 1,
    refetchInterval: 300000,
  })
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    retry: 1,
    refetchInterval: 300000,
  })
}

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    retry: 1,
    refetchInterval: 300000,
  })
}
