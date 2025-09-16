import React, { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { format, startOfMonth, subDays } from "date-fns";
import reservationService from "@/services/api/reservationService";
import roomService from "@/services/api/roomService";
import billingService from "@/services/api/billingService";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

// Header Component
const ReportsHeader = React.memo(({ dateRange, onDateRangeChange }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      <p className="text-gray-600">Hotel performance insights and trends</p>
    </div>
    
    <div className="flex items-center space-x-4">
      <select
        value={dateRange}
        onChange={(e) => onDateRangeChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="7days">Last 7 Days</option>
        <option value="30days">Last 30 Days</option>
        <option value="90days">Last 90 Days</option>
        <option value="thismonth">This Month</option>
      </select>
    </div>
  </div>
));

// Metrics Grid Component
const ReportsMetrics = React.memo(({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
    <StatCard
      title="Net Revenue"
      value={`$${stats.netRevenue.toLocaleString()}`}
      icon="DollarSign"
      color="success"
      trend="up"
      trendValue={`After refunds: $${stats.totalRefunds.toLocaleString()}`}
    />
    
    <StatCard
      title="Tax Collected"
      value={`$${stats.totalTaxCollected.toLocaleString()}`}
      icon="Receipt"
      color="info"
      trend="up"
      trendValue={`Avg rate: ${stats.averageTaxRate.toFixed(1)}%`}
    />
    
    <StatCard
      title="Occupancy Rate"
      value={`${stats.occupancyRate}%`}
      icon="BarChart3"
      color="primary"
      trend={stats.occupancyRate > 75 ? "up" : "down"}
      trendValue="Current rate"
    />
    
    <StatCard
      title="Avg Daily Rate"
      value={`$${stats.averageDailyRate.toFixed(0)}`}
      icon="TrendingUp"
      color="info"
    />
    
    <StatCard
      title="Outstanding"
      value={stats.outstandingPayments}
      icon="Clock"
      color="warning"
      trend="down"
      trendValue={`${stats.partialPayments} partial`}
    />
    
    <StatCard
      title="Total Bookings"
      value={stats.totalBookings}
      icon="Calendar"
      color="secondary"
    />
  </div>
));

// Charts Grid Component
const ReportsCharts = React.memo(({ charts, stats }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Revenue Trend */}
    <div className="bg-white rounded-lg shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ApperIcon name="TrendingUp" size={20} className="mr-2 text-primary-500" />
        Revenue Trend
      </h3>
      {charts?.revenue && (
        <Chart
          options={charts.revenue.options}
          series={charts.revenue.series}
          type="line"
          height={300}
        />
      )}
    </div>

    {/* Room Status Distribution */}
    <div className="bg-white rounded-lg shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ApperIcon name="PieChart" size={20} className="mr-2 text-primary-500" />
        Room Status Distribution
      </h3>
      {charts?.roomStatus && (
        <Chart
          options={charts.roomStatus.options}
          series={charts.roomStatus.series}
          type="donut"
          height={300}
        />
      )}
    </div>

    {/* Occupancy Trend */}
    <div className="bg-white rounded-lg shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ApperIcon name="BarChart" size={20} className="mr-2 text-primary-500" />
        7-Day Occupancy Trend
      </h3>
      {charts?.occupancy && (
        <Chart
          options={charts.occupancy.options}
          series={charts.occupancy.series}
          type="bar"
          height={300}
        />
      )}
    </div>

    {/* Key Performance Indicators */}
    <div className="bg-white rounded-lg shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <ApperIcon name="Target" size={20} className="mr-2 text-primary-500" />
        Key Performance Indicators
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-success-100 rounded-lg p-2 mr-3">
              <ApperIcon name="CheckCircle" size={16} className="text-success-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Booking Conversion</p>
              <p className="text-sm text-gray-600">Confirmed bookings</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {stats.totalBookings - stats.cancellationRate}%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-error-100 rounded-lg p-2 mr-3">
              <ApperIcon name="XCircle" size={16} className="text-error-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Cancellation Rate</p>
              <p className="text-sm text-gray-600">Cancelled bookings</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">{stats.cancellationRate}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-warning-100 rounded-lg p-2 mr-3">
              <ApperIcon name="Clock" size={16} className="text-warning-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Outstanding Payments</p>
              <p className="text-sm text-gray-600">Pending bills</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">{stats.outstandingPayments}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-info-100 rounded-lg p-2 mr-3">
              <ApperIcon name="Star" size={16} className="text-info-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Service Quality</p>
              <p className="text-sm text-gray-600">Guest satisfaction</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">4.8/5</p>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// Performance Table Component
const PerformanceTable = React.memo(({ stats }) => (
  <div className="bg-white rounded-lg shadow-card overflow-hidden">
    <div className="p-6 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <ApperIcon name="FileText" size={20} className="mr-2 text-primary-500" />
        Financial Performance Summary
      </h3>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Financial Metric
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Period
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Performance
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Gross Revenue
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${stats.totalRevenue.toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${Math.round(stats.totalRevenue * 1.15).toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                On Track
              </span>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Tax Collected
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${stats.totalTaxCollected.toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${Math.round(stats.totalRevenue * 0.10).toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Compliant
              </span>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Net Revenue
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${stats.netRevenue.toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${Math.round(stats.netRevenue * 1.1).toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                stats.netRevenue >= stats.totalRevenue * 0.95 
                  ? "bg-green-100 text-green-800" 
                  : stats.netRevenue >= stats.totalRevenue * 0.85 
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {stats.netRevenue >= stats.totalRevenue * 0.95 ? "Excellent" : 
                 stats.netRevenue >= stats.totalRevenue * 0.85 ? "Good" : "Review Required"}
              </span>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Outstanding Payments
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {stats.outstandingPayments} invoices
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              &lt; 5 invoices
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                stats.outstandingPayments <= 5 
                  ? "bg-green-100 text-green-800" 
                  : stats.outstandingPayments <= 10 
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {stats.outstandingPayments <= 5 ? "Good" : 
                 stats.outstandingPayments <= 10 ? "Monitor" : "Action Required"}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
));

// Custom hook for reports data management
const useReportsData = (dateRange) => {
  const [data, setData] = useState({
    reservations: [],
    rooms: [],
    bills: [],
    stats: null,
    charts: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDateRangeFilter = useCallback(() => {
    const now = new Date();
    switch (dateRange) {
      case "7days":
        return subDays(now, 7);
      case "30days":
        return subDays(now, 30);
      case "90days":
        return subDays(now, 90);
      case "thismonth":
        return startOfMonth(now);
      default:
        return subDays(now, 30);
    }
  }, [dateRange]);

  const calculateStats = useCallback((reservations, rooms, bills) => {
    const startDate = getDateRangeFilter();
    const filteredReservations = reservations.filter(r => 
      new Date(r.checkIn) >= startDate
    );
    const filteredBills = bills.filter(b => 
      new Date(b.createdAt) >= startDate
    );

    const paidBills = filteredBills.filter(b => b.paymentStatus === "Paid");
    const totalRevenue = paidBills.reduce((sum, b) => sum + (b.subtotal || b.totalAmount || 0), 0);
    const totalTaxCollected = paidBills.reduce((sum, b) => sum + (b.taxAmount || 0), 0);
    const totalRefunds = filteredBills.reduce((sum, b) => 
      sum + ((b.refunds || []).reduce((refundSum, r) => refundSum + r.amount, 0)), 0
    );

    const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
    const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

    const averageDailyRate = filteredReservations.length > 0 
      ? totalRevenue / filteredReservations.length 
      : 0;

    const totalBookings = filteredReservations.length;
    const cancelledBookings = filteredReservations.filter(r => r.status === "Cancelled").length;
    const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

    return {
      totalRevenue,
      totalTaxCollected,
      totalRefunds,
      netRevenue: totalRevenue - totalRefunds,
      occupancyRate,
      averageDailyRate,
      totalBookings,
      cancellationRate,
outstandingPayments: bills.filter(b => b.paymentStatus === "Pending").length,
      partialPayments: bills.filter(b => b.paymentStatus === "Partial").length,
      averageTaxRate: paidBills.length > 0 ? 
        (totalTaxCollected / totalRevenue) * 100 : 0
    };
  }, [getDateRangeFilter]);

  const generateChartData = useCallback((reservations, bills, rooms, startDate) => {
    const filteredBills = bills.filter(b => 
      new Date(b.createdAt) >= startDate && b.paymentStatus === "Paid"
    );

    // Revenue Chart Data
    const revenueByDay = {};
    filteredBills.forEach(bill => {
      const day = format(new Date(bill.createdAt), "MMM dd");
      revenueByDay[day] = (revenueByDay[day] || 0) + (bill.totalAmount || 0);
    });

    const revenueChart = {
      series: [{
        name: "Revenue",
        data: Object.values(revenueByDay)
      }],
      options: {
        chart: { type: "line", toolbar: { show: false } },
        colors: ["#1e40af"],
        stroke: { curve: "smooth", width: 3 },
        xaxis: { categories: Object.keys(revenueByDay) },
        yaxis: { 
          labels: { 
            formatter: (value) => `$${value.toFixed(0)}` 
          } 
        },
        tooltip: {
          y: { formatter: (value) => `$${value.toFixed(2)}` }
        }
      }
    };

    // Room Status Chart Data
    const roomStatusCounts = {
      Available: rooms.filter(r => r.status === "Available").length,
      Occupied: rooms.filter(r => r.status === "Occupied").length,
      Cleaning: rooms.filter(r => r.status === "Cleaning").length,
      Maintenance: rooms.filter(r => r.status === "Maintenance").length
    };

    const roomStatusChart = {
      series: Object.values(roomStatusCounts),
      options: {
        chart: { type: "donut" },
        colors: ["#059669", "#dc2626", "#d97706", "#0284c7"],
        labels: Object.keys(roomStatusCounts),
        legend: { position: "bottom" },
        dataLabels: {
          formatter: (val) => `${Math.round(val)}%`
        }
      }
    };

    // Occupancy Trend Chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayReservations = reservations.filter(r => {
        const checkIn = new Date(r.checkIn);
        const checkOut = new Date(r.checkOut);
        return checkIn <= date && checkOut > date && r.status !== "Cancelled";
      });
      return {
        day: format(date, "MMM dd"),
        occupancy: rooms.length > 0 ? Math.round((dayReservations.length / rooms.length) * 100) : 0
      };
    });

    const occupancyChart = {
      series: [{
        name: "Occupancy Rate",
        data: last7Days.map(d => d.occupancy)
      }],
      options: {
        chart: { type: "bar", toolbar: { show: false } },
        colors: ["#0ea5e9"],
        xaxis: { categories: last7Days.map(d => d.day) },
        yaxis: { 
          max: 100,
          labels: { formatter: (value) => `${value}%` }
        },
        tooltip: {
          y: { formatter: (value) => `${value}%` }
        }
      }
    };

    return {
      revenue: revenueChart,
      roomStatus: roomStatusChart,
      occupancy: occupancyChart
    };
  }, []);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [reservations, rooms, bills] = await Promise.all([
        reservationService.getAll(),
        roomService.getAll(),
        billingService.getAll()
      ]);

      const stats = calculateStats(reservations, rooms, bills);
      const charts = generateChartData(reservations, bills, rooms, getDateRangeFilter());

      setData({
        reservations,
        rooms,
        bills,
        stats,
        charts
      });
    } catch (err) {
      console.error('Failed to load reports data:', err);
      setError(err.message || 'Failed to load reports data');
    } finally {
      setLoading(false);
    }
  }, [calculateStats, generateChartData, getDateRangeFilter]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  return { data, loading, error, loadReportData };
};

// Main Reports Component
const Reports = () => {
  const [dateRange, setDateRange] = useState("30days");
  const { data, loading, error, loadReportData } = useReportsData(dateRange);

  const handleDateRangeChange = useCallback((newDateRange) => {
    setDateRange(newDateRange);
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message="Failed to load reports" description={error} onRetry={loadReportData} />;

  const { stats, charts } = data;

  return (
    <div className="space-y-8">
      <ReportsHeader 
        dateRange={dateRange} 
        onDateRangeChange={handleDateRangeChange} 
      />
      <ReportsMetrics stats={stats} />
      <ReportsCharts charts={charts} stats={stats} />
      <PerformanceTable stats={stats} />
    </div>
  );
};

export default Reports;