import { Card } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LineChartCard = ({ data, xKey, yKey, title }: any) => (
  <Card className="p-4">
    <h3 className="font-semibold mb-3">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Line dataKey={yKey} />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

export default LineChartCard;
