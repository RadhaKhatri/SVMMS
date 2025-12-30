import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MechanicJobCards = () => {
  const [jobCards, setJobCards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/mechanic/job-cards", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setJobCards(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <DashboardLayout role="mechanic">
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">My Job Cards</h1>

        {jobCards.map((jc: any) => (
          <Card key={jc.job_card_id}>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>{jc.service_type}</CardTitle>
                <Badge>{jc.status.toUpperCase()}</Badge>
              </div>
            </CardHeader>

            <CardContent className="flex justify-between items-center">
              <div className="text-sm space-y-1">
                <div>
                  <b>Customer:</b> {jc.customer_name}
                </div>
                <div>
                  <b>Vehicle:</b> {jc.vehicle}
                </div>
              </div>

              <Button
                onClick={() =>
                  navigate(`/mechanic/job-cards/${jc.job_card_id}`)
                }
              >
                Open Job Card
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default MechanicJobCards;
