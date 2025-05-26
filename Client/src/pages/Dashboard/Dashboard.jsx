import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Navbar from "../../components/Dashboard/Navbar/Navbar.jsx";
import { TitleChanger } from "../../utils/TitleChanger.jsx";
import { fetchHabitSettings } from "../../services/redux/slice/habitSlice.js";
import { useLoading } from "../../Context/LoadingContext.jsx";
import { useSelector, useDispatch } from "react-redux";

const Dashboard = () => {
  TitleChanger("Progress Pulse | Dashboard");
  const user = localStorage.getItem("username");

  const { setLoading } = useLoading();
  const dispatch = useDispatch();


  const [dateRange, setDateRange] = useState("month");
  // Alerts
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");

  useEffect(() => {
    console.log("Running Dashboard settings")
    const fetchSettings = async () => {
      try {
        setLoading(true);
        await dispatch(fetchHabitSettings()).unwrap();
      } catch (err) {
        setAlertErrorMessage("Failed to load settings");
        setShowErrorAlert(true);
        setTimeout(() => setShowErrorAlert(false), 4000);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Hardcoded color palette (replace with your preferred colors)
  const colors = {
    primary: "#4f46e5",    // Indigo-600
    secondary: "#10b981",  // Emerald-500
    accent: "#f59e0b",     // Amber-500
    error: "#ef4444",      // Red-500
    success: "#8b5cf6",    // Violet-500
    darkText: "#1f2937",   // Gray-800
    lightText: "#f9fafb"   // Gray-50
  };

  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Expenses",
        type: "column",
        data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160]
      },
      {
        name: "Income",
        type: "line",
        data: [760, 850, 810, 920, 710, 810, 690, 770, 960, 880, 720, 650]
      },
      {
        name: "Savings",
        type: "area",
        data: [320, 345, 396, 249, 483, 397, 489, 418, 208, 560, 463, 490]
      }
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        stacked: false,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800
        }
      },
      stroke: {
        width: [0, 2, 3],
        curve: "smooth"
      },
      plotOptions: {
        bar: {
          columnWidth: "50%",
          borderRadius: 4
        }
      },
      colors: [colors.primary, colors.secondary, colors.accent],
      fill: {
        opacity: [0.85, 0.25, 1],
        gradient: {
          inverseColors: false,
          shade: "light",
          type: "vertical",
          opacityFrom: 0.85,
          opacityTo: 0.55,
          stops: [0, 100, 100, 100]
        }
      },
      labels: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
      markers: {
        size: 0
      },
      xaxis: {
        type: "category"
      },
      yaxis: [
        {
          seriesName: "Expenses",
          axisTicks: {
            show: true
          },
          axisBorder: {
            show: true,
            color: colors.primary
          },
          labels: {
            style: {
              colors: colors.primary
            }
          },
          title: {
            text: "Expenses ($)",
            style: {
              color: colors.lightText
            }
          }
        },
        {
          seriesName: "Income",
          opposite: true,
          axisTicks: {
            show: true
          },
          axisBorder: {
            show: true,
            color: colors.secondary
          },
          labels: {
            style: {
              colors: colors.secondary
            }
          },
          title: {
            text: "Income ($)",
            style: {
              color: colors.secondary
            }
          }
        }
      ],
      tooltip: {
        shared: true,
        intersect: false,
        theme: "light",
        y: {
          formatter: function (y) {
            if (typeof y !== "undefined") {
              return "$" + y.toFixed(0);
            }
            return y;
          }
        }
      },
      legend: {
        position: "top",
        horizontalAlign: "center",
        fontSize: "14px",
        markers: {
          width: 12,
          height: 12,
          radius: 12
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 500
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    }
  });

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    console.log("Date range changed to:", range);
  };

  return (
    <>
      <div className="p-4 md:p-8 bg-base-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user}!</h1>
              <p className="text-base-content/70">Track your financial progress</p>
            </div>

            <div className="join">
              <button
                className={`join-item btn ${dateRange === "week" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => handleDateRangeChange("week")}
                style={{ backgroundColor: dateRange === "week" ? colors.primary : undefined }}
              >
                Week
              </button>
              <button
                className={`join-item btn ${dateRange === "month" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => handleDateRangeChange("month")}
                style={{ backgroundColor: dateRange === "month" ? colors.primary : undefined }}
              >
                Month
              </button>
              <button
                className={`join-item btn ${dateRange === "year" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => handleDateRangeChange("year")}
                style={{ backgroundColor: dateRange === "year" ? colors.primary : undefined }}
              >
                Year
              </button>
            </div>
          </div>

          {/* Main Chart Card */}
          <div className="card bg-base-200 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Financial Overview</h2>
              <div className="w-full">
                <Chart
                  options={chartData.options}
                  series={chartData.series}
                  type="line"
                  height={450}
                />
              </div>
            </div>
          </div>

          {/* Mini Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="stats shadow" style={{ backgroundColor: colors.primary, color: colors.lightText }}>
              <div className="stat">
                <div className="stat-title">Total Income</div>
                <div className="stat-value">$12,345</div>
                <div className="stat-desc">↑ 12% from last month</div>
              </div>
            </div>

            <div className="stats shadow" style={{ backgroundColor: colors.secondary, color: colors.lightText }}>
              <div className="stat">
                <div className="stat-title">Total Expenses</div>
                <div className="stat-value">$8,765</div>
                <div className="stat-desc">↓ 5% from last month</div>
              </div>
            </div>

            <div className="stats shadow" style={{ backgroundColor: colors.accent, color: colors.lightText }}>
              <div className="stat">
                <div className="stat-title">Savings Rate</div>
                <div className="stat-value">29%</div>
                <div className="stat-desc">↑ 3% from last month</div>
              </div>
            </div>
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart Card */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Expense Categories</h2>
                <div className="w-full">
                  <Chart
                    options={{
                      chart: {
                        type: "donut",
                        toolbar: { show: true }
                      },
                      colors: [
                        colors.primary,
                        colors.secondary,
                        colors.accent,
                        colors.error,
                        colors.success
                      ],
                      labels: ["Housing", "Food", "Transport", "Entertainment", "Other"],
                      legend: { position: "bottom" },
                      responsive: [{
                        breakpoint: 480,
                        options: {
                          chart: { width: 200 },
                          legend: { position: "bottom" }
                        }
                      }]
                    }}
                    series={[35, 25, 20, 10, 10]}
                    type="donut"
                    height={300}
                  />
                </div>
              </div>
            </div>

            {/* Bar Chart Card */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Monthly Comparison</h2>
                <div className="w-full">
                  <Chart
                    options={{
                      chart: {
                        type: "bar",
                        toolbar: { show: true }
                      },
                      plotOptions: {
                        bar: {
                          horizontal: false,
                          columnWidth: "55%",
                          endingShape: "rounded",
                          borderRadius: 4
                        },
                      },
                      colors: [colors.primary, colors.secondary],
                      dataLabels: { enabled: false },
                      stroke: {
                        show: true,
                        width: 2,
                        colors: ["transparent"]
                      },
                      xaxis: {
                        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                      },
                      yaxis: {
                        title: { text: "$ (thousands)" }
                      },
                      fill: {
                        opacity: 0.8
                      },
                      tooltip: {
                        y: {
                          formatter: function (val) {
                            return "$ " + val + "k";
                          }
                        }
                      }
                    }}
                    series={[
                      {
                        name: "2023",
                        data: [44, 55, 57, 56, 61, 58]
                      },
                      {
                        name: "2024",
                        data: [53, 62, 65, 71, 69, 76]
                      }
                    ]}
                    type="bar"
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;