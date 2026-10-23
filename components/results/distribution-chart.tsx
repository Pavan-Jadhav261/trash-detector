'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/shared/primitives'
import type { CategoryResult } from '@/types/waste'

interface DistributionChartProps {
  id: string
  title: string
  description: string
  categories: CategoryResult[]
  value: (c: CategoryResult) => number
  format: (value: number) => string
}

export function DistributionChart({ id, title, description, categories, value, format }: DistributionChartProps) {
  const data = categories.map((c) => ({
    name: `${c.category.id} · ${c.category.name}`,
    value: value(c),
    color: c.category.color,
  }))

  return (
    <Card className="flex flex-col p-5">
      <h3 id={id} className="text-sm font-semibold">
        {title}
      </h3>
      <p className="mt-1 text-[12.5px] text-muted-foreground">{description}</p>
      <figure aria-labelledby={id} className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barCategoryGap={8}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis
              type="number"
              tickFormatter={format}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={104}
              tick={{ fontSize: 12, fill: 'var(--foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--secondary)' }}
              formatter={(v) => [format(Number(v)), title]}
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" radius={[0, 2, 2, 0]} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <figcaption className="sr-only">
          {data.map((d) => `${d.name}: ${format(d.value)}`).join('; ')}
        </figcaption>
      </figure>
    </Card>
  )
}
