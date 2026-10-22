"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#0e9384", "#1d6fa5", "#3c8dbc", "#67b7ad", "#f59e0b", "#64748b"];

export function CategoryChart({ data }: { data: { name: string; value: number }[] }) {
  return <ResponsiveContainer width="100%" height={250}><BarChart data={data} margin={{ left: -22, right: 6 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7edef" /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={55} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip cursor={{ fill: "#f4f7f8" }} /><Bar dataKey="value" name="Vehículos" radius={[6, 6, 0, 0]} fill="#0e9384" /></BarChart></ResponsiveContainer>;
}

export function DocumentChart({ data }: { data: { name: string; value: number }[] }) {
  return <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>{data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>;
}
