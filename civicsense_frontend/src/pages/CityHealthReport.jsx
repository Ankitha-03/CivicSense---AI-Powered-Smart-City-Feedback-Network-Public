import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Sparkles } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";

function ComingSoonCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      <Icon className="w-5 h-5 text-[#1a56db] shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function CityHealthReport() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="max-w-2xl mx-auto text-center">
        <BarChart3 className="w-10 h-10 text-[#1a56db] mx-auto mb-5" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#d97706] border border-amber-200 rounded-full text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Coming Soon
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">City Health Reports</h1>
        <p className="text-gray-500 leading-relaxed mb-10">
          We're building a powerful city-wide analytics dashboard that aggregates civic issue data and generates weekly reports with AI-powered insights.
        </p>

        <div className="text-left space-y-4 mb-10">
          <ComingSoonCard
            icon={BarChart3}
            title="Weekly Category Breakdown"
            description="See how many Infrastructure, Sanitation, Utilities, and Safety issues were reported each week, with trends vs. the previous week."
          />
          <ComingSoonCard
            icon={Sparkles}
            title="AI-Generated Insights"
            description="Our AI will analyse patterns, identify problem hotspots on a heatmap, detect seasonal trends, and recommend resource allocation for each category."
          />
          <ComingSoonCard
            icon={BarChart3}
            title="Resolution Rate Tracking"
            description="Track how quickly issues are being resolved across categories and neighbourhoods, with department-level performance scores."
          />
        </div>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-[#1a56db] text-white rounded-lg font-semibold text-sm hover:bg-[#1e429f] transition-colors duration-150 shadow-sm"
        >
          Back to Dashboard
        </button>
      </div>
    </PageWrapper>
  );
}
