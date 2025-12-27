import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

const BarChartCard = ({ data, xKey, yKey, title }: any) => (
  <Card className="p-4">
    <h3 className="font-semibold mb-3">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={yKey} />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

export default BarChartCard; 
