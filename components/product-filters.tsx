"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TRIBES, CATEGORIES } from "@/lib/types"
import { Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface ProductFiltersProps {
  filters: {
    search: string
    tribe: string
    category: string
    featured: boolean
  }
  onFilterChange: (filters: any) => void
}

export function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  return (
    <div className="space-y-4 p-6 bg-card border border-border rounded-lg">
      <h3 className="font-serif font-semibold text-lg">Filter Products</h3>

      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by name or story..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tribe">Tribe</Label>
        <Select value={filters.tribe} onValueChange={(value) => onFilterChange({ ...filters, tribe: value })}>
          <SelectTrigger id="tribe">
            <SelectValue placeholder="All tribes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tribes</SelectItem>
            {TRIBES.map((tribe) => (
              <SelectItem key={tribe} value={tribe}>
                {tribe}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={filters.category} onValueChange={(value) => onFilterChange({ ...filters, category: value })}>
          <SelectTrigger id="category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="featured"
          checked={filters.featured}
          onCheckedChange={(checked) => onFilterChange({ ...filters, featured: checked as boolean })}
        />
        <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
          Featured products only
        </Label>
      </div>
    </div>
  )
}
