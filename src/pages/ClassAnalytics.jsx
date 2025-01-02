import React, { useEffect, useState } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Inject } from "@syncfusion/ej2-react-grids";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";

// Register Chart.js
ChartJS.register(...registerables);

const ClassAnalytics = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("YOUR_API_URL_HERE");
        const result = await response.json();

        setPerformanceData(result);

        // Prepare data for chart
        const subjects = [...new Set(result.map((item) => item.subject))];
        const averages = subjects.map((subject) => {
          const subjectScores = result
            .filter((item) => item.subject === subject)
            .map((item) => item.score);
          return (
            subjectScores.reduce((acc, score) => acc + score, 0) /
            subjectScores.length
          );
        });

        setChartData({
          labels: subjects,
          datasets: [
            {
              label: "Average Score",
              data: averages,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Class Performance Analytics</h1>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {/* Chart Section */}
          <div className="bg-white shadow-lg rounded-lg p-4 mb-8">
            <h2 className="text-xl font-semibold mb-4">Average Performance by Subject</h2>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
          </div>

          {/* Table Section */}
          <div className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Student Performance</h2>
            <GridComponent
              dataSource={performanceData}
              allowPaging
              pageSettings={{ pageSize: 6 }}
            >
              <ColumnsDirective>
                <ColumnDirective field="student" headerText="Student Name" width="150" textAlign="Left" />
                <ColumnDirective field="subject" headerText="Subject" width="150" textAlign="Left" />
                <ColumnDirective field="score" headerText="Score" width="100" textAlign="Center" />
              </ColumnsDirective>
              <Inject services={[Page]} />
            </GridComponent>
          </div>
        </>
      )}
    </div>
  );
};

export default ClassAnalytics;
