import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/DashboardCard";
import DashboardContainer from "../../components/DashboardContainer";
import api from "../../api/api";

// Icons
import {
  PhoneCall,
  Book,
  FileText,
  Layers,
  Lightbulb,
  Users,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    contacts: 0,
    bookings: 0,
    blogs: 0,
    services: 0,
    suggestions: 0,
    programs: 0,
  });

  const fetchAllDashboardData = async () => {
    try {
      const [
        contactRes,
        bookingRes,
        blogRes,
        serviceRes,
        suggestionRes,
        programRes,
      ] = await Promise.all([
        api.post("/api/admin/contact-us/all", {}),
        api.post("/api/admin/booking/all", {}),
        api.post("/api/admin/blog/all", {}),
        api.post("/api/admin/service/all", {}),
        api.post("/api/admin/suggestion/all", {}),
        api.post("/api/admin/program/all", {}),
      ]);

      console.log("Dashboard Responses:", {
        contactRes,
        bookingRes,
        blogRes,
        serviceRes,
        suggestionRes,
        programRes,
      });

      setStats({
        contacts: contactRes?.data?.total ?? 0,
        bookings: bookingRes?.data?.total ?? 0,
        blogs: blogRes?.data?.total ?? 0,
        services: serviceRes?.data?.total ?? 0,
        suggestions: suggestionRes?.data?.total ?? 0,
        programs: programRes?.data?.total ?? 0,
      });
    } catch (error) {
      console.log("Dashboard API Error:", error);
    }
  };

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  return (
    <div className="p-6">
      <DashboardContainer>
        <DashboardCard
          title="Total Contacts"
          value={stats.contacts}
          icon={PhoneCall}
          bgColor="bg-blue-600"
        />

        <DashboardCard
          title="Total Bookings"
          value={stats.bookings}
          icon={Book}
          bgColor="bg-green-600"
        />

        <DashboardCard
          title="Total Blogs"
          value={stats.blogs}
          icon={FileText}
          bgColor="bg-purple-600"
        />

        <DashboardCard
          title="Total Services"
          value={stats.services}
          icon={Layers}
          bgColor="bg-orange-600"
        />

        <DashboardCard
          title="Suggestions"
          value={stats.suggestions}
          icon={Lightbulb}
          bgColor="bg-red-600"
        />

        <DashboardCard
          title="Programs"
          value={stats.programs}
          icon={Users}
          bgColor="bg-teal-600"
        />
      </DashboardContainer>
    </div>
  );
};

export default Dashboard;
